import type { Address } from '../types/envelope'
import AddressAutocomplete from './AddressAutocomplete'
import type { AddressSuggestion } from '../utils/addressSearch'

interface AddressFormProps {
  title: string
  accent: 'amber' | 'sky'
  address: Address
  onChange: (field: keyof Address, value: string) => void
}

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
  function handleSuggestionSelect(suggestion: AddressSuggestion) {
    onChange('province', suggestion.province)
    onChange('city', suggestion.city)
    onChange('district', suggestion.district)
  }

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <h2 className="mb-5 flex items-center gap-2 text-lg font-semibold text-stone-800">
        <span
          className={`h-2 w-2 rounded-full ${accent === 'amber' ? 'bg-amber-500' : 'bg-sky-500'}`}
        />
        {title}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-stone-600">姓名</span>
          <input
            type="text"
            value={address.name}
            onChange={(e) => onChange('name', e.target.value)}
            placeholder="张三 / John Smith"
            className={`rounded-lg border bg-stone-50 px-3 py-2.5 text-stone-800 outline-none transition focus:bg-white focus:ring-2 ${accentMap[accent]}`}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-stone-600">电话</span>
          <input
            type="text"
            value={address.phone}
            onChange={(e) => onChange('phone', e.target.value)}
            placeholder="13800138000"
            className={`rounded-lg border bg-stone-50 px-3 py-2.5 text-stone-800 outline-none transition focus:bg-white focus:ring-2 ${accentMap[accent]}`}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-stone-600">省/州</span>
          <AddressAutocomplete
            value={address.province}
            placeholder="北京市 / England"
            accent={accent}
            address={address}
            onSelect={handleSuggestionSelect}
            onChange={(val) => onChange('province', val)}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-stone-600">城市</span>
          <AddressAutocomplete
            value={address.city}
            placeholder="北京市 / London"
            accent={accent}
            address={address}
            onSelect={handleSuggestionSelect}
            onChange={(val) => onChange('city', val)}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-stone-600">区/县</span>
          <AddressAutocomplete
            value={address.district}
            placeholder="海淀区（可选）"
            accent={accent}
            address={address}
            onSelect={handleSuggestionSelect}
            onChange={(val) => onChange('district', val)}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
          <span className="font-medium text-stone-600">详细地址</span>
          <input
            type="text"
            value={address.street}
            onChange={(e) => onChange('street', e.target.value)}
            placeholder="街道、门牌号、楼层"
            className={`rounded-lg border bg-stone-50 px-3 py-2.5 text-stone-800 outline-none transition focus:bg-white focus:ring-2 ${accentMap[accent]}`}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-stone-600">邮政编码</span>
          <input
            type="text"
            value={address.postcode}
            onChange={(e) => onChange('postcode', e.target.value)}
            placeholder="100080 / SW1A 2AA"
            className={`rounded-lg border bg-stone-50 px-3 py-2.5 text-stone-800 outline-none transition focus:bg-white focus:ring-2 ${accentMap[accent]}`}
          />
        </label>
      </div>
    </section>
  )
}
