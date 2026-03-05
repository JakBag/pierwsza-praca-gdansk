"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/NavBar";

type JobDraft = {
  company: string;
  title: string;
  contact: string;
  district: string;
  wants_invoice: boolean;
  invoice_nip: string;
  description: string;
  tags: string[];
  city: string;
  location: string;
  contract_type: string;
  time_commitment: string;
  work_mode: string;
  pay: string;
  expires_at: string | null;
  expires_mode: "months" | "date";
  expires_months: number;
};

const EMPTY: JobDraft = {
  company: "",
  title: "",
  contact: "",
  district: "",
  wants_invoice: false,
  invoice_nip: "",
  description: "",
  tags: [],
  city: "Gdansk",
  location: "",
  contract_type: "",
  time_commitment: "",
  work_mode: "",
  pay: "",
  expires_at: null,
  expires_mode: "months",
  expires_months: 1,
};

const suggestedTags = [
  "Bez doświadczenia",
  "Bez CV",
  "Praca od zaraz",
  "Elastyczny grafik",
  "Szkolenie na start",
];

const DISTRICTS_BY_CITY: Record<string, string[]> = {
  Gdansk: [
    "Aniołki",
    "Brętowo",
    "Brzeźno",
    "Chełm",
    "Jasień",
    "Kokoszki",
    "Krakowiec-Górki Zachodnie",
    "Letnica",
    "Matarnia",
    "Młyniska",
    "Nowy Port",
    "Oliwa",
    "Olszynka",
    "Orunia Górna-Gdańsk Południe",
    "Orunia-Św. Wojciech-Lipce",
    "Osowa",
    "Piecki-Migowo",
    "Przeróbka",
    "Przymorze Małe",
    "Przymorze Wielkie",
    "Rudniki",
    "Siedlce",
    "Stogi",
    "Strzyża",
    "Suchanino",
    "Śródmieście",
    "Ujeścisko-Łostowice",
    "VII Dwór",
    "Wrzeszcz Dolny",
    "Wrzeszcz Górny",
    "Wyspa Sobieszewska",
    "Wzgórze Mickiewicza",
    "Zaspa Młyniec",
    "Zaspa Rozstaje",
    "Żabianka-Wejhera-Jelitkowo-Tysiąclecia",
  ],
  Sopot: [
    "Dolny Sopot",
    "Górny Sopot",
    "Kamienny Potok",
    "Brodwino",
    "Karlikowo",
    "Stawowiew",
    "Świemirowo",
    "Przylesie",
  ],
  Gdynia: [
    "Babie Doły",
    "Chwarzno-Wiczlino",
    "Chylonia",
    "Cisowa",
    "Działki Leśne",
    "Dąbrowa",
    "Grabówek",
    "Kamienna Góra",
    "Karwiny",
    "Leszczynki",
    "Mały Kack",
    "Obłuże",
    "Oksywie",
    "Orłowo",
    "Pogórze",
    "Pustki Cisowskie-Demptowo",
    "Redłowo",
    "Śródmieście",
    "Wielki Kack",
    "Witomino",
    "Wzgórze św. Maksymiliana",
  ],
};

function packageSize(code: string | null) {
  if (code === "p3") return 3;
  if (code === "p5") return 5;
  return 1;
}

function isValidEmail(value: string) {
  const email = value.trim();
  return email.includes("@");
}

function addMonthsIso(months: number) {
  const now = new Date();
  const target = new Date(now);
  target.setMonth(target.getMonth() + months);
  return target.toISOString();
}

function normalizeNip(value: string) {
  return String(value ?? "").replace(/\D+/g, "");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function markdownToEditorHtml(markdown: string) {
  const lines = String(markdown ?? "").replace(/\r\n/g, "\n").split("\n");
  const html: string[] = [];
  let i = 0;

  const inlineBold = (text: string) => {
    const escaped = escapeHtml(text);
    return escaped.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  };

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i += 1;
      continue;
    }

    if (/^\s*(?:[-•])\s*/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*(?:[-•])\s*/.test(lines[i])) {
        items.push(`<li>${inlineBold(lines[i].replace(/^\s*(?:[-•])\s*/, "").trim())}</li>`);
        i += 1;
      }
      html.push(`<ul>${items.join("")}</ul>`);
      continue;
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(`<li>${inlineBold(lines[i].replace(/^\s*\d+\.\s+/, "").trim())}</li>`);
        i += 1;
      }
      html.push(`<ol>${items.join("")}</ol>`);
      continue;
    }

    html.push(`<div>${inlineBold(line)}</div>`);
    i += 1;
  }

  return html.join("") || "<div><br></div>";
}

