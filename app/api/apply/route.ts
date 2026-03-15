import crypto from "crypto";
import { NextResponse } from "next/server";
import { getResendClient } from "@/lib/resendServer";
import { supabaseServer } from "@/lib/supabaseServer";
import { getClientIp, internalError, requireAllowedBrowserOrigin, requireSubmissionTiming } from "@/lib/security";
import { applySchema, parseBody } from "@/lib/validation";

function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function getPgCode(err: unknown): string | null {
  if (!err || typeof err !== "object") return null;
  if (!("code" in err)) return null;
  const code = (err as { code?: unknown }).code;
  return typeof code === "string" ? code : null;
}

function sha256(input: string) {
  const salt = process.env.HASH_SALT ?? "";
  return crypto.createHash("sha256").update(`${input}|${salt}`).digest("hex");
}

function normalizeContact(raw: string) {
  const s = raw.trim();
  if (s.includes("@")) return s.toLowerCase();
  return s.replace(/[\s\-().]/g, "");
}

function isMissingColumnError(message: string | null | undefined) {
  const text = String(message ?? "").toLowerCase();
  return text.includes("does not exist") && (
    text.includes("is_aggregated") ||
    text.includes("external_apply_url") ||
    text.includes("hide_expiration_date")
  );
}

type JobRecord = {
  id: string;
  title: string | null;
  company: string | null;
  contact: string | null;
  is_aggregated?: boolean | null;
  external_apply_url?: string | null;
};

export async function POST(req: Request) {
  try {
    const originGuard = requireAllowedBrowserOrigin(req, { requireHeader: true });
    if (originGuard) return originGuard;

    const parsed = await parseBody(req, applySchema);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const { jobId, firstName, contact, message, website, startedAtMs, rodo } = parsed.data;

    if (website) {
      return NextResponse.json({ success: true, ignored: true });
    }

    const timingGuard = requireSubmissionTiming(req, startedAtMs, 1200);
    if (timingGuard) return timingGuard;

    if (!rodo) {
      return NextResponse.json({ error: "Brak zgody RODO" }, { status: 400 });
    }

    const ip = getClientIp(req);
    const ipHash = sha256(ip);
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();

    const { count: recentCount, error: cntErr } = await supabaseServer
      .from("applications")
      .select("*", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .gte("created_at", tenMinutesAgo);

    if (cntErr) return internalError("apply count error", cntErr);
    if ((recentCount ?? 0) >= 10) {
      return NextResponse.json(
        { error: "Za duzo zgloszen z Twojej sieci. Sprobuj ponownie za kilka minut." },
        { status: 429 }
      );
    }

    const contactNorm = normalizeContact(contact);
    const contactHash = sha256(contactNorm);

    let job: JobRecord | null = null;
    let jobErr: { message: string } | null = null;

    const firstAttempt = await supabaseServer
      .from("jobs")
      .select("id,title,company,contact,is_aggregated,external_apply_url")
      .eq("id", jobId)
      .single();

    if (firstAttempt.error && isMissingColumnError(firstAttempt.error.message)) {
      const fallbackAttempt = await supabaseServer
        .from("jobs")
        .select("id,title,company,contact")
        .eq("id", jobId)
        .single();

      job = (fallbackAttempt.data ?? null) as JobRecord | null;
      jobErr = fallbackAttempt.error ? { message: fallbackAttempt.error.message } : null;
    } else {
      job = (firstAttempt.data ?? null) as JobRecord | null;
      jobErr = firstAttempt.error ? { message: firstAttempt.error.message } : null;
    }

    if (jobErr || !job) {
      return NextResponse.json({ error: "Nie znaleziono oferty" }, { status: 404 });
    }

    if (Boolean(job.is_aggregated)) {
      return NextResponse.json(
        { error: "Ta oferta prowadzi do zewnętrznego źródła aplikacji." },
        { status: 400 }
      );
    }

    const companyEmailRaw = String(job.contact ?? "").trim();
    const companyEmail = isEmail(companyEmailRaw) ? companyEmailRaw : "";

    const { data: appRow, error: appErr } = await supabaseServer
      .from("applications")
      .insert({
        job_id: jobId,
        first_name: firstName,
        contact,
        message,
        rodo,
        ip_hash: ipHash,
        contact_hash: contactHash,
      })
      .select("id,created_at")
      .single();

    if (appErr || !appRow) {
      if (getPgCode(appErr) === "23505") {
        return NextResponse.json(
          { error: "Juz wyslales zgloszenie na te oferte tym kontaktem." },
          { status: 409 }
        );
      }
      return internalError("apply insert error", appErr);
    }

    if (!companyEmail) {
      return NextResponse.json({
        success: true,
        emailed: false,
        warning: "Brak poprawnego email firmy w jobs.contact",
      });
    }

    const from = process.env.MAIL_FROM ?? "onboarding@resend.dev";
    const subject = `Nowe zgloszenie: ${job.title} (${firstName})`;
    const text = [
      `Nowe zgloszenie do oferty: ${job.title}`,
      `Firma: ${job.company}`,
      "",
      `Imie: ${firstName}`,
      `Kontakt: ${contact}`,
      "",
      "Wiadomosc:",
      message,
      "",
      `ID zgloszenia: ${appRow.id}`,
      `Data: ${appRow.created_at}`,
    ].join("\n");
    const resend = getResendClient();
    if (!resend) {
      return NextResponse.json({
        success: true,
        emailed: false,
        warning: "Brak konfiguracji RESEND_API_KEY",
      });
    }

    const send = await resend.emails.send({
      from,
      to: companyEmail,
      subject,
      text,
    });

    if (send.error) {
      return NextResponse.json({
        success: true,
        emailed: false,
        warning: "Nie udalo sie wyslac maila do firmy",
      });
    }

    await supabaseServer
      .from("applications")
      .update({
        status: "forwarded",
        forwarded_at: new Date().toISOString(),
        company_email_used: companyEmail,
      })
      .eq("id", appRow.id);

    return NextResponse.json({ success: true, emailed: true });
  } catch (error) {
    return internalError("apply route error", error);
  }
}
