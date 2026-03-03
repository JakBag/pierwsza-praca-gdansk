"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { withAdminCsrfHeader } from "@/lib/clientSecurity";

type SubmissionStatus = "pending" | "approved_unpaid" | "published" | "rejected" | "rejected_unpaid";
type StatusFilter = "all" | SubmissionStatus | "closed" | "expired";
type EffectiveStatus = SubmissionStatus | "closed" | "expired";

type Submission = {
  id: string;
  batch_id?: string | null;
  package_code?: string | null;
  package_size?: number | null;
  company: string;
  title: string;
  contact: string;
  wants_invoice?: boolean | null;
  invoice_nip?: string | null;
  description: string;
  city: string | null;
  tags: string[] | null;
  status: string;
  payment_status?: string | null;
  price_pln?: number | null;
  invoice_ref?: string | null;
  location: string | null;
  contract_type: string | null;
  time_commitment: string | null;
  work_mode: string | null;
  pay: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at?: string | null;
  published_job_id?: string | null;
  published_job_status?: string | null;
  published_job_expires_at?: string | null;
  applications_count?: number | null;
  applications_last_7d?: number | null;
};

type AdminStats = {
  new_today: number;
  last_7_days: number;
  expired_jobs_count: number;
};

function normalizePublishedJobStatus(raw: unknown): "active" | "closed" | "expired" | null {
  const value = String(raw ?? "").trim();
  if (value === "active" || value === "closed" || value === "expired") return value;
  return null;
}

function normalizeStatus(item: Submission): SubmissionStatus {
  const raw = String(item.status ?? "").trim();
  if (raw === "pending" || raw === "approved_unpaid" || raw === "published" || raw === "rejected" || raw === "rejected_unpaid") return raw;
  if (raw === "approved") return item.published_job_id ? "published" : "approved_unpaid";
  return "pending";
}

function statusLabel(status: SubmissionStatus) {
  if (status === "pending") return "Nowe";
  if (status === "approved_unpaid") return "Czeka na platnosc";
  if (status === "published") return "Opublikowane";
  if (status === "rejected_unpaid") return "Anulowane (brak platnosci)";
  return "Odrzucone";
}

function effectiveStatus(item: Submission): EffectiveStatus {
  const status = normalizeStatus(item);
  if (status !== "published") return status;
  const publishedJobStatus = normalizePublishedJobStatus(item.published_job_status);
  if (publishedJobStatus === "closed" || publishedJobStatus === "expired") return publishedJobStatus;
  return "published";
}

