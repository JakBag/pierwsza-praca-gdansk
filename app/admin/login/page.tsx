"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/NavBar";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setError(String(data.error ?? "Logowanie nie powiodlo sie"));
      return;
    }

    router.replace("/admin");
    router.refresh();
  }

  return (
    <>
      <Navbar />
      <main className="bg-slate-50 min-h-screen">
        <div className="max-w-[480px] mx-auto px-6 py-16">
          <h1 className="text-3xl font-bold text-slate-900">Logowanie admin</h1>
          <p className="text-slate-600 mt-2">Zaloguj sie, aby wejsc do panelu administracyjnego.</p>

          <form onSubmit={onSubmit} className="mt-8 bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <label className="block text-sm text-slate-700">
              Login
              <input
                className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2"
                autoComplete="username"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </label>

            <label className="block text-sm text-slate-700">
              Haslo
              <input
                className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </label>

            {error && <div className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">{error}</div>}

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Logowanie..." : "Zaloguj"}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
