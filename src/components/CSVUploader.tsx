import { useCallback, useRef, useState } from 'react'
import { useEnvelope } from '../context/EnvelopeContext'
import { useLanguage } from '../context/LanguageContext'
import {
  generateCsvTemplate,
  readCsvFile,
  type CsvParseError,
  type CsvParseResult,
} from '../utils/csvParser'

type UploadStatus = 'idle' | 'uploading' | 'success' | 'partial' | 'error'

export default function CSVUploader() {
  const { addressList, addAddresses, tagList, addTag } = useEnvelope()
  const { t } = useLanguage()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<UploadStatus>('idle')
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<CsvParseResult | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.name.toLowerCase().endsWith('.csv')) {
        setStatus('error')
        setResult({
          success: false,
          total: 0,
          successCount: 0,
          failCount: 1,
          duplicateCount: 0,
          addresses: [],
          errors: [{ line: 0, message: t('csvUploader.uploadCsvOnly') }],
          autoCreatedTags: [],
        })
        return
      }

      setStatus('uploading')
      setProgress(0)

      try {
        const parseResult = await readCsvFile(
          file,
          addressList,
          tagList,
          (percent) => {
            setProgress(percent)
          },
        )

        setResult(parseResult)

        if (parseResult.autoCreatedTags.length > 0) {
          parseResult.autoCreatedTags.forEach((tag) => {
            addTag(tag.name, tag.color)
          })
        }

        if (parseResult.addresses.length > 0) {
          addAddresses(parseResult.addresses)
        }

        if (parseResult.success && parseResult.successCount > 0) {
          setStatus('success')
        } else if (parseResult.successCount > 0) {
          setStatus('partial')
        } else {
          setStatus('error')
        }
      } catch {
        setStatus('error')
        setResult({
          success: false,
          total: 0,
          successCount: 0,
          failCount: 1,
          duplicateCount: 0,
          addresses: [],
          errors: [{ line: 0, message: t('csvUploader.readFailed') }],
          autoCreatedTags: [],
        })
      }
    },
    [addAddresses, addTag, addressList, tagList, t],
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  const downloadTemplate = () => {
    const template = generateCsvTemplate()
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'address_template.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const resetState = () => {
    setStatus('idle')
    setProgress(0)
    setResult(null)
  }

  const statusConfig = {
    idle: { bg: 'bg-white', border: 'border-stone-300', text: 'text-stone-600' },
    uploading: { bg: 'bg-sky-50', border: 'border-sky-300', text: 'text-sky-700' },
    success: { bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-700' },
    partial: { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-700' },
    error: { bg: 'bg-rose-50', border: 'border-rose-300', text: 'text-rose-700' },
  }[status]

  return (
    <section className={`rounded-2xl border ${statusConfig.border} ${statusConfig.bg} p-6 shadow-sm transition-colors`}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-stone-800">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          {t('csvUploader.title')}
        </h2>
        <button
          type="button"
          onClick={downloadTemplate}
          className="text-sm font-medium text-stone-500 transition hover:text-stone-700"
        >
          {t('csvUploader.downloadTemplate')}
        </button>
      </div>

      {status === 'idle' && (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-8 py-10 transition-colors ${
            isDragging ? 'border-sky-400 bg-sky-50' : 'border-stone-300 hover:border-sky-400 hover:bg-stone-50'
          }`}
        >
          <svg className="mb-3 h-10 w-10 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="text-sm font-medium text-stone-700">{t('csvUploader.uploadHint')}</p>
          <p className="mt-1 text-xs text-stone-500">{t('csvUploader.uploadHintSub')}</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleInputChange}
            className="hidden"
          />
        </div>
      )}

      {status === 'uploading' && (
        <div className="rounded-xl bg-white p-6">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-stone-700">{t('csvUploader.parsingFile')}</span>
            <span className="font-semibold text-sky-600">{progress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-stone-200">
            <div
              className="h-full rounded-full bg-sky-500 transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {(status === 'success' || status === 'partial' || status === 'error') && result && (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-3">
            <div className="rounded-lg bg-white px-4 py-3 text-center">
              <div className="text-2xl font-bold text-stone-800">{result.total}</div>
              <div className="text-xs text-stone-500">{t('csvUploader.total')}</div>
            </div>
            <div className="rounded-lg bg-white px-4 py-3 text-center">
              <div className="text-2xl font-bold text-emerald-600">{result.successCount}</div>
              <div className="text-xs text-stone-500">{t('csvUploader.success')}</div>
            </div>
            <div className="rounded-lg bg-white px-4 py-3 text-center">
              <div className="text-2xl font-bold text-amber-600">{result.duplicateCount}</div>
              <div className="text-xs text-stone-500">{t('csvUploader.duplicate')}</div>
            </div>
            <div className="rounded-lg bg-white px-4 py-3 text-center">
              <div className="text-2xl font-bold text-rose-600">{result.failCount}</div>
              <div className="text-xs text-stone-500">{t('csvUploader.fail')}</div>
            </div>
          </div>

          {result.errors.length > 0 && (
            <div className="max-h-40 overflow-y-auto rounded-lg bg-white p-4">
              <p className="mb-2 text-sm font-medium text-stone-700">{t('csvUploader.errorDetails')}</p>
              <ul className="space-y-1 text-sm">
                {result.errors.slice(0, 10).map((err: CsvParseError, idx: number) => (
                  <li key={idx} className="flex gap-2 text-stone-600">
                    <span className="shrink-0 text-rose-500">{t('csvUploader.lineN', { line: err.line })}</span>
                    <span>{err.message}</span>
                  </li>
                ))}
                {result.errors.length > 10 && (
                  <li className="text-stone-400">{t('csvUploader.moreErrors', { count: result.errors.length - 10 })}</li>
                )}
              </ul>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={resetState}
              className="flex-1 rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
            >
              {t('csvUploader.continueUpload')}
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
