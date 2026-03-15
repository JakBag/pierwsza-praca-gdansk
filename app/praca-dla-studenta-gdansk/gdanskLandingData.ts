import type { Metadata } from "next";
import type { DbJob } from "@/lib/jobsDb";

export type LandingSection = {
  title: string;
  paragraphs: string[];
};

export type LandingFaq = {
  question: string;
  answer: string;
};

export type LandingLink = {
  href: string;
  label: string;
};

const siteDescription =
  "Aktualne oferty dla studentów w Gdańsku: bez doświadczenia, dorywcze, weekendowe i zdalne. Lokalna strona z ogłoszeniami tylko z Gdańska.";

function normalizeText(value: string | null | undefined) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function matchesAnyKeyword(job: DbJob, keywords: string[]) {
  const haystack = normalizeText(
    `${job.title} ${job.company} ${job.description ?? ""} ${(job.tags ?? []).join(" ")} ${job.time_commitment ?? ""} ${job.work_mode ?? ""}`
  );
  return keywords.some(keyword => haystack.includes(normalizeText(keyword)));
}

export function buildLandingMetadata(title: string, canonical: string): Metadata {
  return {
    title,
    description: siteDescription,
    alternates: {
      canonical,
    },
  };
}

export const gdanskBody = [
  "Fraza praca student Gdańsk zwykle oznacza bardzo konkretną potrzebę: ktoś nie szuka ogólnego poradnika o rynku pracy, tylko miejsca, w którym od razu zobaczy aktualne oferty z jednego miasta. Dlatego ta podstrona skupia się wyłącznie na Gdańsku. Jeśli studiujesz dziennie i potrzebujesz elastycznego grafiku, chcesz dorobić po zajęciach albo szukasz pierwszego stanowiska do CV, tutaj masz ogłoszenia zawężone do lokalnego rynku.",
  "Praca dla studentów Gdańsk najczęściej pojawia się w kilku powtarzalnych kategoriach. Dużo ofert dotyczy obsługi klienta, gastronomii, sprzedaży, punktów usługowych, magazynów, prostych prac administracyjnych i wsparcia biura. Coraz częściej pojawia się też praca zdalna lub hybrydowa przy researchu, obsłudze social mediów, umawianiu spotkań, wprowadzaniu danych albo wsparciu e-commerce.",
  "To ważne zwłaszcza dla osób, które wpisują praca bez doświadczenia student Gdańsk albo praca weekendowa student Gdańsk. W takich rolach pracodawcy częściej liczą na dyspozycyjność, komunikację i chęć nauki niż na rozbudowane portfolio. Z perspektywy kandydata liczy się szybka aplikacja, realna dostępność oraz wybór oferty, która nie rozwali planu zajęć.",
  "Ta strona nie zastępuje decyzji kandydata, ale upraszcza pierwszy krok. Zamiast przekopywać szerokie wyniki dla całego Trójmiasta, dostajesz listę ofert tylko z Gdańska oraz treść dopasowaną do intencji lokalnej. Dzięki temu łatwiej porównać, czy lepsza będzie dla Ciebie praca na weekendy, zlecenie po zajęciach, proste stanowisko biurowe czy zdalne wsparcie firmy.",
];