export default function AdminSubmissions() {
  const IDLE_TIMEOUT_MS = 5 * 60 * 1000;
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [items, setItems] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [referenceNowMs, setReferenceNowMs] = useState<number>(0);
  const [stats, setStats] = useState<AdminStats>({ new_today: 0, last_7_days: 0, expired_jobs_count: 0 });

  const [priceById, setPriceById] = useState<Record<string, string>>({});
  const [invoiceById, setInvoiceById] = useState<Record<string, string>>({});
  const [durationById, setDurationById] = useState<Record<string, string>>({});
  const [rejectReasonById, setRejectReasonById] = useState<Record<string, string>>({});
  const [payByJobId, setPayByJobId] = useState<Record<string, string>>({});
  const [descriptionByJobId, setDescriptionByJobId] = useState<Record<string, string>>({});
  const [expiresAtByJobId, setExpiresAtByJobId] = useState<Record<string, string>>({});
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function handleUnauthorized(res: Response) {
    if (res.status === 401) {
      window.location.href = "/admin/login";
      return true;
    }
    return false;
  }

  async function logout() {
    await fetch("/api/admin/logout", {
      method: "POST",
      headers: withAdminCsrfHeader(),
    });
    window.location.href = "/admin/login";
  }

  async function postJson(path: string, payload?: unknown) {
    const headers = payload === undefined
      ? withAdminCsrfHeader()
      : withAdminCsrfHeader({ "Content-Type": "application/json" });

    return fetch(path, {
      method: "POST",
      headers,
      body: payload === undefined ? undefined : JSON.stringify(payload),
    });
  }

  useEffect(() => {
    const resetIdleTimer = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        void logout();
      }, IDLE_TIMEOUT_MS);
    };

    const events: Array<keyof WindowEventMap> = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
    ];

    resetIdleTimer();
    events.forEach(eventName => window.addEventListener(eventName, resetIdleTimer, { passive: true }));

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      events.forEach(eventName => window.removeEventListener(eventName, resetIdleTimer));
    };
  }, []);

  const summary = useMemo(
    () =>
      items.reduce(
        (acc, item) => {
          const status = effectiveStatus(item);
          acc[status] += 1;
          return acc;
        },
        {
          pending: 0,
          approved_unpaid: 0,
          published: 0,
          closed: 0,
          expired: 0,
          rejected_unpaid: 0,
          rejected: 0,
        } as Record<EffectiveStatus, number>
      ),
    [items]
  );

  const batchSizeMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of items) {
      const batchId = String(item.batch_id ?? "").trim();
      if (!batchId) continue;
      map.set(batchId, (map.get(batchId) ?? 0) + 1);
    }
    return map;
  }, [items]);

  const filteredItems = useMemo(() => {
    if (statusFilter === "all") return items;
    return items.filter(item => effectiveStatus(item) === statusFilter);
  }, [items, statusFilter]);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/submissions");
    if (await handleUnauthorized(res)) return;
    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      alert(data.error ?? "Blad pobierania");
      return;
    }

    setItems(data.data ?? []);
    const parsedNow = Date.parse(String(data.nowIso ?? ""));
    setReferenceNowMs(Number.isFinite(parsedNow) ? parsedNow : 0);
    setStats({
      new_today: Number(data.stats?.new_today ?? 0),
      last_7_days: Number(data.stats?.last_7_days ?? 0),
      expired_jobs_count: Number(data.stats?.expired_jobs_count ?? 0),
    });
  }

  async function approveUnpaid(submissionId: string) {
    const rawPrice = (priceById[submissionId] ?? "").trim();
    const parsedPrice = Number(rawPrice);
    const payload: { submissionId: string; pricePln?: number } = { submissionId };
    if (rawPrice && Number.isFinite(parsedPrice) && parsedPrice > 0) payload.pricePln = Math.floor(parsedPrice);

    setBusyId(submissionId);
    const res = await postJson("/api/admin/submissions/approve-unpaid", payload);
    if (await handleUnauthorized(res)) return;
    const data = await res.json().catch(() => ({}));
    setBusyId(null);
    if (!res.ok) return alert(data.error ?? "Blad approve");
    await load();
  }

  async function markPaidAndPublish(submissionId: string) {
    const invoiceRef = (invoiceById[submissionId] ?? "").trim();
    const parsedDuration = Number((durationById[submissionId] ?? "").trim());
    const payload = {
      submissionId,
      invoiceRef,
      durationDays: Number.isFinite(parsedDuration) && parsedDuration > 0 ? Math.floor(parsedDuration) : 30,
    };
    setBusyId(submissionId);
    const res = await postJson("/api/admin/submissions/mark-paid-and-publish", payload);
    if (await handleUnauthorized(res)) return;
    const data = await res.json().catch(() => ({}));
    setBusyId(null);
    if (!res.ok) return alert(data.error ?? "Blad publikacji");
    await load();
  }

  async function reject(submissionId: string) {
    const reason = String(rejectReasonById[submissionId] ?? "").trim();
    if (!reason) return alert("Podaj uzasadnienie odrzucenia.");
    setBusyId(submissionId);
    const res = await postJson("/api/admin/reject", { submissionId, reason });
    if (await handleUnauthorized(res)) return;
    const data = await res.json().catch(() => ({}));
    setBusyId(null);
    if (!res.ok) return alert(data.error ?? "Blad reject");
    await load();
  }

  async function closeJob(jobId: string, submissionId: string) {
    setBusyId(submissionId);
    const res = await postJson("/api/admin/jobs/close", { jobId });
    if (await handleUnauthorized(res)) return;
    const data = await res.json().catch(() => ({}));
    setBusyId(null);
    if (!res.ok) return alert(data.error ?? "Blad zamykania oferty");
    await load();
  }

  async function restoreJob(jobId: string, submissionId: string) {
    setBusyId(submissionId);
    const res = await postJson("/api/admin/jobs/restore", { jobId });
    if (await handleUnauthorized(res)) return;
    const data = await res.json().catch(() => ({}));
    setBusyId(null);
    if (!res.ok) return alert(data.error ?? "Blad przywracania oferty");
    await load();
  }

  async function expireSweep() {
    const res = await postJson("/api/admin/jobs/expire");
    if (await handleUnauthorized(res)) return;
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return alert(data.error ?? "Blad oznaczania wygaslych");
    await load();
  }

  async function deleteSubmission(submissionId: string) {
    const confirmed = window.confirm("Usunac ten rekord? Jesli oferta byla opublikowana, powiazany wpis w jobs tez zostanie usuniety.");
    if (!confirmed) return;
    setBusyId(submissionId);
    const res = await postJson("/api/admin/submissions/delete", { submissionId });
    if (await handleUnauthorized(res)) return;
    const data = await res.json().catch(() => ({}));
    setBusyId(null);
    if (!res.ok) return alert(data.error ?? "Blad usuwania rekordu");
    await load();
  }

  function toDateInput(iso: string) {
    const parsed = Date.parse(String(iso ?? "").trim());
    if (!Number.isFinite(parsed)) return "";
    return new Date(parsed).toISOString().slice(0, 10);
  }

  function formatDatePl(iso: string | null | undefined) {
    const parsed = Date.parse(String(iso ?? "").trim());
    if (!Number.isFinite(parsed)) return "-";
    return new Date(parsed).toLocaleDateString("pl-PL");
  }

  function formatDateTimePl(iso: string | null | undefined) {
    const parsed = Date.parse(String(iso ?? "").trim());
    if (!Number.isFinite(parsed)) return "-";
    return new Date(parsed).toLocaleString("pl-PL", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function selectedMonthsCount(startIso: string | null | undefined, endIso: string | null | undefined) {
    const startMs = Date.parse(String(startIso ?? "").trim());
    const endMs = Date.parse(String(endIso ?? "").trim());
    if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs < startMs) return null;
    const start = new Date(startMs);
    const end = new Date(endMs);
    let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    if (end.getDate() < start.getDate()) months -= 1;
    return Math.max(0, months);
  }

  async function savePublishedJob(jobId: string, submissionId: string) {
    const pay = String(payByJobId[jobId] ?? "").trim();
    const description = String(descriptionByJobId[jobId] ?? "").trim();
    const expiresAt = String(expiresAtByJobId[jobId] ?? "").trim();
    if (!pay || !description) return alert("Uzupelnij stawke i opis.");
    setBusyId(submissionId);
    const res = await postJson("/api/admin/jobs/update", {
      jobId,
      pay,
      description,
      expiresAt: expiresAt ? `${expiresAt}T23:59:59.000Z` : null,
    });
    if (await handleUnauthorized(res)) return;
    const data = await res.json().catch(() => ({}));
    setBusyId(null);
    if (!res.ok) return alert(data.error ?? "Blad zapisu zmian");
    await load();
  }

  async function extendPublishedJob(jobId: string, submissionId: string, days = 30) {
    setBusyId(submissionId);
    const res = await postJson("/api/admin/jobs/extend", { jobId, days });
    if (await handleUnauthorized(res)) return;
    const data = await res.json().catch(() => ({}));
    setBusyId(null);
    if (!res.ok) return alert(data.error ?? "Blad przedluzenia");
    await load();
  }

  function daysAgo(dateIso: string | null | undefined) {
    if (!dateIso) return null;
    const timestamp = Date.parse(dateIso);
    if (!Number.isFinite(timestamp) || referenceNowMs <= 0) return null;
    return Math.max(0, Math.floor((referenceNowMs - timestamp) / (24 * 60 * 60 * 1000)));
  }

  function waitingDaysForUnpaid(item: Submission) {
    if (normalizeStatus(item) !== "approved_unpaid") return null;
    const approvalLikeIso = String(item.updated_at ?? "").trim() || item.created_at;
    return daysAgo(approvalLikeIso);
  }

  function closedOrExpiredInfo(item: Submission) {
    const status = String(item.published_job_status ?? "").trim();
    if (status !== "closed" && status !== "expired") return null;
    const days = daysAgo(item.published_job_expires_at);
    if (days === null) return status === "closed" ? "Oferta zamknieta" : "Oferta wygasla";
    return status === "closed" ? `Zamknieta ${days} dni temu` : `Wygasla ${days} dni temu`;
  }

  function isClosed(item: Submission) {
    return (item.published_job_status ?? "") === "closed";
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <div className="flex gap-3 items-center flex-wrap">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl" onClick={load}>
            {loading ? "Ladowanie..." : "Pobierz zgloszenia"}
          </button>
          <button className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-xl" onClick={expireSweep}>
            Oznacz wygasle
          </button>
          <button className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2 rounded-xl" onClick={logout}>
            Wyloguj
          </button>
          <select className="border border-slate-200 rounded-xl px-3 py-2" value={statusFilter} onChange={e => setStatusFilter(e.target.value as StatusFilter)}>
            <option value="all">Wszystkie statusy</option>
            <option value="pending">Nowe</option>
            <option value="approved_unpaid">Czeka na platnosc</option>
            <option value="published">Opublikowane (aktywne)</option>
            <option value="closed">Zamkniete</option>
            <option value="expired">Wygasle</option>
            <option value="rejected_unpaid">Anulowane (brak platnosci)</option>
            <option value="rejected">Odrzucone</option>
          </select>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Pending: {summary.pending} | Czeka na platnosc: {summary.approved_unpaid} | Opublikowane: {summary.published} | Zamrozone: {summary.closed} | Wygasle: {summary.expired} | Anulowane: {summary.rejected_unpaid} | Odrzucone: {summary.rejected}
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Nowe dzisiaj: {stats.new_today} | Ostatnie 7 dni: {stats.last_7_days} | Wygasle oferty: {stats.expired_jobs_count}
        </p>
      </div>

      <div className="space-y-4">
        {filteredItems.map(item => {
          const status = normalizeStatus(item);
          const displayStatus = effectiveStatus(item);
          const paymentStatus = String(item.payment_status ?? "unpaid");
          const jobId = String(item.published_job_id ?? "").trim();
          const busy = busyId === item.id;
          const batchId = String(item.batch_id ?? "").trim();
          const batchCount = batchId ? batchSizeMap.get(batchId) ?? 1 : null;
          const isFromPackage = Boolean(batchId);
          const selectedMonths = selectedMonthsCount(item.created_at, item.expires_at);
          const expiresLabel = item.expires_at ? selectedMonths !== null ? `${formatDatePl(item.expires_at)} (${selectedMonths} mies.)` : formatDatePl(item.expires_at) : "-";
          const waitDays = waitingDaysForUnpaid(item);
          const submittedAtLabel = formatDateTimePl(item.created_at);
          const approvedAtLabel = status === "approved_unpaid" ? formatDateTimePl(item.updated_at ?? item.created_at) : null;

          return (
            <div key={item.id} className="bg-white border border-slate-200 rounded-2xl p-5">
              <div className="flex justify-between gap-6 flex-wrap">
                <div className="min-w-0">
                  <div className="font-semibold text-slate-900">{item.company} / {item.title}</div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-xs bg-slate-900 text-white px-3 py-1 rounded-full">status: {displayStatus}</span>
                    <span className="text-xs bg-slate-200 text-slate-800 px-3 py-1 rounded-full">{statusLabel(status)}</span>
                    <span className="text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">payment_status: {paymentStatus}</span>
                    {isFromPackage && batchId && <span className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full">batch: {batchId.slice(0, 8)} ({batchCount} ofert)</span>}
                  </div>

                  <div className="mt-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tylko admin</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-700 mt-2">
                      <div>price_pln: {item.price_pln ?? "-"}</div><div>invoice_ref: {item.invoice_ref ?? "-"}</div><div>expires_at: {expiresLabel}</div><div>kontakt: {item.contact ?? "-"}</div><div>faktura: {item.wants_invoice ? "tak" : "nie"}</div><div>NIP: {item.wants_invoice ? (item.invoice_nip ?? "-") : "-"}</div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-700 mt-2">
                      <div>wyslano formularz: {submittedAtLabel}</div>
                      {status === "approved_unpaid" ? <div>zaakceptowano: {approvedAtLabel}</div> : <div />}
                    </div>
                  </div>

                  <hr className="my-4 border-slate-200" />

                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Dane ogloszenia</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-700 mt-2">
                      <div>umowa: {item.contract_type ?? "-"}</div><div>wymiar: {item.time_commitment ?? "-"}</div><div>tryb: {item.work_mode ?? "-"}</div><div>stawka: {item.pay ?? "-"}</div>
                    </div>
                    <div className="text-sm text-slate-700 mt-4 whitespace-pre-line">{item.description}</div>
                    <div className="flex flex-wrap gap-2 mt-3">{(item.tags ?? []).map(tag => <span key={tag} className="bg-emerald-600 text-white text-xs px-3 py-1 rounded-full">{tag}</span>)}</div>
                  </div>
                </div>

                <div className="w-full md:w-[330px] shrink-0 space-y-3">
                  {status === "pending" && (
                    <>
                      <label className="block text-sm text-slate-700">Cena (PLN)<input className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2" type="number" min={1} step={1} placeholder="np. 99" value={priceById[item.id] ?? ""} onChange={e => setPriceById(prev => ({ ...prev, [item.id]: e.target.value }))} /></label>
                      <label className="block text-sm text-slate-700">Uzasadnienie odrzucenia<textarea className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 min-h-[90px]" placeholder="Napisz krotko, dlaczego oferta zostala odrzucona" value={rejectReasonById[item.id] ?? ""} onChange={e => setRejectReasonById(prev => ({ ...prev, [item.id]: e.target.value }))} /></label>
                      <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl disabled:opacity-60" onClick={() => approveUnpaid(item.id)} disabled={busy}>Approve (czeka na platnosc)</button>
                      <button className="w-full bg-slate-200 hover:bg-slate-300 text-slate-900 px-4 py-2 rounded-xl disabled:opacity-60" onClick={() => reject(item.id)} disabled={busy}>Reject</button>
                    </>
                  )}

                  {status === "approved_unpaid" && (
                    <>
                      <div className="text-sm font-medium text-amber-700 bg-amber-100 rounded-xl px-3 py-2">Czeka na platnosc</div>
                      {waitDays !== null && (
                        <div className="text-sm font-medium text-slate-700 bg-slate-100 rounded-xl px-3 py-2">
                          Od akceptacji minelo: {waitDays} dni
                        </div>
                      )}
                      {waitDays !== null && waitDays >= 3 && (
                        <div className="text-sm font-medium text-rose-700 bg-rose-100 rounded-xl px-3 py-2">
                          Minely {waitDays} dni od akceptacji - sprawdz platnosc lub anuluj oferte.
                        </div>
                      )}
                      <label className="block text-sm text-slate-700">Uzasadnienie odrzucenia<textarea className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 min-h-[90px]" placeholder="Napisz krotko, dlaczego oferta zostala odrzucona" value={rejectReasonById[item.id] ?? ""} onChange={e => setRejectReasonById(prev => ({ ...prev, [item.id]: e.target.value }))} /></label>
                      <label className="block text-sm text-slate-700">invoice_ref<input className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2" placeholder="np. numer z Bizky" value={invoiceById[item.id] ?? ""} onChange={e => setInvoiceById(prev => ({ ...prev, [item.id]: e.target.value }))} /></label>
                      <label className="block text-sm text-slate-700">durationDays<input className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2" type="number" min={1} step={1} placeholder="30" value={durationById[item.id] ?? ""} onChange={e => setDurationById(prev => ({ ...prev, [item.id]: e.target.value }))} /></label>
                      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl disabled:opacity-60" onClick={() => markPaidAndPublish(item.id)} disabled={busy}>Oznacz oplacone + Publikuj</button>
                      <button className="w-full bg-slate-200 hover:bg-slate-300 text-slate-900 px-4 py-2 rounded-xl disabled:opacity-60" onClick={() => reject(item.id)} disabled={busy}>Reject</button>
                    </>
                  )}

                  {status === "published" && (
                    <>
                      <div className="text-sm font-medium text-emerald-700 bg-emerald-100 rounded-xl px-3 py-2">Opublikowane</div>
                      <div className="text-sm font-medium text-indigo-700 bg-indigo-50 rounded-xl px-3 py-2">Zgloszenia: {item.applications_count ?? 0} | Ostatnie 7 dni: {item.applications_last_7d ?? 0}</div>
                      {closedOrExpiredInfo(item) && <div className="text-sm font-medium text-slate-700 bg-slate-100 rounded-xl px-3 py-2">{closedOrExpiredInfo(item)}</div>}
                      {jobId ? <Link href={`/oferty/${jobId}`} className="text-sm text-blue-700 underline">/oferty/{jobId}</Link> : <div className="text-sm text-slate-600">Brak powiazanego jobId.</div>}
                      {jobId && <label className="block text-sm text-slate-700">Stawka<input className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2" value={payByJobId[jobId] ?? ""} onChange={e => setPayByJobId(prev => ({ ...prev, [jobId]: e.target.value }))} /></label>}
                      {jobId && <label className="block text-sm text-slate-700">Opis oferty<textarea className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 min-h-[120px]" value={descriptionByJobId[jobId] ?? ""} onChange={e => setDescriptionByJobId(prev => ({ ...prev, [jobId]: e.target.value }))} /></label>}
                      {jobId && <label className="block text-sm text-slate-700">Data wygasniecia<input className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2" type="date" value={expiresAtByJobId[jobId] ?? ""} onChange={e => setExpiresAtByJobId(prev => ({ ...prev, [jobId]: e.target.value }))} /></label>}
                      {jobId && <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl disabled:opacity-60" onClick={() => savePublishedJob(jobId, item.id)} disabled={busy}>Zapisz zmiany</button>}
                      {jobId && <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl disabled:opacity-60" onClick={() => extendPublishedJob(jobId, item.id, 30)} disabled={busy}>Przedluz +30 dni</button>}
                      {jobId && (isClosed(item) ? <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl disabled:opacity-60" onClick={() => restoreJob(jobId, item.id)} disabled={busy}>Przywroc oferte</button> : <button className="w-full bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl disabled:opacity-60" onClick={() => closeJob(jobId, item.id)} disabled={busy}>Zamknij oferte</button>)}
                      <button className="w-full bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl disabled:opacity-60" onClick={() => deleteSubmission(item.id)} disabled={busy}>Usun rekord</button>
                    </>
                  )}

                  {(status === "rejected" || status === "rejected_unpaid") && (
                    <>
                      <div className="text-sm font-medium text-rose-700 bg-rose-100 rounded-xl px-3 py-2">
                        {status === "rejected_unpaid" ? "Anulowane: brak platnosci" : "Odrzucone"}
                      </div>
                      {status === "rejected_unpaid" && (
                        <div className="text-sm font-medium text-rose-700 bg-rose-50 rounded-xl px-3 py-2">
                          Powod: Anulowano automatycznie po 5 dniach braku platnosci.
                        </div>
                      )}
                      <button className="w-full bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl disabled:opacity-60" onClick={() => deleteSubmission(item.id)} disabled={busy}>Usun rekord</button>
                    </>
                  )}

                  {(status === "pending" || status === "approved_unpaid") && (
                    <button className="w-full bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl disabled:opacity-60" onClick={() => deleteSubmission(item.id)} disabled={busy}>Usun rekord</button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredItems.length === 0 && <div className="text-slate-600 text-sm">Brak zgloszen dla wybranego statusu.</div>}
      </div>
    </div>
  );
}
