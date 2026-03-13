import type { Metadata } from "next";
import CityOffersLanding from "@/components/CityOffersLanding";
import { getPublishedJobsByCity } from "@/lib/jobsDb";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Praca dla studenta Gdynia | Oferty bez doświadczenia",
  description:
    "Praca dla studenta w Gdyni: aktualne oferty bez doświadczenia, dorywcze, weekendowe i na część etatu. Lokalny listing tylko dla Gdyni.",
  alternates: {
    canonical: "/praca-dla-studenta-gdynia",
  },
};

export default async function StudentJobsGdyniaPage() {
  const jobs = await getPublishedJobsByCity("Gdynia");

  return (
    <CityOffersLanding
      h1="Praca dla studenta w Gdyni"
      intro="Ta strona zbiera oferty dla studentów szukających pracy w Gdyni: od dorywczej i weekendowej po role biurowe, usługowe i bez doświadczenia."
      cityDisplayName="Gdyni"
      jobs={jobs}
      body={[
        "Osoba wpisująca praca dla studenta Gdynia zwykle oczekuje krótkiej drogi od wyszukania do aplikacji. Nie chce filtrować wielu miast naraz ani domyślać się, które oferty naprawdę są lokalne. Dlatego ten landing pokazuje tylko ogłoszenia przypisane do Gdyni i opisuje najczęstsze scenariusze, z jakimi spotykają się studenci na tym rynku. To ważne zwłaszcza wtedy, gdy liczy się dojazd, możliwość pracy po zajęciach i szybkie porównanie, czy lepiej celować w gastronomię, handel, logistykę czy prostą pracę biurową.",
        "Gdynia ma inną strukturę ofert niż duże, bardzo rozproszone miasta. Sporo ogłoszeń dla studentów pojawia się w handlu, punktach usługowych, restauracjach, przy eventach, w obsłudze klienta i w rolach związanych z ruchem turystycznym. Do tego dochodzą stanowiska magazynowe, wsparcie sprzedaży i zadania administracyjne w mniejszych firmach. Jeśli interesuje Cię praca bez doświadczenia Gdynia, właśnie w tych segmentach najłatwiej trafić na oferty z wdrożeniem, jasnym grafikiem i możliwością rozpoczęcia pracy bez długiego procesu rekrutacyjnego.",
        "Praca dorywcza student Gdynia często oznacza zmianowość i dyspozycyjność w konkretnych porach tygodnia. W praktyce dobrze sprawdzają się role popołudniowe, weekendowe albo sezonowe, bo można je pogodzić z nauką. Wiele firm szuka osób do wsparcia w godzinach największego ruchu, więc nie zawsze potrzebny jest pełny etat. Jeżeli studiujesz dziennie, zwracaj uwagę na opisy z frazami elastyczne godziny, praca na część etatu, weekendy, grafik ustalany tygodniowo lub możliwość łączenia pracy z zajęciami.",
        "Na lokalnym rynku coraz częściej pojawiają się też role zdalne i hybrydowe, szczególnie w obsłudze klienta, prostym marketingu, sprzedaży telefonicznej, wprowadzaniu danych czy researchu. Dla wielu studentów to dobry punkt wejścia, bo dojazdy nie zjadają czasu, a pierwsze doświadczenie można zdobyć bez pełnej dostępności na miejscu. W takiej sytuacji warto sprawdzić nie tylko lokalizację firmy, ale też opis modelu pracy i realne wymagania dotyczące obecności w biurze.",
        "Jeśli chcesz zwiększyć szanse na odpowiedź, aplikuj konkretnie. Napisz, na jakim jesteś roku, kiedy możesz pracować, czy interesuje Cię praca na tygodniu, w weekendy, czy szukasz zlecenia na stałe czy tylko na semestr. Lokalna strona z ofertami dla Gdyni ma pomóc właśnie w takim szybkim dopasowaniu. Zamiast ogólnej listy z całego regionu widzisz oferty z jednego miasta, co lepiej odpowiada na intencję użytkownika i skraca drogę do kontaktu z pracodawcą.",
      ]}
      faq={[
        {
          question: "Jakie oferty najczęściej trafiają się studentom w Gdyni?",
          answer:
            "Najwięcej pojawia się w handlu, gastronomii, obsłudze klienta, logistyce i rolach usługowych. To segmenty, w których firmy regularnie szukają osób uczących się.",
        },
        {
          question: "Czy Gdynia ma dużo pracy weekendowej dla studentów?",
          answer:
            "Tak. Wiele ogłoszeń dotyczy zmian weekendowych, sezonowych i popołudniowych, co dobrze łączy się ze studiami dziennymi.",
        },
        {
          question: "Czy znajdę tu oferty bez doświadczenia?",
          answer:
            "Tak. Podstrona pokazuje także role z wdrożeniem i podstawowymi wymaganiami, odpowiednie dla osób szukających pierwszej pracy.",
        },
        {
          question: "Jak najlepiej aplikować na lokalne oferty w Gdyni?",
          answer:
            "Warto zgłaszać się szybko i od razu podać dyspozycyjność, preferowane godziny oraz informację, czy interesuje Cię praca dorywcza, stała czy weekendowa.",
        },
      ]}
      relatedLinks={[
        { href: "/praca-dla-studenta-gdansk", label: "Praca dla studenta Gdańsk" },
        { href: "/praca-dla-studenta-sopot", label: "Praca dla studenta Sopot" },
        { href: "/", label: "Oferty pracy dla studentów w Trójmieście" },
      ]}
    />
  );
}
