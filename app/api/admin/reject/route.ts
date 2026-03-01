import { NextResponse } from "next/server";
import { Resend } from "resend";
import { supabaseServer } from "@/lib/supabaseServer";
import { requireAdminRequest } from "@/lib/security";

const resend = new Resend(process.env.RESEND_API_KEY);

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(req: Request) {
  const guard = await requireAdminRequest(req);
  if (guard) {
    return guard;
  }

  const body = await req.json().catch(() => ({}));
  const submissionId = String(body.submissionId ?? "").trim();
  const reason = String(body.reason ?? "").trim();

  if (!submissionId) {
    return NextResponse.json({ error: "Missing submissionId" }, { status: 400 });
  }
  if (!reason) {
    return NextResponse.json({ error: "Missing reason" }, { status: 400 });
  }

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


