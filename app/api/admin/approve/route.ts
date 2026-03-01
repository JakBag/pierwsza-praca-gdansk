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
  const pricePln = Number(body.pricePln ?? 0);

  if (!submissionId) {
    return NextResponse.json({ error: "Missing submissionId" }, { status: 400 });
  }

  const update: { status: string; price_pln?: number } = { status: "approved_unpaid" };
  if (Number.isFinite(pricePln) && pricePln > 0) {
    update.price_pln = Math.floor(pricePln);
  }

  const { data: sub, error: subErr } = await supabaseServer
    .from("job_submissions")
    .select("id,company,title,contact,price_pln")
    .eq("id", submissionId)
    .single();

  if (subErr || !sub) {
    return NextResponse.json({ error: subErr?.message ?? "Submission not found" }, { status: 404 });
  }

  const { error } = await supabaseServer
    .from("job_submissions")
    .update(update)
    .eq("id", submissionId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const companyEmail = String(sub.contact ?? "").trim().toLowerCase();
  if (!isEmail(companyEmail)) {
    return NextResponse.json({
      success: true,
      mailed: false,
      warning: "Brak poprawnego email w polu kontaktu",
    });
  }

  const from = process.env.MAIL_FROM ?? "onboarding@resend.dev";
  const subject = `Weryfikacja oferty zakończona: ${sub.title ?? "Oferta"}`;
  const safeCompany = String(sub.company ?? "Twoja firma");
  const effectivePrice = update.price_pln ?? Number(sub.price_pln ?? 0);
  const priceLine = Number.isFinite(effectivePrice) && effectivePrice > 0
    ? `${Math.floor(effectivePrice)} PLN`
    : "do potwierdzenia";

  const send = await resend.emails.send({
    from,
    to: companyEmail,
    subject,
    text: [
      `Cześć ${safeCompany},`,
      "",
      "Twoja oferta pomyślnie przeszła proces weryfikacji i oczekuje na płatność.",
      `Stanowisko: ${String(sub.title ?? "Oferta")}`,
      `Kwota: ${priceLine}`,
      "Faktura zostanie wysłana przez Bizky.",
      "",
      "Pozdrawiamy,",
      "Zespół Pierwsza Praca Gdańsk",
    ].join("\n"),
  });

  if (send.error) {
    return NextResponse.json({
      success: true,
      mailed: false,
      warning: send.error.message,
    });
  }

  return NextResponse.json({ success: true, mailed: true });
}
