import Navbar from "@/components/NavBar";

const ADMIN_EMAIL = "pierwszapracagdansk.kontakt@gmail.com";

export default function HelpPage() {
  return (
    <>
      <Navbar />
      <main className="bg-slate-50 min-h-screen">
        <div className="max-w-[1200px] mx-auto px-6 py-12">
          <h1 className="text-3xl font-bold text-slate-900">Pomoc</h1>
          <p className="text-slate-600 mt-2">
            Masz pytania lub problem z działaniem strony? Skontaktuj się z administratorem.
          </p>

          <section className="mt-8 max-w-[720px] bg-white border border-slate-200 rounded-2xl p-8">
            <h2 className="text-xl font-semibold text-slate-900">Kontakt do admina</h2>
            <p className="text-slate-600 mt-3">Najszybszy kontakt:</p>

            <a
              href={`mailto:${ADMIN_EMAIL}`}
              className="mt-4 inline-block text-blue-700 hover:text-blue-800 font-semibold underline underline-offset-2"
            >
              {ADMIN_EMAIL}
            </a>

            <p className="text-sm text-slate-500 mt-4">
              W wiadomości podaj krótki opis problemu i link do strony, na której występuje.
            </p>
          </section>
        </div>
      </main>
    </>
  );
}

