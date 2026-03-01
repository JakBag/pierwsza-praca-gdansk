"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    { href: "/oferty", label: "Oferty" },
    { href: "/jak-to-dziala", label: "Jak to dziala" },
    { href: "/dla-firm", label: "Dla firm" },
    { href: "/pomoc", label: "Pomoc" },
    { href: "/privacy-policy", label: "Polityka prywatnosci" },
  ] as const;

  const isActive = (href: string) => pathname === href;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg text-slate-900">
          Pierwsza Praca <span className="text-emerald-600">Trojmiasto</span>
        </Link>

        <nav className="hidden md:flex gap-8 text-slate-700">
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
