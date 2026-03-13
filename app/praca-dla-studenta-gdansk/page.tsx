import type { Metadata } from "next";
import CityOffersLanding from "@/components/CityOffersLanding";
import { getPublishedJobsByCity } from "@/lib/jobsDb";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Praca dla studenta Gdańsk | Oferty bez doświadczenia",
  description:
    "Praca dla studenta w Gdańsku: aktualne oferty bez doświadczenia, dorywcze, weekendowe i zdalne. Lokalna strona z ogłoszeniami tylko z Gdańska.",
  alternates: {
    canonical: "/praca-dla-studenta-gdansk",
  },
};

export default async function StudentJobsGdanskPage() {
  const jobs = await getPublishedJobsByCity("Gdansk");

  return (
    <CityOffersLanding
      h1="Praca dla studenta w Gdańsku"
      intro="Ta strona jest dla studentów, którzy chcą szybko znaleźć lokalne oferty w Gdańsku: pracę bez doświadczenia, dorywczą, weekendową, zdalną albo pierwszą pracę na część etatu."
      cityDisplayName="Gdańsku"
      jobs={jobs}
      body={[
        "Fraza praca student Gdańsk zwykle oznacza bardzo konkretną potrzebę: ktoś nie szuka ogólnego poradnika o rynku pracy, tylko miejsca, w którym od razu zobaczy aktualne oferty z jednego miasta. Dlatego ta podstrona skupia się wyłącznie na Gdańsku. Jeśli studiujesz dziennie i potrzebujesz elastycznego grafiku, chcesz dorobić po zajęciach albo szukasz pierwszego stanowiska do CV, tutaj masz ogłoszenia zawężone do lokalnego rynku.",
        "Praca dla studenta Gdańsk najczęściej pojawia się w kilku powtarzalnych kategoriach. Dużo ofert dotyczy obsługi klienta, gastronomii, sprzedaży, punktów usługowych, magazynów, prostych prac administracyjnych i wsparcia biura. Coraz częściej pojawia się też praca zdalna lub hybrydowa przy researchu, obsłudze social mediów, umawianiu spotkań, wprowadzaniu danych albo wsparciu e-commerce. Dla osoby bez doświadczenia to ważne, bo na takich stanowiskach pracodawcy częściej liczą na dyspozycyjność, komunikację i chęć nauki niż na rozbudowane portfolio.",
        "Praca dla studentów Gdańsk ma też mocny kontekst lokalny. Najwięcej ogłoszeń pojawia się zwykle tam, gdzie jest duży ruch klientów i firm: Wrzeszcz, Śródmieście, Oliwa, Przymorze, okolice galerii handlowych, punktów gastronomicznych, biur oraz zaplecza logistycznego. Jeśli interesuje Cię praca dorywcza student Gdańsk, zwracaj uwagę na oferty zmianowe, weekendowe i sezonowe. Takie role często pozwalają dopasować liczbę godzin do planu zajęć, a szybka aplikacja ma tutaj duże znaczenie, bo kandydaci reagują zwykle w pierwszych godzinach po publikacji.",
        "Wiele osób wpisuje też praca bez doświadczenia Gdańsk, bo nie ma jeszcze wcześniejszego zatrudnienia albo chce zmienić branżę. To nie jest przeszkoda, jeśli dobrze filtrujesz ogłoszenia. Szukaj sformułowań takich jak bez doświadczenia, przyuczenie, wdrożenie, szkolenie, praca dla osób uczących się, elastyczne godziny lub praca od zaraz. Z perspektywy rekrutera krótka, konkretna aplikacja często działa lepiej niż rozbudowane CV. Jeśli ogłoszenie dopuszcza kontakt bez załączników, napisz, kiedy możesz zacząć, ile godzin tygodniowo chcesz pracować i w jakich dniach jesteś dyspozycyjny.",
        "Ta strona nie zastępuje decyzji kandydata, ale upraszcza pierwszy krok. Zamiast przekopywać szerokie wyniki dla całego Trójmiasta, dostajesz listę ofert tylko z Gdańska oraz treść dopasowaną do intencji lokalnej. Dzięki temu łatwiej porównać, czy lepsza będzie dla Ciebie praca na weekendy, zlecenie po zajęciach, proste stanowisko biurowe czy zdalne wsparcie firmy. Jeśli zależy Ci na szybkim starcie, sprawdzaj nowe publikacje regularnie i aplikuj od razu, gdy oferta odpowiada Twojej dostępności.",
      ]}
      faq={[
        {
          question: "Jaką pracę najłatwiej znaleźć studentowi w Gdańsku?",
          answer:
            "Najczęściej są to role w sprzedaży, gastronomii, obsłudze klienta, logistyce, prostym wsparciu biura i e-commerce. To stanowiska, na które często można wejść bez wcześniejszego doświadczenia.",
        },
        {
          question: "Czy da się znaleźć pracę bez doświadczenia w Gdańsku?",
          answer:
            "Tak. Wiele lokalnych ofert jest kierowanych do osób uczących się i zawiera wdrożenie. Warto szukać ogłoszeń z frazami bez doświadczenia, szkolenie, przyuczenie albo praca od zaraz.",
        },
        {
          question: "Czy na tej stronie są tylko oferty z Gdańska?",
          answer:
            "Tak. Lista na tej podstronie jest filtrowana do ogłoszeń oznaczonych jako Gdańsk, żeby użytkownik nie musiał przeglądać ofert z całego Trójmiasta.",
        },
        {
          question: "Jak szybko aplikować na pracę dorywczą dla studenta w Gdańsku?",
          answer:
            "Najlepiej reagować od razu po publikacji, podać dyspozycyjność, liczbę godzin tygodniowo i informację, od kiedy możesz zacząć. W prostych rolach szybkość zgłoszenia często ma duże znaczenie.",
        },
      ]}
      relatedLinks={[
        { href: "/praca-dla-studenta-gdynia", label: "Praca dla studenta Gdynia" },
        { href: "/praca-dla-studenta-sopot", label: "Praca dla studenta Sopot" },
        { href: "/", label: "Oferty pracy dla studentów w Trójmieście" },
      ]}
    />
  );
}
