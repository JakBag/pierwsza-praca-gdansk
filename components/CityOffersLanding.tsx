import Link from "next/link";
import Navbar from "@/components/NavBar";
import OffersClient from "@/components/OffersClient";
import type { DbJob } from "@/lib/jobsDb";

type FaqItem = {
  question: string;
  answer: string;
};

type CityLink = {
  href: string;
  label: string;
};

type CityOffersLandingProps = {
  h1: string;
  intro: string;
  cityDisplayName: string;
  jobs: DbJob[];
  body: string[];
  faq: FaqItem[];
  relatedLinks: CityLink[];
};

export default function CityOffersLanding({
  h1,
  intro,
  cityDisplayName,
  jobs,
  body,
  faq,
  relatedLinks,
}: CityOffersLandingProps) {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map(item => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <Navbar />
      <main className="bg-slate-50">
        <section className="border-b border-slate-200 bg-white">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 sm:py-10">
            <div className="max-w-4xl">
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">{h1}</h1>
              <p className="mt-4 text-lg text-slate-700">{intro}</p>
              <div className="mt-5 flex flex-wrap gap-2 text-sm">
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-800">Bez doświadczenia</span>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-800">Praca dorywcza</span>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-800">Weekendy</span>
                <span className="rounded-full bg-violet-100 px-3 py-1 text-violet-800">Zdalnie i hybrydowo</span>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Aktualne oferty</h2>
            <p className="mt-2 max-w-3xl text-slate-600">
              Tylko ogłoszenia z {cityDisplayName}. Dzięki temu szybciej znajdziesz lokalne oferty bez przeglądania
              całego Trójmiasta.
            </p>
          </div>
          <OffersClient jobs={jobs} />
        </section>

        <section className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
            <article className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
              <div className="space-y-5 text-slate-700">
                {body.map(paragraph => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </article>

            <aside className="rounded-3xl border border-slate-200 bg-white p-6 h-fit">
              <h2 className="text-xl font-semibold text-slate-900">Szukasz pracy w konkretnym mieście?</h2>
              <div className="mt-5 space-y-3">
                {relatedLinks.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 hover:border-emerald-300 hover:bg-emerald-50 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </aside>
          </div>
        </section>

        <section className="border-t border-slate-200 bg-white">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 sm:py-10">
            <div className="max-w-4xl">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">FAQ</h2>
              <div className="mt-6 space-y-3">
                {faq.map(item => (
                  <details key={item.question} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <summary className="cursor-pointer font-semibold text-slate-900">{item.question}</summary>
                    <p className="mt-3 text-slate-700">{item.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    </>
  );
}
