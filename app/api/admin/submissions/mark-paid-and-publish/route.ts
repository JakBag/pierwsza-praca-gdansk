import { NextResponse } from "next/server";
import { getResendClient } from "@/lib/resendServer";
import { requireAdminMutation } from "@/lib/security";
import { supabaseServer } from "@/lib/supabaseServer";
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
  const { submissionId, invoiceRef, durationDays, isAggregated, hideExpirationDate, externalApplyUrl } = parsed.data;

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
      is_aggregated: Boolean(isAggregated),
      hide_expiration_date: Boolean(hideExpirationDate),
      external_apply_url: String(externalApplyUrl ?? "").trim() || null,
    })
    .eq("id", submissionId);

  if (payErr) {
    return NextResponse.json({ error: payErr.message }, { status: 500 });
  }

  const expiresAt = addDaysIso(Number.isFinite(durationDays) && durationDays > 0 ? durationDays : 30);

  const { data: jobRow, error: jobErr } = await supabaseServer
    .from("jobs")
    .insert({
      title: String(sub.title ?? "").trim() || "Oferta",
      company: String(sub.company ?? "").trim() || "Firma",
      city: sub.city ?? "Gdansk",
      tags: sub.tags ?? [],
      location: sub.location ?? "Gdansk",
      contract_type: sub.contract_type ?? null,
      time_commitment: sub.time_commitment ?? null,
      work_mode: sub.work_mode ?? null,
      pay: sub.pay ?? null,
      description: sub.description ?? null,
      contact: sub.contact ?? null,
      is_aggregated: Boolean(sub.is_aggregated),
      hide_expiration_date: Boolean(sub.hide_expiration_date),
      external_apply_url: String(sub.external_apply_url ?? "").trim() || null,
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
