"use client";

import { useMemo, useState } from "react";
import { withAdminCsrfHeader } from "@/lib/clientSecurity";

type AppRow = {
  id: string;
  job_id: string;
  job_title: string;
  job_company: string;
  first_name: string;
  contact: string;
  message: string;
  rodo: boolean;
  created_at: string;
  status: "new" | "forwarded" | "closed";
  forwarded_at: string | null;
  company_email_used: string | null;
};

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("pl-PL");
  } catch {
    return iso;
  }
}

export default function AdminApplications() {
  const [items, setItems] = useState<AppRow[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);
  const [jobId, setJobId] = useState("");
  const [status, setStatus] = useState("");

  const jobOptions = useMemo(() => {
    const m = new Map<string, string>();
    items.forEach(i => m.set(i.job_id, `${i.job_title}${i.job_company ? ` - ${i.job_company}` : ""}`));
    return Array.from(m.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [items]);

  async function handleUnauthorized(res: Response) {
    if (res.status === 401) {
      window.location.assign("/admin/login");
      return true;
    }
    return false;
  }

  async function load() {
    setLoading(true);
    const qs = new URLSearchParams();
    if (jobId) qs.set("jobId", jobId);
    if (status) qs.set("status", status);

    const res = await fetch(`/api/admin/applications?${qs.toString()}`);
    if (await handleUnauthorized(res)) {
      setLoading(false);
      return;
    }

    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      alert(`Blad (${res.status}): ${data.error ?? "unknown"}`);
      return;
    }

    const nextItems = (data.data ?? []) as AppRow[];
    setItems(nextItems);
    const nextIds = new Set(nextItems.map(item => item.id));
    setSelectedIds(prev => prev.filter(id => nextIds.has(id)));
  }

  function toggleSelected(applicationId: string, checked: boolean) {
    setSelectedIds(prev => {
      if (checked) {
        if (prev.includes(applicationId)) return prev;
        return [...prev, applicationId];
      }
      return prev.filter(id => id !== applicationId);
    });
  }

  const allVisibleSelected = items.length > 0 && selectedIds.length === items.length;

  function selectAllVisible() {
    setSelectedIds(items.map(item => item.id));
  }

  function clearSelection() {
    setSelectedIds([]);
  }

  async function markForwarded(app: AppRow) {
    const res = await fetch("/api/admin/applications/forward", {
      method: "POST",
      headers: withAdminCsrfHeader({ "Content-Type": "application/json" }),
      body: JSON.stringify({
        applicationId: app.id,
        companyEmailUsed: app.company_email_used ?? "",
      }),
    });
    if (await handleUnauthorized(res)) {
      return;
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert(`Blad (${res.status}): ${data.error ?? "unknown"}`);
      return;
    }

    await load();
  }

  async function logout() {
    await fetch("/api/admin/logout", {
      method: "POST",
      headers: withAdminCsrfHeader(),
    });
    window.location.assign("/admin/login");
  }

  async function deleteSelected() {
    if (!selectedIds.length) return;
    const confirmed = window.confirm(
      `Usunac zaznaczone zgloszenia (${selectedIds.length})? Tej operacji nie da sie cofnac.`
    );
    if (!confirmed) return;

    setIsDeletingBulk(true);
    const res = await fetch("/api/admin/applications/delete", {
      method: "POST",
      headers: withAdminCsrfHeader({ "Content-Type": "application/json" }),
      body: JSON.stringify({ applicationIds: selectedIds }),
    });
    if (await handleUnauthorized(res)) {
      setIsDeletingBulk(false);
      return;
    }

    const data = await res.json().catch(() => ({}));
    setIsDeletingBulk(false);
    if (!res.ok) {
      alert(`Blad (${res.status}): ${data.error ?? "unknown"}`);
      return;
    }

    setSelectedIds([]);
    await load();
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
        <div className="flex flex-wrap gap-3 items-center">
          <select
            className="border border-slate-200 rounded-xl px-3 py-2 bg-white w-[420px]"
            value={jobId}
            onChange={e => setJobId(e.target.value)}
          >
            <option value="">Wszystkie oferty</option>
            {jobOptions.map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>

          <select
            className="border border-slate-200 rounded-xl px-3 py-2 bg-white w-[180px]"
            value={status}
            onChange={e => setStatus(e.target.value)}
          >
            <option value="">Wszystkie statusy</option>
            <option value="new">new</option>
            <option value="forwarded">forwarded</option>
            <option value="closed">closed</option>
          </select>

          <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl" onClick={load}>
            {loading ? "Ladowanie..." : "Pobierz"}
          </button>

          <button
            className="border border-slate-300 hover:bg-slate-100 text-slate-800 px-4 py-2 rounded-xl disabled:opacity-50"
            onClick={allVisibleSelected ? clearSelection : selectAllVisible}
            disabled={!items.length}
          >
            {allVisibleSelected ? "Odznacz wszystkie" : "Zaznacz wszystkie"}
          </button>

          <button
            className="bg-rose-700 hover:bg-rose-800 text-white px-4 py-2 rounded-xl disabled:opacity-50"
            onClick={deleteSelected}
            disabled={!selectedIds.length || isDeletingBulk}
          >
            {isDeletingBulk ? "Usuwanie..." : `Usun zaznaczone (${selectedIds.length})`}
          </button>

          <button className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-xl" onClick={logout}>
            Wyloguj
          </button>
        </div>

        <div className="text-xs text-slate-500">Tip: ustaw status = <b>new</b>, zeby widziec tylko nowe zgloszenia.</div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <div className="text-sm text-slate-600">
          Wyniki: <span className="font-semibold text-slate-900">{items.length}</span>
        </div>
        <div className="text-xs text-slate-500 mt-1">
          Zaznaczone: <span className="font-semibold text-slate-900">{selectedIds.length}</span>
        </div>

        <div className="mt-4 space-y-4">
          {items.map(a => (
            <div key={a.id} className="border border-slate-200 rounded-2xl p-5">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(a.id)}
                      onChange={e => toggleSelected(a.id, e.target.checked)}
                      aria-label={`Zaznacz zgloszenie ${a.id}`}
                    />
                    <div className="font-semibold text-slate-900">
                      {a.job_title} {a.job_company ? `- ${a.job_company}` : ""}
                    </div>
                  </div>

                  <div className="text-sm text-slate-600 mt-1">
                    {fmtDate(a.created_at)} · status: <span className="font-semibold">{a.status}</span>
                    {a.forwarded_at ? ` · forwarded: ${fmtDate(a.forwarded_at)}` : ""}
                  </div>

                  <div className="mt-3 text-sm text-slate-700">
                    <div>
                      <span className="text-slate-500">Imie:</span> {a.first_name}
                    </div>
                    <div>
                      <span className="text-slate-500">Kontakt:</span> {a.contact}
                    </div>
                  </div>

                  <div className="mt-3 text-sm text-slate-700 whitespace-pre-line">{a.message}</div>
                </div>

                <div className="shrink-0 flex gap-2">
                  {a.status !== "forwarded" && (
                    <button
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl"
                      onClick={() => markForwarded(a)}
                    >
                      Oznacz jako przekazane
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {items.length === 0 && <div className="text-slate-600 text-sm">Brak zgloszen dla tych filtrow.</div>}
        </div>
      </div>
    </div>
  );
}
