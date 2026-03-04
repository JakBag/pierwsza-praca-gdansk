import type { Metadata } from "next";
import Navbar from "@/components/NavBar";
import { getPublishedJobs } from "@/lib/jobsDb";
import OffersClient from "@/components/OffersClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Oferty pracy dla studentow",
  description:
    "Aktualne oferty pracy dla studentow: praca bez doswiadczenia, dorywcza, na pol etatu i weekendowa w Trojmiescie (Polska).",
};

export default async function OffersPage() {
  const jobs = await getPublishedJobs();

  return (
    <>
      <Navbar />
      <main className="bg-slate-50">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10 sm:py-12">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Oferty pracy dla studentow w Trojmiescie</h1>
          <p className="text-slate-600 mt-2">Praca bez doswiadczenia, dorywcza, na pol etatu i weekendowa.</p>

          <div className="mt-8">
            <OffersClient jobs={jobs} />
          </div>
        </div>
      </main>
    </>
  );
}
