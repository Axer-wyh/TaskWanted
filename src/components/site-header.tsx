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
  UserCircle,
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
  { href: "/bounties", label: "Bounties", labelZh: "悬赏公告板", icon: Target },
  { href: "/agent", label: "Agent", labelZh: "Agent", icon: Robot },
  { href: "/#ecosystem", label: "Ecosystem", labelZh: "生态", icon: Target },
  { href: "/#about", label: "About", labelZh: "关于我们", icon: House },
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
    <header className="site-header">
      <div className="mx-auto flex h-[68px] w-full max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          aria-label="TaskWanted home"
          className="site-brand"
          href="/"
        >
          <span className="site-brand-mark">
            TW
          </span>
          <span>TaskWanted</span>
        </Link>

        <nav className="site-nav hidden md:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.href === "/" ? pathname === "/" : pathname === item.href;
            return (
              <Link
                className={`site-nav-link ${active ? "active" : ""}`}
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
            aria-label="Switch language"
            className="nav-icon nav-icon-ghost"
            onClick={toggleLocale}
            type="button"
          >
            <Translate size={18} />
            <span className="font-mono text-[11px]">{locale.toUpperCase()}</span>
          </button>
          <button
            aria-label="Switch theme"
            className="nav-icon nav-icon-ghost"
            onClick={toggleTheme}
            type="button"
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>
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
          {signedIn ? (
            <Link aria-label="Open profile" className="nav-avatar" href="/profile">
              <UserCircle size={24} weight="duotone" />
              <span>TW</span>
            </Link>
          ) : null}
        </div>

        <button
          aria-expanded={menuOpen}
          aria-label="Open menu"
          className="nav-icon md:!hidden"
          onClick={() => setMenuOpen((value) => !value)}
          type="button"
        >
          {menuOpen ? <X size={18} /> : <List size={18} />}
        </button>
      </div>

      {menuOpen ? (
        <div className="site-mobile-menu md:hidden">
          <div className="grid gap-2">
            {navItems.map((item) => (
              <Link
                className="site-mobile-link"
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
            {signedIn ? (
              <Link
                aria-label="Open profile"
                className="nav-action justify-center"
                href="/profile"
                onClick={() => setMenuOpen(false)}
              >
                <UserCircle size={16} />
                <span>{locale === "zh" ? "个人中心" : "Profile"}</span>
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
    </header>
  );
}
