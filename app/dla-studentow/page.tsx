import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/NavBar";

export const metadata: Metadata = {
  title: "Dla studentów",
  description:
    "Jak znaleźć pierwszą pracę w Trójmieście: 3 kroki, praktyczny poradnik, najczęstsze pytania i aktualne oferty pracy dla studentów.",
};

export default function ForStudentsPage() {
  return (
    <>
      <Navbar />
      <main className="bg-slate-50">
        <div className="max-w-[1200px] mx-auto px-6 py-12">
          <h1 className="text-3xl font-bold text-slate-900">Dla studentów</h1>
          <p className="text-slate-600 mt-2">
            3 kroki, bez CV. Dla osób, które szukają pierwszej pracy bez doświadczenia.
          </p>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            <article className="bg-white border border-slate-200 rounded-2xl p-6">
              <div className="text-emerald-600 font-bold">1</div>
              <h2 className="font-semibold mt-2">Wybierasz ofertę</h2>
              <p className="text-slate-600 text-sm mt-2">Tylko Trójmiasto i tylko 0 doświadczenia.</p>
            </article>

            <article className="bg-white border border-slate-200 rounded-2xl p-6">
              <div className="text-emerald-600 font-bold">2</div>
              <h2 className="font-semibold mt-2">Zgłaszasz się bez CV</h2>
              <p className="text-slate-600 text-sm mt-2">Krótka wiadomość + kontakt.</p>
            </article>

            <article className="bg-white border border-slate-200 rounded-2xl p-6">
              <div className="text-emerald-600 font-bold">3</div>
              <h2 className="font-semibold mt-2">Firma kontaktuje się</h2>
              <p className="text-slate-600 text-sm mt-2">Bezpośrednio i szybko.</p>
            </article>
          </section>

          <div className="mt-8">
            <Link
              href="/praca-dla-studenta-gdansk"
              className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700 transition-colors"
            >
              Zobacz oferty pracy
            </Link>
          </div>

          <section className="mt-12 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-slate-900">Artykuł </h2>

            <article className="mt-6">
              <h3 className="text-xl font-semibold text-slate-900">
                1. Pierwsza praca w Gdańsku - gdzie szukać pracy jako student?
              </h3>
              <p className="text-slate-700 mt-3">
                Studia to dla wielu osób moment, w którym pojawia się pierwsza praca. W Gdańsku możliwości jest
                sporo - od pracy dorywczej po pierwsze stanowiska w dużych firmach. Problem polega na tym, że wielu
                studentów nie wie, gdzie faktycznie szukać ofert dla osób bez doświadczenia.
              </p>
              <p className="text-slate-700 mt-3">Poniżej znajdziesz najważniejsze miejsca, gdzie warto zacząć.</p>

              <h4 className="text-lg font-semibold text-slate-900 mt-6">1. Portale z ofertami dla studentów</h4>
              <p className="text-slate-700 mt-2">
                Najłatwiej zacząć od stron zbierających oferty pracy dla studentów i osób bez doświadczenia. Takie
                strony skupiają ogłoszenia, które nie wymagają dużego doświadczenia zawodowego.
              </p>
              <p className="text-slate-700 mt-2">
                Na przykład na stronie pierwszapracatrojmiasto.pl znajdziesz oferty pracy skierowane właśnie do
                studentów w Trójmieście.
              </p>
              <p className="text-slate-700 mt-2">Można tam znaleźć m.in.:</p>
              <ul className="list-disc pl-6 text-slate-700 mt-2 space-y-1">
                <li>pracę dorywczą</li>
                <li>pracę weekendową</li>
                <li>pierwsze stanowiska biurowe</li>
                <li>praktyki i staże</li>
              </ul>

              <h4 className="text-lg font-semibold text-slate-900 mt-6">2. Gastronomia i handel</h4>
              <p className="text-slate-700 mt-2">
                Jednym z najczęstszych miejsc pierwszej pracy studentów jest gastronomia oraz handel.
              </p>
              <p className="text-slate-700 mt-2">Typowe stanowiska:</p>
              <ul className="list-disc pl-6 text-slate-700 mt-2 space-y-1">
                <li>kelner / kelnerka</li>
                <li>barista</li>
                <li>pracownik restauracji</li>
                <li>sprzedawca w sklepie</li>
                <li>pracownik obsługi klienta</li>
              </ul>
              <p className="text-slate-700 mt-2">
                Zaletą takich prac jest elastyczny grafik, który można dopasować do zajęć na uczelni.
              </p>

              <h4 className="text-lg font-semibold text-slate-900 mt-6">3. Praca biurowa i administracyjna</h4>
              <p className="text-slate-700 mt-2">
                Coraz więcej firm w Gdańsku zatrudnia studentów również w pracy biurowej. Często są to stanowiska
                juniorskie lub asystenckie.
              </p>
              <p className="text-slate-700 mt-2">Przykłady:</p>
              <ul className="list-disc pl-6 text-slate-700 mt-2 space-y-1">
                <li>asystent biura</li>
                <li>wprowadzanie danych</li>
                <li>obsługa klienta</li>
                <li>wsparcie działu marketingu</li>
              </ul>
              <p className="text-slate-700 mt-2">Tego typu praca pozwala zdobyć pierwsze doświadczenie zawodowe.</p>

              <h4 className="text-lg font-semibold text-slate-900 mt-6">4. Praca zdalna dla studentów</h4>
              <p className="text-slate-700 mt-2">
                Niektóre oferty pracy można wykonywać całkowicie zdalnie. To dobre rozwiązanie dla studentów, którzy
                chcą pracować elastycznie.
              </p>
              <p className="text-slate-700 mt-2">Najczęstsze przykłady:</p>
              <ul className="list-disc pl-6 text-slate-700 mt-2 space-y-1">
                <li>obsługa social media</li>
                <li>copywriting</li>
                <li>wsparcie techniczne</li>
                <li>proste zadania IT</li>
              </ul>

              <h4 className="text-lg font-semibold text-slate-900 mt-6">5. Biura karier na uczelniach</h4>
              <p className="text-slate-700 mt-2">
                Uczelnie w Gdańsku posiadają własne biura karier. Publikują one oferty pracy, staży i praktyk
                skierowane do studentów.
              </p>
              <p className="text-slate-700 mt-2">Warto sprawdzić:</p>
              <ul className="list-disc pl-6 text-slate-700 mt-2 space-y-1">
                <li>Uniwersytet Gdański</li>
                <li>Politechnikę Gdańską</li>
                <li>GUMed</li>
                <li>Uniwersytet Morski</li>
              </ul>

              <h4 className="text-lg font-semibold text-slate-900 mt-6">Podsumowanie</h4>
              <p className="text-slate-700 mt-2">
                Pierwsza praca w Gdańsku jest łatwiejsza do znalezienia, niż może się wydawać. Najważniejsze to
                korzystać z kilku źródeł jednocześnie i regularnie sprawdzać nowe oferty.
              </p>
              <p className="text-slate-700 mt-2">
                Jeśli szukasz pracy dla studenta w Trójmieście, sprawdź aktualne ogłoszenia na
                {" "}
                <Link href="/praca-dla-studenta-gdansk" className="text-emerald-700 font-medium hover:underline">
                  pierwszapracatrojmiasto.pl/praca-dla-studenta-gdansk
                </Link>
                .
              </p>
            </article>
          </section>

          <section className="mt-10 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-slate-900">FAQ</h2>
            <div className="mt-6 space-y-4">
              <details className="group rounded-xl border border-slate-200 p-4" open>
                <summary className="cursor-pointer list-none font-semibold text-slate-900">
                  1. Praca dla studenta w Gdyni - gdzie szukać ofert bez doświadczenia?
                </summary>
                <p className="text-slate-700 mt-3">
                  Gdynia oferuje dużo pracy dla studentów: gastronomia, handel, magazyny, obsługa klienta i sezonowe
                  role latem. Warto regularnie sprawdzać portale z ofertami dla studentów oraz lokalne ogłoszenia.
                </p>
                <p className="text-slate-700 mt-2">
                  Aktualne oferty dla Trójmiasta znajdziesz na
                  {" "}
                  <Link href="/praca-dla-studenta-gdansk" className="text-emerald-700 font-medium hover:underline">
                    pierwszapracatrojmiasto.pl/praca-dla-studenta-gdansk
                  </Link>
                  .
                </p>
              </details>

              <details className="group rounded-xl border border-slate-200 p-4">
                <summary className="cursor-pointer list-none font-semibold text-slate-900">
                  2. Jak znaleźć pierwszą pracę jako student - praktyczny poradnik
                </summary>
                <p className="text-slate-700 mt-3">
                  Zacznij od prostego CV, aplikuj szeroko (10-20 ofert), reaguj szybko i nie bój się ogłoszeń bez
                  doświadczenia. Pracodawcy szukają przede wszystkim chęci nauki, punktualności i komunikatywności.
                </p>
                <p className="text-slate-700 mt-2">
                  Dobre wyniki daje też korzystanie z portali dla studentów oraz polecenia od znajomych ze studiów.
                </p>
              </details>

              <details className="group rounded-xl border border-slate-200 p-4">
                <summary className="cursor-pointer list-none font-semibold text-slate-900">
                  3. Gdzie najszybciej znaleźć oferty pierwszej pracy w Trójmieście?
                </summary>
                <p className="text-slate-700 mt-3">
                  Najszybciej przez dedykowane portale z ofertami dla studentów i osób bez doświadczenia, np.
                  {" "}
                  <Link href="/praca-dla-studenta-gdansk" className="text-emerald-700 font-medium hover:underline">
                    pierwszapracatrojmiasto.pl/praca-dla-studenta-gdansk
                  </Link>
                  . Sprawdzaj oferty codziennie i aplikuj od razu po publikacji.
                </p>
              </details>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
