import { NextResponse } from "next/server";
import { getResendClient } from "@/lib/resendServer";
import { supabaseServer } from "@/lib/supabaseServer";
import { requireAdminMutation } from "@/lib/security";
import { adminRejectSchema, parseBody } from "@/lib/validation";

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(req: Request) {
  const guard = await requireAdminMutation(req);
  if (guard) {
    return guard;
  }

  const parsed = await parseBody(req, adminRejectSchema);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const { submissionId, reason } = parsed.data;

  const { data: sub, error: subErr } = await supabaseServer
    .from("job_submissions")
    .select("id,company,title,contact")
    .eq("id", submissionId)
    .single();

  if (subErr || !sub) {
    return NextResponse.json({ error: subErr?.message ?? "Submission not found" }, { status: 404 });
  }

  const { error } = await supabaseServer
    .from("job_submissions")
    .update({ status: "rejected" })
    .eq("id", submissionId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const companyEmail = String(sub.contact ?? "").trim().toLowerCase();
  if (!isEmail(companyEmail)) {
    return NextResponse.json({
      ok: true,
      mailed: false,
      warning: "Brak poprawnego email w polu kontaktu",
    });
  }

  const from = process.env.MAIL_FROM ?? "onboarding@resend.dev";
  const subject = `Aktualizacja zgloszenia: ${sub.title ?? "Oferta"}`;
  const safeCompany = String(sub.company ?? "Twoja firma");
  const resend = getResendClient();
  if (!resend) {
    return NextResponse.json({
      ok: true,
      mailed: false,
      warning: "Brak konfiguracji RESEND_API_KEY",
    });
  }

  const send = await resend.emails.send({
    from,
    to: companyEmail,
    subject,
    text: [
      `Czesc ${safeCompany},`,
      "",
      "Dziekujemy za przeslanie oferty.",
      "Niestety na ten moment nie mozemy jej opublikowac.",
      "",
      "Uzasadnienie:",
      reason,
      "",
      "Mozesz poprawic tresc i wyslac zgloszenie ponownie.",
      "",
      "Pozdrawiamy,",
      "Zespol Pierwsza Praca Gdansk",
    ].join("\n"),
  });

  if (send.error) {
    return NextResponse.json({
      ok: true,
      mailed: false,
      warning: send.error.message,
    });
  }

  return NextResponse.json({ ok: true, mailed: true });
}
