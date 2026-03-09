"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import type { DbJob } from "@/lib/jobsDb";
import JobCard from "@/components/JobCard";

function uniq(values: (string | null | undefined)[]) {
  return Array.from(new Set(values.filter(Boolean) as string[])).sort();
}

function mergeWithDefaults(dynamicValues: string[], defaultValues: string[]) {
  const base = new Set(defaultValues);
  dynamicValues.forEach(value => base.add(value));
  return Array.from(base);
}

function extractPayValue(pay: string | null | undefined) {
  const raw = String(pay ?? "").replace(",", ".");
  const match = raw.match(/\d+(\.\d+)?/);
  if (!match) return null;
  const parsed = Number(match[0]);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function includesAnyToken(haystack: string, tokens: string[]) {
  return tokens.some(token => haystack.includes(token));
}

function toggleInList(values: string[], value: string) {
  if (values.includes(value)) return values.filter(v => v !== value);
  return [...values, value];
}

function uniqueIds(values: string[]) {
  return Array.from(new Set(values));
}

type SortKey = "newest" | "oldest" | "pay_desc" | "pay_asc";

const FAVORITES_KEY = "saved_job_ids_v1";
const PAGE_SIZE = 9;

const FILTER_LABELS_PL: Record<string, string> = {
  Gdansk: "Gdańsk",
  "Umowa o prace": "Umowa o pracę",
  "Staz / praktyki": "Staż / praktyki",
  "Pelny etat": "Pełny etat",
  "Czesc etatu": "Część etatu",
  Elastycznie: "Elastyczne godziny",
};

const DEFAULT_CONTRACT_OPTIONS = [
  "Umowa zlecenie",
  "Umowa o prace",
  "B2B",
  "Staz / praktyki",
  "Inne",
];

const DEFAULT_TIME_OPTIONS = [
  "Pelny etat",
  "Czesc etatu",
  "Weekendy",
  "Elastycznie",
];

const DEFAULT_MODE_OPTIONS = [
  "Stacjonarnie",
  "Zdalnie",
  "Hybrydowo",
];

const DEFAULT_CITY_OPTIONS = [
  "Gdansk",
  "Sopot",
  "Gdynia",
];


function toFilterLabel(value: string) {
  return FILTER_LABELS_PL[value] ?? value;
}

const favoriteStore = {
  listeners: new Set<() => void>(),
  emit() {
    favoriteStore.listeners.forEach(listener => listener());
  },
  getSnapshot() {
    if (typeof window === "undefined") return "[]";
    return window.localStorage.getItem(FAVORITES_KEY) ?? "[]";
  },
  subscribe(callback: () => void) {
    favoriteStore.listeners.add(callback);
    if (typeof window === "undefined") return () => {};
    const onStorage = (event: StorageEvent) => {
      if (event.key === FAVORITES_KEY) favoriteStore.emit();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      favoriteStore.listeners.delete(callback);
      window.removeEventListener("storage", onStorage);
    };
  },
  set(ids: string[]) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(uniqueIds(ids)));
    favoriteStore.emit();
  },
};

function PaginatedOffers({
  jobs,
  favoriteSet,
  onToggleFavorite,
}: {
  jobs: DbJob[];
  favoriteSet: Set<string>;
  onToggleFavorite: (jobId: string) => void;
}) {
  const [page, setPage] = useState(1);
  const visibleCount = page * PAGE_SIZE;
  const pagedJobs = useMemo(() => jobs.slice(0, visibleCount), [jobs, visibleCount]);
  const hasMoreJobs = visibleCount < jobs.length;

  return (
    <>
      {pagedJobs.map(job => (
        <JobCard
          key={job.id}
          job={job}
          isFavorite={favoriteSet.has(job.id)}
          onToggleFavorite={onToggleFavorite}
        />
      ))}

      {hasMoreJobs && (
        <button
          type="button"
          className="w-1/2 pagi bg-white border border-black text-black hover:bg-slate-50 py-3 rounded-xl font-medium"
          onClick={() => setPage(prev => prev + 1)}
        >
          Wczytaj wiecej
        </button>
      )}
    </>
  );
}