export const gdanskSections: LandingSection[] = [
  {
    title: "Praca dla studenta Gdańsk Wrzeszcz",
    paragraphs: [
      "Wrzeszcz to jedna z najmocniejszych lokalizacji dla osób, które chcą łączyć studia z pracą. Bliskość SKM, galerii handlowych, punktów usługowych i biur sprawia, że właśnie tutaj regularnie pojawia się praca dla studenta Gdańsk Wrzeszcz w sprzedaży, gastronomii, obsłudze klienta i prostym wsparciu administracyjnym.",
      "Jeżeli zależy Ci na szybkim dojeździe z uczelni i pracy po zajęciach, Wrzeszcz bywa praktyczniejszy niż dalsze dzielnice. Warto patrzeć na oferty zmianowe, popołudniowe i takie, które pozwalają dopasować grafik do tygodnia akademickiego.",
    ],
  },
  {
    title: "Praca dla studenta Gdańsk Oliwa",
    paragraphs: [
      "Oliwa ma inny profil niż Wrzeszcz, bo obok usług i gastronomii mocniej widać tu biura, kampusy, firmy technologiczne i role pomocnicze przy administracji albo obsłudze klienta. Dlatego fraza praca dla studenta Gdańsk Oliwa często łączy się z bardziej uporządkowanym grafikiem i zadaniami biurowymi lub hybrydowymi.",
      "Jeśli interesuje Cię pierwsze doświadczenie do CV i nie chcesz zaczynać wyłącznie od pracy fizycznej albo gastronomii, właśnie w Oliwie warto szukać ogłoszeń z wdrożeniem, wsparciem back office i prostymi procesami operacyjnymi.",
    ],
  },
  {
    title: "Praca weekendowa student Gdańsk",
    paragraphs: [
      "Praca weekendowa student Gdańsk to jedna z najczęstszych ścieżek dla osób studiujących dziennie. Najwięcej takich ofert pojawia się w gastronomii, handlu, eventach, punktach usługowych i wszędzie tam, gdzie ruch klientów rośnie pod koniec tygodnia.",
      "W praktyce warto sprawdzać nowe publikacje regularnie i aplikować szybko. W ofertach weekendowych liczy się gotowość do pracy w konkretnych godzinach, a przewagę daje jasna informacja, czy możesz pracować w soboty, niedziele i wieczorami.",
    ],
  },
  {
    title: "Praca bez doświadczenia student Gdańsk",
    paragraphs: [
      "Praca bez doświadczenia student Gdańsk jest realna, ale trzeba filtrować oferty praktycznie. Szukaj ogłoszeń z frazami typu przyuczenie, szkolenie, wdrożenie, elastyczne godziny albo praca od zaraz. W wielu przypadkach ważniejsze od stażu są komunikacja, dokładność i dyspozycyjność.",
      "Dla pracodawcy liczy się to, czy kandydat rzeczywiście może wejść w grafik i szybko zacząć. Dlatego krótka, konkretna wiadomość z informacją o dostępności zwykle działa lepiej niż ogólna aplikacja bez konkretu.",
    ],
  },
  {
    title: "Praca dorywcza student Gdańsk",
    paragraphs: [
      "Praca dorywcza student Gdańsk najczęściej oznacza elastyczny grafik, mniejszą liczbę godzin i szybki proces rekrutacyjny. To dobry wariant dla osób, które chcą dorobić w trakcie semestru bez wchodzenia od razu na pełny etat.",
      "W tej kategorii mieszczą się zarówno pojedyncze zmiany, jak i regularne zlecenia po zajęciach. Kluczowe jest szybkie dopasowanie do miejsca i godzin, dlatego lokalna strona z ofertami tylko z Gdańska ma przewagę nad szerokim listingiem całego regionu.",
    ],
  },
];

export const gdanskFaq: LandingFaq[] = [
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
];

export const gdanskRelatedLinks: LandingLink[] = [
  { href: "/praca-bez-doswiadczenia-gdansk", label: "Praca bez doświadczenia Gdańsk" },
  { href: "/praca-weekendowa-student-gdansk", label: "Praca weekendowa student Gdańsk" },
  { href: "/praca-dorywcza-gdansk-student", label: "Praca dorywcza student Gdańsk" },
  { href: "/praca-zdalna-student-gdansk", label: "Praca zdalna student Gdańsk" },
  { href: "/praca-dla-studenta-gdynia", label: "Praca dla studenta Gdynia" },
  { href: "/praca-dla-studenta-sopot", label: "Praca dla studenta Sopot" },
];

export const gdanskFaqLinks: LandingLink[] = [
  { href: "/praca-bez-doswiadczenia-gdansk", label: "Praca bez doświadczenia Gdańsk" },
  { href: "/praca-weekendowa-student-gdansk", label: "Praca weekendowa student Gdańsk" },
  { href: "/praca-dorywcza-gdansk-student", label: "Praca dorywcza student Gdańsk" },
  { href: "/praca-zdalna-student-gdansk", label: "Praca zdalna student Gdańsk" },
];

export function filterGdanskJobs(jobs: DbJob[], keywords: string[]) {
  const matched = jobs.filter(job => matchesAnyKeyword(job, keywords));
  return matched.length > 0 ? matched : jobs;
}
