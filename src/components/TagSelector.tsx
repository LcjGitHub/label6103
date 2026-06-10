import { useEffect, useRef, useState } from 'react'
import { useEnvelope } from '../context/EnvelopeContext'
import { useLanguage } from '../context/LanguageContext'

interface TagSelectorProps {
  addressId: string
  selectedTags: string[]
  onChange: (tags: string[]) => void
  compact?: boolean
}

export default function TagSelector({
  addressId,
  selectedTags,
  onChange,
  compact = false,
}: TagSelectorProps) {
  const { tagList } = useEnvelope()
  const { t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function toggleTag(tagId: string) {
    if (selectedTags.includes(tagId)) {
      onChange(selectedTags.filter((id) => id !== tagId))
    } else {
      onChange([...selectedTags, tagId])
    }
  }

  const selectedTagObjects = tagList.filter((tag) => selectedTags.includes(tag.id))

  if (compact) {
    return (
      <div className="relative inline-block" ref={containerRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-stone-50 px-2 py-1 text-xs text-stone-600 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
          {selectedTags.length > 0 ? `${selectedTags.length}` : t('tags.addTag')}
        </button>
        {isOpen && tagList.length > 0 && (
          <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-xl border border-stone-200 bg-white p-2 shadow-lg">
            <div className="max-h-48 space-y-1 overflow-y-auto">
              {tagList.map((tag) => {
                const isSelected = selectedTags.includes(tag.id)
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm transition ${
                      isSelected ? 'bg-stone-100' : 'hover:bg-stone-50'
                    }`}
                  >
                    <span
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="truncate flex-1 text-stone-700">{tag.name}</span>
                    {isSelected && (
                      <svg className="h-4 w-4 text-sky-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}
        {isOpen && tagList.length === 0 && (
          <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-xl border border-stone-200 bg-white p-3 text-center shadow-lg">
            <p className="text-xs text-stone-500">{t('tags.noTagsHint')}</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {selectedTagObjects.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedTagObjects.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggleTag(tag.id)}
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition hover:opacity-80"
              style={{
                backgroundColor: `${tag.color}20`,
                color: tag.color,
                border: `1px solid ${tag.color}40`,
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: tag.color }}
              />
              {tag.name}
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ))}
        </div>
      )}
      <div className="relative inline-block" ref={containerRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-stone-300 bg-white px-3 py-1.5 text-xs text-stone-500 transition hover:border-violet-400 hover:bg-violet-50 hover:text-violet-600"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t('tags.manageTags')}
        </button>
        {isOpen && (
          <div className="absolute left-0 top-full z-20 mt-1 w-56 rounded-xl border border-stone-200 bg-white p-2 shadow-lg">
            {tagList.length === 0 ? (
              <p className="px-2 py-2 text-xs text-stone-500">{t('tags.noTagsHint')}</p>
            ) : (
              <div className="max-h-56 space-y-0.5 overflow-y-auto">
                {tagList.map((tag) => {
                  const isSelected = selectedTags.includes(tag.id)
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition ${
                        isSelected ? 'bg-stone-100' : 'hover:bg-stone-50'
                      }`}
                    >
                      <span
                        className="h-3.5 w-3.5 rounded-full shrink-0"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span className="truncate flex-1 text-stone-700">{tag.name}</span>
                      {isSelected && (
                        <svg className="h-4 w-4 text-sky-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
      <input type="hidden" name={`tags-${addressId}`} value={selectedTags.join(',')} />
    </div>
  )
}
