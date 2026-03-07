import { NextResponse } from "next/server";
import { Resend } from "resend";
import { supabaseServer } from "@/lib/supabaseServer";

const resend = new Resend(process.env.RESEND_API_KEY);

function isAuthorized(req: Request) {
  return req.headers.get("x-admin-key") === process.env.ADMIN_KEY;
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function addDaysIso(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const submissionId = String(body.submissionId ?? "").trim();
  const invoiceRef = String(body.invoiceRef ?? "").trim();
  const durationDays = Number(body.durationDays ?? 30);

  if (!submissionId) {
    return NextResponse.json({ error: "Missing submissionId" }, { status: 400 });
  }

  const { data: sub, error: subErr } = await supabaseServer
    .from("job_submissions")
    .select("*")
    .eq("id", submissionId)
    .single();

  if (subErr || !sub) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  if (sub.status === "rejected" || sub.status === "published") {
    return NextResponse.json({ error: "Submission is not publishable" }, { status: 400 });
  }

  const paidAt = new Date().toISOString();
  const { error: payErr } = await supabaseServer
    .from("job_submissions")
    .update({
      payment_status: "paid",
      paid_at: paidAt,
      invoice_ref: invoiceRef || null,
      status: "published",
    })
    .eq("id", submissionId);

  if (payErr) {
    return NextResponse.json({ error: payErr.message }, { status: 500 });
  }

  const expiresAt = addDaysIso(Number.isFinite(durationDays) && durationDays > 0 ? durationDays : 30);

  const { data: jobRow, error: jobErr } = await supabaseServer
    .from("jobs")
    .insert({
      title: sub.title,
      company: sub.company,
      city: sub.city ?? "Gdansk",
      tags: sub.tags ?? [],
      location: sub.location ?? "Gdansk",
      contract_type: sub.contract_type ?? null,
      time_commitment: sub.time_commitment ?? null,
      work_mode: sub.work_mode ?? null,
      pay: sub.pay ?? null,
      description: sub.description ?? null,
      contact: sub.contact ?? null,
      status: "active",
      expires_at: sub.expires_at ?? expiresAt,
      published: true,
    })
    .select("id")
    .single();

  if (jobErr || !jobRow) {
    return NextResponse.json({ error: jobErr?.message ?? "Publish failed" }, { status: 500 });
  }

  const { error: linkErr } = await supabaseServer
    .from("job_submissions")
    .update({ published_job_id: jobRow.id })
    .eq("id", submissionId);

  if (linkErr) {
    return NextResponse.json({ error: linkErr.message }, { status: 500 });
  }

  const companyEmail = String(sub.contact ?? "").trim().toLowerCase();
  if (!isEmail(companyEmail)) {
    return NextResponse.json({
      success: true,
      jobId: jobRow.id,
      mailed: false,
      warning: "Brak poprawnego email w polu kontaktu",
    });
  }

  const from = process.env.MAIL_FROM ?? "onboarding@resend.dev";
  const safeCompany = String(sub.company ?? "Twoja firma");
  const safeTitle = String(sub.title ?? "Oferta");
  const subject = `Platnosc zaksiegowana i oferta opublikowana: ${safeTitle}`;

  const send = await resend.emails.send({
    from,
    to: companyEmail,
    subject,
    text: [
      `Czesc ${safeCompany},`,
      "",
      "Twoje zamowienie zostało opłacone i opublikowane na stronie.",
      `Stanowisko: ${safeTitle}`,
      "",
      "Powodzenia w szukaniu kandydatow!",
      "",
      "Pozdrawiamy,",
      "Zespol Pierwsza Praca Gdansk",
    ].join("\n"),
  });

  if (send.error) {
    return NextResponse.json({
      success: true,
      jobId: jobRow.id,
      mailed: false,
      warning: send.error.message,
    });
  }

  return NextResponse.json({ success: true, jobId: jobRow.id, mailed: true });
}
