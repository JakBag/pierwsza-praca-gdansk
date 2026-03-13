import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 grid gap-6 md:grid-cols-[1.4fr_1fr_1fr] text-sm">
        <div className="text-slate-600">
          Kontakt:{" "}
          <a className="text-slate-900 underline" href="mailto:kontakt@pierwszapraca-gdansk.pl">
            kontakt@pierwszapraca-gdansk.pl
          </a>
        </div>
        <div className="space-y-2 text-slate-700">
          <div className="font-semibold text-slate-900">Miasta</div>
          <div className="flex flex-col gap-2">
            <Link href="/praca-dla-studenta-gdansk" className="hover:text-slate-900 underline">
              Praca dla studenta Gdańsk
            </Link>
            <Link href="/praca-dla-studenta-gdynia" className="hover:text-slate-900 underline">
              Oferty pracy dla studentów w Gdyni
            </Link>
            <Link href="/praca-dla-studenta-sopot" className="hover:text-slate-900 underline">
              Oferty pracy dla studentów w Sopocie
            </Link>
          </div>
        </div>
        <div className="space-y-2 text-slate-700">
          <div className="font-semibold text-slate-900">Serwis</div>
          <div className="flex flex-col gap-2">
            <Link href="/privacy-policy" className="hover:text-slate-900 underline">
              Polityka prywatności
            </Link>
            <Link href="/pomoc" className="hover:text-slate-900 underline">
              Pomoc
            </Link>
          </div>
        </div>
      </div>
      <div>
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-3 text-xs md:text-sm text-slate-600">
          Copyright (c) {year} Pierwsza Praca Trójmiasto. Wszelkie prawa zastrzeżone.
        </div>
      </div>
    </footer>
  );
}
