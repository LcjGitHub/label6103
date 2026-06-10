import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useEnvelope } from '../context/EnvelopeContext'
import CSVUploader from '../components/CSVUploader'
import type { Address } from '../types/envelope'

function formatAddressSummary(addr: Address): string {
  const parts = [addr.province, addr.city, addr.district, addr.street].filter(Boolean)
  return parts.join(' ') || '暂无地址信息'
}

export default function AddressListPage() {
  const { addressList, removeAddress, clearAddressList, setRecipientFromList } = useEnvelope()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const filteredList = addressList.filter((addr) => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return (
      addr.name.toLowerCase().includes(query) ||
      addr.phone.toLowerCase().includes(query) ||
      addr.province.toLowerCase().includes(query) ||
      addr.city.toLowerCase().includes(query) ||
      addr.district.toLowerCase().includes(query) ||
      addr.street.toLowerCase().includes(query)
    )
  })

  const handleUseAddress = (index: number) => {
    const actualIndex = addressList.indexOf(filteredList[index])
    if (actualIndex !== -1) {
      setRecipientFromList(actualIndex)
      setSelectedIndex(index)
      setTimeout(() => navigate('/'), 300)
    }
  }

  const handleDelete = (index: number) => {
    const actualIndex = addressList.indexOf(filteredList[index])
    if (actualIndex !== -1) {
      removeAddress(actualIndex)
    }
  }

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

        <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-stone-800">
                <span className="h-2 w-2 rounded-full bg-sky-500" />
                地址列表
              </h2>
              <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-600">
                共 {addressList.length} 条
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索姓名、电话或地址..."
                  className="w-64 rounded-lg border border-stone-300 bg-stone-50 py-2 pl-9 pr-3 text-sm text-stone-800 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-400/30"
                />
              </div>
              {addressList.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('确定要清空所有地址吗？此操作不可撤销。')) {
                      clearAddressList()
                    }
                  }}
                  className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-100"
                >
                  清空列表
                </button>
              )}
            </div>
          </div>

          {filteredList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <svg className="mb-4 h-16 w-16 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
              <p className="text-base font-medium text-stone-600">
                {addressList.length === 0 ? '暂无地址数据' : '未找到匹配的地址'}
              </p>
              <p className="mt-1 text-sm text-stone-400">
                {addressList.length === 0 ? '请通过上方区域导入 CSV 文件' : '尝试修改搜索关键词'}
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-stone-200">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-stone-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-stone-700">姓名</th>
                      <th className="px-4 py-3 text-left font-semibold text-stone-700">电话</th>
                      <th className="px-4 py-3 text-left font-semibold text-stone-700">地址</th>
                      <th className="px-4 py-3 text-left font-semibold text-stone-700">邮编</th>
                      <th className="px-4 py-3 text-right font-semibold text-stone-700">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {filteredList.map((addr, index) => (
                      <tr
                        key={index}
                        className={`transition-colors ${
                          selectedIndex === index ? 'bg-sky-50' : 'hover:bg-stone-50'
                        }`}
                      >
                        <td className="px-4 py-3 font-medium text-stone-800">{addr.name || '-'}</td>
                        <td className="px-4 py-3 text-stone-600">{addr.phone || '-'}</td>
                        <td className="px-4 py-3 max-w-xs truncate text-stone-600" title={formatAddressSummary(addr)}>
                          {formatAddressSummary(addr)}
                        </td>
                        <td className="px-4 py-3 text-stone-600">{addr.postcode || '-'}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleUseAddress(index)}
                              className="rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-sky-700"
                            >
                              使用此地址
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(index)}
                              className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-600 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600"
                            >
                              删除
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
