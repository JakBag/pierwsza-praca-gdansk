import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/NavBar";
import ApplyForm from "@/components/ApplyForm";
import FormattedDescription from "@/components/FormattedDescription";
import { getJobById, getPublishedJobs } from "@/lib/jobsDb";

export const dynamic = "force-dynamic";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pierwszapracatrojmiasto.pl";

function formatTimeCommitment(value: string | null) {
  const raw = String(value ?? "").trim().toLowerCase();
  if (!raw) return null;
  if (raw === "pelny etat" || raw === "pełny etat" || raw === "pelny etay") return "Pełny etat";
  if (raw === "czesc etatu" || raw === "część etatu") return "Część etatu";
  if (raw === "praca sezonowa") return "Praca sezonowa";
  return value ?? null;
}

function formatContractType(value: string | null) {
  const raw = String(value ?? "").trim().toLowerCase();
  if (!raw) return null;
  if (raw === "umowa o prace" || raw === "umowa o pracę") return "Umowa o pracę";
  if (raw === "staz / praktyki" || raw === "staż / praktyki") return "Staż / praktyki";
  return value ?? null;
}

function normalizeText(value: string | null | undefined) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const job = await getJobById(id);

  if (!job) {
    return {
      title: "Oferta nieznaleziona",
      description: "Ta oferta nie jest już dostępna.",
    };
  }

  return {
    title: `${job.title} - ${job.company}`,
    description: (job.description ?? "").slice(0, 160) || `Oferta pracy: ${job.title} w ${job.company}.`,
    alternates: {
      canonical: `/praca-dla-studentow-gdansk/${job.id}`,
    },
    openGraph: {
      title: `${job.title} - ${job.company}`,
      description: (job.description ?? "").slice(0, 160),
      url: `${siteUrl}/praca-dla-studentow-gdansk/${job.id}`,
      type: "article",
    },
  };
}

