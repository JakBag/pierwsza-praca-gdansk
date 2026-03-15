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
  "Praca weekendowa student Gdańsk - aktualne oferty",
  "/praca-weekendowa-student-gdansk"
);

export default async function GdanskWeekendPage() {
  const jobs = await getPublishedJobsByCity("Gdansk");
  const filteredJobs = filterGdanskJobs(jobs, ["weekend", "weekendy", "soboty", "niedziele"]);

  return (
    <CityOffersLanding
      h1="Praca weekendowa student Gdańsk - aktualne oferty"
      intro="Oferty z Gdańska dla studentów, którzy chcą pracować głównie w weekendy i nie rozwalać sobie planu zajęć w tygodniu."
      cityDisplayName="Gdańska"
      jobs={filteredJobs}
      body={[
        "Fraza praca weekendowa student Gdańsk zwykle pojawia się wtedy, gdy nauka zajmuje większość tygodnia i zostają głównie soboty, niedziele albo wieczory. To bardzo konkretna intencja, więc dedykowany landing ma sens zarówno dla użytkownika, jak i pod SEO.",
        "Najwięcej takich ofert pojawia się w gastronomii, sprzedaży, eventach, usługach i miejscach z dużym ruchem klientów. W praktyce liczy się szybka reakcja, bo pracodawcy często chcą zamknąć rekrutację jeszcze przed najbliższym weekendem.",
        "W zgłoszeniu warto od razu napisać, czy możesz pracować oba dni weekendowe, w jakich godzinach jesteś dostępny i czy interesują Cię pojedyncze zmiany czy stała współpraca. Taka wiadomość skraca proces po obu stronach.",
      ]}
      faq={[
        {
          question: "Gdzie najczęściej trafia się praca weekendowa dla studentów w Gdańsku?",
          answer:
            "Najczęściej w gastronomii, handlu, eventach i punktach usługowych, gdzie ruch klientów rośnie pod koniec tygodnia.",
        },
        {
          question: "Czy warto aplikować od razu na oferty weekendowe?",
          answer:
            "Tak. W takich rolach szybkość zgłoszenia ma duże znaczenie, bo firmy często potrzebują wsparcia na najbliższe dni.",
        },
      ]}
      primaryLink={{ href: "/praca-dla-studenta-gdansk", label: "Praca student Gdańsk" }}
      faqLinks={gdanskFaqLinks}
      relatedLinks={gdanskRelatedLinks}
      relatedLinksTitle="Powiązane podstrony Gdańsk"
    />
  );
}
