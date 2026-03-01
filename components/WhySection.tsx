export default function WhySection() {
  return (
    <section className="py-12 sm:py-20">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <h2 className="text-xl sm:text-2xl font-bold text-center">
          Dlaczego to jest dla Ciebie
        </h2>
        <p className="text-center text-slate-600 mt-2">
          Wszystkie oferty są sprawdzane ręcznie
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-10">
          {[
            "0 doświadczenia",
            "Bez CV",
            "Praca od zaraz",
          ].map(text => (
            <div
              key={text}
              className="bg-white border border-slate-200 rounded-2xl p-6 text-center font-semibold"
            >
              {text}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
