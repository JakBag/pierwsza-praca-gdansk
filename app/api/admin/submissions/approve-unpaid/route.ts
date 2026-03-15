import { NextResponse } from "next/server";
import { getResendClient } from "@/lib/resendServer";
import { supabaseServer } from "@/lib/supabaseServer";
import { requireAdminMutation } from "@/lib/security";
import { adminApproveSchema, parseBody } from "@/lib/validation";

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(req: Request) {
  const guard = await requireAdminMutation(req);
  if (guard) {
    return guard;
  }

  const parsed = await parseBody(req, adminApproveSchema);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const { submissionId, pricePln, isAggregated, hideExpirationDate, externalApplyUrl } = parsed.data;

  const update: {
    status: string;
    price_pln?: number;
    is_aggregated: boolean;
    hide_expiration_date: boolean;
    external_apply_url: string | null;
  } = {
    status: "approved_unpaid",
    is_aggregated: Boolean(isAggregated),
    hide_expiration_date: Boolean(hideExpirationDate),
    external_apply_url: String(externalApplyUrl ?? "").trim() || null,
  };
  if (typeof pricePln === "number" && Number.isFinite(pricePln) && pricePln > 0) {
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
  const subject = `Weryfikacja oferty zakonczona: ${sub.title ?? "Oferta"}`;
  const safeCompany = String(sub.company ?? "Twoja firma");
  const effectivePrice = update.price_pln ?? Number(sub.price_pln ?? 0);
  const priceLine = Number.isFinite(effectivePrice) && effectivePrice > 0
    ? `${Math.floor(effectivePrice)} PLN`
    : "do potwierdzenia";
  const resend = getResendClient();
  if (!resend) {
    return NextResponse.json({
      success: true,
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
      "Twoja oferta pomyslnie przeszla proces weryfikacji i oczekuje na platnosc.",
      `Stanowisko: ${String(sub.title ?? "Oferta")}`,
      `Kwota: ${priceLine}`,
      "Faktura zostanie wyslana przez Bizky.",
      "",
      "Pozdrawiamy,",
      "Zespol Pierwsza Praca Gdansk",
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