export default async function OfferDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = await getJobById(id);

  if (!job) {
    return (
      <>
        <Navbar />
        <main className="bg-slate-50 min-h-screen">
          <div className="max-w-[1200px] mx-auto px-6 py-12">
            <h1 className="text-2xl font-bold">Nie znaleziono oferty</h1>
          </div>
        </main>
      </>
    );
  }

  const normalizedPay = String(job.pay ?? "").trim();
  const formattedPay = normalizedPay
    ? /zł|zl/i.test(normalizedPay)
      ? normalizedPay.replace(/zl/gi, "zł")
      : `${normalizedPay} zł`
    : null;
  const postedMs = Date.parse(String(job.created_at ?? ""));
  const postedLabel = Number.isFinite(postedMs)
    ? `Dodano ${new Date(postedMs).toLocaleDateString("pl-PL")}`
    : "Dodano niedawno";
  const expiresMs = Date.parse(String(job.expires_at ?? ""));
  const expiresLabel = Number.isFinite(expiresMs)
    ? `Wygasa ${new Date(expiresMs).toLocaleDateString("pl-PL")}`
    : null;
  const cityValue = String(job.city ?? "").trim();
  const districtValue = String(job.district ?? "").trim();
  const locationValue = String(job.location ?? "").trim();
  const cityLabel = [cityValue, districtValue].filter(Boolean).join(" - ");
  const normalizedLocation = normalizeText(locationValue);
  const normalizedCity = normalizeText(cityValue);
  const showLocation = Boolean(locationValue && normalizedLocation !== normalizedCity && normalizedLocation !== "gdansk");
  const isGdanskJob = normalizedCity === "gdansk";
  const hideExpirationDate = Boolean(job.hide_expiration_date);
  const externalApplyUrl = String(job.external_apply_url ?? "").trim();
  const isAggregatedJob = Boolean(job.is_aggregated) && Boolean(externalApplyUrl);
  const contractLabel = formatContractType(job.contract_type);
  const timeCommitmentLabel = formatTimeCommitment(job.time_commitment);
  const workModeLabel = String(job.work_mode ?? "").trim() || null;

  const allJobs = await getPublishedJobs();
  const relatedJobs = allJobs
    .filter(item => item.id !== job.id)
    .sort((a, b) => {
      const aSameCity = normalizeText(a.city) === normalizedCity;
      const bSameCity = normalizeText(b.city) === normalizedCity;
      if (aSameCity && !bSameCity) return -1;
      if (!aSameCity && bSameCity) return 1;
      return 0;
    })
    .slice(0, 3);

  const jobPostingSchema = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description ?? "",
    datePosted: job.created_at,
    validThrough: hideExpirationDate ? undefined : (job.expires_at ?? undefined),
    employmentType: job.contract_type ?? undefined,
    hiringOrganization: {
      "@type": "Organization",
      name: job.company,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: cityValue || undefined,
        addressCountry: "PL",
      },
    },
    applicantLocationRequirements: {
      "@type": "Country",
      name: "PL",
    },
    directApply: !isAggregatedJob,
    url: `${siteUrl}/praca-dla-studentow-gdansk/${job.id}`,
  };

  return (
    <>
      <Navbar />
      <main className="bg-slate-50 min-h-screen">
        <div className="max-w-[1200px] mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
          <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="px-8 py-7 bg-gradient-to-r from-blue-600 to-blue-400 text-white">
              {isGdanskJob ? (
                <div className="mb-4 text-sm text-blue-50">
                  <Link href="/praca-dla-studenta-gdansk" className="font-semibold hover:text-white hover:underline">
                    Praca student Gdańsk
                  </Link>
                  <span className="mx-2">/</span>
                  <span>{job.title}</span>
                </div>
              ) : null}

              <h1 className="text-3xl font-bold leading-tight">{job.title}</h1>

              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-blue-50">
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-300" />
                  {job.company}
                </span>
                {cityLabel ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-cyan-200" />
                    {cityLabel}
                  </span>
                ) : null}
                {showLocation ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-100" />
                    {locationValue}
                  </span>
                ) : null}
              </div>

              <div className="mt-5 pt-4 border-t border-white/20 flex flex-wrap gap-2">
                {formattedPay ? (
                  <span className="rounded-full bg-white/15 px-3 py-1.5 text-sm font-medium">{formattedPay}</span>
                ) : null}
                {contractLabel ? (
                  <span className="rounded-full bg-white/15 px-3 py-1.5 text-sm font-medium">Umowa: {contractLabel}</span>
                ) : null}
                {timeCommitmentLabel ? (
                  <span className="rounded-full bg-white/15 px-3 py-1.5 text-sm font-medium">Wymiar: {timeCommitmentLabel}</span>
                ) : null}
                {workModeLabel ? (
                  <span className="rounded-full bg-white/15 px-3 py-1.5 text-sm font-medium">Tryb: {workModeLabel}</span>
                ) : null}
                <span className="rounded-full bg-white/15 px-3 py-1.5 text-sm font-medium">{postedLabel}</span>
                {!hideExpirationDate && expiresLabel ? (
                  <span className="rounded-full bg-white/15 px-3 py-1.5 text-sm font-medium">{expiresLabel}</span>
                ) : null}
              </div>
            </div>

            <div className="p-8">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Opis stanowiska</h2>
                <FormattedDescription text={job.description ?? ""} className="mt-3 text-slate-700 space-y-3" />
              </div>
            </div>
          </section>

          <aside className="bg-white border border-slate-200 rounded-2xl p-6 h-fit">
            {isAggregatedJob ? (
              <>
                <h2 className="font-semibold text-slate-900">Aplikuj w oryginalnym ogłoszeniu</h2>
                <p className="text-sm text-slate-600 mt-2">
                  Ta oferta jest agregowana. Przejdź do zewnętrznego źródła, aby wysłać aplikację.
                </p>
                <a
                  href={externalApplyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
                >
                  Przejdź do OLX
                </a>
              </>
            ) : (
              <>
                <h2 className="font-semibold text-slate-900">Zgłoś się</h2>
                <p className="text-sm text-slate-600 mt-2">Bez CV. Krótka wiadomość i kontakt.</p>
                <ApplyForm jobId={job.id} />
              </>
            )}
          </aside>
        </div>

        {relatedJobs.length > 0 ? (
          <section className="max-w-[1200px] mx-auto px-6 pb-12">
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-slate-900">Podobne oferty pracy</h2>
              <div className="mt-4 space-y-3">
                {relatedJobs.map(item => (
                  <Link
                    key={item.id}
                    href={`/praca-dla-studentow-gdansk/${item.id}`}
                    className="block rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 transition-colors hover:border-emerald-300 hover:bg-emerald-50"
                  >
                    {item.title}
                    {item.city ? ` - ${item.city}` : ""}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingSchema) }} />
    </>
  );
}
