import Link from "next/link";
import Navbar from "@/components/NavBar";

const PACKAGES = [
  { code: "p1", title: "1 ogłoszenie", price: "30 zł/miesięcznie", desc: "Jedna oferta na 30 dni", featured: false, discount: null },
  { code: "p3", title: "3 ogłoszenia", price: "77 zł/miesięcznie", desc: "Trzy oferty na 30 dni", featured: true, discount: "13% zniżki" },
  { code: "p5", title: "5 ogłoszeń", price: "110 zł/miesięcznie", desc: "Pięć ofert na 30 dni", featured: false, discount: "26% zniżki" },
] as const;

export default function ForCompaniesPackagesPage() {
  return (
    <>
      <Navbar />
      <main className="bg-slate-50">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-10 sm:py-12">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Wybierz pakiet</h1>
          <p className="text-slate-600 mt-2">Po wybraniu pakietu zostaniesz przekierowany do formularza</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 items-stretch">
            {PACKAGES.map(p => (
              <Link
                key={p.code}
                href={`/dla-firm/form?pakiet=${p.code}`}
                className="relative bg-white border border-slate-200 rounded-2xl p-8 min-h-[340px] shadow-sm flex flex-col transition-all duration-200 ease-out hover:scale-[1.02] hover:-translate-y-1 hover:shadow-lg hover:border-blue-400"
              >
                {p.discount && (
                  <div className="absolute top-4 right-4 text-xs font-semibold text-red-700 bg-red-100 px-3 py-1 rounded-full">
                    {p.discount}
                  </div>
                )}

                <div className="mt-4">
                  <h2 className="text-lg font-semibold">{p.title}</h2>
                  <div className="text-3xl font-bold mt-3">{p.price}</div>
                  <div className="text-sm text-slate-600 mt-2">{p.desc}</div>
                </div>

                <div className="mt-auto pt-8">
                  <div className="flex items-center justify-center w-full h-12 rounded-xl font-medium bg-blue-600 hover:bg-blue-700 text-white">
                    Wybieram
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <section className="mt-14">
            <h2 className="text-2xl font-bold text-slate-900">Jak to działa dla firm?</h2>
            <p className="text-slate-600 mt-2">
              3 proste kroki publikacji ogłoszenia, bez zbędnych formalności.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <div className="text-blue-600 font-bold">1</div>
                <h3 className="font-semibold mt-2">Wybierz pakiet</h3>
                <p className="text-slate-600 text-sm mt-2">
                  Wybierasz liczbę ogłoszeń i przechodzisz do formularza.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <div className="text-blue-600 font-bold">2</div>
                <h3 className="font-semibold mt-2">Wypełnij formularz</h3>
                <p className="text-slate-600 text-sm mt-2">
                  Podajesz dane firmy, opis stanowiska, warunki i lokalizację.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <div className="text-blue-600 font-bold">3</div>
                <h3 className="font-semibold mt-2">Wyślij zgłoszenie</h3>
                <p className="text-slate-600 text-sm mt-2">
                  Otrzymujesz potwierdzenie, a my rozpoczynamy weryfikację ogłoszenia.
                </p>
              </div>
            </div>

            <div className="mt-6 bg-white border border-slate-200 rounded-2xl p-6">
              <h3 className="font-semibold text-slate-900">Co dzieje się po wysłaniu formularza?</h3>
              <p className="text-slate-600 text-sm mt-2">
                Sprawdzamy zgłoszenie, a po zatwierdzeniu przesyłamy informacje dotyczące płatności.
                Po zaksięgowaniu płatności ogłoszenie trafia do publikacji.
              </p>
            </div>
          </section>

          <section className="mt-14 pb-2">
            <h2 className="text-2xl font-bold text-slate-900">FAQ dla firm</h2>
            <div className="mt-6 space-y-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-5">
                <h3 className="font-semibold text-slate-900">Czy dostanę fakturę?</h3>
                <p className="text-slate-600 text-sm mt-2">
                  Tak. W formularzu zaznacz opcję faktury i wpisz poprawny NIP. Fakturę otrzymasz od Bizky.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5">
                <h3 className="font-semibold text-slate-900">Jaki jest termin płatności?</h3>
                <p className="text-slate-600 text-sm mt-2">
                  Dane do płatności wysyłamy po pozytywnej weryfikacji formularza. Termin opłacenia wynosi 3 dni robocze od
                  wysłania danych. Brak płatności w terminie może anulować rezerwację publikacji.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5">
                <h3 className="font-semibold text-slate-900">Kiedy ogłoszenie zostanie opublikowane?</h3>
                <p className="text-slate-600 text-sm mt-2">
                  Publikacja następuje po pozytywnej moderacji i potwierdzeniu płatności, zwykle do 24 godzin w dni robocze.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5">
                <h3 className="font-semibold text-slate-900">Czy można otrzymać zwrot?</h3>
                <p className="text-slate-600 text-sm mt-2">
                  Zwrot jest możliwy, jeśli ogłoszenie nie zostało opublikowane z przyczyn leżących po naszej stronie.
                  Po publikacji usługi zwroty nie przysługują. Każdy przypadek rozpatrujemy indywidualnie.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5">
                <h3 className="font-semibold text-slate-900">Na czym polega moderacja ogłoszeń?</h3>
                <p className="text-slate-600 text-sm mt-2">
                  Sprawdzamy zgodność treści z prawem, regulaminem i standardami serwisu: rzetelność opisu, warunki
                  zatrudnienia, dane kontaktowe i brak treści dyskryminujących.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5">
                <h3 className="font-semibold text-slate-900">Jakie ogłoszenia są odrzucane?</h3>
                <p className="text-slate-600 text-sm mt-2">
                  Odrzucamy oferty niezgodne z prawem lub regulaminem, bez stawki lub warunków pracy, z nieprawdziwymi
                  danymi firmy, z treściami wprowadzającymi w błąd albo naruszającymi dobra osobiste.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5">
                <h3 className="font-semibold text-slate-900">Czy mogę edytować ogłoszenie po wysłaniu?</h3>
                <p className="text-slate-600 text-sm mt-2">
                  Tak, w razie zmian skontaktuj się z nami i podaj nazwę firmy oraz stanowisko.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5">
                <h3 className="font-semibold text-slate-900">Jak mogę się skontaktować?</h3>
                <p className="text-slate-600 text-sm mt-2">
                  Napisz przez formularz lub kontakt podany na stronie Pomoc.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
