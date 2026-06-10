export interface Address {
  name: string
  phone: string
  province: string
  city: string
  district: string
  street: string
  postcode: string
}

export interface SavedAddress extends Address {
  id: string
}

export interface EnvelopeData {
  sender: Address
  recipient: Address
}

export type LayoutStyle = 'chinese' | 'british'

export type EnvelopeSide = 'front' | 'back'

export interface EnvelopeSize {
  id: string
  label: string
  widthMm: number
  heightMm: number
  description: string
}

export const ENVELOPE_SIZES: EnvelopeSize[] = [
  {
    id: 'small',
    label: '小号 (5号)',
    widthMm: 110,
    heightMm: 220,
    description: '110 × 220 mm',
  },
  {
    id: 'medium',
    label: '中号 (6号)',
    widthMm: 120,
    heightMm: 230,
    description: '120 × 230 mm',
  },
  {
    id: 'large',
    label: '大号 (7号)',
    widthMm: 160,
    heightMm: 230,
    description: '160 × 230 mm',
  },
]

export const STORAGE_KEY = 'envelope-preview-data'
export const ADDRESS_LIST_KEY = 'envelope-address-list'
export const TEMPLATE_LIST_KEY = 'envelope-template-list'
export const UI_SETTINGS_KEY = 'envelope-ui-settings'

export interface EnvelopeUiSettings {
  layout: LayoutStyle
  sizeId: string
  side: EnvelopeSide
}

export interface EnvelopeTemplate {
  id: string
  name: string
  createdAt: number
  updatedAt: number
  data: EnvelopeData
  layout: LayoutStyle
  sizeId: string
  side: EnvelopeSide
}

export function generateTemplateId(): string {
  return `tmpl_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

export function createEmptyAddress(): Address {
  return {
    name: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    street: '',
    postcode: '',
  }
}

export function generateAddressId(): string {
  return `addr_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

export function toSavedAddress(address: Address): SavedAddress {
  return {
    ...address,
    id: generateAddressId(),
  }
}

export function getAddressKey(addr: Address): string {
  return [
    addr.name.trim(),
    addr.phone.trim(),
    addr.province.trim(),
    addr.city.trim(),
    addr.district.trim(),
    addr.street.trim(),
    addr.postcode.trim(),
  ].join('|').toLowerCase()
}

export function isSameAddress(a: Address, b: Address): boolean {
  return getAddressKey(a) === getAddressKey(b)
}

export function formatChineseAddress(addr: Address): string[] {
  const lines: string[] = []
  if (addr.name) lines.push(addr.name)
  const region = [addr.province, addr.city, addr.district].filter(Boolean).join('')
  if (region) lines.push(region)
  if (addr.street) lines.push(addr.street)
  if (addr.phone) lines.push(`Tel: ${addr.phone}`)
  return lines
}

export function formatBritishAddress(addr: Address): string[] {
  const lines: string[] = []
  if (addr.name) lines.push(addr.name.toUpperCase())
  if (addr.street) lines.push(addr.street)
  const cityLine = [addr.city, addr.province].filter(Boolean).join(', ')
  if (cityLine) lines.push(cityLine)
  if (addr.postcode) lines.push(addr.postcode.toUpperCase())
  if (addr.phone) lines.push(addr.phone)
  return lines
}
