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
  const [lang, setLangState] = useState<Lang>(() =>
    typeof window !== "undefined" ? normalizeLang(window.localStorage.getItem(STORAGE_KEY)) : "en"
  );

  const setLang = (next: Lang) => {
    setLangState(next);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, lang);
    }
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
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
