import {
  createEmptyAddress,
  DEFAULT_TAG_COLORS,
  generateTagId,
  getAddressKey,
  type Address,
  type Tag,
} from '../types/envelope'

export const FIELD_ALIASES: Record<string, keyof Address | 'tags'> = {
  name: 'name',
  姓名: 'name',
  phone: 'phone',
  tel: 'phone',
  telephone: 'phone',
  电话: 'phone',
  手机: 'phone',
  联系电话: 'phone',
  province: 'province',
  省: 'province',
  省份: 'province',
  '省/州': 'province',
  city: 'city',
  市: 'city',
  城市: 'city',
  district: 'district',
  区: 'district',
  区县: 'district',
  '区/县': 'district',
  street: 'street',
  address: 'street',
  地址: 'street',
  详细地址: 'street',
  postcode: 'postcode',
  'post code': 'postcode',
  'postal code': 'postcode',
  zip: 'postcode',
  'zip code': 'postcode',
  邮编: 'postcode',
  邮政编码: 'postcode',
  tags: 'tags',
  tag: 'tags',
  标签: 'tags',
  分组: 'tags',
  分类: 'tags',
  category: 'tags',
  categories: 'tags',
  groups: 'tags',
  group: 'tags',
}

export const FIELD_LABELS_CN: Record<string, string> = {
  name: '姓名',
  phone: '电话',
  province: '省/州',
  city: '城市',
  district: '区/县',
  street: '详细地址',
  postcode: '邮政编码',
  tags: '标签',
}

export function resolveFieldKey(rawHeader: string): keyof Address | 'tags' | undefined {
  const trimmed = String(rawHeader || '').trim()
  const normalized = trimmed.toLowerCase()
  return FIELD_ALIASES[trimmed] || FIELD_ALIASES[normalized]
}

export function validateAddress(address: Address): string | null {
  if (!address.name.trim()) return '姓名不能为空'
  if (!address.province.trim() && !address.city.trim() && !address.street.trim()) {
    return '地址信息不完整（至少需要省、城市或详细地址之一）'
  }
  return null
}

export function parseTagsValue(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((v) => String(v).trim()).filter(Boolean)
  }
  if (typeof value === 'string' && value.trim()) {
    return value
      .split(/[;；,，|、\s]+/)
      .map((n) => n.trim())
      .filter(Boolean)
  }
  return []
}

export interface ProcessAddressContext {
  existingAddresses: Address[]
  existingTags: Tag[]
}

export interface ProcessAddressResult {
  address: Address | null
  error: string | null
  isDuplicate: boolean
  newTags: Tag[]
}

export class AddressProcessor {
  private existingKeys: Set<string>
  private parsedKeys: Set<string> = new Set()
  private tagMap: Map<string, Tag>
  private autoTagColorIndex: number
  private autoCreatedTags: Tag[] = []

  constructor(ctx: ProcessAddressContext) {
    this.existingKeys = new Set(ctx.existingAddresses.map((a) => getAddressKey(a)))
    this.tagMap = new Map()
    ctx.existingTags.forEach((tag) => {
      this.tagMap.set(tag.name.trim().toLowerCase(), tag)
    })
    this.autoTagColorIndex = ctx.existingTags.length % DEFAULT_TAG_COLORS.length
  }

  process(rawTags: string[], fieldValues: Partial<Record<keyof Address, string>>): ProcessAddressResult {
    const address = createEmptyAddress()

    for (const [key, value] of Object.entries(fieldValues) as [keyof Address, string][]) {
      ;(address as unknown as Record<string, string>)[key] = value
    }

    const newTags: Tag[] = []
    if (rawTags.length > 0) {
      const tagIds: string[] = []
      rawTags.forEach((name) => {
        const nameLower = name.toLowerCase()
        let tag = this.tagMap.get(nameLower)
        if (!tag) {
          const color = DEFAULT_TAG_COLORS[this.autoTagColorIndex % DEFAULT_TAG_COLORS.length]
          this.autoTagColorIndex++
          tag = {
            id: generateTagId(),
            name,
            color,
          }
          this.tagMap.set(nameLower, tag)
          this.autoCreatedTags.push(tag)
          newTags.push(tag)
        }
        if (!tagIds.includes(tag.id)) {
          tagIds.push(tag.id)
        }
      })
      address.tags = tagIds
    }

    const validationError = validateAddress(address)
    if (validationError) {
      return { address: null, error: validationError, isDuplicate: false, newTags }
    }

    const key = getAddressKey(address)
    if (this.existingKeys.has(key) || this.parsedKeys.has(key)) {
      return { address: null, error: '该地址已存在，已跳过', isDuplicate: true, newTags }
    }

    this.parsedKeys.add(key)
    return { address, error: null, isDuplicate: false, newTags }
  }

  getAutoCreatedTags(): Tag[] {
    return this.autoCreatedTags
  }
}

export function resolveTagNames(address: Address, tagList: Tag[]): string {
  return address.tags
    .map((tagId) => tagList.find((t) => t.id === tagId)?.name)
    .filter(Boolean)
    .join(';')
}

export function resolveTagNamesArray(address: Address, tagList: Tag[]): string[] {
  return address.tags
    .map((tagId) => tagList.find((t) => t.id === tagId)?.name)
    .filter((n): n is string => Boolean(n))
}
