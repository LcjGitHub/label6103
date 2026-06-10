import {
  createEmptyAddress,
  DEFAULT_TAG_COLORS,
  generateTagId,
  getAddressKey,
  type Address,
  type Tag,
} from '../types/envelope'

export interface ParseResult {
  success: boolean
  total: number
  successCount: number
  failCount: number
  duplicateCount: number
  addresses: Address[]
  errors: ParseError[]
  autoCreatedTags: Tag[]
}

export interface ParseError {
  line?: number
  row?: number
  index?: number
  message: string
}

export interface CsvParseResult extends ParseResult {
  errors: CsvParseError[]
}

export interface CsvParseError extends ParseError {
  line: number
}

export interface JsonParseResult extends ParseResult {
  errors: JsonParseError[]
}

export interface JsonParseError extends ParseError {
  index: number
}

export interface ExportField {
  key: keyof Address | 'tags'
  label: string
}

export const DEFAULT_EXPORT_FIELDS: ExportField[] = [
  { key: 'name', label: '姓名' },
  { key: 'phone', label: '电话' },
  { key: 'province', label: '省/州' },
  { key: 'city', label: '城市' },
  { key: 'district', label: '区/县' },
  { key: 'street', label: '详细地址' },
  { key: 'postcode', label: '邮政编码' },
  { key: 'tags', label: '标签' },
]

const CSV_HEADERS_CN: Record<string, string> = {
  name: '姓名',
  phone: '电话',
  province: '省/州',
  city: '城市',
  district: '区/县',
  street: '详细地址',
  postcode: '邮政编码',
  tags: '标签',
}

type CsvFieldKey = keyof Address | 'tags'

const CSV_HEADER_ALIASES: Record<string, CsvFieldKey> = {
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

function stripBom(text: string): string {
  if (text.charCodeAt(0) === 0xfeff) {
    return text.slice(1)
  }
  return text
}

function parseCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        current += '"'
        i++
      } else if (char === '"') {
        inQuotes = false
      } else {
        current += char
      }
    } else {
      if (char === '"') {
        inQuotes = true
      } else if (char === ',') {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
  }
  result.push(current.trim())
  return result
}

function validateAddress(address: Address): string | null {
  if (!address.name.trim()) return '姓名不能为空'
  if (!address.province.trim() && !address.city.trim() && !address.street.trim()) {
    return '地址信息不完整（至少需要省、城市或详细地址之一）'
  }
  return null
}

export function parseCsv(
  text: string,
  existingAddresses: Address[] = [],
  existingTags: Tag[] = [],
): CsvParseResult {
  const result: CsvParseResult = {
    success: false,
    total: 0,
    successCount: 0,
    failCount: 0,
    duplicateCount: 0,
    addresses: [],
    errors: [],
    autoCreatedTags: [],
  }

  const cleanText = stripBom(text)
  const normalizedText = cleanText.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  const lines = normalizedText.split('\n').filter((line) => line.trim().length > 0)

  if (lines.length === 0) {
    result.errors.push({ line: 0, message: 'CSV 文件为空' })
    return result
  }

  const headerLine = parseCsvLine(lines[0])
  const headerMapping: Map<number, CsvFieldKey> = new Map()

  headerLine.forEach((header, index) => {
    const trimmed = header.trim()
    const normalizedHeader = trimmed.toLowerCase()
    const fieldKey = CSV_HEADER_ALIASES[trimmed] || CSV_HEADER_ALIASES[normalizedHeader]
    if (fieldKey) {
      headerMapping.set(index, fieldKey)
    }
  })

  if (headerMapping.size === 0) {
    const supportedHeaders = Object.values(CSV_HEADERS_CN).join('、')
    result.errors.push({
      line: 1,
      message: `未识别到有效表头。支持的表头包括：${supportedHeaders}`,
    })
    return result
  }

  const existingKeys = new Set(existingAddresses.map((a) => getAddressKey(a)))
  const parsedKeys = new Set<string>()

  const tagMap = new Map<string, Tag>()
  existingTags.forEach((tag) => {
    tagMap.set(tag.name.trim().toLowerCase(), tag)
  })
  let autoTagColorIndex = existingTags.length % DEFAULT_TAG_COLORS.length

  const dataLines = lines.slice(1)
  result.total = dataLines.length

  dataLines.forEach((line, idx) => {
    const lineNumber = idx + 2
    const values = parseCsvLine(line)
    const address = createEmptyAddress()
    let rawTagsValue = ''

    headerMapping.forEach((fieldKey, colIndex) => {
      const value = values[colIndex] || ''
      if (fieldKey === 'tags') {
        rawTagsValue = value
      } else {
        ;(address as unknown as Record<string, string>)[fieldKey] = value
      }
    })

    if (rawTagsValue.trim()) {
      const tagNames = rawTagsValue
        .split(/[;；,，|、\s]+/)
        .map((n) => n.trim())
        .filter(Boolean)
      const tagIds: string[] = []

      tagNames.forEach((name) => {
        const nameLower = name.toLowerCase()
        let tag = tagMap.get(nameLower)
        if (!tag) {
          const color = DEFAULT_TAG_COLORS[autoTagColorIndex % DEFAULT_TAG_COLORS.length]
          autoTagColorIndex++
          tag = {
            id: generateTagId(),
            name,
            color,
          }
          tagMap.set(nameLower, tag)
          result.autoCreatedTags.push(tag)
        }
        if (!tagIds.includes(tag.id)) {
          tagIds.push(tag.id)
        }
      })

      address.tags = tagIds
    }

    const validationError = validateAddress(address)
    if (validationError) {
      result.failCount++
      result.errors.push({ line: lineNumber, message: validationError })
      return
    }

    const key = getAddressKey(address)
    if (existingKeys.has(key) || parsedKeys.has(key)) {
      result.duplicateCount++
      result.errors.push({ line: lineNumber, message: '该地址已存在，已跳过' })
      return
    }

    parsedKeys.add(key)
    result.successCount++
    result.addresses.push(address)
  })

  result.success = result.failCount === 0
  return result
}

