import { useLanguage } from '../context/LanguageContext';
import type { Language } from '../i18n/translations';

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();

  const languages: { code: Language; label: string }[] = [
    { code: 'zh', label: t('nav.zh') },
    { code: 'en', label: t('nav.en') },
  ];

  return (
    <div className="inline-flex items-center rounded-full border border-stone-200 bg-white p-0.5 shadow-sm">
      {languages.map((lang) => (
        <button
          key={lang.code}
          type="button"
          onClick={() => setLanguage(lang.code)}
          aria-label={`${t('nav.switchLang')} - ${lang.label}`}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
            language === lang.code
              ? 'bg-stone-900 text-white shadow-sm'
              : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
