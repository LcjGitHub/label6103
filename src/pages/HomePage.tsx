import { Link } from 'react-router-dom'
import AddressForm from '../components/AddressForm'
import AddressList from '../components/AddressList'
import CSVUploader from '../components/CSVUploader'
import { useEnvelope } from '../context/EnvelopeContext'
import { mockBritishData } from '../data/mockData'

export default function HomePage() {
  const {
    data,
    addressList,
    updateSender,
    updateRecipient,
    loadMockData,
    resetData,
    persist,
    setData,
    setLayout,
  } = useEnvelope()

  const loadBritishMock = () => {
    setData(mockBritishData)
    setLayout('british')
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-stone-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-5">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-stone-900">
              信封地址排版预览器
            </h1>
            <p className="mt-0.5 text-sm text-stone-500">
              填写寄件人 / 收件人信息，预览中式与英式信封布局
            </p>
          </div>
          <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-500">
            本地 Mock · 无后端
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={loadMockData}
            className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800 transition hover:bg-amber-100"
          >
            载入中式 Mock 数据
          </button>
          <button
            type="button"
            onClick={loadBritishMock}
            className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-800 transition hover:bg-sky-100"
          >
            载入英式 Mock 数据
          </button>
          <button
            type="button"
            onClick={resetData}
            className="rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-50"
          >
            清空表单
          </button>
          <Link
            to="/addresses"
            className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800 transition hover:bg-emerald-100"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            地址列表
            {addressList.length > 0 && (
              <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-semibold text-white">
                {addressList.length}
              </span>
            )}
          </Link>
        </div>

        <CSVUploader />

        {addressList.length > 0 && <AddressList compact showClearButton={false} />}

        <AddressForm
          title="寄件人"
          accent="amber"
          address={data.sender}
          onChange={updateSender}
        />

        <AddressForm
          title="收件人"
          accent="sky"
          address={data.recipient}
          onChange={updateRecipient}
        />

        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-stone-500">
            数据保存在浏览器 localStorage，刷新后仍可恢复。
          </p>
          <Link
            to="/preview"
            onClick={persist}
            className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-stone-800"
          >
            前往预览
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </main>
    </div>
  )
}
