import Navbar from "@/components/NavBar";

export default function HowPage() {
  return (
    <>
      <Navbar />
      <main className="bg-slate-50">
        <div className="max-w-[1200px] mx-auto px-6 py-12">
          <h1 className="text-3xl font-bold text-slate-900">Jak to działa?</h1>
          <p className="text-slate-600 mt-2">
            3 kroki, bez CV. Dla osób, które szukają pierwszej pracy bez doświadczenia.
          </p>

          <div className="grid grid-cols-3 gap-6 mt-10">
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <div className="text-emerald-600 font-bold">1</div>
              <h2 className="font-semibold mt-2">Wybierasz ofertę</h2>
              <p className="text-slate-600 text-sm mt-2">Tylko Trójmiasto i tylko 0 doświadczenia.</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <div className="text-emerald-600 font-bold">2</div>
              <h2 className="font-semibold mt-2">Zgłaszasz się bez CV</h2>
              <p className="text-slate-600 text-sm mt-2">Krótka wiadomość + kontakt.</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <div className="text-emerald-600 font-bold">3</div>
              <h2 className="font-semibold mt-2">Firma kontaktuje się</h2>
              <p className="text-slate-600 text-sm mt-2">Bezpośrednio i szybko.</p>
            </div>
          </div>

        </div>
      </main>
    </>
  );
}
