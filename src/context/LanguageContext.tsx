import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { translations, type Language, type Translations } from '../i18n/translations'

const LANGUAGE_STORAGE_KEY = 'app-language'

function getNestedValue(obj: any, path: string): string | undefined {
  const keys = path.split('.')
  let result = obj
  for (const key of keys) {
    if (result === undefined || result === null) return undefined
    result = result[key]
  }
  return typeof result === 'string' ? result : undefined
}

function interpolate(template: string, variables?: Record<string, string | number>): string {
  if (!variables) return template
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    const value = variables[key]
    return value !== undefined ? String(value) : `{${key}}`
  })
}

interface LanguageContextValue {
  language: Language
  setLanguage: (lang: Language) => void
  toggleLanguage: () => void
  t: (key: string, variables?: Record<string, string | number>) => string
  translations: Translations
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

function loadLanguage(): Language {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY)
    if (stored === 'zh' || stored === 'en') return stored
  } catch {
    /* ignore */
  }
  if (typeof navigator !== 'undefined') {
    const lang = navigator.language.toLowerCase()
    if (lang.startsWith('zh')) return 'zh'
  }
  return 'en'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(loadLanguage)

  useEffect(() => {
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
    } catch {
      /* ignore */
    }
  }, [language])

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang)
  }, [])

  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => (prev === 'zh' ? 'en' : 'zh'))
  }, [])

  const t = useCallback(
    (key: string, variables?: Record<string, string | number>): string => {
      const currentTranslations = translations[language]
      const value = getNestedValue(currentTranslations, key)
      if (value === undefined) {
        console.warn(`[i18n] Missing translation key: ${key}`)
        return key
      }
      return interpolate(value, variables)
    },
    [language],
  )

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      t,
      translations: translations[language],
    }),
    [language, setLanguage, toggleLanguage, t],
  )

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
