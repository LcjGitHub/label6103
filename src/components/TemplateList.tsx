import { useState } from 'react'
import { useEnvelope } from '../context/EnvelopeContext'
import { useLanguage } from '../context/LanguageContext'
import type { EnvelopeTemplate } from '../types/envelope'

interface TemplateListProps {
  compact?: boolean
  onApplied?: () => void
}

function formatDate(ts: number): string {
  const d = new Date(ts)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${day} ${h}:${min}`
}

export default function TemplateList({ compact = false, onApplied }: TemplateListProps) {
  const { templateList, applyTemplate, deleteTemplate, updateTemplate, isTemplateNameDuplicate } =
    useEnvelope()
  const { t } = useLanguage()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [editingError, setEditingError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2000)
  }

  const handleApply = (tmpl: EnvelopeTemplate) => {
    applyTemplate(tmpl.id)
    showToast(t('template.applySuccess'))
    onApplied?.()
  }

  const handleDelete = (id: string) => {
    deleteTemplate(id)
    setDeletingId(null)
    showToast(t('template.deleteSuccess'))
  }

  const startRename = (e: React.MouseEvent, tmpl: EnvelopeTemplate) => {
    e.stopPropagation()
    setEditingId(tmpl.id)
    setEditingName(tmpl.name)
    setEditingError(null)
  }

  const startDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setDeletingId(id)
  }

  const cancelRename = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setEditingId(null)
    setEditingName('')
    setEditingError(null)
  }

  const cancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setDeletingId(null)
  }

  const submitRename = (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!editingId) return
    const trimmed = editingName.trim()
    if (!trimmed) {
      setEditingError(t('template.emptyNameError'))
      return
    }
    if (isTemplateNameDuplicate(trimmed, editingId)) {
      setEditingError(t('template.duplicateNameError'))
      return
    }
    updateTemplate(editingId, trimmed)
    setEditingId(null)
    setEditingName('')
    setEditingError(null)
    showToast(t('template.renameSuccess'))
  }

  const sortedList = [...templateList].sort((a, b) => b.updatedAt - a.updatedAt)

  return (
    <div className="relative">
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-stone-900 px-4 py-2 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}

      <div
        className={`rounded-2xl border border-stone-200 bg-white ${
          compact ? 'p-4' : 'p-6'
        } shadow-sm`}
      >
        {!compact && (
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-stone-900">{t('template.title')}</h2>
              <p className="mt-0.5 text-xs text-stone-500">{t('template.subtitle')}</p>
            </div>
            {templateList.length > 0 && (
              <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-semibold text-violet-700">
                {templateList.length}
              </span>
            )}
          </div>
        )}

        {templateList.length === 0 ? (
          <div className="py-8 text-center">
            <svg
              className="mx-auto h-10 w-10 text-stone-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <p className="mt-3 text-sm text-stone-400">{t('template.noTemplates')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedList.map((tmpl) => {
              const isEditing = editingId === tmpl.id
              const isDeleting = deletingId === tmpl.id
              const layoutLabel =
                tmpl.layout === 'chinese' ? t('preview.chineseStyle') : t('preview.britishStyle')
              const sizeLabel = t(`preview.sizes.${tmpl.sizeId}` as never) || tmpl.sizeId
              const sideLabel = tmpl.side === 'front' ? t('preview.front') : t('preview.back')

              return (
                <div
                  key={tmpl.id}
                  onClick={() => !isEditing && !isDeleting && handleApply(tmpl)}
                  className="group cursor-pointer rounded-xl border border-stone-200 bg-stone-50/50 p-3 transition hover:border-violet-300 hover:bg-violet-50/30"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      {isEditing ? (
                        <form onSubmit={submitRename} className="space-y-1.5">
                          <input
                            type="text"
                            value={editingName}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => {
                              setEditingName(e.target.value)
                              if (editingError) setEditingError(null)
                            }}
                            className="w-full rounded-lg border border-violet-300 bg-white px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-violet-200"
                            autoFocus
                          />
                          {editingError && (
                            <p className="text-xs text-rose-600">{editingError}</p>
                          )}
                          <div className="flex gap-1.5">
                            <button
                              type="submit"
                              onClick={(e) => e.stopPropagation()}
                              className="rounded-md bg-violet-600 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-violet-700"
                            >
                              {t('common.confirm')}
                            </button>
                            <button
                              type="button"
                              onClick={cancelRename}
                              className="rounded-md border border-stone-300 bg-white px-2.5 py-1 text-xs font-medium text-stone-600 transition hover:bg-stone-50"
                            >
                              {t('common.cancel')}
                            </button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <h3 className="truncate text-sm font-semibold text-stone-900">
                            {tmpl.name}
                          </h3>
                          <p className="mt-1 truncate text-xs text-stone-500">
                            {layoutLabel} · {sizeLabel} · {sideLabel}
                          </p>
                          {!compact && (
                            <div className="mt-1.5 flex flex-wrap gap-3 text-[11px] text-stone-400">
                              <span>
                                {t('template.created')}: {formatDate(tmpl.createdAt)}
                              </span>
                              <span>
                                {t('template.updated')}: {formatDate(tmpl.updatedAt)}
                              </span>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {!isEditing && !isDeleting && (
                      <div className="flex shrink-0 gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleApply(tmpl)
                          }}
                          className="rounded-lg border border-violet-200 bg-violet-50 px-2.5 py-1.5 text-xs font-medium text-violet-700 transition hover:bg-violet-100"
                          title={t('template.loadTemplate')}
                        >
                          {t('common.use')}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => startRename(e, tmpl)}
                          className="rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs font-medium text-stone-600 transition hover:bg-stone-50"
                          title={t('template.renameTemplate')}
                        >
                          <svg
                            className="h-3.5 w-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => startDelete(e, tmpl.id)}
                          className="rounded-lg border border-rose-200 bg-white px-2.5 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
                          title={t('template.deleteTemplate')}
                        >
                          <svg
                            className="h-3.5 w-3.5"
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
                    )}

                    {isDeleting && (
                      <div
                        className="flex shrink-0 items-center gap-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="text-xs text-rose-700">
                          {t('template.deleteConfirm')}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(tmpl.id)
                          }}
                          className="rounded-md bg-rose-600 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-rose-700"
                        >
                          {t('common.confirm')}
                        </button>
                        <button
                          type="button"
                          onClick={cancelDelete}
                          className="rounded-md border border-stone-300 bg-white px-2.5 py-1 text-xs font-medium text-stone-600 transition hover:bg-stone-50"
                        >
                          {t('common.cancel')}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
