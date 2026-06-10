import { useMemo, useState } from 'react'
import { useEnvelope } from '../context/EnvelopeContext'
import { useLanguage } from '../context/LanguageContext'
import type { SavedAddress } from '../types/envelope'
import TagSelector from './TagSelector'

interface AddressListProps {
  compact?: boolean
  showClearButton?: boolean
  showSearch?: boolean
  showTagFilter?: boolean
}

function formatAddressSummary(addr: SavedAddress, noInfoText: string): string {
  const parts = [addr.province, addr.city, addr.district, addr.street].filter(Boolean)
  return parts.join(' ') || noInfoText
}

export default function AddressList({
  compact = false,
  showClearButton = true,
  showSearch = true,
  showTagFilter = true,
}: AddressListProps) {
  const { addressList, removeAddress, clearAddressList, setRecipientFromList, updateAddressTags, tagList } = useEnvelope()
  const { t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])

  function toggleTagFilter(tagId: string) {
    if (selectedTagIds.includes(tagId)) {
      setSelectedTagIds(selectedTagIds.filter((id) => id !== tagId))
    } else {
      setSelectedTagIds([...selectedTagIds, tagId])
    }
  }

  function clearTagFilter() {
    setSelectedTagIds([])
  }

  const filteredList = useMemo(() => {
    let list = addressList

    if (selectedTagIds.length > 0) {
      list = list.filter((addr) =>
        selectedTagIds.some((tagId) => addr.tags.includes(tagId)),
      )
    }

    if (!searchQuery.trim()) return list
    const query = searchQuery.toLowerCase()
    return list.filter(
      (addr) =>
        addr.name.toLowerCase().includes(query) ||
        addr.phone.toLowerCase().includes(query) ||
        addr.province.toLowerCase().includes(query) ||
        addr.city.toLowerCase().includes(query) ||
        addr.district.toLowerCase().includes(query) ||
        addr.street.toLowerCase().includes(query) ||
        addr.tags.some((tagId) => {
          const tag = tagList.find((t) => t.id === tagId)
          return tag && tag.name.toLowerCase().includes(query)
        }),
    )
  }, [addressList, searchQuery, selectedTagIds, tagList])

  const handleUseAddress = (id: string) => {
    setRecipientFromList(id)
    setSelectedId(id)
    setTimeout(() => setSelectedId(null), 1500)
  }

  const handleTagsChange = (id: string, tags: string[]) => {
    updateAddressTags(id, tags)
  }

  const noAddressInfoText = t('common.noAddressInfo')

  function renderAddressTags(addr: SavedAddress) {
    const tags = addr.tags
      .map((tagId) => tagList.find((t) => t.id === tagId))
      .filter(Boolean)
    if (tags.length === 0) return null
    return (
      <div className="flex flex-wrap gap-1">
        {tags.slice(0, 3).map((tag) => (
          <span
            key={tag!.id}
            className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium"
            style={{
              backgroundColor: `${tag!.color}20`,
              color: tag!.color,
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: tag!.color }}
            />
            {tag!.name}
          </span>
        ))}
        {tags.length > 3 && (
          <span className="inline-flex items-center rounded-full bg-stone-100 px-1.5 py-0.5 text-[10px] font-medium text-stone-500">
            +{tags.length - 3}
          </span>
        )}
      </div>
    )
  }

  if (compact) {
    return (
      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-stone-800">
            <span className="h-2 w-2 rounded-full bg-sky-500" />
            {t('csvUploader.title')}
            <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600">
              {addressList.length}
            </span>
          </h2>
          {showSearch && addressList.length > 0 && (
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('common.searchPlaceholderCompact')}
                className="w-48 rounded-lg border border-stone-300 bg-stone-50 py-1.5 pl-9 pr-3 text-sm text-stone-800 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-400/30"
              />
            </div>
          )}
        </div>

        {showTagFilter && tagList.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-stone-500">{t('tags.filterBy')}:</span>
            {tagList.map((tag) => {
              const isActive = selectedTagIds.includes(tag.id)
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTagFilter(tag.id)}
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium transition ${
                    isActive ? 'ring-2 ring-offset-1' : 'opacity-60 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: `${tag.color}20`,
                    color: tag.color,
                    border: `1px solid ${tag.color}40`,
                    ...(isActive ? { boxShadow: `0 0 0 2px ${tag.color}40` } : {}),
                  }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  {tag.name}
                </button>
              )
            })}
            {selectedTagIds.length > 0 && (
              <button
                type="button"
                onClick={clearTagFilter}
                className="text-xs font-medium text-stone-500 underline-offset-2 hover:text-stone-700 hover:underline"
              >
                {t('tags.clearFilter')}
              </button>
            )}
          </div>
        )}

        {filteredList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm text-stone-500">
              {addressList.length === 0
                ? t('csvUploader.uploadHint')
                : t('common.noMatch')}
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {filteredList.map((addr) => (
              <div
                key={addr.id}
                className={`group flex items-center justify-between gap-4 rounded-lg border px-4 py-3 transition-colors ${
                  selectedId === addr.id
                    ? 'border-sky-300 bg-sky-50'
                    : 'border-stone-200 hover:border-sky-300 hover:bg-stone-50'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium text-stone-800">{addr.name || '-'}</span>
                    {addr.phone && (
                      <span className="shrink-0 text-sm text-stone-500">{addr.phone}</span>
                    )}
                    <div className="ml-auto shrink-0">
                      {renderAddressTags(addr)}
                    </div>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <p
                      className="truncate text-sm text-stone-500 flex-1"
                      title={formatAddressSummary(addr, noAddressInfoText)}
                    >
                      {formatAddressSummary(addr, noAddressInfoText)}
                    </p>
                    <TagSelector
                      addressId={addr.id}
                      selectedTags={addr.tags}
                      onChange={(tags) => handleTagsChange(addr.id, tags)}
                      compact
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {selectedId === addr.id && (
                    <span className="flex items-center gap-1 text-xs font-medium text-sky-600">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {t('common.filled')}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleUseAddress(addr.id)}
                    className="rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-sky-700"
                  >
                    {t('common.use')}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeAddress(addr.id)}
                    className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-500 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600"
                  >
                    {t('common.delete')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-stone-800">
            <span className="h-2 w-2 rounded-full bg-sky-500" />
            {t('home.addressList')}
          </h2>
          <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-600">
            {t('common.totalItems', { count: addressList.length })}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {showSearch && (
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('common.searchPlaceholder')}
                className="w-64 rounded-lg border border-stone-300 bg-stone-50 py-2 pl-9 pr-3 text-sm text-stone-800 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-400/30"
              />
            </div>
          )}
          {showClearButton && addressList.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (confirm(t('common.confirmClear'))) {
                  clearAddressList()
                }
              }}
              className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-100"
            >
              {t('common.clearList')}
            </button>
          )}
        </div>
      </div>

      {showTagFilter && tagList.length > 0 && (
        <div className="mb-5 flex flex-wrap items-center gap-2 rounded-xl border border-stone-100 bg-stone-50/50 p-3">
          <svg className="h-4 w-4 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
          <span className="text-xs font-medium text-stone-600">{t('tags.filterBy')}:</span>
          {tagList.map((tag) => {
            const isActive = selectedTagIds.includes(tag.id)
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTagFilter(tag.id)}
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition ${
                  isActive
                    ? 'scale-105 shadow-sm'
                    : 'opacity-70 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: isActive ? tag.color : `${tag.color}15`,
                  color: isActive ? '#fff' : tag.color,
                  border: `1px solid ${tag.color}40`,
                }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: isActive ? '#fff' : tag.color }}
                />
                {tag.name}
              </button>
            )
          })}
          {selectedTagIds.length > 0 && (
            <button
              type="button"
              onClick={clearTagFilter}
              className="ml-1 inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-stone-500 shadow-sm ring-1 ring-stone-200 transition hover:text-stone-700"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              {t('tags.clearFilter')}
            </button>
          )}
        </div>
      )}

      {filteredList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <svg className="mb-4 h-16 w-16 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            />
          </svg>
          <p className="text-base font-medium text-stone-600">
            {addressList.length === 0 ? t('common.noData') : t('common.noMatch')}
          </p>
          <p className="mt-1 text-sm text-stone-400">
            {addressList.length === 0
              ? t('csvUploader.uploadHint')
              : t('common.tryModifyKeyword')}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-stone-200">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stone-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-stone-700">{t('common.name')}</th>
                  <th className="px-4 py-3 text-left font-semibold text-stone-700">{t('common.phone')}</th>
                  <th className="px-4 py-3 text-left font-semibold text-stone-700">{t('common.street')}</th>
                  <th className="px-4 py-3 text-left font-semibold text-stone-700">{t('tags.tags')}</th>
                  <th className="px-4 py-3 text-left font-semibold text-stone-700">{t('common.postcode')}</th>
                  <th className="px-4 py-3 text-right font-semibold text-stone-700">{t('common.operation')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {filteredList.map((addr) => (
                  <tr
                    key={addr.id}
                    className={`transition-colors ${
                      selectedId === addr.id ? 'bg-sky-50' : 'hover:bg-stone-50'
                    }`}
                  >
                    <td className="px-4 py-3 font-medium text-stone-800">{addr.name || '-'}</td>
                    <td className="px-4 py-3 text-stone-600">{addr.phone || '-'}</td>
                    <td
                      className="px-4 py-3 max-w-xs truncate text-stone-600"
                      title={formatAddressSummary(addr, noAddressInfoText)}
                    >
                      {formatAddressSummary(addr, noAddressInfoText)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="max-w-xs">
                        <TagSelector
                          addressId={addr.id}
                          selectedTags={addr.tags}
                          onChange={(tags) => handleTagsChange(addr.id, tags)}
                          compact={false}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-stone-600">{addr.postcode || '-'}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {selectedId === addr.id && (
                          <span className="flex items-center gap-1 text-xs font-medium text-sky-600">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {t('common.filled')}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleUseAddress(addr.id)}
                          className="rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-sky-700"
                        >
                          {t('common.useThisAddress')}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeAddress(addr.id)}
                          className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-600 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600"
                        >
                          {t('common.delete')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  )
}
