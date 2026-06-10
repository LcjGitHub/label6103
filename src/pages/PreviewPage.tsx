import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import EnvelopePreview from '../components/EnvelopePreview'
import ExportButton from '../components/ExportButton'
import LanguageSwitcher from '../components/LanguageSwitcher'
import SaveTemplateDialog from '../components/SaveTemplateDialog'
import TemplateList from '../components/TemplateList'
import { useEnvelope } from '../context/EnvelopeContext'
import { useLanguage } from '../context/LanguageContext'
import {
  clampSize,
  CUSTOM_SIZE_ID,
  ENVELOPE_SIZES,
  isSizeInRange,
  MAX_ENVELOPE_MM,
  MIN_ENVELOPE_MM,
} from '../types/envelope'

export default function PreviewPage() {
  const { data, layout, size, side, customSize, setLayout, setSizeId, setCustomSize, setSide } =
    useEnvelope()
  const { t } = useLanguage()
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [customWidthInput, setCustomWidthInput] = useState<string>(String(customSize.widthMm))
  const [customHeightInput, setCustomHeightInput] = useState<string>(String(customSize.heightMm))

  useEffect(() => {
    setCustomWidthInput(String(customSize.widthMm))
    setCustomHeightInput(String(customSize.heightMm))
  }, [customSize.widthMm, customSize.heightMm])

  const handleWidthBlur = () => {
    const num = Number(customWidthInput)
    if (Number.isNaN(num) || customWidthInput.trim() === '') {
      setCustomSize({ widthMm: MIN_ENVELOPE_MM })
    } else {
      setCustomSize({ widthMm: clampSize(num) })
    }
  }

  const handleHeightBlur = () => {
    const num = Number(customHeightInput)
    if (Number.isNaN(num) || customHeightInput.trim() === '') {
      setCustomSize({ heightMm: MIN_ENVELOPE_MM })
    } else {
      setCustomSize({ heightMm: clampSize(num) })
    }
  }

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2000)
  }

  const hasRecipient = Boolean(data.recipient.name || data.recipient.street)

  return (
    <div className="min-h-screen">
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-stone-900 px-4 py-2 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}

      <SaveTemplateDialog
        open={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
        onSaved={() => showToast(t('template.saveSuccess'))}
      />

      <header className="border-b border-stone-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-50"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {t('preview.backEdit')}
            </Link>
            <div>
              <h1 className="text-lg font-bold text-stone-900">{t('preview.title')}</h1>
              <p className="text-xs text-stone-500">{t('preview.subtitle')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSaveDialogOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-sm font-medium text-violet-800 transition hover:bg-violet-100"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              {t('template.saveTemplate')}
            </button>
            <LanguageSwitcher />
            <Link
              to="/print"
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800 transition hover:bg-emerald-100"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              {t('printPreview.title')}
            </Link>
            <ExportButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
          {/* 控制面板 */}
          <aside className="space-y-5">
            {/* 版式切换 */}
            <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-500">
                {t('preview.layout')}
              </h2>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setLayout('chinese')}
                  className={`rounded-xl px-4 py-3 text-sm font-medium transition ${
                    layout === 'chinese'
                      ? 'bg-amber-100 text-amber-900 ring-2 ring-amber-400'
                      : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {t('preview.chineseStyle')}
                </button>
                <button
                  type="button"
                  onClick={() => setLayout('british')}
                  className={`rounded-xl px-4 py-3 text-sm font-medium transition ${
                    layout === 'british'
                      ? 'bg-sky-100 text-sky-900 ring-2 ring-sky-400'
                      : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {t('preview.britishStyle')}
                </button>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-stone-400">
                {layout === 'chinese'
                  ? t('preview.chineseDesc')
                  : t('preview.britishDesc')}
              </p>
            </section>

            {/* 尺寸模板 */}
            <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-500">
                {t('preview.sizeLabel')}
              </h2>
              <div className="space-y-2">
                {ENVELOPE_SIZES.filter((s) => !s.isCustom).map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSizeId(s.id)}
                    className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm transition ${
                      size.id === s.id
                        ? 'bg-stone-900 text-white ring-2 ring-stone-700'
                        : 'bg-stone-50 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <span className="font-medium">{t(`preview.sizes.${s.id}`)}</span>
                    <span
                      className={`text-xs ${size.id === s.id ? 'text-stone-300' : 'text-stone-400'}`}
                    >
                      {s.description}
                    </span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setSizeId(CUSTOM_SIZE_ID)}
                  className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm transition ${
                    size.id === CUSTOM_SIZE_ID
                      ? 'bg-stone-900 text-white ring-2 ring-stone-700'
                      : 'bg-stone-50 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <span className="font-medium">{t('preview.sizes.custom')}</span>
                  {size.id === CUSTOM_SIZE_ID && (
                    <span className="text-xs text-stone-300">
                      {size.description}
                    </span>
                  )}
                </button>
                {size.id === CUSTOM_SIZE_ID && (
                  <div className="mt-3 space-y-3 rounded-xl border border-stone-200 bg-stone-50 p-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-stone-500">
                          {t('preview.sizes.width')}
                          <span className="ml-1 text-stone-400">({t('preview.sizes.mmUnit')})</span>
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={customWidthInput}
                          onChange={(e) => setCustomWidthInput(e.target.value)}
                          onBlur={handleWidthBlur}
                          className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 ${
                            isSizeInRange(customSize.widthMm)
                              ? 'border-stone-300 bg-white focus:border-stone-500 focus:ring-stone-200'
                              : 'border-amber-400 bg-amber-50 focus:border-amber-500 focus:ring-amber-200'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-stone-500">
                          {t('preview.sizes.height')}
                          <span className="ml-1 text-stone-400">({t('preview.sizes.mmUnit')})</span>
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={customHeightInput}
                          onChange={(e) => setCustomHeightInput(e.target.value)}
                          onBlur={handleHeightBlur}
                          className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 ${
                            isSizeInRange(customSize.heightMm)
                              ? 'border-stone-300 bg-white focus:border-stone-500 focus:ring-stone-200'
                              : 'border-amber-400 bg-amber-50 focus:border-amber-500 focus:ring-amber-200'
                          }`}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-stone-500">{t('preview.sizes.sizeRangeTip')}</p>
                    {(!isSizeInRange(customSize.widthMm) ||
                      !isSizeInRange(customSize.heightMm)) && (
                      <div className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                        <p className="font-medium">{t('preview.sizes.sizeOutOfRange')}</p>
                        <p className="mt-0.5 text-amber-600">
                          {t('preview.sizes.minSize')}: {MIN_ENVELOPE_MM}mm · {t('preview.sizes.maxSize')}:{' '}
                          {MAX_ENVELOPE_MM}mm
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>

            {/* 正反面 */}
            <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-500">
                {t('preview.sideLabel')}
              </h2>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSide('front')}
                  className={`rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                    side === 'front'
                      ? 'bg-emerald-100 text-emerald-900 ring-2 ring-emerald-400'
                      : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {t('preview.front')}
                </button>
                <button
                  type="button"
                  onClick={() => setSide('back')}
                  className={`rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                    side === 'back'
                      ? 'bg-emerald-100 text-emerald-900 ring-2 ring-emerald-400'
                      : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {t('preview.back')}
                </button>
              </div>
            </section>

            {/* 地址摘要 */}
            <section className="rounded-2xl border border-stone-200 bg-stone-50 p-5 text-sm">
              <h2 className="mb-2 font-semibold text-stone-700">{t('preview.currentData')}</h2>
              <dl className="space-y-2 text-stone-600">
                <div>
                  <dt className="text-xs text-stone-400">{t('common.recipient')}</dt>
                  <dd>{data.recipient.name || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-stone-400">{t('common.sender')}</dt>
                  <dd>{data.sender.name || '—'}</dd>
                </div>
              </dl>
              {!hasRecipient && (
                <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  {t('preview.noRecipientTip')}
                </p>
              )}
            </section>

            {/* 模板列表 */}
            <TemplateList compact />
          </aside>

          {/* 预览区 */}
          <section className="flex flex-col items-center">
            <div className="mb-4 flex items-center gap-3 text-sm text-stone-500">
              <span>
                {size.isCustom ? t('preview.sizes.custom') : t(`preview.sizes.${size.id}`)} ·{' '}
                {size.description}
              </span>
              <span className="text-stone-300">|</span>
              <span>{layout === 'chinese' ? t('preview.chineseStyle') : t('preview.britishStyle')}</span>
              <span className="text-stone-300">|</span>
              <span>{side === 'front' ? t('preview.front') : t('preview.back')}</span>
            </div>

            <div className="flex min-h-[480px] w-full items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-gradient-to-br from-stone-200/50 to-stone-100 p-8">
              <EnvelopePreview scale={1.15} />
            </div>

            <p className="mt-4 max-w-md text-center text-xs text-stone-400">
              {t('preview.previewScaleTip')}
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
