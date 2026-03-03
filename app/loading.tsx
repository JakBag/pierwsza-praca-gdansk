import Navbar from "@/components/NavBar";

export default function GlobalLoading() {
  return (
    <>
      <Navbar />
      <main className="bg-slate-50 min-h-screen">
        <div className="max-w-[1200px] mx-auto px-6 py-12">
          <div className="h-9 w-80 bg-slate-200 rounded animate-pulse" />
          <div className="h-5 w-96 bg-slate-200 rounded animate-pulse mt-3" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            <section className="lg:col-span-2 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 animate-pulse">
                  <div className="h-6 w-2/3 bg-slate-200 rounded" />
                  <div className="h-4 w-1/2 bg-slate-200 rounded mt-3" />
                  <div className="h-4 w-full bg-slate-200 rounded mt-4" />
                  <div className="h-4 w-5/6 bg-slate-200 rounded mt-2" />
                </div>
              ))}
            </section>

            <aside className="bg-white border border-slate-200 rounded-2xl p-5 animate-pulse h-fit">
              <div className="h-5 w-36 bg-slate-200 rounded" />
              <div className="h-10 w-full bg-slate-200 rounded-xl mt-4" />
              <div className="h-10 w-full bg-slate-200 rounded-xl mt-3" />
              <div className="h-24 w-full bg-slate-200 rounded-xl mt-3" />
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}
