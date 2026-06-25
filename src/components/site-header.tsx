"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House,
  List,
  Moon,
  Robot,
  SignIn,
  Sun,
  Target,
  Translate,
  Wallet,
  X,
} from "@phosphor-icons/react";
import { useEffect, useState } from "react";

export type Locale = "en" | "zh";
type Theme = "light" | "dark";

const localeKey = "taskwanted-locale";
const themeKey = "taskwanted-theme";

function storedLocale(): Locale {
  if (typeof window === "undefined") {
    return "en";
  }

  const saved = window.localStorage.getItem(localeKey);
  return saved === "zh" || saved === "en" ? saved : "en";
}

function storedTheme(): Theme {
  if (typeof window === "undefined") {
    return "light";
  }

  const saved = window.localStorage.getItem(themeKey);
  if (saved === "dark" || saved === "light") {
    return saved;
  }

  const prefersDark =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  return prefersDark ? "dark" : "light";
}

const navItems = [
  { href: "/", label: "Home", labelZh: "首页", icon: House },
  { href: "/bounties", label: "Bounties", labelZh: "悬赏", icon: Target },
  { href: "/agent", label: "Agent", labelZh: "Agent", icon: Robot },
];

export function useTaskWantedLocale(): Locale {
  const [locale, setLocale] = useState<Locale>(() => storedLocale());

  useEffect(() => {
    const onChange = (event: Event) => {
      const next = (event as CustomEvent<Locale>).detail;
      if (next === "zh" || next === "en") {
        setLocale(next);
      }
    };

    window.addEventListener("taskwanted:locale", onChange);
    return () => window.removeEventListener("taskwanted:locale", onChange);
  }, []);

  return locale;
}

export function SiteHeader() {
  const pathname = usePathname() ?? "/";
  const [locale, setLocale] = useState<Locale>(() => storedLocale());
  const [theme, setTheme] = useState<Theme>(() => storedTheme());
  const [wallet, setWallet] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  function toggleLocale() {
    const nextLocale = locale === "en" ? "zh" : "en";
    setLocale(nextLocale);
    window.localStorage.setItem(localeKey, nextLocale);
    window.dispatchEvent(
      new CustomEvent<Locale>("taskwanted:locale", { detail: nextLocale }),
    );
  }

  function toggleTheme() {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem(themeKey, nextTheme);
  }

  const walletLabel = wallet ? "0xA17...9C4E" : locale === "zh" ? "连接钱包" : "Wallet";
  const loginLabel = signedIn
    ? locale === "zh"
      ? "已登录"
      : "Signed in"
    : locale === "zh"
      ? "登录"
      : "Sign in";

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-background/92 backdrop-blur-xl">
      <div className="mx-auto flex h-[68px] w-full max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          aria-label="TaskWanted home"
          className="flex items-center gap-3 font-mono text-sm font-semibold"
          href="/"
        >
          <span className="grid size-8 place-items-center rounded-[6px] bg-foreground text-background">
            TW
          </span>
          <span>TaskWanted</span>
        </Link>

        <nav className="hidden items-center gap-1 rounded-[8px] border border-line bg-surface p-1 md:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                className={`inline-flex h-10 items-center gap-2 rounded-[6px] px-3 text-sm transition ${
                  active
                    ? "bg-foreground text-background"
                    : "text-muted-strong hover:bg-surface-muted hover:text-foreground"
                }`}
                href={item.href}
                key={item.href}
              >
                <Icon size={16} weight={active ? "fill" : "regular"} />
                {locale === "zh" ? item.labelZh : item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <button
            aria-label="Connect wallet"
            className="nav-action"
            onClick={() => setWallet((value) => !value)}
            type="button"
          >
            <Wallet size={16} />
            <span>{walletLabel}</span>
          </button>
          <button
            aria-label="Sign in"
            className="nav-action"
            onClick={() => setSignedIn((value) => !value)}
            type="button"
          >
            <SignIn size={16} />
            <span>{loginLabel}</span>
          </button>
          <button
            aria-label="Switch language"
            className="nav-icon"
            onClick={toggleLocale}
            type="button"
          >
            <Translate size={18} />
            <span className="font-mono text-[11px]">{locale.toUpperCase()}</span>
          </button>
          <button
            aria-label="Switch theme"
            className="nav-icon"
            onClick={toggleTheme}
            type="button"
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>

        <button
          aria-expanded={menuOpen}
          aria-label="Open menu"
          className="nav-icon md:hidden"
          onClick={() => setMenuOpen((value) => !value)}
          type="button"
        >
          {menuOpen ? <X size={18} /> : <List size={18} />}
        </button>
      </div>

      {menuOpen ? (
        <div className="border-t border-line bg-background px-4 py-4 md:hidden">
          <div className="grid gap-2">
            {navItems.map((item) => (
              <Link
                className="rounded-[8px] border border-line bg-surface px-4 py-3 text-sm font-medium"
                href={item.href}
                key={item.href}
                onClick={() => setMenuOpen(false)}
              >
                {locale === "zh" ? item.labelZh : item.label}
              </Link>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              aria-label="Connect wallet"
              className="nav-action justify-center"
              onClick={() => setWallet((value) => !value)}
              type="button"
            >
              <Wallet size={16} />
              <span>{walletLabel}</span>
            </button>
            <button
              aria-label="Sign in"
              className="nav-action justify-center"
              onClick={() => setSignedIn((value) => !value)}
              type="button"
            >
              <SignIn size={16} />
              <span>{loginLabel}</span>
            </button>
            <button
              aria-label="Switch language"
              className="nav-action justify-center"
              onClick={toggleLocale}
              type="button"
            >
              <Translate size={16} />
              <span>{locale.toUpperCase()}</span>
            </button>
            <button
              aria-label="Switch theme"
              className="nav-action justify-center"
              onClick={toggleTheme}
              type="button"
            >
              {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
              <span>{theme === "light" ? "Dark" : "Light"}</span>
            </button>
          </div>
        </div>
      ) : null}
    </header>
  );
}
