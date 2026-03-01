import crypto from "crypto";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { supabaseServer } from "@/lib/supabaseServer";
import { getClientIp, internalError } from "@/lib/security";

const resend = new Resend(process.env.RESEND_API_KEY);

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

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const jobId = String(body.jobId ?? "").trim();
    const firstName = String(body.firstName ?? "").trim();
    const contact = String(body.contact ?? "").trim();
    const message = String(body.message ?? "").trim();
    const website = String(body.website ?? "").trim();
    const rodo = Boolean(body.rodo);

    if (website) {
      return NextResponse.json({ success: true, ignored: true });
    }

    if (!jobId || !firstName || !contact || !message) {
      return NextResponse.json({ error: "Brak danych" }, { status: 400 });
    }
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

    const { data: job, error: jobErr } = await supabaseServer
      .from("jobs")
      .select("id,title,company,contact")
      .eq("id", jobId)
      .single();

    if (jobErr || !job) {
      return NextResponse.json({ error: "Nie znaleziono oferty" }, { status: 404 });
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
