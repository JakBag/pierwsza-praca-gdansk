import Navbar from "@/components/NavBar";
import AdminSubmissions from "@/components/AdminSubmissions";

export default function AdminPage() {
  return (
    <>
      <Navbar />
      <main className="bg-slate-50 min-h-screen">
        <div className="max-w-[1200px] mx-auto px-6 py-12">
          <h1 className="text-3xl font-bold text-slate-900">Moderacja ofert</h1>
          <p className="text-slate-600 mt-2">pending -&gt; approved_unpaid -&gt; published (lub rejected / rejected_unpaid)</p>
          <div className="mt-8">
            <AdminSubmissions />
          </div>
        </div>
      </main>
    </>
  );
}
