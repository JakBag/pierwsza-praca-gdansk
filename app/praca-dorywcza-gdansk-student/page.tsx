import CityOffersLanding from "@/components/CityOffersLanding";
import { getPublishedJobsByCity } from "@/lib/jobsDb";
import {
  buildLandingMetadata,
  filterGdanskJobs,
  gdanskFaqLinks,
  gdanskRelatedLinks,
} from "../praca-dla-studenta-gdansk/gdanskLandingData";

export const dynamic = "force-dynamic";

export const metadata = buildLandingMetadata(
  "Praca dorywcza student Gdańsk - lokalne oferty",
  "/praca-dorywcza-gdansk-student"
);

export default async function GdanskCasualWorkPage() {
  const jobs = await getPublishedJobsByCity("Gdansk");
  const filteredJobs = filterGdanskJobs(jobs, ["dorywcza", "elastycznie", "zmiany", "na godziny"]);

  return (
    <CityOffersLanding
      h1="Praca dorywcza student Gdańsk - lokalne oferty"
      intro="Oferty z Gdańska dla studentów, którzy chcą dorobić po zajęciach, na pojedynczych zmianach albo w elastycznym grafiku."
      cityDisplayName="Gdańska"
      jobs={filteredJobs}
      body={[
        "Praca dorywcza student Gdańsk to zwykle fraza wpisywana przez osoby, które nie szukają pełnego etatu, tylko sposobu na regularne dorobienie w trakcie semestru. Właśnie dlatego warto mieć osobny landing pod tę intencję.",
        "Dorywcze role często pojawiają się w handlu, usługach, gastronomii, magazynach i przy krótszych zleceniach operacyjnych. Przewagą takich ofert jest elastyczność, ale też mniejsza przewidywalność, więc trzeba patrzeć na lokalizację i konkretne godziny pracy.",
        "Z punktu widzenia studenta najważniejsze jest szybkie porównanie, czy dana oferta faktycznie pasuje do planu zajęć. Lokalny filtr do samego Gdańska skraca tę drogę i pozwala szybciej zdecydować, gdzie aplikować.",
      ]}
      faq={[
        {
          question: "Czy praca dorywcza w Gdańsku nadaje się dla studentów dziennych?",
          answer:
            "Tak. To jeden z najczęstszych modeli pracy dla osób studiujących, zwłaszcza gdy liczy się elastyczny grafik i możliwość dorobienia po zajęciach.",
        },
        {
          question: "Na co uważać przy pracy dorywczej?",
          answer:
            "Najlepiej od razu sprawdzić liczbę godzin, miejsce pracy, realny grafik i to, czy oferta dotyczy pojedynczych zmian czy regularnej współpracy.",
        },
      ]}
      primaryLink={{ href: "/praca-dla-studenta-gdansk", label: "Praca student Gdańsk" }}
      faqLinks={gdanskFaqLinks}
      relatedLinks={gdanskRelatedLinks}
      relatedLinksTitle="Powiązane podstrony Gdańsk"
    />
  );
}
