"use client";

import { useRef, useState } from "react";

export default function ApplyForm({ jobId }: { jobId: string }) {
  const startedAtMsRef = useRef<number>(Date.now());
  const [firstName, setFirstName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [rodo, setRodo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function showToast(type: "success" | "error", text: string) {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;

    setToast(null);

    if (!rodo) {
      showToast("error", "Zaznacz zgodę RODO.");
      return;
    }

    setIsSubmitting(true);
    const res = await fetch("/api/apply", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jobId,
        firstName,
        contact,
        message,
        website,
        startedAtMs: startedAtMsRef.current,
        rodo,
      }),
    });

    const data = await res.json().catch(() => ({}));
    setIsSubmitting(false);

    if (!res.ok) {
      if (res.status === 409) {
        showToast("error", "To zgłoszenie już zostało wysłane dla tej oferty.");
        return;
      }
      if (res.status === 429) {
        showToast("error", "Za dużo prób. Spróbuj ponownie za kilka minut.");
        return;
      }

      showToast("error", String(data.error ?? "Nie udało się zapisać zgłoszenia."));
      return;
    }

    showToast("success", "Dzięki. Zgłoszenie zostało wysłane.");
    setFirstName("");
    setContact("");
    setMessage("");
    setWebsite("");
    setRodo(false);
    startedAtMsRef.current = Date.now();
  }

  return (
    <div className="relative">
      {toast && (
        <div
          className={`mb-3 rounded-xl border px-3 py-2 text-sm shadow-sm transition ${
            toast.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-800"
          }`}
          role="status"
          aria-live="polite"
        >
          {toast.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-5 space-y-3">
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={e => setWebsite(e.target.value)}
          className="hidden"
          aria-hidden="true"
        />
        <input
          className="w-full border border-slate-200 rounded-xl px-3 py-2"
          placeholder="Imię"
          value={firstName}
          onChange={e => setFirstName(e.target.value)}
        />
        <input
          className="w-full border border-slate-200 rounded-xl px-3 py-2"
          placeholder="Telefon lub mail"
          value={contact}
          onChange={e => setContact(e.target.value)}
        />
        <textarea
          className="w-full border border-slate-200 rounded-xl px-3 py-2 h-28"
          placeholder="2-3 zdania (dyspozycyjność + dlaczego chcesz zacząć)"
          value={message}
          onChange={e => setMessage(e.target.value)}
        />
        <label className="flex items-center gap-2 text-xs text-slate-600">
          <input type="checkbox" checked={rodo} onChange={e => setRodo(e.target.checked)} />
          Zgoda RODO
        </label>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Wysyłanie..." : "Wyślij zgłoszenie"}
        </button>
      </form>
    </div>
  );
}
