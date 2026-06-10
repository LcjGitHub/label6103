export interface Address {
  name: string
  phone: string
  province: string
  city: string
  district: string
  street: string
  postcode: string
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
