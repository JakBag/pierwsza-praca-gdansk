import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between text-sm">
        <div className="text-slate-600">
          Kontakt: <a className="text-slate-900 underline" href="mailto:kontakt@pierwszapraca-gdansk.pl">kontakt@pierwszapraca-gdansk.pl</a>
        </div>
        <div className="flex items-center gap-4 text-slate-700">
          <Link href="/privacy-policy" className="hover:text-slate-900 underline">
            Polityka prywatnosci
          </Link>
          <Link href="/pomoc" className="hover:text-slate-900 underline">
            Pomoc
          </Link>
        </div>
      </div>
      <div>
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-3 text-xs md:text-sm text-slate-600">
          Copyright (c) {year} Pierwsza Praca Trojmiasto. Wszelkie prawa zastrzezone.
        </div>
      </div>
    </footer>
  );
}
