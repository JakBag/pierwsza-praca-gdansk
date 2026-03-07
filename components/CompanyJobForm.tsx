"use client";

import { useState } from "react";

const inputClassName =
  "mt-2 w-full border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400";

const PACKAGES = [
  { code: "p1", label: "1 ogloszenie", size: 1 },
  { code: "p3", label: "3 ogloszenia", size: 3 },
  { code: "p5", label: "5 ogloszen", size: 5 },
] as const;

type JobDraft = {
  company: string;
  title: string;
  contact: string;
  description: string;
  location?: string;
  contract_type?: string;
  time_commitment?: string;
  work_mode?: string;
  pay?: string;
  expires_at?: string | null;
};

const EMPTY_DRAFT: JobDraft = {
  company: "",
  title: "",
  contact: "",
  description: "",
  location: "Gdansk",
  contract_type: "",
  time_commitment: "",
  work_mode: "",
  pay: "",
  expires_at: null,
};

type CompanyJobFormCardProps = {
  index: number;
  total: number;
  value: JobDraft;
  onChange: (next: JobDraft) => void;
};

function CompanyJobFormCard({ index, total, value, onChange }: CompanyJobFormCardProps) {
  function updateField<K extends keyof JobDraft>(key: K, nextValue: JobDraft[K]) {
    onChange({ ...value, [key]: nextValue });
  }

  return (
    <section className="rounded-2xl border border-slate-200 p-5">
      <h2 className="text-lg font-semibold text-slate-900">
        Ogloszenie {index + 1} / {total}
      </h2>

      <div className="mt-4 space-y-5">
        <div>
          <label htmlFor={`company-${index}`} className="text-sm font-semibold text-slate-900">
            Nazwa firmy
          </label>
          <input
            id={`company-${index}`}
            className={inputClassName}
            placeholder="np. Bistro Oliwa"
            value={value.company}
            onChange={e => updateField("company", e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor={`title-${index}`} className="text-sm font-semibold text-slate-900">
            Stanowisko
          </label>
          <input
            id={`title-${index}`}
            className={inputClassName}
            placeholder="np. Pomoc kuchenna"
            value={value.title}
            onChange={e => updateField("title", e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor={`contact-${index}`} className="text-sm font-semibold text-slate-900">
            Kontakt (email)
          </label>
          <input
            id={`contact-${index}`}
            type="email"
            className={inputClassName}
            placeholder="np. praca@firma.pl"
            value={value.contact}
            onChange={e => updateField("contact", e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor={`description-${index}`} className="text-sm font-semibold text-slate-900">
            Opis oferty
          </label>
          <textarea
            id={`description-${index}`}
            className={`${inputClassName} min-h-[130px] resize-y`}
            placeholder="Krotki opis, godziny i stawka"
            value={value.description}
            onChange={e => updateField("description", e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor={`location-${index}`} className="text-sm font-semibold text-slate-900">
            Lokalizacja
          </label>
          <input
            id={`location-${index}`}
            className={inputClassName}
            placeholder="np. Gdańsk Wrzeszcz"
            value={value.location ?? ""}
            onChange={e => updateField("location", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor={`contractType-${index}`} className="text-sm font-semibold text-slate-900">
              Rodzaj umowy
            </label>
            <select
              id={`contractType-${index}`}
              className={inputClassName}
              value={value.contract_type ?? ""}
              onChange={e => updateField("contract_type", e.target.value)}
            >
              <option value="">Wybierz</option>
              <option value="Umowa zlecenie">Umowa zlecenie</option>
              <option value="Umowa o pracę">Umowa o prace</option>
              <option value="B2B">B2B</option>
              <option value="Staż / praktyki">Staż / praktyki</option>
              <option value="Inne">Inne</option>
            </select>
          </div>

          <div>
            <label htmlFor={`timeCommitment-${index}`} className="text-sm font-semibold text-slate-900">
              Wymiar czasu
            </label>
            <select
              id={`timeCommitment-${index}`}
              className={inputClassName}
              value={value.time_commitment ?? ""}
              onChange={e => updateField("time_commitment", e.target.value)}
            >
              <option value="">Wybierz</option>
              <option value="Pelny etat">Pełny etat</option>
              <option value="Czesc etatu">Część etatu</option>
              <option value="Weekendy">Weekendy</option>
              <option value="Elastycznie">Elastycznie</option>
            </select>
          </div>

          <div>
            <label htmlFor={`workMode-${index}`} className="text-sm font-semibold text-slate-900">
              Tryb pracy
            </label>
            <select
              id={`workMode-${index}`}
              className={inputClassName}
              value={value.work_mode ?? ""}
              onChange={e => updateField("work_mode", e.target.value)}
            >
              <option value="">Wybierz</option>
              <option value="Stacjonarnie">Stacjonarnie</option>
              <option value="Zdalnie">Zdalnie</option>
              <option value="Hybrydowo">Hybrydowo</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor={`pay-${index}`} className="text-sm font-semibold text-slate-900">
            Stawka
          </label>
          <input
            id={`pay-${index}`}
            className={inputClassName}
            placeholder="np. 27-32 zl/h brutto"
            value={value.pay ?? ""}
            onChange={e => updateField("pay", e.target.value)}
          />
        </div>

        <div>
          <label htmlFor={`expiresAt-${index}`} className="block text-sm text-slate-700">
            Szukamy do (opcjonalnie)
          </label>
          <input
            id={`expiresAt-${index}`}
            type="date"
            className="mt-2 w-full border border-slate-200 rounded-xl px-3 py-2"
            value={value.expires_at ?? ""}
            onChange={e => updateField("expires_at", e.target.value || null)}
          />
          <p className="text-xs text-slate-500">
            Po tej dacie oferta przestanie być widoczna na stronie.
          </p>
        </div>
      </div>
    </section>
  );
}

export default function CompanyJobForm() {
  const [pkg, setPkg] = useState<(typeof PACKAGES)[number]>(PACKAGES[0]);
  const [forms, setForms] = useState<JobDraft[]>(
    Array.from({ length: PACKAGES[0].size }, () => ({ ...EMPTY_DRAFT }))
  );

  function updateForm(index: number, next: JobDraft) {
    setForms(prev => prev.map((draft, i) => (i === index ? next : draft)));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const jobsPayload = forms.map(form => ({
      ...form,
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
    }));

    const res = await fetch("/api/submit-jobs-batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        packageCode: pkg.code,
        packageSize: pkg.size,
        jobs: jobsPayload,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      alert(`Blad API (${res.status}): ${text}`);
      return;
    }

    alert("Wysłane do weryfikacji.");
    setForms(Array.from({ length: pkg.size }, () => ({ ...EMPTY_DRAFT })));
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label htmlFor="package" className="text-sm font-semibold text-slate-900">
          Pakiet ogłoszeń
        </label>
        <select
          id="package"
          className={inputClassName}
          value={pkg.code}
          onChange={e => {
            const next = PACKAGES.find(option => option.code === e.target.value);
            if (next) {
              setPkg(next);
              setForms(Array.from({ length: next.size }, () => ({ ...EMPTY_DRAFT })));
            }
          }}
        >
          {PACKAGES.map(option => (
            <option key={option.code} value={option.code}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        {Array.from({ length: pkg.size }).map((_, i) => (
          <CompanyJobFormCard
            key={i}
            index={i}
            total={pkg.size}
            value={forms[i]}
            onChange={next => updateForm(i, next)}
          />
        ))}
      </div>

      <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium">
        Wyślij do weryfikacji
      </button>
    </form>
  );
}
