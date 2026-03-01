import Navbar from "@/components/NavBar";

const ADMIN_EMAIL = "pierwszapracagdansk.kontakt@gmail.com";
const ADMIN_NAME = "J&B";

export default function PrivacyPolicyPage() {
  return (
    <>
      <Navbar />
      <main className="bg-slate-50 min-h-screen">
        <div className="max-w-[900px] mx-auto px-6 py-12">
          <h1 className="text-3xl font-bold text-slate-900">Polityka prywatności</h1>
          <p className="text-slate-600 mt-2">Polityka prywatności serwisu Pierwsza Praca Trójmiasto.</p>

          <section className="mt-8 bg-white border border-slate-200 rounded-2xl p-6 space-y-4 text-slate-700">
            <h2 className="text-xl font-semibold text-slate-900">1. Administrator danych</h2>
            <p>
              Administratorem danych osobowych jest {ADMIN_NAME}, administrator serwisu Pierwsza Praca Trójmiasto.
              Kontakt: <a className="text-blue-700 underline" href={`mailto:${ADMIN_EMAIL}`}>{ADMIN_EMAIL}</a>.
            </p>
          </section>

          <section className="mt-6 bg-white border border-slate-200 rounded-2xl p-6 space-y-4 text-slate-700">
            <h2 className="text-xl font-semibold text-slate-900">2. Jakie dane zbieramy i po co</h2>
            <p>W serwisie przetwarzamy dane z dwóch głównych procesów:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <span className="font-medium">Aplikacje kandydatów na oferty:</span> imię, kontakt (telefon lub email),
                treść wiadomości, zgoda RODO, dane techniczne (np. hash IP, status zgłoszenia). Cel: obsługa aplikacji,
                przekazanie kandydatury do firmy i ochrona przed nadużyciami.
              </li>
              <li>
                <span className="font-medium">Zgłoszenia firm (formularz ogłoszeń):</span> nazwa firmy, dane kontaktowe,
                opis oferty, lokalizacja, warunki zatrudnienia, stawka, termin publikacji. Cel: przygotowanie, weryfikacja,
                rozliczenie i publikacja ogłoszeń.
              </li>
            </ul>
          </section>

          <section className="mt-6 bg-white border border-slate-200 rounded-2xl p-6 space-y-4 text-slate-700">
            <h2 className="text-xl font-semibold text-slate-900">3. Podstawa prawna (RODO)</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <span className="font-medium">Art. 6 ust. 1 lit. a RODO (zgoda):</span> gdy kandydat wysyła aplikację
                i zaznacza zgodę RODO.
              </li>
              <li>
                <span className="font-medium">Art. 6 ust. 1 lit. f RODO (uzasadniony interes):</span> obsługa serwisu,
                zapewnienie bezpieczeństwa, przeciwdziałanie spamowi i nadużyciom, dochodzenie lub obrona roszczeń.
              </li>
              <li>
                <span className="font-medium">Art. 6 ust. 1 lit. b RODO:</span> działania niezbędne do realizacji zlecenia
                publikacji ogłoszenia od firmy.
              </li>
            </ul>
          </section>

          <section className="mt-6 bg-white border border-slate-200 rounded-2xl p-6 space-y-4 text-slate-700">
            <h2 className="text-xl font-semibold text-slate-900">4. Czas przechowywania danych</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Dane kandydatów przechowujemy przez czas niezbędny do obsługi rekrutacji i kontaktu z firmą.</li>
              <li>
                Dane zgłoszeń firm przechowujemy przez czas realizacji usługi publikacji, rozliczeń oraz przez okres
                wymagany przepisami prawa (np. księgowymi), a także do czasu przedawnienia ewentualnych roszczeń.
              </li>
              <li>
                Część danych technicznych i operacyjnych możemy przechowywać krócej, jeśli są potrzebne tylko do
                ochrony przed nadużyciami.
              </li>
            </ul>
          </section>

          <section className="mt-6 bg-white border border-slate-200 rounded-2xl p-6 space-y-4 text-slate-700">
            <h2 className="text-xl font-semibold text-slate-900">5. Komu przekazujemy dane</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Firmie publikującej ogłoszenie, gdy kandydat aplikuje na daną ofertę.</li>
              <li>
                Dostawcom usług technicznych i komunikacyjnych, w tym{" "}
                <span className="font-medium">Resend</span> jako podmiotowi przetwarzającemu dane w zakresie wysyłki
                wiadomości email.
              </li>
              <li>Podmiotom uprawnionym na podstawie przepisów prawa, jeśli istnieje taki obowiązek.</li>
            </ul>
          </section>

          <section className="mt-6 bg-white border border-slate-200 rounded-2xl p-6 space-y-4 text-slate-700">
            <h2 className="text-xl font-semibold text-slate-900">6. Prawa użytkownika</h2>
            <p>Masz prawo do:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>dostępu do danych i uzyskania ich kopii,</li>
              <li>sprostowania danych,</li>
              <li>usunięcia danych (w przypadkach przewidzianych prawem),</li>
              <li>ograniczenia przetwarzania,</li>
              <li>sprzeciwu wobec przetwarzania opartego na uzasadnionym interesie,</li>
              <li>przenoszenia danych,</li>
              <li>cofnięcia zgody w dowolnym momencie (bez wpływu na zgodność z prawem przetwarzania przed cofnięciem).</li>
            </ul>
            <p>
              W sprawach prywatności napisz na:{" "}
              <a className="text-blue-700 underline" href={`mailto:${ADMIN_EMAIL}`}>{ADMIN_EMAIL}</a>. 
            </p>
          </section>
        </div>
      </main>
    </>
  );
}

