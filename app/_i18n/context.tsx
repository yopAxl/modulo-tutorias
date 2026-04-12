"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

import es from "./locales/es.json";
import en from "./locales/en.json";

// ─── Types ───────────────────────────────────────────────────────────────────

export type Locale = "es" | "en";

type Dictionary = typeof es;

interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

// ─── Dictionaries ────────────────────────────────────────────────────────────

const DICTIONARIES: Record<Locale, Dictionary> = { es, en };

const STORAGE_KEY = "tutortrack-locale";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Resolve a dot-notated key against a nested object, e.g. "nav.alumno.dashboard" */
function resolve(obj: Record<string, any>, path: string): string | undefined {
  const result = path.split(".").reduce((acc, part) => acc?.[part], obj as any);
  return typeof result === "string" ? result : undefined;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("es");
  const [mounted, setMounted] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (stored && (stored === "es" || stored === "en")) {
      setLocaleState(stored);
    }
    setMounted(true);
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem(STORAGE_KEY, l);
    // Update the html lang attribute
    document.documentElement.lang = l;
  }, []);

  /**
   * Translate a key. Supports simple variable interpolation:
   *   t("greeting", { name: "Juan" })  →  "Hola, {name}" becomes "Hola, Juan"
   */
  const t = useCallback(
    (key: string, vars?: Record<string, string | number>): string => {
      let value = resolve(DICTIONARIES[locale], key);
      if (value === undefined) {
        // Fallback to Spanish, then to raw key
        value = resolve(DICTIONARIES["es"], key) ?? key;
      }
      if (vars) {
        Object.entries(vars).forEach(([k, v]) => {
          value = value!.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
        });
      }
      return value;
    },
    [locale]
  );

  // Prevent hydration mismatch — render with default "es" until mounted
  if (!mounted) {
    const tDefault = (key: string, vars?: Record<string, string | number>) => {
      let value = resolve(DICTIONARIES["es"], key) ?? key;
      if (vars) {
        Object.entries(vars).forEach(([k, v]) => {
          value = value!.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
        });
      }
      return value;
    };
    return (
      <I18nContext.Provider value={{ locale: "es", setLocale, t: tDefault }}>
        {children}
      </I18nContext.Provider>
    );
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

/** Hook to access i18n context */
export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}
