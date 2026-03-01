import Navbar from "@/components/NavBar";

export default function LoadingOfferDetailsPage() {
  return (
    <>
      <Navbar />
      <main className="bg-slate-50 min-h-screen">
        <div className="max-w-[1200px] mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
          <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden animate-pulse">
            <div className="px-8 py-7 bg-slate-200">
              <div className="h-9 w-2/3 bg-slate-300 rounded" />
              <div className="h-5 w-1/2 bg-slate-300 rounded mt-4" />
              <div className="h-5 w-full bg-slate-300 rounded mt-4" />
            </div>
            <div className="p-8">
              <div className="h-6 w-40 bg-slate-200 rounded" />
              <div className="h-4 w-full bg-slate-200 rounded mt-4" />
              <div className="h-4 w-5/6 bg-slate-200 rounded mt-3" />
              <div className="h-4 w-2/3 bg-slate-200 rounded mt-3" />
            </div>
          </section>

          <aside className="bg-white border border-slate-200 rounded-2xl p-6 h-fit animate-pulse">
            <div className="h-6 w-28 bg-slate-200 rounded" />
            <div className="h-4 w-48 bg-slate-200 rounded mt-3" />
            <div className="h-10 w-full bg-slate-200 rounded-xl mt-5" />
            <div className="h-10 w-full bg-slate-200 rounded-xl mt-3" />
            <div className="h-24 w-full bg-slate-200 rounded-xl mt-3" />
            <div className="h-10 w-full bg-slate-200 rounded-xl mt-4" />
          </aside>
        </div>
      </main>
    </>
  );
}
