"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const cityLinks = [
    { href: "/praca-dla-studenta-gdansk", label: "Gdańsk" },
    { href: "/praca-dla-studenta-gdynia", label: "Gdynia" },
    { href: "/praca-dla-studenta-sopot", label: "Sopot" },
  ] as const;

  const links = [
    { href: "/dla-studentow", label: "Dla studentów" },
    { href: "/dla-firm", label: "Dla firm" },
    { href: "/pomoc", label: "Pomoc" },
    { href: "/privacy-policy", label: "Polityka prywatnosci" },
  ] as const;

  const isActive = (href: string) => pathname === href;
  const isCityActive = cityLinks.some(link => isActive(link.href));

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg text-slate-900">
          Pierwsza Praca <span className="text-emerald-600">Trójmiasto</span>
        </Link>

        <nav className="hidden md:flex gap-8 text-slate-700">
          <div className="relative group">
            <Link
              href="/praca-dla-studenta-gdansk"
              className={`inline-flex items-center gap-2 ${isCityActive ? "text-slate-900 font-semibold" : ""}`}
            >
              Praca dla studenta
              <span className="text-xs">▾</span>
            </Link>

            <div className="absolute left-0 top-full z-20 w-56 pt-3 opacity-0 pointer-events-none translate-y-2 transition-all group-hover:opacity-100 group-hover:pointer-events-auto group-hover:translate-y-0">
              <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                {cityLinks.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`block rounded-xl px-4 py-3 hover:bg-slate-50 ${
                      isActive(link.href) ? "font-semibold text-slate-900" : "text-slate-700"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={isActive(link.href) ? "text-slate-900 font-semibold" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className="md:hidden h-10 px-3 rounded-xl border border-slate-300 text-slate-700 text-sm"
          onClick={() => setOpen(prev => !prev)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Zamknij menu" : "Otworz menu"}
        >
          {open ? "Zamknij" : "Menu"}
        </button>
      </div>

      {open && (
        <nav id="mobile-nav" className="md:hidden border-t border-slate-200 bg-white">
          <div className="max-w-[1200px] mx-auto px-4 py-3 flex flex-col">
            <div className="py-3 border-b border-slate-100">
              <Link
                href="/praca-dla-studenta-gdansk"
                onClick={() => setOpen(false)}
                className={`block ${isCityActive ? "text-slate-900 font-semibold" : "text-slate-700"}`}
              >
                Praca dla studenta
              </Link>
              <div className="mt-2 flex flex-col gap-2 pl-4">
                {cityLinks.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={isActive(link.href) ? "text-slate-900 font-semibold" : "text-slate-700"}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`py-3 border-b last:border-b-0 border-slate-100 ${
                  isActive(link.href) ? "text-slate-900 font-semibold" : "text-slate-700"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
