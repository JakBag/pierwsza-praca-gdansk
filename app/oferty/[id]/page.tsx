import type { Metadata } from "next";
import Navbar from "@/components/NavBar";
import ApplyForm from "@/components/ApplyForm";
import FormattedDescription from "@/components/FormattedDescription";
import { getJobById } from "@/lib/jobsDb";

export const dynamic = "force-dynamic";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

function formatTimeCommitment(value: string | null) {
  const raw = String(value ?? "").trim().toLowerCase();
  if (!raw) return "-";
  if (raw === "pelny etat" || raw === "pełny etat" || raw === "pelny etay") return "Pełny etat";
  if (raw === "czesc etatu" || raw === "część etatu") return "Część etatu";
  return value ?? "-";
}

function formatContractType(value: string | null) {
  const raw = String(value ?? "").trim().toLowerCase();
  if (!raw) return "-";
  if (raw === "umowa o prace" || raw === "umowa o pracę") return "Umowa o pracę";
  if (raw === "staz / praktyki" || raw === "staż / praktyki") return "Staż / praktyki";
  return value ?? "-";
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
      canonical: `/oferty/${job.id}`,
    },
    openGraph: {
      title: `${job.title} - ${job.company}`,
      description: (job.description ?? "").slice(0, 160),
      url: `${siteUrl}/oferty/${job.id}`,
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

  const normalizedPay = job.pay?.trim();
  const formattedPay = normalizedPay
    ? /zł|zl/i.test(normalizedPay)
      ? normalizedPay.replace(/zl/gi, "zł")
      : `${normalizedPay} zł`
    : "-";
  const postedMs = Date.parse(String(job.created_at ?? ""));
  const postedLabel = Number.isFinite(postedMs)
    ? `Dodano ${new Date(postedMs).toLocaleDateString("pl-PL")}`
    : "Dodano niedawno";
  const expiresMs = Date.parse(String(job.expires_at ?? ""));
  const expiresLabel = Number.isFinite(expiresMs)
    ? `Wygasa ${new Date(expiresMs).toLocaleDateString("pl-PL")}`
    : "Bez terminu";

  const jobPostingSchema = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description ?? "",
    datePosted: job.created_at,
    validThrough: job.expires_at ?? undefined,
    employmentType: job.contract_type ?? undefined,
    hiringOrganization: {
      "@type": "Organization",
      name: job.company,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.city ?? "Gdańsk",
        addressCountry: "PL",
      },
    },
    applicantLocationRequirements: {
      "@type": "Country",
      name: "PL",
    },
    directApply: true,
    url: `${siteUrl}/oferty/${job.id}`,
  };

  return (
    <>
      <Navbar />
      <main className="bg-slate-50 min-h-screen">
        <div className="max-w-[1200px] mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
          <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="px-8 py-7 bg-gradient-to-r from-blue-600 to-blue-400 text-white">
              <h1 className="text-3xl font-bold leading-tight">{job.title}</h1>

              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-blue-50">
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-300" />
                  {job.company}
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-cyan-200" />
                  {job.city ?? "-"}
                  {job.district ? ` - ${job.district}` : ""}
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-100" />
                  {job.location ?? "-"}
                </span>
              </div>

              <div className="mt-5 pt-4 border-t border-white/20 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/15 px-3 py-1.5 text-sm font-medium">
                  {formattedPay} / h
                </span>
                <span className="rounded-full bg-white/15 px-3 py-1.5 text-sm font-medium">
                  Umowa: {formatContractType(job.contract_type)}
                </span>
                <span className="rounded-full bg-white/15 px-3 py-1.5 text-sm font-medium">
                  Wymiar: {formatTimeCommitment(job.time_commitment)}
                </span>
                <span className="rounded-full bg-white/15 px-3 py-1.5 text-sm font-medium">
                  Tryb: {job.work_mode ?? "-"}
                </span>
                <span className="rounded-full bg-white/15 px-3 py-1.5 text-sm font-medium">
                  {postedLabel}
                </span>
                <span className="rounded-full bg-white/15 px-3 py-1.5 text-sm font-medium">
                  {expiresLabel}
                </span>
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
            <h2 className="font-semibold text-slate-900">Zgłoś się</h2>
            <p className="text-sm text-slate-600 mt-2">Bez CV. Krótka wiadomość i kontakt.</p>
            <ApplyForm jobId={job.id} />
          </aside>
        </div>
      </main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingSchema) }}
      />
    </>
  );
}

