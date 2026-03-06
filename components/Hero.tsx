import Link from "next/link";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-blue-500 text-white">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 sm:py-20 grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight">Praca dla studentów w Trójmiescie.</h1>
          <p className="mt-4 text-base sm:text-lg">Znajdz pierwszą prace bez doświadczenia. Bez CV.</p>
          <p className="mt-2 text-blue-100">
            Tylko oferty dla studentów: praca dorywcza, na pół etatu i praca weekendowa.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Link href="/oferty" className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold text-center">
              Zobacz oferty
            </Link>
            <Link href="/jak-to-dziala" className="border border-white px-6 py-3 rounded-xl text-center">
              Jak to działa (30 sekund)
            </Link>
          </div>
        </div>

        <div className="relative h-52 sm:h-64 lg:h-80 rounded-2xl overflow-hidden bg-white/20">
          <Image
            src="/hero.png"
            alt="Praca dla studentow w Trojmiescie"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>
    </section>
  );
}
