import { Link } from 'react-router-dom'
import { useEnvelope } from '../context/EnvelopeContext'
import CSVUploader from '../components/CSVUploader'
import AddressList from '../components/AddressList'

export default function AddressListPage() {
  const { addressList } = useEnvelope()

  return (
    <div className="min-h-screen">
      <header className="border-b border-stone-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-stone-900">地址列表管理</h1>
            <p className="mt-0.5 text-sm text-stone-500">管理已导入的收件人地址，快速填充到表单</p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回主页
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        <CSVUploader />

        <AddressList />

        {addressList.length > 0 && (
          <div className="flex justify-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-stone-800"
            >
              返回主页继续编辑
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