export function readCsvFile(
  file: File,
  existingAddresses: Address[] = [],
  existingTags: Tag[] = [],
  onProgress?: (percent: number) => void,
): Promise<CsvParseResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const percent = Math.round((event.loaded / event.total) * 100)
        onProgress(percent)
      }
    }

    reader.onload = (event) => {
      try {
        const text = event.target?.result as string
        if (onProgress) onProgress(100)
        resolve(parseCsv(text, existingAddresses, existingTags))
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => {
      reject(new Error('文件读取失败'))
    }

    reader.readAsText(file, 'utf-8')
  })
}

export function generateCsvTemplate(): string {
  const headers = ['姓名', '电话', '省/州', '城市', '区/县', '详细地址', '邮政编码', '标签']
  const example = [
    '张三',
    '13800138000',
    '北京市',
    '北京市',
    '海淀区',
    '中关村大街1号',
    '100080',
    '家人;重要',
  ]
  return [headers.join(','), example.join(',')].join('\n')
}

const JSON_FIELD_ALIASES: Record<string, keyof Address | 'tags'> = {
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

function parseTagsValue(value: unknown): string[] {
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

export function parseJson(
  text: string,
  existingAddresses: Address[] = [],
  existingTags: Tag[] = [],
): JsonParseResult {
  const result: JsonParseResult = {
    success: false,
    total: 0,
    successCount: 0,
    failCount: 0,
    duplicateCount: 0,
    addresses: [],
    errors: [],
    autoCreatedTags: [],
  }

  const cleanText = stripBom(text).trim()
  if (!cleanText) {
    result.errors.push({ index: 0, message: 'JSON 文件为空' })
    return result
  }

  let data: unknown
  try {
    data = JSON.parse(cleanText)
  } catch {
    result.errors.push({ index: 0, message: 'JSON 格式错误，无法解析' })
    return result
  }

  let records: unknown[] = []
  if (Array.isArray(data)) {
    records = data
  } else if (data && typeof data === 'object') {
    if (Array.isArray((data as Record<string, unknown>).addresses)) {
      records = (data as Record<string, unknown>).addresses as unknown[]
    } else if (Array.isArray((data as Record<string, unknown>).data)) {
      records = (data as Record<string, unknown>).data as unknown[]
    } else if (Array.isArray((data as Record<string, unknown>).list)) {
      records = (data as Record<string, unknown>).list as unknown[]
    } else {
      records = [data]
    }
  } else {
    result.errors.push({ index: 0, message: 'JSON 数据格式不正确，应为数组或对象' })
    return result
  }

  if (records.length === 0) {
    result.errors.push({ index: 0, message: 'JSON 文件中没有地址数据' })
    return result
  }

  const existingKeys = new Set(existingAddresses.map((a) => getAddressKey(a)))
  const parsedKeys = new Set<string>()

  const tagMap = new Map<string, Tag>()
  existingTags.forEach((tag) => {
    tagMap.set(tag.name.trim().toLowerCase(), tag)
  })
  let autoTagColorIndex = existingTags.length % DEFAULT_TAG_COLORS.length

  result.total = records.length

  records.forEach((record, idx) => {
    const index = idx + 1
    if (!record || typeof record !== 'object') {
      result.failCount++
      result.errors.push({ index, message: '数据格式不正确，应为对象' })
      return
    }

    const recordObj = record as Record<string, unknown>
    const address = createEmptyAddress()
    const rawTagNames: string[] = []

    Object.entries(recordObj).forEach(([key, value]) => {
      const trimmedKey = key.trim()
      const normalizedKey = trimmedKey.toLowerCase()
      const fieldKey = JSON_FIELD_ALIASES[trimmedKey] || JSON_FIELD_ALIASES[normalizedKey]

      if (fieldKey) {
        if (fieldKey === 'tags') {
          rawTagNames.push(...parseTagsValue(value))
        } else {
          ;(address as unknown as Record<string, string>)[fieldKey] = String(value ?? '').trim()
        }
      }
    })

    if (rawTagNames.length > 0) {
      const tagIds: string[] = []
      rawTagNames.forEach((name) => {
        const nameLower = name.toLowerCase()
        let tag = tagMap.get(nameLower)
        if (!tag) {
          const color = DEFAULT_TAG_COLORS[autoTagColorIndex % DEFAULT_TAG_COLORS.length]
          autoTagColorIndex++
          tag = {
            id: generateTagId(),
            name,
            color,
          }
          tagMap.set(nameLower, tag)
          result.autoCreatedTags.push(tag)
        }
        if (!tagIds.includes(tag.id)) {
          tagIds.push(tag.id)
        }
      })
      address.tags = tagIds
    }

    const validationError = validateAddress(address)
    if (validationError) {
      result.failCount++
      result.errors.push({ index, message: validationError })
      return
    }

    const key = getAddressKey(address)
    if (existingKeys.has(key) || parsedKeys.has(key)) {
      result.duplicateCount++
      result.errors.push({ index, message: '该地址已存在，已跳过' })
      return
    }

    parsedKeys.add(key)
    result.successCount++
    result.addresses.push(address)
  })

  result.success = result.failCount === 0
  return result
}

export function readJsonFile(
  file: File,
  existingAddresses: Address[] = [],
  existingTags: Tag[] = [],
  onProgress?: (percent: number) => void,
): Promise<JsonParseResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const percent = Math.round((event.loaded / event.total) * 100)
        onProgress(percent)
      }
    }

    reader.onload = (event) => {
      try {
        const text = event.target?.result as string
        if (onProgress) onProgress(100)
        resolve(parseJson(text, existingAddresses, existingTags))
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => {
      reject(new Error('文件读取失败'))
    }

    reader.readAsText(file, 'utf-8')
  })
}

