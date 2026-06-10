import { useCallback, useRef, useState } from 'react';
import { useEnvelope } from '../context/EnvelopeContext';
import { useLanguage } from '../context/LanguageContext';
import {
  generateCsvTemplate,
  generateJsonTemplate,
  readCsvFile,
  readJsonFile,
  type ParseError,
  type ParseResult,
} from '../utils/csvParser';
import { generateExcelTemplate, readExcelFile } from '../utils/excelParser';

type FileFormat = 'csv' | 'json' | 'xlsx';
type UploadStatus = 'idle' | 'uploading' | 'success' | 'partial' | 'error';

const FORMAT_ACCEPT: Record<FileFormat, string> = {
  csv: '.csv',
  json: '.json',
  xlsx: '.xlsx,.xls',
};

const FORMAT_EXTENSIONS: Record<FileFormat, string[]> = {
  csv: ['.csv'],
  json: ['.json'],
  xlsx: ['.xlsx', '.xls'],
};

const FORMAT_LABEL_KEYS: Record<
  FileFormat,
  'csvUploader.formatCsv' | 'csvUploader.formatJson' | 'csvUploader.formatExcel'
> = {
  csv: 'csvUploader.formatCsv',
  json: 'csvUploader.formatJson',
  xlsx: 'csvUploader.formatExcel',
};
const FORMAT_LABEL_KV = FORMAT_LABEL_KEYS;

function detectFileFormat(file: File): FileFormat | null {
  const name = file.name.toLowerCase();
  for (const [format, exts] of Object.entries(FORMAT_EXTENSIONS) as [FileFormat, string[]][]) {
    if (exts.some((ext) => name.endsWith(ext))) {
      return format;
    }
  }
  return null;
}

function getErrorLocation(err: ParseError): string {
  if (err.line !== undefined) return `第${err.line}行`;
  if (err.row !== undefined) return `第${err.row}行`;
  if (err.index !== undefined) return `第${err.index}项`;
  return '';
}

export default function CSVUploader() {
  const { addressList, addAddresses, tagList, importTags } = useEnvelope();
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [format, setFormat] = useState<FileFormat>('csv');
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ParseResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      const detectedFormat = detectFileFormat(file);
      if (!detectedFormat) {
        setStatus('error');
        setResult({
          success: false,
          total: 0,
          successCount: 0,
          failCount: 1,
          duplicateCount: 0,
          addresses: [],
          errors: [{ message: t('csvUploader.uploadSupportedOnly') }],
          autoCreatedTags: [],
        });
        return;
      }

      setFormat(detectedFormat);
      setStatus('uploading');
      setProgress(0);

      try {
        let parseResult: ParseResult;
        if (detectedFormat === 'csv') {
          parseResult = await readCsvFile(file, addressList, tagList, (percent) => {
            setProgress(percent);
          });
        } else if (detectedFormat === 'json') {
          parseResult = await readJsonFile(file, addressList, tagList, (percent) => {
            setProgress(percent);
          });
        } else {
          parseResult = await readExcelFile(file, addressList, tagList, (percent) => {
            setProgress(percent);
          });
        }

        setResult(parseResult);

        if (parseResult.autoCreatedTags.length > 0) {
          importTags(parseResult.autoCreatedTags);
        }

        if (parseResult.addresses.length > 0) {
          addAddresses(parseResult.addresses);
        }

        if (parseResult.success && parseResult.successCount > 0) {
          setStatus('success');
        } else if (parseResult.successCount > 0) {
          setStatus('partial');
        } else {
          setStatus('error');
        }
      } catch {
        setStatus('error');
        setResult({
          success: false,
          total: 0,
          successCount: 0,
          failCount: 1,
          duplicateCount: 0,
          addresses: [],
          errors: [{ message: t('csvUploader.readFailed') }],
          autoCreatedTags: [],
        });
      }
    },
    [addAddresses, importTags, addressList, tagList, t],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const downloadTemplate = () => {
    if (format === 'csv') {
      const content = generateCsvTemplate();
      const blob = new Blob(['\ufeff' + content], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'address_template.csv';
      link.click();
      URL.revokeObjectURL(url);
    } else if (format === 'json') {
      const content = generateJsonTemplate();
      const blob = new Blob([content], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'address_template.json';
      link.click();
      URL.revokeObjectURL(url);
    } else {
      generateExcelTemplate();
    }
  };

  const resetState = () => {
    setStatus('idle');
    setProgress(0);
    setResult(null);
  };

  const statusConfig = {
    idle: { bg: 'bg-white', border: 'border-stone-300', text: 'text-stone-600' },
    uploading: { bg: 'bg-sky-50', border: 'border-sky-300', text: 'text-sky-700' },
    success: { bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-700' },
    partial: { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-700' },
    error: { bg: 'bg-rose-50', border: 'border-rose-300', text: 'text-rose-700' },
  }[status];

  const formatTabs: {
    key: FileFormat;
    labelKey: 'csvUploader.formatCsv' | 'csvUploader.formatJson' | 'csvUploader.formatExcel';
    icon: JSX.Element;
  }[] = [
    {
      key: 'csv',
      labelKey: 'csvUploader.formatCsv',
      icon: (
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
    {
      key: 'json',
      labelKey: 'csvUploader.formatJson',
      icon: (
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
          />
        </svg>
      ),
    },
    {
      key: 'xlsx',
      labelKey: 'csvUploader.formatExcel',
      icon: (
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      ),
    },
  ];

  return (
    <section
      className={`rounded-2xl border ${statusConfig.border} ${statusConfig.bg} p-6 shadow-sm transition-colors`}
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-stone-800">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          {t('csvUploader.title')}
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg bg-stone-100 p-0.5">
            {formatTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setFormat(tab.key);
                  if (status !== 'uploading') resetState();
                }}
                disabled={status === 'uploading'}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                  format === tab.key
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-500 hover:text-stone-700'
                } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                {tab.icon}
                {t(`csvUploader.${tab.labelKey}`)}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={downloadTemplate}
            className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-600 transition hover:bg-stone-50 hover:text-stone-800"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            {t('csvUploader.downloadTemplate')}
          </button>
        </div>
      </div>

      {status === 'idle' && (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-8 py-10 transition-colors ${
            isDragging
              ? 'border-sky-400 bg-sky-50'
              : 'border-stone-300 hover:border-sky-400 hover:bg-stone-50'
          }`}
        >
          <svg
            className="mb-3 h-10 w-10 text-stone-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="text-sm font-medium text-stone-700">
            {t('csvUploader.uploadHintFormat', { format: t(FORMAT_LABEL_KV[format]) })}
          </p>
          <p className="mt-1 text-xs text-stone-500">{t('csvUploader.uploadHintSub')}</p>
          <input
            ref={fileInputRef}
            type="file"
            accept={FORMAT_ACCEPT[format]}
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
              <p className="mb-2 text-sm font-medium text-stone-700">
                {t('csvUploader.errorDetails')}
              </p>
              <ul className="space-y-1 text-sm">
                {result.errors.slice(0, 10).map((err: ParseError, idx: number) => {
                  const location = getErrorLocation(err);
                  return (
                    <li key={idx} className="flex gap-2 text-stone-600">
                      {location && <span className="shrink-0 text-rose-500">{location}:</span>}
                      <span>{err.message}</span>
                    </li>
                  );
                })}
                {result.errors.length > 10 && (
                  <li className="text-stone-400">
                    {t('csvUploader.moreErrors', { count: result.errors.length - 10 })}
                  </li>
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
  );
}
