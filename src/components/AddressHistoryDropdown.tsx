import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import {
  clearAddressHistory,
  formatLastUsed,
  loadAddressHistory,
  removeAddressFromHistory,
} from '../utils/addressHistory'
import type { Address, AddressHistoryItem } from '../types/envelope'

interface AddressHistoryDropdownProps {
  accent: 'amber' | 'sky'
  onSelect: (address: Address) => void
}

const accentBorderMap = {
  amber: 'border-amber-200 hover:border-amber-400 focus:ring-amber-400/30',
  sky: 'border-sky-200 hover:border-sky-400 focus:ring-sky-400/30',
}

const accentTextMap = {
  amber: 'text-amber-700',
  sky: 'text-sky-700',
}

const accentHoverBgMap = {
  amber: 'hover:bg-amber-50',
  sky: 'hover:bg-sky-50',
}

export default function AddressHistoryDropdown({
  accent,
  onSelect,
}: AddressHistoryDropdownProps) {
  const { t, language } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [history, setHistory] = useState<AddressHistoryItem[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setHistory(loadAddressHistory())
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSelect(item: AddressHistoryItem) {
    onSelect(item.address)
    setIsOpen(false)
  }

  function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    const updated = removeAddressFromHistory(id)
    setHistory(updated)
  }

  function handleClearAll(e: React.MouseEvent) {
    e.stopPropagation()
    if (window.confirm(t('common.historyClearConfirm'))) {
      const updated = clearAddressHistory()
      setHistory(updated)
    }
  }

  function formatAddressDisplay(addr: Address): string {
    const parts = [addr.name, addr.province, addr.city, addr.district, addr.street].filter(Boolean)
    return parts.join(' · ') || t('common.noAddressInfo')
  }

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
            <h3 className="text-sm font-semibold text-stone-800">
              {t('common.historyTitle')}
            </h3>
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
                    className={`group flex cursor-pointer items-start gap-3 px-4 py-3 transition ${accentHoverBgMap[accent]}`}
                    onClick={() => handleSelect(item)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-sm font-medium text-stone-800">
                        {item.address.name || t('common.noAddressInfo')}
                      </div>
                      <div className="mt-0.5 truncate text-xs text-stone-500">
                        {formatAddressDisplay(item.address)}
                      </div>
                      {item.address.phone && (
                        <div className="mt-0.5 text-xs text-stone-400">
                          {item.address.phone}
                        </div>
                      )}
                      <div className="mt-1 text-xs text-stone-400">
                        {t('common.historyLastUsed')}: {formatLastUsed(item.lastUsedAt, language as 'zh' | 'en')}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className={`rounded px-2 py-1 text-xs font-medium opacity-0 transition group-hover:opacity-100 ${accentTextMap[accent]} ${accentHoverBgMap[accent]}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSelect(item)
                        }}
                      >
                        {t('common.historyUse')}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDelete(item.id, e)}
                        className="rounded p-1 text-stone-400 opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                        title={t('common.historyDelete')}
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
  )
}
