import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import AddressForm, { type AddressFormRef } from '../components/AddressForm'
import AddressList from '../components/AddressList'
import CSVUploader from '../components/CSVUploader'
import LanguageSwitcher from '../components/LanguageSwitcher'
import SaveTemplateDialog from '../components/SaveTemplateDialog'
import TemplateList from '../components/TemplateList'
import { useEnvelope } from '../context/EnvelopeContext'
import { useLanguage } from '../context/LanguageContext'
import { mockBritishData } from '../data/mockData'

export default function HomePage() {
  const {
    data,
    addressList,
    updateSender,
    updateRecipient,
    updateSenderTags,
    updateRecipientTags,
    loadMockData,
    resetData,
    persist,
    setData,
    setLayout,
  } = useEnvelope()
  const { t } = useLanguage()
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const senderFormRef = useRef<AddressFormRef>(null)
  const recipientFormRef = useRef<AddressFormRef>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2000)
  }

  const loadBritishMock = () => {
    setData(mockBritishData)
    setLayout('british')
  }

  const saveAddressHistory = () => {
    senderFormRef.current?.saveToHistory()
    recipientFormRef.current?.saveToHistory()
  }

  const handleGoPreview = () => {
    saveAddressHistory()
    persist()
  }

  const handleGoPrint = () => {
    saveAddressHistory()
    persist()
  }

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
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-5">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-stone-900">
              {t('app.title')}
            </h1>
            <p className="mt-0.5 text-sm text-stone-500">
              {t('app.subtitle')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-500">
              {t('app.localMock')}
            </span>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={loadMockData}
            className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800 transition hover:bg-amber-100"
          >
            {t('home.loadChineseMock')}
          </button>
          <button
            type="button"
            onClick={loadBritishMock}
            className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-800 transition hover:bg-sky-100"
          >
            {t('home.loadBritishMock')}
          </button>
          <button
            type="button"
            onClick={resetData}
            className="rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-50"
          >
            {t('home.resetForm')}
          </button>
          <button
            type="button"
            onClick={() => setSaveDialogOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-medium text-violet-800 transition hover:bg-violet-100"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            {t('template.saveTemplate')}
          </button>
          <Link
            to="/addresses"
            className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800 transition hover:bg-emerald-100"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            {t('home.addressList')}
            {addressList.length > 0 && (
              <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-semibold text-white">
                {addressList.length}
              </span>
            )}
          </Link>
        </div>

        <TemplateList />

        <CSVUploader />

        {addressList.length > 0 && <AddressList compact showClearButton={false} />}

        <AddressForm
          ref={senderFormRef}
          title={t('common.sender')}
          accent="amber"
          address={data.sender}
          onChange={updateSender}
          onTagsChange={updateSenderTags}
        />

        <AddressForm
          ref={recipientFormRef}
          title={t('common.recipient')}
          accent="sky"
          address={data.recipient}
          onChange={updateRecipient}
          onTagsChange={updateRecipientTags}
        />

        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-stone-500">
            {t('home.dataSavedTip')}
          </p>
          <div className="flex items-center gap-3">
            <Link
              to="/preview"
              onClick={handleGoPreview}
              className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-stone-800"
            >
              {t('home.goPreview')}
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              to="/print"
              onClick={handleGoPrint}
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-6 py-3 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              {t('printPreview.title')}
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
