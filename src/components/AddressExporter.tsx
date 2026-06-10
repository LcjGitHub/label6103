import { useMemo, useState } from 'react';
import { useEnvelope } from '../context/EnvelopeContext';
import { useLanguage } from '../context/LanguageContext';
import { downloadCsvFile, downloadJsonFile, type ExportField } from '../utils/csvParser';
import { downloadExcelFile } from '../utils/excelParser';
import type { Address } from '../types/envelope';

type ExportFormat = 'csv' | 'json' | 'xlsx';

const FIELD_KEYS: (keyof Address | 'tags')[] = [
  'name',
  'phone',
  'province',
  'city',
  'district',
  'street',
  'postcode',
  'tags',
];

export default function AddressExporter({
  variant = 'primary',
}: {
  variant?: 'primary' | 'compact';
}) {
  const { addressList, tagList } = useEnvelope();
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [selectedFields, setSelectedFields] = useState<(keyof Address | 'tags')[]>([
    'name',
    'phone',
    'province',
    'city',
    'district',
    'street',
    'postcode',
    'tags',
  ]);

  const allFields: ExportField[] = useMemo(
    () =>
      FIELD_KEYS.map((key) => ({
        key,
        label: t(`exportFields.${key}` as const),
      })),
    [t],
  );

  const formatOptions = useMemo(
    (): { key: ExportFormat; label: string; icon: JSX.Element }[] => [
      {
        key: 'csv',
        label: t('addressExporter.formatCsv'),
        icon: (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        label: t('addressExporter.formatJson'),
        icon: (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        label: t('addressExporter.formatExcel'),
        icon: (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        ),
      },
    ],
    [t],
  );

  const toggleField = (key: keyof Address | 'tags') => {
    setSelectedFields((prev) => {
      if (prev.includes(key)) {
        return prev.filter((f) => f !== key);
      }
      return [...prev, key];
    });
  };

  const selectAllFields = () => {
    setSelectedFields([...FIELD_KEYS]);
  };

  const clearFields = () => {
    setSelectedFields([]);
  };

  const handleExport = () => {
    if (selectedFields.length === 0) return;
    if (addressList.length === 0) return;

    const fields = allFields.filter((f) => selectedFields.includes(f.key));
    const addresses = addressList as unknown as Address[];

    const timestamp = new Date().toISOString().slice(0, 10);

    if (format === 'csv') {
      downloadCsvFile(addresses, fields, tagList, `addresses_${timestamp}.csv`);
    } else if (format === 'json') {
      downloadJsonFile(addresses, fields, tagList, `addresses_${timestamp}.json`);
    } else {
      downloadExcelFile(addresses, fields, tagList, `addresses_${timestamp}.xlsx`);
    }

    setIsOpen(false);
  };

  if (addressList.length === 0) return null;

  const btnBase =
    'inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium shadow-sm transition';
  const btnStyle =
    variant === 'primary'
      ? 'bg-sky-600 text-white hover:bg-sky-700'
      : 'border border-sky-200 bg-sky-50 text-sky-800 hover:bg-sky-100';

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)} className={`${btnBase} ${btnStyle}`}>
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
          />
        </svg>
        {t('addressExporter.exportAll')}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-stone-900">
                  {t('addressExporter.title')}
                </h3>
                <p className="mt-1 text-sm text-stone-500">
                  {t('addressExporter.subtitle', { count: addressList.length })}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-stone-400 transition hover:bg-stone-100 hover:text-stone-600"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-stone-700">
                  {t('addressExporter.selectFormat')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {formatOptions.map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setFormat(opt.key)}
                      className={`flex flex-col items-center gap-1.5 rounded-xl border-2 px-3 py-3 text-xs font-medium transition ${
                        format === opt.key
                          ? 'border-sky-500 bg-sky-50 text-sky-700'
                          : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                      }`}
                    >
                      {opt.icon}
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium text-stone-700">
                    {t('addressExporter.selectFields')}
                  </label>
                  <div className="flex gap-2 text-xs">
                    <button
                      type="button"
                      onClick={selectAllFields}
                      className="font-medium text-sky-600 hover:text-sky-700"
                    >
                      {t('addressExporter.selectAll')}
                    </button>
                    <span className="text-stone-300">|</span>
                    <button
                      type="button"
                      onClick={clearFields}
                      className="font-medium text-stone-500 hover:text-stone-700"
                    >
                      {t('addressExporter.clearAll')}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 rounded-xl border border-stone-200 bg-stone-50 p-3">
                  {allFields.map((field) => {
                    const isChecked = selectedFields.includes(field.key);
                    return (
                      <label
                        key={field.key}
                        className={`flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition ${
                          isChecked
                            ? 'bg-white text-stone-900 shadow-sm'
                            : 'text-stone-600 hover:bg-white/50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleField(field.key)}
                          className="h-4 w-4 rounded border-stone-300 text-sky-600 focus:ring-sky-500"
                        />
                        {field.label}
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex-1 rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={handleExport}
                disabled={selectedFields.length === 0}
                className="flex-1 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t('addressExporter.confirmExport')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
