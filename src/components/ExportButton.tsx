import { useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import EnvelopePreview from './EnvelopePreview'
import { useEnvelope } from '../context/EnvelopeContext'
import { useLanguage } from '../context/LanguageContext'

export default function ExportButton() {
  const previewRef = useRef<HTMLDivElement>(null)
  const { size, layout, side } = useEnvelope()
  const { t } = useLanguage()
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    if (!previewRef.current) return
    setExporting(true)
    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
        logging: false,
      })
      const link = document.createElement('a')
      link.download = `envelope-${layout}-${size.id}-${side}-${Date.now()}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (err) {
      console.error('Export failed:', err)
      alert(t('preview.exportFailed'))
    } finally {
      setExporting(false)
    }
  }

  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed left-[-9999px] top-0"
      >
        <div ref={previewRef}>
          <EnvelopePreview forceZoomPercent={100} />
        </div>
      </div>
      <button
        type="button"
        onClick={handleExport}
        disabled={exporting}
        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"
      >
        {exporting ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            {t('preview.exporting')}
          </>
        ) : (
          <>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            {t('preview.exportPNG')}
          </>
        )}
      </button>
    </>
  )
}
