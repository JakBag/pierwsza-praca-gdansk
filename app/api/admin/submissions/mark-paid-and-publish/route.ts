import { NextResponse } from "next/server";
import { getResendClient } from "@/lib/resendServer";
import { supabaseServer } from "@/lib/supabaseServer";
import { requireAdminMutation } from "@/lib/security";
import { adminMarkPaidSchema, parseBody } from "@/lib/validation";

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function addDaysIso(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

export async function POST(req: Request) {
  const guard = await requireAdminMutation(req);
  if (guard) {
    return guard;
  }

  const parsed = await parseBody(req, adminMarkPaidSchema);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const { submissionId, invoiceRef, durationDays } = parsed.data;

  const { data: sub, error: subErr } = await supabaseServer
    .from("job_submissions")
    .select("*")
    .eq("id", submissionId)
    .single();

  if (subErr || !sub) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  if (sub.status === "rejected" || sub.status === "rejected_unpaid" || sub.status === "published") {
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
      district: sub.district ?? null,
      tags: sub.tags ?? [],
      location: sub.location ?? null,
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
  const resend = getResendClient();
  if (!resend) {
    return NextResponse.json({
      success: true,
      jobId: jobRow.id,
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
      "Twoje zamowienie zostalo oplacone i opublikowane na stronie.",
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
