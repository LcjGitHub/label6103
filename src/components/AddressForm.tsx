import type { Address } from '../types/envelope'

interface AddressFormProps {
  title: string
  accent: 'amber' | 'sky'
  address: Address
  onChange: (field: keyof Address, value: string) => void
}

const fields: { key: keyof Address; label: string; placeholder: string; span?: number }[] = [
  { key: 'name', label: '姓名', placeholder: '张三 / John Smith' },
  { key: 'phone', label: '电话', placeholder: '13800138000' },
  { key: 'province', label: '省/州', placeholder: '北京市 / England' },
  { key: 'city', label: '城市', placeholder: '北京市 / London' },
  { key: 'district', label: '区/县', placeholder: '海淀区（可选）' },
  { key: 'street', label: '详细地址', placeholder: '街道、门牌号、楼层', span: 2 },
  { key: 'postcode', label: '邮政编码', placeholder: '100080 / SW1A 2AA' },
]

const accentMap = {
  amber: 'border-amber-400 focus:ring-amber-400/30',
  sky: 'border-sky-400 focus:ring-sky-400/30',
}

export default function AddressForm({
  title,
  accent,
  address,
  onChange,
}: AddressFormProps) {
  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <h2 className="mb-5 flex items-center gap-2 text-lg font-semibold text-stone-800">
        <span
          className={`h-2 w-2 rounded-full ${accent === 'amber' ? 'bg-amber-500' : 'bg-sky-500'}`}
        />
        {title}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map(({ key, label, placeholder, span }) => (
          <label
            key={key}
            className={`flex flex-col gap-1.5 text-sm ${span === 2 ? 'sm:col-span-2' : ''}`}
          >
            <span className="font-medium text-stone-600">{label}</span>
            <input
              type="text"
              value={address[key]}
              onChange={(e) => onChange(key, e.target.value)}
              placeholder={placeholder}
              className={`rounded-lg border bg-stone-50 px-3 py-2.5 text-stone-800 outline-none transition focus:bg-white focus:ring-2 ${accentMap[accent]}`}
            />
          </label>
        ))}
      </div>
    </section>
  )
}
