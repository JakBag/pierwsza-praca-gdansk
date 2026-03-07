import type { Metadata } from "next";
import Navbar from "@/components/NavBar";
import { getPublishedJobs } from "@/lib/jobsDb";
import OffersClient from "@/components/OffersClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    absolute: "Praca dla studentów Gdańsk - aktualne oferty pracy | Pierwsza Praca Trójmiasto",
  },
  description:
    "Aktualne oferty pracy dla studentów: praca bez doświadczenia, dorywcza, na pół etatu i weekendowa w Trójmieście (Polska).",
  alternates: {
    canonical: "/praca-dla-studentow-gdansk",
  },
};

export default async function OffersPage() {
  const jobs = await getPublishedJobs();

  return (
    <>
      <Navbar />
      <main className="bg-slate-50">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10 sm:py-12">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Praca dla studentów w Gdańsku</h1>
          <p className="text-slate-600 mt-2">
            Na tej stronie znajdziesz aktualne oferty pracy dla studentów w Trójmieście. Publikujemy ogłoszenia pracy
            w Gdańsku, Gdyni i Sopocie, w tym pracę dorywczą, weekendową oraz pierwszą pracę bez doświadczenia.
            Oferty są regularnie odświeżane, dlatego warto zaglądać codziennie i aplikować od razu po publikacji.
          </p>

          <div className="mt-8">
            <OffersClient jobs={jobs} />
          </div>
        </div>
      </main>
    </>
  );
}
