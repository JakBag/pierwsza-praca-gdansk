import Navbar from "@/components/NavBar";

export default function LoadingCompanyFormPage() {
  return (
    <>
      <Navbar />
      <main className="bg-slate-50">
        <div className="max-w-[1100px] mx-auto px-6 py-12">
          <div className="h-5 w-28 bg-slate-200 rounded animate-pulse" />
          <div className="h-9 w-80 bg-slate-200 rounded animate-pulse mt-4" />
          <div className="h-5 w-96 bg-slate-200 rounded animate-pulse mt-3" />

          <section className="bg-white border border-slate-200 rounded-2xl p-6 mt-8 animate-pulse">
            <div className="h-6 w-56 bg-slate-200 rounded" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="h-11 w-full bg-slate-200 rounded-xl" />
              ))}
            </div>
            <div className="h-28 w-full bg-slate-200 rounded-xl mt-4" />
          </section>
        </div>
      </main>
    </>
  );
}
