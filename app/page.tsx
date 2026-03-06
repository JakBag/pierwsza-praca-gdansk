import type { Metadata } from "next";
import Navbar from "@/components/NavBar";
import Hero from "@/components/Hero";
import WhySection from "@/components/WhySection";
import { getPublishedJobs } from "@/lib/jobsDb";
import OffersClient from "@/components/OffersClient";

export const metadata: Metadata = {
  title: "Praca dla studentów",
  description:
    "Praca dla studentów w Polsce (Trójmiasto): pierwsza praca bez doświadczenia, praca dorywcza, na pół etatu i weekendowa.",
};

export default async function Home() {
  const jobs = await getPublishedJobs();

  return (
    <>
      <Navbar />
      <Hero />
      <WhySection />

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