export function generateJsonTemplate(): string {
  return JSON.stringify(
    [
      {
        姓名: '张三',
        电话: '13800138000',
        省: '北京市',
        城市: '北京市',
        区: '海淀区',
        详细地址: '中关村大街1号',
        邮政编码: '100080',
        标签: ['家人', '重要'],
      },
    ],
    null,
    2,
  )
}

function resolveTagNames(address: Address, tagList: Tag[]): string {
  return address.tags
    .map((tagId) => tagList.find((t) => t.id === tagId)?.name)
    .filter(Boolean)
    .join(';')
}

function escapeCsvValue(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function generateCsvContent(
  addresses: Address[],
  fields: ExportField[] = DEFAULT_EXPORT_FIELDS,
  tagList: Tag[] = [],
): string {
  const headers = fields.map((f) => f.label)
  const rows = addresses.map((addr) => {
    return fields.map((field) => {
      if (field.key === 'tags') {
        return resolveTagNames(addr, tagList)
      }
      return addr[field.key as keyof Address] as string
    })
  })

  const lines = [headers.map(escapeCsvValue).join(',')]
  rows.forEach((row) => {
    lines.push(row.map(escapeCsvValue).join(','))
  })
  return lines.join('\n')
}

export function downloadCsvFile(
  addresses: Address[],
  fields: ExportField[] = DEFAULT_EXPORT_FIELDS,
  tagList: Tag[] = [],
  filename: string = 'addresses.csv',
): void {
  const content = generateCsvContent(addresses, fields, tagList)
  const blob = new Blob(['\ufeff' + content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function generateJsonContent(
  addresses: Address[],
  fields: ExportField[] = DEFAULT_EXPORT_FIELDS,
  tagList: Tag[] = [],
): string {
  const data = addresses.map((addr) => {
    const obj: Record<string, unknown> = {}
    fields.forEach((field) => {
      if (field.key === 'tags') {
        obj[field.label] = addr.tags
          .map((tagId) => tagList.find((t) => t.id === tagId)?.name)
          .filter(Boolean)
      } else {
        obj[field.label] = addr[field.key as keyof Address]
      }
    })
    return obj
  })
  return JSON.stringify(data, null, 2)
}

export function downloadJsonFile(
  addresses: Address[],
  fields: ExportField[] = DEFAULT_EXPORT_FIELDS,
  tagList: Tag[] = [],
  filename: string = 'addresses.json',
): void {
  const content = generateJsonContent(addresses, fields, tagList)
  const blob = new Blob([content], { type: 'application/json;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
