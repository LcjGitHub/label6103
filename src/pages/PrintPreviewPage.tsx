import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import EnvelopeChinese from '../components/EnvelopeChinese';
import EnvelopeBritish from '../components/EnvelopeBritish';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useEnvelope } from '../context/EnvelopeContext';
import { useLanguage } from '../context/LanguageContext';
import { mmToPx, type Address } from '../types/envelope';

type PerPageOption = 1 | 2 | 4 | 9;
type DataMode = 'current' | 'list';

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const PAGE_PADDING_MM = 10;

interface EnvelopeItem {
  recipient: Address;
  sender: Address;
}

function getGridConfig(perPage: PerPageOption) {
  switch (perPage) {
    case 1:
      return { cols: 1, rows: 1 };
    case 2:
      return { cols: 1, rows: 2 };
    case 4:
      return { cols: 2, rows: 2 };
    case 9:
      return { cols: 3, rows: 3 };
  }
}

function getEnvelopeScale(
  perPage: PerPageOption,
  envelopeWidthMm: number,
  envelopeHeightMm: number,
) {
  const { cols, rows } = getGridConfig(perPage);
  const contentWidthMm = A4_WIDTH_MM - PAGE_PADDING_MM * 2;
  const contentHeightMm = A4_HEIGHT_MM - PAGE_PADDING_MM * 2;
  const cellWidthMm = contentWidthMm / cols;
  const cellHeightMm = contentHeightMm / rows;
  const gapMm = perPage === 1 ? 0 : perPage === 2 ? 4 : 3;
  const availW = cellWidthMm - gapMm;
  const availH = cellHeightMm - gapMm;
  const scaleW = availW / envelopeWidthMm;
  const scaleH = availH / envelopeHeightMm;
  return Math.min(scaleW, scaleH, 1);
}

