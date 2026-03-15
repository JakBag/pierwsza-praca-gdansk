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
  "Praca zdalna student Gdańsk - oferty hybrydowe i remote",
  "/praca-zdalna-student-gdansk"
);

export default async function GdanskRemotePage() {
  const jobs = await getPublishedJobsByCity("Gdansk");
  const filteredJobs = filterGdanskJobs(jobs, ["zdalnie", "zdalna", "hybrydowo", "hybrydowa", "remote"]);

  return (
    <CityOffersLanding
      h1="Praca zdalna student Gdańsk - oferty hybrydowe i remote"
      intro="Oferty z Gdańska dla studentów, którzy chcą pracować zdalnie albo hybrydowo i lepiej kontrolować czas między zajęciami a pracą."
      cityDisplayName="Gdańska"
      jobs={filteredJobs}
      body={[
        "Fraza praca zdalna student Gdańsk jest coraz bardziej naturalna, bo część lokalnych firm szuka wsparcia w modelu remote albo hybrydowym. Dotyczy to szczególnie prostego marketingu, researchu, e-commerce, obsługi klienta i zadań administracyjnych.",
        "Dla studenta taka forma pracy bywa wygodniejsza niż codzienne dojazdy, ale warto sprawdzać szczegóły. Nie każda oferta zdalna oznacza pełne remote, a hybryda może wymagać obecności w biurze w określone dni tygodnia.",
        "Właśnie dlatego lokalna podstrona ma sens: widzisz oferty z rynku Gdańska, ale możesz odsiać te, które lepiej pasują do studiowania dziennego i pracy między zajęciami.",
      ]}
      faq={[
        {
          question: "Jakie role najczęściej trafiają się studentom z Gdańska w pracy zdalnej?",
          answer:
            "Najczęściej są to stanowiska w obsłudze klienta, e-commerce, prostym marketingu, researchu i administracji operacyjnej.",
        },
        {
          question: "Czy hybryda też pasuje pod tę podstronę?",
          answer:
            "Tak. Dla wielu studentów hybrydowy model pracy jest praktyczny, bo ogranicza liczbę dojazdów, ale nadal daje kontakt z zespołem i wdrożenie na miejscu.",
        },
      ]}
      primaryLink={{ href: "/praca-dla-studenta-gdansk", label: "Praca student Gdańsk" }}
      faqLinks={gdanskFaqLinks}
      relatedLinks={gdanskRelatedLinks}
      relatedLinksTitle="Powiązane podstrony Gdańsk"
    />
  );
}
