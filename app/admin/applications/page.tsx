import Navbar from "@/components/NavBar";
import AdminApplications from "@/components/AdminApplications";

export default function AdminApplicationsPage() {
  return (
    <>
      <Navbar />
      <main className="bg-slate-50 min-h-screen">
        <div className="max-w-[1200px] mx-auto px-6 py-12">
          <h1 className="text-3xl font-bold text-slate-900">Zgłoszenia studentów</h1>
          <p className="text-slate-600 mt-2">Lista + filtrowanie po ofercie i statusie.</p>

          <div className="mt-8">
            <AdminApplications />
          </div>
        </div>
      </main>
    </>
  );
}

