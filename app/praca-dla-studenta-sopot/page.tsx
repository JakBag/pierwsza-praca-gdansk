import type { Metadata } from "next";
import CityOffersLanding from "@/components/CityOffersLanding";
import { getPublishedJobsByCity } from "@/lib/jobsDb";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Praca dla studenta Sopot | Oferty bez doświadczenia",
  description:
    "Praca dla studenta w Sopocie: lokalne oferty bez doświadczenia, dorywcze, weekendowe i sezonowe. Dedykowana podstrona tylko dla Sopotu.",
  alternates: {
    canonical: "/praca-dla-studenta-sopot",
  },
};

export default async function StudentJobsSopotPage() {
  const jobs = await getPublishedJobsByCity("Sopot");

  return (
    <CityOffersLanding
      h1="Praca dla studenta w Sopocie"
      intro="Ta strona pomaga studentom znaleźć oferty pracy w Sopocie: sezonowe, dorywcze, weekendowe, bez doświadczenia i takie, które da się pogodzić z planem zajęć."
      cityDisplayName="Sopocie"
      jobs={jobs}
      body={[
        "Sopot ma specyficzną dynamikę rynku pracy dla osób uczących się. Kiedy ktoś wpisuje praca student Sopot, zazwyczaj szuka ofert blisko uczelni, SKM, centrum albo miejsc z dużym ruchem klientów. Intencja jest bardzo lokalna, dlatego dedykowana podstrona działa lepiej niż szeroka lista dla całego regionu. Tutaj użytkownik od razu widzi ogłoszenia przypisane do Sopotu i treść zbudowaną wokół realnych potrzeb studenta: dorobienia po zajęciach, pracy w weekendy i wejścia na rynek bez dużego doświadczenia.",
        "W Sopocie szczególnie często pojawiają się oferty związane z gastronomią, hotelarstwem, eventami, obsługą gości, sprzedażą i pracą sezonową. To naturalne dla miasta o silnym profilu usługowym i turystycznym. Jeśli interesuje Cię praca dla studenta Sopot, właśnie te kategorie zwykle dają najwięcej elastyczności. Wiele stanowisk wymaga dobrej komunikacji, punktualności i gotowości do pracy z ludźmi, ale nie wymaga długiego stażu zawodowego. To dobra wiadomość dla osób, które dopiero budują pierwsze doświadczenia do CV.",
        "Praca dorywcza student Sopot często bywa oparta o grafik tygodniowy albo zmiany dopasowane do obłożenia. Z jednej strony daje to mniejszą przewidywalność, z drugiej pozwala łatwiej połączyć pracę z nauką. W praktyce warto szukać ofert z oznaczeniami weekendy, elastyczny grafik, zmiany popołudniowe, praca sezonowa albo praca od zaraz. Jeśli zależy Ci na szybkim starcie, obserwuj nowe ogłoszenia regularnie, bo w prostych rolach usługowych decyzje rekrutacyjne zapadają szybko.",
        "Praca bez doświadczenia Sopot jest jak najbardziej możliwa, ale trzeba patrzeć na wymagania praktycznie. Jeżeli oferta dotyczy kontaktu z klientem, liczą się kultura osobista, dyspozycyjność i umiejętność pracy w tempie. W rolach administracyjnych albo wsparcia sprzedaży ważna może być dokładność i dobra organizacja. Pracodawcy nie zawsze oczekują długiej historii zatrudnienia, za to chcą wiedzieć, czy kandydat naprawdę może pracować w deklarowanych godzinach. Krótkie, rzeczowe zgłoszenie z taką informacją często działa lepiej niż ogólny opis bez konkretów.",
        "Ta podstrona ma jeden cel: ułatwić trafienie dokładnie na to, czego użytkownik szuka. Zamiast szerokiej strony o Trójmieście dostajesz lokalny listing Sopotu oraz treść opisującą, gdzie i jak najłatwiej zacząć. Dzięki temu łatwiej ocenić, czy lepsza będzie praca sezonowa, weekendowa czy regularna praca na część etatu. Jeżeli zależy Ci na szybkim znalezieniu ogłoszeń w jednym mieście, taka struktura jest po prostu bardziej użyteczna i czytelna.",
      ]}
      faq={[
        {
          question: "Jakie branże najczęściej zatrudniają studentów w Sopocie?",
          answer:
            "Najczęściej są to gastronomia, hotelarstwo, sprzedaż, eventy i szeroko rozumiana obsługa klienta. W Sopocie duża część ofert wynika z charakteru miasta i ruchu turystycznego.",
        },
        {
          question: "Czy w Sopocie łatwo znaleźć pracę sezonową lub weekendową?",
          answer:
            "Tak. To jedno z częstszych zapytań i jednocześnie jeden z najmocniejszych segmentów lokalnego rynku pracy dla studentów.",
        },
        {
          question: "Czy praca bez doświadczenia w Sopocie jest realna?",
          answer:
            "Tak. W wielu rolach usługowych ważniejsze od doświadczenia są dyspozycyjność, komunikacja i gotowość do wdrożenia.",
        },
        {
          question: "Jak zwiększyć szansę na odpowiedź od pracodawcy?",
          answer:
            "Aplikuj szybko, napisz wprost kiedy możesz pracować i zaznacz, czy interesuje Cię praca sezonowa, dorywcza czy stała na część etatu.",
        },
      ]}
      relatedLinks={[
        { href: "/praca-dla-studenta-gdansk", label: "Praca dla studenta Gdańsk" },
        { href: "/praca-dla-studenta-gdynia", label: "Praca dla studenta Gdynia" },
        { href: "/", label: "Oferty pracy dla studentów w Trójmieście" },
      ]}
    />
  );
}
