export interface Tag {
  id: string
  name: string
  color: string
}

export interface Address {
  name: string
  phone: string
  province: string
  city: string
  district: string
  street: string
  postcode: string
  tags: string[]
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
  isCustom?: boolean
}

export const CUSTOM_SIZE_ID = 'custom'

export const MIN_ENVELOPE_MM = 90
export const MAX_ENVELOPE_MM = 200

export const DEFAULT_CUSTOM_WIDTH = 140
export const DEFAULT_CUSTOM_HEIGHT = 200

export const MM_TO_PX = 3.78

export function mmToPx(mm: number, scale = 1): number {
  return Math.round(mm * MM_TO_PX * scale)
}

export function getEnvelopePixelSize(
  widthMm: number,
  heightMm: number,
  scale = 1,
): { width: number; height: number } {
  return {
    width: mmToPx(widthMm, scale),
    height: mmToPx(heightMm, scale),
  }
}

export function isSizeInRange(value: number): boolean {
  return value >= MIN_ENVELOPE_MM && value <= MAX_ENVELOPE_MM
}

export function clampSize(value: number): number {
  return Math.min(Math.max(value, MIN_ENVELOPE_MM), MAX_ENVELOPE_MM)
}

export function getSizeDescription(widthMm: number, heightMm: number): string {
  return `${widthMm} × ${heightMm} mm`
}

export function createCustomSize(widthMm: number, heightMm: number): EnvelopeSize {
  return {
    id: CUSTOM_SIZE_ID,
    label: '自定义',
    widthMm,
    heightMm,
    description: getSizeDescription(widthMm, heightMm),
    isCustom: true,
  }
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
  createCustomSize(DEFAULT_CUSTOM_WIDTH, DEFAULT_CUSTOM_HEIGHT),
]

export const STORAGE_KEY = 'envelope-preview-data'
export const ADDRESS_LIST_KEY = 'envelope-address-list'
export const TEMPLATE_LIST_KEY = 'envelope-template-list'
export const UI_SETTINGS_KEY = 'envelope-ui-settings'
export const TAG_LIST_KEY = 'envelope-tag-list'
export const ADDRESS_HISTORY_KEY = 'envelope-address-history'
export const MAX_HISTORY_ITEMS = 20

export const DEFAULT_TAG_COLORS = [
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#eab308',
  '#84cc16',
  '#22c55e',
  '#10b981',
  '#14b8a6',
  '#06b6d4',
  '#0ea5e9',
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#a855f7',
  '#d946ef',
  '#ec4899',
  '#f43f5e',
  '#64748b',
]

export interface CustomSizeSettings {
  widthMm: number
  heightMm: number
}

export interface EnvelopeUiSettings {
  layout: LayoutStyle
  sizeId: string
  side: EnvelopeSide
  customSize: CustomSizeSettings
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
  customSize?: CustomSizeSettings
}

export function generateTemplateId(): string {
  return `tmpl_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

export function generateTagId(): string {
  return `tag_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
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
    tags: [],
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

export interface AddressHistoryItem {
  id: string
  address: Address
  lastUsedAt: number
}

export function generateHistoryId(): string {
  return `hist_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}
