import Navbar from "@/components/NavBar";

export default function LoadingOffersPage() {
  return (
    <>
      <Navbar />
      <main className="bg-slate-50">
        <div className="max-w-[1200px] mx-auto px-6 py-12">
          <div className="h-9 w-96 bg-slate-200 rounded animate-pulse" />
          <div className="h-5 w-80 bg-slate-200 rounded animate-pulse mt-3" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
            <aside className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 lg:col-span-4 xl:col-span-3">
              <div className="h-5 w-28 bg-slate-200 rounded animate-pulse" />
              <div className="h-10 w-full bg-slate-200 rounded-xl animate-pulse" />
              <div className="h-5 w-24 bg-slate-200 rounded animate-pulse mt-2" />
              <div className="h-10 w-full bg-slate-200 rounded-xl animate-pulse" />
              <div className="h-10 w-full bg-slate-200 rounded-xl animate-pulse" />
            </aside>

            <div className="space-y-4 lg:col-span-8 xl:col-span-9">
              <div className="h-5 w-36 bg-slate-200 rounded animate-pulse" />
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 animate-pulse">
                  <div className="h-6 w-2/3 bg-slate-200 rounded" />
                  <div className="h-4 w-1/3 bg-slate-200 rounded mt-3" />
                  <div className="h-4 w-full bg-slate-200 rounded mt-3" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
