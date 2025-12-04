"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { copy, type CopyContent, type Lang, languages } from "@/lib/copy";

type LanguageContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: CopyContent;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const STORAGE_KEY = "jbl_lang_pref";

function normalizeLang(value: string | null): Lang {
  return (languages.find((code) => code === value) ?? "en") as Lang;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const getInitialLang = () => {
    if (typeof window === "undefined") return "en";
    const cookieMatch = document.cookie.match(new RegExp(`${STORAGE_KEY}=([^;]+)`));
    const stored = window.localStorage.getItem(STORAGE_KEY) || (cookieMatch ? cookieMatch[1] : null);
    if (stored) return normalizeLang(stored);
    const browser = navigator.language?.slice(0, 2) ?? "en";
    return normalizeLang(browser);
  };

  const [lang, setLangState] = useState<Lang>(getInitialLang);

  const setLang = (next: Lang) => {
    setLangState(next);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, lang);
    }
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
      const oneYear = 60 * 60 * 24 * 365;
      document.cookie = `${STORAGE_KEY}=${lang}; path=/; max-age=${oneYear}; SameSite=Lax`;
    }
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t: copy[lang] }), [lang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
