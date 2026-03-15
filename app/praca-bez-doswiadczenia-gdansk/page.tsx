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
  "Praca bez doświadczenia Gdańsk - oferty dla studentów",
  "/praca-bez-doswiadczenia-gdansk"
);

export default async function GdanskNoExperiencePage() {
  const jobs = await getPublishedJobsByCity("Gdansk");
  const filteredJobs = filterGdanskJobs(jobs, ["bez doświadczenia", "przyuczenie", "szkolenie", "wdrożenie"]);

  return (
    <CityOffersLanding
      h1="Praca bez doświadczenia Gdańsk - oferty dla studentów"
      intro="Oferty z Gdańska dla studentów, którzy chcą zacząć bez wcześniejszego doświadczenia i szukają realnego wdrożenia zamiast pustych wymagań."
      cityDisplayName="Gdańska"
      jobs={filteredJobs}
      body={[
        "Ta podstrona zbiera oferty pod frazę praca bez doświadczenia Gdańsk. Intencja jest prosta: użytkownik chce szybko znaleźć role, do których można wejść bez długiej historii zatrudnienia i bez rozbudowanego CV.",
        "Najczęściej będą to stanowiska w obsłudze klienta, handlu, gastronomii, prostym wsparciu biura, logistyce albo e-commerce. W takich rolach pracodawcy częściej sprawdzają dyspozycyjność, komunikację i gotowość do nauki niż listę poprzednich firm.",
        "Jeśli chcesz zwiększyć szansę na odpowiedź, aplikuj konkretnie. Napisz, kiedy możesz pracować, ile godzin tygodniowo szukasz i czy interesuje Cię praca dorywcza, weekendowa czy regularna. To skraca drogę do kontaktu i lepiej odpowiada na potrzeby lokalnego pracodawcy.",
      ]}
      faq={[
        {
          question: "Czy praca bez doświadczenia w Gdańsku jest realna dla studenta?",
          answer:
            "Tak. Wiele lokalnych ogłoszeń jest kierowanych do osób uczących się i zakłada przyuczenie albo krótkie wdrożenie na start.",
        },
        {
          question: "Na jakie frazy zwracać uwagę w ofertach bez doświadczenia?",
          answer:
            "Najczęściej są to sformułowania typu przyuczenie, szkolenie, wdrożenie, praca od zaraz albo elastyczne godziny.",
        },
      ]}
      primaryLink={{ href: "/praca-dla-studenta-gdansk", label: "Praca student Gdańsk" }}
      faqLinks={gdanskFaqLinks}
      relatedLinks={gdanskRelatedLinks}
      relatedLinksTitle="Powiązane podstrony Gdańsk"
    />
  );
}