export default function OffersClient({ jobs }: { jobs: DbJob[] }) {
  const [q, setQ] = useState("");
  const [contracts, setContracts] = useState<string[]>([]);
  const [times, setTimes] = useState<string[]>([]);
  const [modes, setModes] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [sort, setSort] = useState<SortKey>("newest");
  const [quickNoExp, setQuickNoExp] = useState(false);
  const [quickWeekend, setQuickWeekend] = useState(false);
  const [quickAsap, setQuickAsap] = useState(false);
  const favoritesRaw = useSyncExternalStore(
    favoriteStore.subscribe,
    favoriteStore.getSnapshot,
    () => "[]"
  );
  const favoriteJobIds = useMemo(() => {
    try {
      const parsed = JSON.parse(favoritesRaw);
      if (!Array.isArray(parsed)) return [];
      return uniqueIds(parsed.filter((v): v is string => typeof v === "string"));
    } catch {
      return [];
    }
  }, [favoritesRaw]);

  function toggleFavorite(jobId: string) {
    if (favoriteJobIds.includes(jobId)) {
      favoriteStore.set(favoriteJobIds.filter(id => id !== jobId));
      return;
    }
    favoriteStore.set([jobId, ...favoriteJobIds]);
  }

  const favoriteSet = useMemo(() => new Set(favoriteJobIds), [favoriteJobIds]);

  const savedJobs = useMemo(
    () =>
      uniqueIds(favoriteJobIds)
        .map(id => jobs.find(job => job.id === id))
        .filter((job): job is DbJob => Boolean(job)),
    [favoriteJobIds, jobs]
  );

  const contractOptions = useMemo(
    () => mergeWithDefaults(uniq(jobs.map(j => j.contract_type)), DEFAULT_CONTRACT_OPTIONS),
    [jobs]
  );
  const timeOptions = useMemo(
    () => mergeWithDefaults(uniq(jobs.map(j => j.time_commitment)), DEFAULT_TIME_OPTIONS),
    [jobs]
  );
  const modeOptions = useMemo(
    () => mergeWithDefaults(uniq(jobs.map(j => j.work_mode)), DEFAULT_MODE_OPTIONS),
    [jobs]
  );
  const cityOptions = useMemo(
    () => mergeWithDefaults(uniq(jobs.map(j => j.city)), DEFAULT_CITY_OPTIONS),
    [jobs]
  );

  const filtered = useMemo(() => {
    const normalizedNeedle = normalizeText(q.trim());

    const base = jobs.filter(job => {
      const tags = job.tags ?? [];
      const normalizedHaystack = normalizeText(
        `${job.title} ${job.company} ${job.description ?? ""} ${tags.join(" ")} ${job.time_commitment ?? ""}`
      );

      if (normalizedNeedle && !normalizedHaystack.includes(normalizedNeedle)) return false;
      if (contracts.length > 0 && !contracts.includes(job.contract_type ?? "")) return false;
      if (times.length > 0 && !times.includes(job.time_commitment ?? "")) return false;
      if (modes.length > 0 && !modes.includes(job.work_mode ?? "")) return false;
      if (cities.length > 0 && !cities.includes(job.city ?? "")) return false;

      if (quickNoExp && !includesAnyToken(normalizedHaystack, ["bez doswiadczenia", "bez doswiadczen"])) return false;
      if (quickWeekend && !includesAnyToken(normalizedHaystack, ["weekendy", "weekendowa", "weekend"])) return false;
      if (quickAsap && !includesAnyToken(normalizedHaystack, ["od zaraz"])) return false;

      return true;
    });

    const sorted = [...base];
    sorted.sort((a, b) => {
      if (sort === "oldest") return Date.parse(a.created_at) - Date.parse(b.created_at);
      if (sort === "pay_desc") return (extractPayValue(b.pay) ?? -1) - (extractPayValue(a.pay) ?? -1);
      if (sort === "pay_asc") return (extractPayValue(a.pay) ?? Number.MAX_SAFE_INTEGER) - (extractPayValue(b.pay) ?? Number.MAX_SAFE_INTEGER);
      return Date.parse(b.created_at) - Date.parse(a.created_at);
    });

    return sorted;
  }, [jobs, q, contracts, times, modes, cities, sort, quickNoExp, quickWeekend, quickAsap]);

  const visibleJobs = useMemo(
    () => filtered.filter(job => !favoriteSet.has(job.id)),
    [filtered, favoriteSet]
  );

  const filterKey = useMemo(
    () =>
      JSON.stringify({
        q,
        contracts,
        times,
        modes,
        cities,
        sort,
        quickNoExp,
        quickWeekend,
        quickAsap,
      }),
    [q, contracts, times, modes, cities, sort, quickNoExp, quickWeekend, quickAsap]
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <aside className="bg-white border border-slate-200 rounded-2xl p-5 h-fit space-y-4 lg:col-span-4 xl:col-span-3">
        <div>
          <div className="text-sm font-semibold text-slate-900">Szukaj stanowiska</div>
          <input
            className="mt-2 w-full border border-slate-200 rounded-xl px-3 py-2"
            placeholder="np. magazyn, sprzedawca, praca weekendowa, pol etatu"
            value={q}
            onChange={e => setQ(e.target.value)}
          />
        </div>


        <div>
          <div className="text-sm font-semibold text-slate-900">Sortowanie</div>
          <select
            className="mt-2 w-full border border-slate-200 rounded-xl px-3 py-2 bg-white"
            value={sort}
            onChange={e => setSort(e.target.value as SortKey)}
          >
            <option value="newest">Najnowsze</option>
            <option value="oldest">Najstarsze</option>
            <option value="pay_desc">Stawka malejaco</option>
            <option value="pay_asc">Stawka rosnaco</option>
          </select>
        </div>



        <div>
          <div className="text-sm font-semibold text-slate-900">Szybkie filtry</div>
          <div className="mt-2 space-y-2 text-sm text-slate-700">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={quickNoExp} onChange={e => setQuickNoExp(e.target.checked)} />
              Bez doświadczenia
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={quickWeekend} onChange={e => setQuickWeekend(e.target.checked)} />
              Weekendy
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={quickAsap} onChange={e => setQuickAsap(e.target.checked)} />
              Od zaraz
            </label>
          </div>
        </div>

        <div>
          <div className="text-sm font-semibold text-slate-900">Umowa</div>
          <div className="mt-2 space-y-2 text-sm text-slate-700">
            {contractOptions.map(v => (
              <label key={v} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={contracts.includes(v)}
                  onChange={() => setContracts(prev => toggleInList(prev, v))}
                />
                {toFilterLabel(v)}
              </label>
            ))}
          </div>
        </div>

        <div>
          <div className="text-sm font-semibold text-slate-900">Wymiar</div>
          <div className="mt-2 space-y-2 text-sm text-slate-700">
            {timeOptions.map(v => (
              <label key={v} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={times.includes(v)}
                  onChange={() => setTimes(prev => toggleInList(prev, v))}
                />
                {toFilterLabel(v)}
              </label>
            ))}
          </div>
        </div>

        <div>
          <div className="text-sm font-semibold text-slate-900">Tryb</div>
          <div className="mt-2 space-y-2 text-sm text-slate-700">
            {modeOptions.map(v => (
              <label key={v} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={modes.includes(v)}
                  onChange={() => setModes(prev => toggleInList(prev, v))}
                />
                {toFilterLabel(v)}
              </label>
            ))}
          </div>
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-900">Miasto</div>
          <div className="mt-2 space-y-2 text-sm text-slate-700">
            {cityOptions.map(v => (
              <label key={v} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={cities.includes(v)}
                  onChange={() => setCities(prev => toggleInList(prev, v))}
                />
                {toFilterLabel(v)}
              </label>
            ))}
          </div>
        </div>

        <button
          className="w-full bg-slate-200 hover:bg-slate-300 text-slate-900 py-2 rounded-xl"
          onClick={() => {
            setQ("");
            setContracts([]);
            setTimes([]);
            setModes([]);
            setCities([]);
            setSort("newest");
            setQuickNoExp(false);
            setQuickWeekend(false);
            setQuickAsap(false);
          }}
        >
          Wyczyść filtry
        </button>
      </aside>

      <div className="space-y-4 lg:col-span-8 xl:col-span-9">
        <div className="text-sm text-slate-600">
          Wyniki: <span className="font-semibold text-slate-900">{visibleJobs.length}</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <div className="text-sm font-semibold text-slate-900">Zapisane oferty: {savedJobs.length}</div>
          {savedJobs.length === 0 ? (
            <div className="mt-2 text-sm text-slate-600">Kliknij serduszko przy ofercie, aby zapisać ją na później.</div>
          ) : (
            <div className="mt-3 space-y-3">
              {savedJobs.map(job => (
                <JobCard
                  key={`saved-${job.id}`}
                  job={job}
                  isFavorite={favoriteSet.has(job.id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          )}
        </div>

        <PaginatedOffers
          key={filterKey}
          jobs={visibleJobs}
          favoriteSet={favoriteSet}
          onToggleFavorite={toggleFavorite}
        />

        {visibleJobs.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 text-slate-600">
            Brak ofert dla tych filtrów.
          </div>
        )}
      </div>
    </div>
  );
}
