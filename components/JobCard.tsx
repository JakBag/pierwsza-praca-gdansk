import Link from "next/link";
import type { DbJob } from "@/lib/jobsDb";

type JobCardProps = {
  job: DbJob;
  isFavorite?: boolean;
  onToggleFavorite?: (jobId: string) => void;
};

const VALUE_LABELS_PL: Record<string, string> = {
  Gdansk: "Gda\u0144sk",
  "Umowa o prace": "Umowa o prac\u0119",
  "Staz / praktyki": "Sta\u017c / praktyki",
  "Pelny etat": "Pe\u0142ny etat",
  "Czesc etatu": "Cz\u0119\u015b\u0107 etatu",
  "Praca sezonowa": "Praca sezonowa",
};

function toLabel(value: string | null | undefined) {
  if (!value) return "-";
  return VALUE_LABELS_PL[value] ?? value;
}

function daysDiffFromNow(dateIso: string) {
  const timestamp = Date.parse(dateIso);
  if (Number.isNaN(timestamp)) return null;
  const dayMs = 24 * 60 * 60 * 1000;
  return Math.floor((timestamp - Date.now()) / dayMs);
}

function getExpiresLabel(expiresAt: string | null) {
  if (!expiresAt) return null;
  const diff = daysDiffFromNow(expiresAt);
  if (diff === null) return null;
  if (diff <= 0) return "Wygasa dzisiaj";
  if (diff === 1) return "Wygasa za 1 dzie\u0144";
  return `Wygasa za ${diff} dni`;
}

export default function JobCard({ job, isFavorite = false, onToggleFavorite }: JobCardProps) {
  const tags = job.tags ?? [];
  const expiresLabel = job.hide_expiration_date ? null : getExpiresLabel(job.expires_at);
  const isNew = (() => {
    const diff = daysDiffFromNow(job.created_at);
    if (diff === null) return false;
    return Math.max(0, -diff) <= 3;
  })();

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 hover:shadow-md transition">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <Link href={`/praca-dla-studentow-gdansk/${job.id}`} className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900">{job.title}</h3>
          <p className="text-sm text-slate-600">
            {job.company} - {toLabel(job.city)}
            {job.district ? ` - ${job.district}` : ""}
          </p>

          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {isNew && <span className="rounded-full bg-blue-600 text-white px-3 py-1 font-semibold">Nowe</span>}
            {expiresLabel && <span className="rounded-full bg-amber-100 text-amber-800 px-3 py-1">{expiresLabel}</span>}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {tags.map((tag: string) => (
              <span key={tag} className="bg-emerald-600 text-white text-xs px-3 py-1 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </Link>

        <div className="w-full sm:w-auto shrink-0 self-stretch flex sm:flex-col items-center sm:items-end justify-between gap-3">
          <button
            type="button"
            onClick={() => onToggleFavorite?.(job.id)}
            className={`h-11 w-11 rounded-xl border text-lg leading-none transition ${
              isFavorite
                ? "border-rose-200 bg-rose-50 text-rose-600"
                : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
            }`}
            aria-label={isFavorite ? "Usu\u0144 z zapisanych" : "Zapisz ofert\u0119"}
            title={isFavorite ? "Usu\u0144 z zapisanych" : "Zapisz ofert\u0119"}
          >
            {isFavorite ? "\u2665" : "\u2661"}
          </button>

          <Link
            href={`/praca-dla-studentow-gdansk/${job.id}`}
            className="flex-1 sm:flex-none text-center bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl min-w-[120px]"
          >
            Zobacz
          </Link>
        </div>
      </div>
    </div>
  );
}
