import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  clearAddressHistory,
  formatAddressDisplay,
  formatLastUsed,
  loadAddressHistory,
  markHistoryUsed,
  removeAddressFromHistory,
  subscribeHistoryChange,
} from '../utils/addressHistory';
import type { Address, AddressHistoryItem, AddressSide } from '../types/envelope';

interface AddressHistoryDropdownProps {
  side: AddressSide;
  accent: 'amber' | 'sky';
  onSelect: (address: Address) => void;
}

const accentBorderMap = {
  amber: 'border-amber-200 hover:border-amber-400 focus:ring-amber-400/30',
  sky: 'border-sky-200 hover:border-sky-400 focus:ring-sky-400/30',
};

const accentTextMap = {
  amber: 'text-amber-700',
  sky: 'text-sky-700',
};

const accentBgMap = {
  amber: 'bg-amber-50',
  sky: 'bg-sky-50',
};

const accentHoverBgMap = {
  amber: 'hover:bg-amber-50',
  sky: 'hover:bg-sky-50',
};

export default function AddressHistoryDropdown({
  side,
  accent,
  onSelect,
}: AddressHistoryDropdownProps) {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState<AddressHistoryItem[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHistory(loadAddressHistory(side));
  }, [side]);

  useEffect(() => {
    const unsubscribe = subscribeHistoryChange((changedSide) => {
      if (changedSide === side) {
        setHistory(loadAddressHistory(side));
      }
    });
    return unsubscribe;
  }, [side]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSelect(item: AddressHistoryItem) {
    const updated = markHistoryUsed(side, item.id);
    setHistory(updated);
    onSelect(item.address);
    setIsOpen(false);
  }

  function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    const updated = removeAddressFromHistory(side, id);
    setHistory(updated);
  }

  function handleClearAll(e: React.MouseEvent) {
    e.stopPropagation();
    if (window.confirm(t('common.historyClearConfirm'))) {
      const updated = clearAddressHistory(side);
      setHistory(updated);
    }
  }

  const timeParams = {
    justNow: t('time.justNow'),
    minutesAgo: (count: number) => t('time.minutesAgo').replace('{count}', String(count)),
    hoursAgo: (count: number) =>
      t('time.hoursAgo')
        .replace('{count}', String(count))
        .replace('{plural}', language === 'en' && count > 1 ? 's' : ''),
    daysAgo: (count: number) =>
      t('time.daysAgo')
        .replace('{count}', String(count))
        .replace('{plural}', language === 'en' && count > 1 ? 's' : ''),
    dateFormat: (y: string, m: string, d: string) =>
      t('time.dateFormat').replace('{year}', y).replace('{month}', m).replace('{day}', d),
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-2 rounded-lg border bg-white px-3 py-1.5 text-sm font-medium transition focus:outline-none focus:ring-2 ${accentBorderMap[accent]} ${accentTextMap[accent]}`}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        {t('common.history')}
        {history.length > 0 && (
          <span className="rounded-full bg-stone-100 px-1.5 py-0.5 text-xs text-stone-600">
            {history.length}
          </span>
        )}
        <svg
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-stone-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3">
            <h3 className="text-sm font-semibold text-stone-800">{t('common.historyTitle')}</h3>
            {history.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs text-stone-500 transition hover:text-red-600"
              >
                {t('common.historyClearAll')}
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {history.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-stone-400">
                {t('common.historyEmpty')}
              </div>
            ) : (
              <ul className="py-1">
                {history.map((item) => (
                  <li
                    key={item.id}
                    className={`flex cursor-pointer items-start gap-3 px-4 py-3 transition ${accentHoverBgMap[accent]}`}
                    onClick={() => handleSelect(item)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-sm font-medium text-stone-800">
                        {item.address.name || t('common.noAddressInfo')}
                      </div>
                      <div className="mt-0.5 truncate text-xs text-stone-500">
                        {formatAddressDisplay(item.address, t('common.noAddressInfo'))}
                      </div>
                      {item.address.phone && (
                        <div className="mt-0.5 text-xs text-stone-400">{item.address.phone}</div>
                      )}
                      <div className="mt-1 text-xs text-stone-400">
                        {t('common.historyLastUsed')}: {formatLastUsed(item.lastUsedAt, timeParams)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className={`rounded px-2 py-1 text-xs font-medium ${accentTextMap[accent]} ${accentBgMap[accent]}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(item);
                        }}
                      >
                        {t('common.historyUse')}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDelete(item.id, e)}
                        className="rounded p-1 text-stone-400 transition hover:bg-red-50 hover:text-red-600"
                        title={t('common.historyDelete')}
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