export default function PrintPreviewPage() {
  const { data, layout, size, side, addressList } = useEnvelope();
  const { t } = useLanguage();
  const [perPage, setPerPage] = useState<PerPageOption>(4);
  const [dataMode, setDataMode] = useState<DataMode>('list');
  const [printing, setPrinting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

  const envelopeItems: EnvelopeItem[] = useMemo(() => {
    if (dataMode === 'current') {
      return [{ recipient: data.recipient, sender: data.sender }];
    }
    if (addressList.length > 0) {
      return addressList.map((addr) => ({
        recipient: {
          name: addr.name,
          phone: addr.phone,
          province: addr.province,
          city: addr.city,
          district: addr.district,
          street: addr.street,
          postcode: addr.postcode,
          tags: addr.tags,
        },
        sender: data.sender,
      }));
    }
    return [{ recipient: data.recipient, sender: data.sender }];
  }, [dataMode, data, addressList]);

  const pages: EnvelopeItem[][] = useMemo(() => {
    const result: EnvelopeItem[][] = [];
    for (let i = 0; i < envelopeItems.length; i += perPage) {
      result.push(envelopeItems.slice(i, i + perPage));
    }
    return result;
  }, [envelopeItems, perPage]);

  const scale = getEnvelopeScale(perPage, size.widthMm, size.heightMm);
  const widthPx = mmToPx(size.widthMm, scale);
  const heightPx = mmToPx(size.heightMm, scale);
  const { cols, rows } = getGridConfig(perPage);
  const gapMm = perPage === 1 ? 0 : perPage === 2 ? 4 : 3;

  const EnvelopeComponent = layout === 'chinese' ? EnvelopeChinese : EnvelopeBritish;

  const perPageOptions: { value: PerPageOption; label: string }[] = [
    { value: 1, label: t('printPreview.perPage1') },
    { value: 2, label: t('printPreview.perPage2') },
    { value: 4, label: t('printPreview.perPage4') },
    { value: 9, label: t('printPreview.perPage9') },
  ];

  const handlePrint = () => {
    setPrinting(true);
    setTimeout(() => {
      window.print();
      setTimeout(() => setPrinting(false), 500);
    }, 300);
  };

  const setPageRef = useCallback(
    (idx: number) => (el: HTMLDivElement | null) => {
      pageRefs.current[idx] = el;
    },
    [],
  );

  useEffect(() => {
    if (pages.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = pageRefs.current.indexOf(entry.target as HTMLDivElement);
            if (idx !== -1) {
              setCurrentPage(idx + 1);
            }
          }
        }
      },
      {
        root: null,
        rootMargin: '-40% 0px -40% 0px',
        threshold: 0,
      },
    );

    pageRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [pages.length]);

  return (
    <div className="min-h-screen">
      <header className="print-hide border-b border-stone-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              to="/preview"
              className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-50"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              {t('printPreview.backPreview')}
            </Link>
            <div>
              <h1 className="text-lg font-bold text-stone-900">{t('printPreview.title')}</h1>
              <p className="text-xs text-stone-500">{t('printPreview.subtitle')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <button
              type="button"
              onClick={handlePrint}
              disabled={printing}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"
            >
              {printing ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  {t('printPreview.printing')}
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                    />
                  </svg>
                  {t('printPreview.print')}
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="print-hide mx-auto max-w-6xl px-4 py-4">
        <div className="flex flex-wrap items-start gap-4">
          <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-stone-500">
              {t('printPreview.perPage')}
            </h2>
            <div className="flex gap-2">
              {perPageOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPerPage(opt.value)}
                  className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                    perPage === opt.value
                      ? 'bg-stone-900 text-white ring-2 ring-stone-700'
                      : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-stone-500">
              {t('printPreview.dataMode')}
            </h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDataMode('current')}
                className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                  dataMode === 'current'
                    ? 'bg-amber-100 text-amber-900 ring-2 ring-amber-400'
                    : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
                }`}
              >
                {t('printPreview.useCurrentOnly')}
              </button>
              <button
                type="button"
                onClick={() => setDataMode('list')}
                className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                  dataMode === 'list'
                    ? 'bg-amber-100 text-amber-900 ring-2 ring-amber-400'
                    : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
                }`}
              >
                {t('printPreview.useAddressList')}
                {addressList.length > 0 && (
                  <span className="ml-1.5 rounded-full bg-emerald-600 px-1.5 py-0.5 text-xs font-semibold text-white">
                    {addressList.length}
                  </span>
                )}
              </button>
            </div>
          </section>

          <section className="flex items-center gap-4 rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-600">
            <span>{t('printPreview.page', { current: currentPage, total: pages.length })}</span>
            <span className="text-stone-300">|</span>
            <span>
              {envelopeItems.length} {dataMode === 'list' ? t('common.recipient') : ''}
            </span>
          </section>
        </div>

        {dataMode === 'list' && addressList.length === 0 && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <p className="font-medium">{t('printPreview.noAddresses')}</p>
            <p className="mt-1 text-xs text-amber-600">{t('printPreview.noAddressesTip')}</p>
          </div>
        )}

        <p className="mt-3 text-xs text-stone-400">{t('printPreview.printTip')}</p>
      </div>

      <div className="print-container flex flex-col items-center gap-8 px-4 py-6 print:gap-0 print:px-0 print:py-0">
        {pages.map((pageEnvelopes, pageIdx) => (
          <div
            key={pageIdx}
            ref={setPageRef(pageIdx)}
            className="print-page bg-white shadow-lg print:shadow-none"
            style={{
              width: `${A4_WIDTH_MM}mm`,
              minHeight: `${A4_HEIGHT_MM}mm`,
              padding: `${PAGE_PADDING_MM}mm`,
            }}
          >
            <div
              className="grid h-full w-full"
              style={{
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                gridTemplateRows: `repeat(${rows}, 1fr)`,
                gap: `${gapMm}mm`,
              }}
            >
              {pageEnvelopes.map((item, envIdx) => (
                <div key={envIdx} className="flex items-center justify-center">
                  <EnvelopeComponent
                    side={side}
                    recipient={item.recipient}
                    sender={item.sender}
                    widthPx={widthPx}
                    heightPx={heightPx}
                  />
                </div>
              ))}
              {Array.from({ length: perPage - pageEnvelopes.length }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
