import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/NavBar";
import Hero from "@/components/Hero";
import WhySection from "@/components/WhySection";
import { getPublishedJobs } from "@/lib/jobsDb";
import OffersClient from "@/components/OffersClient";

export const metadata: Metadata = {
  title: "Praca dla studentów",
  description:
    "Praca dla studentów w Polsce (Trójmiasto): pierwsza praca bez doświadczenia, praca dorywcza, na pół etatu i weekendowa.",
  alternates: {
    canonical: "/",
  },
};

export default async function Home() {
  const jobs = await getPublishedJobs();
  const latestJobs = jobs.slice(0, 3);

  return (
    <>
      <Navbar />
      <Hero />
      <WhySection />

      <section className="bg-white border-y border-slate-200">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10 sm:py-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Oferty pracy dla studentów według miasta</h2>
          <p className="mt-3 max-w-3xl text-slate-600">
            Jeśli szukasz lokalnej strony pod konkretne miasto, przejdź od razu do dedykowanej podstrony.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Link
              href="/praca-dla-studenta-gdansk"
              className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-800 hover:border-emerald-300 hover:bg-emerald-50 transition-colors"
            >
              Praca dla studenta Gdańsk
            </Link>
            <Link
              href="/praca-dla-studenta-gdynia"
              className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-800 hover:border-emerald-300 hover:bg-emerald-50 transition-colors"
            >
              Oferty pracy dla studentów w Gdyni
            </Link>
            <Link
              href="/praca-dla-studenta-sopot"
              className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-800 hover:border-emerald-300 hover:bg-emerald-50 transition-colors"
            >
              Oferty pracy dla studentów w Sopocie
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white border-b border-slate-200">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10 sm:py-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Najnowsze oferty pracy</h2>
          <div className="mt-5 space-y-3">
            {latestJobs.map(job => (
              <Link
                key={job.id}
                href={`/praca-dla-studentow-gdansk/${job.id}`}
                className="block rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 hover:border-emerald-300 hover:bg-emerald-50 transition-colors"
              >
                {job.title}
                {job.city ? ` - ${job.city}` : ""}
              </Link>
            ))}
          </div>
          <div className="mt-5">
            <Link href="/praca-dla-studenta-gdansk" className="text-emerald-700 font-semibold hover:underline">
              Zobacz wszystkie oferty
            </Link>
          </div>
        </div>
      </section>

      <section id="oferty" className="bg-slate-50">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10 sm:py-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Sprawdzone oferty pracy dla studentów</h2>

          <div className="mt-8">
            <OffersClient jobs={jobs} />
          </div>
        </div>
      </section>
    </>
  );
}