type FormContentProps = {
  pkgCode: string;
  size: number;
};

function FormContent({ pkgCode, size }: FormContentProps) {
  const [forms, setForms] = useState<JobDraft[]>(
    Array.from({ length: size }, () => ({ ...EMPTY }))
  );
  const [website, setWebsite] = useState("");
  const [sending, setSending] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [customTagInputByIndex, setCustomTagInputByIndex] = useState<Record<number, string>>({});
  const [showCustomTagInputByIndex, setShowCustomTagInputByIndex] = useState<Record<number, boolean>>({});
  const startedAtMsRef = useRef<number>(Date.now());
  const descriptionRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const lastSelectionByIndex = useRef<Record<number, Range | null>>({});
  const editorInitializedByIndex = useRef<Record<number, boolean>>({});
  const router = useRouter();

  function update(i: number, patch: Partial<JobDraft>) {
    setForms(prev => prev.map((f, idx) => (idx === i ? { ...f, ...patch } : f)));
  }

  function autofillOthersOnBlur(i: number, key: "company" | "contact" | "location") {
    setForms(prev =>
      prev.map((f, idx, arr) => {
        if (idx === i) return f;
        const sourceValue = String(arr[i]?.[key] ?? "");
        if (!sourceValue.trim()) return f;
        if (String(f[key] ?? "").trim()) return f;
        return { ...f, [key]: sourceValue };
      })
    );
  }

  function toggleTag(index: number, tag: string) {
    setForms(prev =>
      prev.map((f, idx) => {
        if (idx !== index) return f;
        const exists = f.tags.includes(tag);
        return { ...f, tags: exists ? f.tags.filter(t => t !== tag) : [...f.tags, tag] };
      })
    );
  }

  function addCustomTag(index: number) {
    const current = (customTagInputByIndex[index] ?? "").trim();
    if (!current) return;

    setForms(prev =>
      prev.map((f, idx) => {
        if (idx !== index) return f;
        const alreadyExists = f.tags.some(t => t.toLowerCase() === current.toLowerCase());
        return alreadyExists ? f : { ...f, tags: [...f.tags, current] };
      })
    );

    setCustomTagInputByIndex(prev => ({ ...prev, [index]: "" }));
    setShowCustomTagInputByIndex(prev => ({ ...prev, [index]: false }));
  }

  function editorHtmlToMarkdown(html: string) {
    if (typeof window === "undefined") return "";
    const root = document.createElement("div");
    root.innerHTML = html;

    const readInline = (node: ChildNode): string => {
      if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? "";
      if (node.nodeType !== Node.ELEMENT_NODE) return "";

      const el = node as HTMLElement;
      const tag = el.tagName.toLowerCase();
      if (tag === "br") return "\n";

      const text = Array.from(el.childNodes).map(readInline).join("");
      if (tag === "strong" || tag === "b") return `**${text}**`;
      return text;
    };

    const lines: string[] = [];

    Array.from(root.childNodes).forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = (node.textContent ?? "").trim();
        if (text) lines.push(text);
        return;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return;

      const el = node as HTMLElement;
      const tag = el.tagName.toLowerCase();

      if (tag === "ul") {
        Array.from(el.querySelectorAll(":scope > li")).forEach(li => {
          const itemText = Array.from(li.childNodes).map(readInline).join("").trim();
          if (itemText) lines.push(`• ${itemText}`);
        });
        return;
      }

      if (tag === "ol") {
        Array.from(el.querySelectorAll(":scope > li")).forEach((li, idx) => {
          const itemText = Array.from(li.childNodes).map(readInline).join("").trim();
          if (itemText) lines.push(`${idx + 1}. ${itemText}`);
        });
        return;
      }

      const text = Array.from(el.childNodes).map(readInline).join("").trim();
      if (text) lines.push(text);
    });

    return lines.join("\n");
  }

  function syncEditorToDescription(index: number) {
    const editor = descriptionRefs.current[index];
    if (!editor) return;
    const html = editor.innerHTML;
    update(index, { description: editorHtmlToMarkdown(html) });
  }

  function saveSelection(index: number) {
    const editor = descriptionRefs.current[index];
    if (!editor) return;

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    if (!editor.contains(range.startContainer) || !editor.contains(range.endContainer)) return;
    lastSelectionByIndex.current[index] = range.cloneRange();
  }

  function restoreSelection(index: number) {
    const editor = descriptionRefs.current[index];
    const saved = lastSelectionByIndex.current[index];
    if (!editor) return false;

    const sel = window.getSelection();
    if (!sel) return false;

    // If user still has a live caret/selection inside this editor, keep it.
    if (
      sel.rangeCount > 0 &&
      editor.contains(sel.getRangeAt(0).startContainer) &&
      editor.contains(sel.getRangeAt(0).endContainer)
    ) {
      return true;
    }

    editor.focus();

    // Fallback to the last saved selection if it still points into this editor.
    if (
      saved &&
      editor.contains(saved.startContainer) &&
      editor.contains(saved.endContainer)
    ) {
      sel.removeAllRanges();
      sel.addRange(saved);
      return true;
    }

    // Final fallback: put caret at the end of the editor.
    const range = document.createRange();
    range.selectNodeContents(editor);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
    return true;
  }

  function formatBold(index: number) {
    const editor = descriptionRefs.current[index];
    if (!editor) return;
    restoreSelection(index);
    document.execCommand("bold");
    saveSelection(index);
  }

  function formatList(index: number, ordered: boolean) {
    const editor = descriptionRefs.current[index];
    if (!editor) return;

    restoreSelection(index);
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    if (!editor.contains(range.startContainer) || !editor.contains(range.endContainer)) return;

    if (range.collapsed) {
      const prefix = ordered ? "1. " : "• ";
      range.deleteContents();
      const textNode = document.createTextNode(prefix);
      range.insertNode(textNode);

      const nextRange = document.createRange();
      nextRange.setStartAfter(textNode);
      nextRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(nextRange);
      saveSelection(index);
      return;
    }

    const blockTags = new Set(["div", "p", "li", "ul", "ol"]);
    const selectedFragment = range.cloneContents();
    const selectedRoot = document.createElement("div");
    selectedRoot.appendChild(selectedFragment);

    const pieces: string[] = [];
    const pushNewline = () => {
      if (pieces.length === 0) return;
      if (pieces[pieces.length - 1] !== "\n") pieces.push("\n");
    };

    const walk = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        pieces.push(node.textContent ?? "");
        return;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return;

      const el = node as HTMLElement;
      const tag = el.tagName.toLowerCase();

      if (tag === "br") {
        pushNewline();
        return;
      }

      const isBlock = blockTags.has(tag);
      if (isBlock) pushNewline();
      Array.from(el.childNodes).forEach(walk);
      if (isBlock) pushNewline();
    };

    Array.from(selectedRoot.childNodes).forEach(walk);

    const rawLines = pieces
      .join("")
      .replace(/\r\n/g, "\n")
      .split("\n");

    let order = 1;
    const htmlLines = rawLines
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        const prefix = ordered ? `${order++}. ` : "• ";
        return `<div>${escapeHtml(`${prefix}${line}`)}</div>`;
      });

    if (htmlLines.length === 0) return;

    const fragment = range.createContextualFragment(htmlLines.join(""));
    const lastInserted = fragment.lastChild;
    range.deleteContents();
    range.insertNode(fragment);

    if (lastInserted) {
      const nextRange = document.createRange();
      nextRange.selectNodeContents(lastInserted);
      nextRange.collapse(false);
      sel.removeAllRanges();
      sel.addRange(nextRange);
    }

    saveSelection(index);
  }

  async function submitAll() {
    setErr(null);
    setOk(null);

    const syncedForms = forms.map((form, index) => {
      const editor = descriptionRefs.current[index];
      if (!editor) return form;
      return { ...form, description: editorHtmlToMarkdown(editor.innerHTML) };
    });

    for (const f of syncedForms) {
      if (!f.company.trim() || !f.title.trim() || !f.contact.trim() || !f.description.trim()) {
        setErr("Uzupełnij: firma, stanowisko, kontakt i opis we wszystkich formularzach.");
        return;
      }
      if (!f.district.trim()) {
        setErr("Wybierz dzielnice dla kazdego ogloszenia.");
        return;
      }
      if (!isValidEmail(f.contact)) {
        setErr("Kontakt musi być poprawnym emailem (musi zawierać znak @).");
        return;
      }
      if (f.pay.trim() && !/^\d+(?:[,.]\d+)?$/.test(f.pay.trim())) {
        setErr("Stawka może zawierać cyfry oraz opcjonalnie przecinek (np. 31,5).");
        return;
      }
      if (f.wants_invoice) {
        const nip = normalizeNip(f.invoice_nip);
        if (nip.length !== 10) {
          setErr("Jesli chcesz fakture, podaj poprawny NIP (10 cyfr).");
          return;
        }
      }
    }

    setSending(true);
    try {
      const jobsPayload = syncedForms.map(f => {
        const expiresAtIso =
          f.expires_mode === "date"
            ? f.expires_at
              ? new Date(f.expires_at).toISOString()
              : null
            : addMonthsIso(Math.max(1, Number(f.expires_months) || 1));

        return {
          ...f,
          invoice_nip: f.wants_invoice ? normalizeNip(f.invoice_nip) : "",
          expires_at: expiresAtIso,
        };
      });

      const res = await fetch("/api/submit-jobs-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startedAtMs: startedAtMsRef.current,
          packageCode: pkgCode,
          packageSize: size,
          website,
          jobs: jobsPayload,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Błąd wysyłki");

      setOk("Wysłane. Po zatwierdzeniu zgłoszenia przekażemy dane do płatności na maila");
      setForms(Array.from({ length: size }, () => ({ ...EMPTY })));
      setWebsite("");
      startedAtMsRef.current = Date.now();
      setCustomTagInputByIndex({});
      setShowCustomTagInputByIndex({});
      editorInitializedByIndex.current = {};
      Object.values(descriptionRefs.current).forEach(editor => {
        if (editor) editor.innerHTML = "<div><br></div>";
      });
      lastSelectionByIndex.current = {};
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Błąd");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <button
        onClick={() => router.push("/dla-firm")}
        className="text-sm text-slate-600 hover:text-slate-900"
      >
        {"<-"} Zmień pakiet
      </button>

      <h1 className="text-3xl font-bold text-slate-900 mt-4">
        Formularz ({size} {size === 1 ? "ogłoszenie" : "ogłoszenia"})
      </h1>
      <p className="text-slate-600 mt-2">
        Wypełnij wszystkie pola wymagane. Po weryfikacji wyślemy fakturę/płatność.
      </p>

      {err && <div className="mt-6 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">{err}</div>}
      {ok && <div className="mt-6 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4">{ok}</div>}

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

      <div className="mt-8 space-y-6">
        {forms.map((f, i) => (
          <section key={i} className="bg-white border border-slate-200 rounded-2xl p-6">
            <div className="font-semibold text-slate-900">
              Ogłoszenie {i + 1} / {size}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <input
                className="border border-slate-200 rounded-xl px-3 py-2"
                placeholder="Nazwa firmy *"
                value={f.company}
                onChange={e => update(i, { company: e.target.value })}
                onBlur={() => autofillOthersOnBlur(i, "company")}
              />
              <input
                className="border border-slate-200 rounded-xl px-3 py-2"
                placeholder="Stanowisko *"
                value={f.title}
                onChange={e => update(i, { title: e.target.value })}
              />

              <input
                className="border border-slate-200 rounded-xl px-3 py-2"
                placeholder="Kontakt do firmy (email) *"
                type="email"
                value={f.contact}
                onChange={e => update(i, { contact: e.target.value })}
                onBlur={() => autofillOthersOnBlur(i, "contact")}
              />
              <select
                className="border border-slate-200 rounded-xl px-3 py-2 bg-white"
                value={f.city}
                onChange={e => update(i, { city: e.target.value, district: "" })}
              >
                <option value="Gdansk">Gdańsk</option>
                <option value="Sopot">Sopot</option>
                <option value="Gdynia">Gdynia</option>
              </select>
              <select
                className="border border-slate-200 rounded-xl px-3 py-2 bg-white"
                value={f.district}
                onChange={e => update(i, { district: e.target.value })}
              >
                <option value="">Wybierz dzielnice</option>
                {(DISTRICTS_BY_CITY[f.city] ?? []).map(district => (
                  <option key={`${f.city}-${district}`} value={district}>
                    {district}
                  </option>
                ))}
              </select>

              <input
                className="border border-slate-200 rounded-xl px-3 py-2"
                placeholder="Adres"
                value={f.location}
                onChange={e => update(i, { location: e.target.value })}
                onBlur={() => autofillOthersOnBlur(i, "location")}
              />
              <select
                className="border border-slate-200 rounded-xl px-3 py-2 bg-white"
                value={f.contract_type}
                onChange={e => update(i, { contract_type: e.target.value })}
              >
                <option value="">Rodzaj umowy</option>
                <option value="Umowa zlecenie">Umowa zlecenie</option>
                <option value="Umowa o prace">Umowa o pracę</option>
                <option value="B2B">B2B</option>
                <option value="Staz / praktyki">Staż / praktyki</option>
                <option value="Inne">Inne</option>
              </select>

              <select
                className="border border-slate-200 rounded-xl px-3 py-2 bg-white"
                value={f.time_commitment}
                onChange={e => update(i, { time_commitment: e.target.value })}
              >
                <option value="">Wymiar czasu</option>
                <option value="Pelny etat">Pełny etat</option>
                <option value="Czesc etatu">Cześć etatu</option>
                <option value="Weekendy">Weekendy</option>
                <option value="Elastycznie">Elastyczne godziny</option>
              </select>

              <select
                className="border border-slate-200 rounded-xl px-3 py-2 bg-white"
                value={f.work_mode}
                onChange={e => update(i, { work_mode: e.target.value })}
              >
                <option value="">Tryb pracy</option>
                <option value="Stacjonarnie">Stacjonarnie</option>
                <option value="Zdalnie">Zdalnie</option>
                <option value="Hybrydowo">Hybrydowo</option>
              </select>
              <input
                className="border border-slate-200 rounded-xl px-3 py-2"
                placeholder="Stawka godzinowa"
                value={f.pay}
                inputMode="decimal"
                pattern="[0-9]+([,.][0-9]+)?"
                onChange={e => update(i, { pay: e.target.value.replace(/[^\d,.\s]/g, "").trim() })}
              />

              <select
                className="border border-slate-200 rounded-xl px-3 py-2 bg-white"
                value={f.expires_mode}
                onChange={e => update(i, { expires_mode: e.target.value as "months" | "date" })}
              >
                <option value="months">Wygasa po liczbie miesięcy</option>
                <option value="date">Wygasa konkretnego dnia</option>
              </select>

              {f.expires_mode === "months" ? (
                <select
                  className="border border-slate-200 rounded-xl px-3 py-2 bg-white"
                  value={String(f.expires_months)}
                  onChange={e => update(i, { expires_months: Math.max(1, Number(e.target.value) || 1) })}
                >
                  <option value="1">1 miesiąc</option>
                  <option value="2">2 miesiące</option>
                  <option value="3">3 miesiące</option>
                  <option value="6">6 miesięcy</option>
                  <option value="12">12 miesięcy</option>
                </select>
              ) : (
                <input
                  type="date"
                  className="border border-slate-200 rounded-xl px-3 py-2"
                  value={f.expires_at ?? ""}
                  onChange={e => update(i, { expires_at: e.target.value || null })}
                />
              )}
            </div>

            <div className="mt-4">
              <div className="mb-2 text-sm font-semibold text-slate-900">Opis stanowiska</div>
              <div
                ref={el => {
                  descriptionRefs.current[i] = el;
                  if (el && !editorInitializedByIndex.current[i]) {
                    el.innerHTML = markdownToEditorHtml(f.description);
                    editorInitializedByIndex.current[i] = true;
                  }
                }}
                contentEditable
                suppressContentEditableWarning
                className="w-full border border-slate-200 rounded-xl px-3 py-2 min-h-[112px] focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                onFocus={() => saveSelection(i)}
                onInput={() => saveSelection(i)}
                onKeyUp={() => saveSelection(i)}
                onMouseUp={() => saveSelection(i)}
                onBlur={() => syncEditorToDescription(i)}
              />

              <div className="mt-2 text-xs text-slate-500">Formatowanie dotyczy tylko pola Opis stanowiska.</div>

              <div className="flex flex-wrap gap-2 mt-2">
                <button
                  type="button"
                  onMouseDown={e => {
                    e.preventDefault();
                    formatBold(i);
                  }}
                  className="border border-slate-300 hover:bg-slate-50 text-slate-900 rounded-lg px-3 py-1.5 text-sm font-semibold"
                >
                  B
                </button>
                <button
                  type="button"
                  onMouseDown={e => {
                    e.preventDefault();
                    formatList(i, false);
                  }}
                  className="border border-slate-300 hover:bg-slate-50 text-slate-900 rounded-lg px-3 py-1.5 text-sm"
                >
                  Lista punktowana
                </button>
                <button
                  type="button"
                  onMouseDown={e => {
                    e.preventDefault();
                    formatList(i, true);
                  }}
                  className="border border-slate-300 hover:bg-slate-50 text-slate-900 rounded-lg px-3 py-1.5 text-sm"
                >
                  Lista numerowana
                </button>
              </div>
            </div>

            <div className="mt-4">
              <label className="text-sm font-semibold text-slate-900">Tagi ogloszenia</label>

              <div className="mt-2 flex flex-wrap gap-2">
                {suggestedTags.map(tag => {
                  const active = f.tags.includes(tag);
                  return (
                    <button
                      key={`${i}-${tag}`}
                      type="button"
                      onClick={() => toggleTag(i, tag)}
                      className={
                        active
                          ? "rounded-full bg-emerald-600 text-white text-sm px-4 py-1.5"
                          : "rounded-full bg-slate-100 text-slate-700 text-sm px-4 py-1.5 hover:bg-slate-200"
                      }
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>

              {f.tags.some(tag => !suggestedTags.includes(tag)) && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {f.tags
                    .filter(tag => !suggestedTags.includes(tag))
                    .map(tag => (
                      <button
                        key={`${i}-custom-${tag}`}
                        type="button"
                        onClick={() => toggleTag(i, tag)}
                        className="rounded-full bg-emerald-600 text-white text-sm px-4 py-1.5"
                      >
                        {tag}
                      </button>
                    ))}
                </div>
              )}

              <div className="mt-2">
                <button
                  type="button"
                  onClick={() =>
                    setShowCustomTagInputByIndex(prev => ({ ...prev, [i]: !prev[i] }))
                  }
                  className="rounded-full border border-slate-300 text-slate-700 text-sm px-4 py-1.5 hover:bg-slate-50"
                >
                  + Napisz swoj tag
                </button>
              </div>

              {showCustomTagInputByIndex[i] && (
                <div className="mt-3 flex gap-2">
                  <input
                    className="w-full border border-slate-200 rounded-xl px-3 py-2"
                    placeholder="Wpisz wlasny tag"
                    value={customTagInputByIndex[i] ?? ""}
                    onChange={e =>
                      setCustomTagInputByIndex(prev => ({ ...prev, [i]: e.target.value }))
                    }
                  />
                  <button
                    type="button"
                    onClick={() => addCustomTag(i)}
                    className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl"
                  >
                    Dodaj
                  </button>
                </div>
              )}

              <div className="mt-4">
                <label className="flex items-center gap-2 text-sm text-slate-800">
                  <input
                    type="checkbox"
                    checked={f.wants_invoice}
                    onChange={e =>
                      update(i, {
                        wants_invoice: e.target.checked,
                        invoice_nip: e.target.checked ? f.invoice_nip : "",
                      })
                    }
                  />
                  Chce fakture
                </label>
                {f.wants_invoice && (
                  <input
                    className="mt-2 w-full border border-slate-200 rounded-xl px-3 py-2"
                    placeholder="Podaj NIP (10 cyfr) *"
                    value={f.invoice_nip}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    onChange={e => update(i, { invoice_nip: e.target.value.replace(/\D+/g, "") })}
                  />
                )}
              </div>
            </div>
          </section>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          disabled={sending}
          onClick={submitAll}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-6 py-3 rounded-xl font-medium"
        >
          {sending ? "Wysylanie..." : "Wyslij pakiet"}
        </button>
      </div>
    </>
  );
}

export default function ForCompaniesFormPage() {
  const sp = useSearchParams();
  const pkgCode = sp.get("pakiet") ?? "p1";
  const size = useMemo(() => packageSize(pkgCode), [pkgCode]);

  return (
    <>
      <Navbar />
      <main className="bg-slate-50">
        <div className="max-w-[1100px] mx-auto px-6 py-12">
          <FormContent key={pkgCode} pkgCode={pkgCode} size={size} />
        </div>
      </main>
    </>
  );
}
