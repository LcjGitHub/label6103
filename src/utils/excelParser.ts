import * as XLSX from 'xlsx'
import {
  createEmptyAddress,
  DEFAULT_TAG_COLORS,
  generateTagId,
  getAddressKey,
  type Address,
  type Tag,
} from '../types/envelope'

export interface ExcelParseResult {
  success: boolean
  total: number
  successCount: number
  failCount: number
  duplicateCount: number
  addresses: Address[]
  errors: ExcelParseError[]
  autoCreatedTags: Tag[]
}

export interface ExcelParseError {
  row: number
  message: string
}

const EXCEL_HEADERS_CN: Record<string, string> = {
  name: '姓名',
  phone: '电话',
  province: '省/州',
  city: '城市',
  district: '区/县',
  street: '详细地址',
  postcode: '邮政编码',
  tags: '标签',
}

type ExcelFieldKey = keyof Address | 'tags'

const EXCEL_HEADER_ALIASES: Record<string, ExcelFieldKey> = {
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

function validateAddress(address: Address): string | null {
  if (!address.name.trim()) return '姓名不能为空'
  if (!address.province.trim() && !address.city.trim() && !address.street.trim()) {
    return '地址信息不完整（至少需要省、城市或详细地址之一）'
  }
  return null
}

function normalizeHeader(header: string): string {
  return String(header || '').trim().toLowerCase()
}

export function parseExcelWorkbook(
  workbook: XLSX.WorkBook,
  existingAddresses: Address[] = [],
  existingTags: Tag[] = [],
): ExcelParseResult {
  const result: ExcelParseResult = {
    success: false,
    total: 0,
    successCount: 0,
    failCount: 0,
    duplicateCount: 0,
    addresses: [],
    errors: [],
    autoCreatedTags: [],
  }

  const sheetName = workbook.SheetNames[0]
  if (!sheetName) {
    result.errors.push({ row: 0, message: 'Excel 文件中没有工作表' })
    return result
  }

  const worksheet = workbook.Sheets[sheetName]
  const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
    defval: '',
    raw: false,
  })

  if (jsonData.length === 0) {
    result.errors.push({ row: 0, message: 'Excel 文件为空或没有数据行' })
    return result
  }

  const firstRow = jsonData[0]
  const headerMapping: Map<string, ExcelFieldKey> = new Map()

  Object.keys(firstRow).forEach((header) => {
    const trimmed = String(header).trim()
    const normalized = normalizeHeader(header)
    const fieldKey = EXCEL_HEADER_ALIASES[trimmed] || EXCEL_HEADER_ALIASES[normalized]
    if (fieldKey) {
      headerMapping.set(header, fieldKey)
    }
  })

  if (headerMapping.size === 0) {
    const supportedHeaders = Object.values(EXCEL_HEADERS_CN).join('、')
    result.errors.push({
      row: 1,
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

  result.total = jsonData.length

  jsonData.forEach((row, idx) => {
    const rowNumber = idx + 2
    const address = createEmptyAddress()
    let rawTagsValue = ''

    headerMapping.forEach((fieldKey, headerKey) => {
      const value = String(row[headerKey] ?? '').trim()
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
      result.errors.push({ row: rowNumber, message: validationError })
      return
    }

    const key = getAddressKey(address)
    if (existingKeys.has(key) || parsedKeys.has(key)) {
      result.duplicateCount++
      result.errors.push({ row: rowNumber, message: '该地址已存在，已跳过' })
      return
    }

    parsedKeys.add(key)
    result.successCount++
    result.addresses.push(address)
  })

  result.success = result.failCount === 0
  return result
}

export function readExcelFile(
  file: File,
  existingAddresses: Address[] = [],
  existingTags: Tag[] = [],
  onProgress?: (percent: number) => void,
): Promise<ExcelParseResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const percent = Math.round((event.loaded / event.total) * 50)
        onProgress(percent)
      }
    }

    reader.onload = (event) => {
      try {
        if (onProgress) onProgress(60)
        const data = event.target?.result
        const workbook = XLSX.read(data, { type: 'binary' })
        if (onProgress) onProgress(80)
        const result = parseExcelWorkbook(workbook, existingAddresses, existingTags)
        if (onProgress) onProgress(100)
        resolve(result)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => {
      reject(new Error('文件读取失败'))
    }

    reader.readAsBinaryString(file)
  })
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

function resolveTagNames(address: Address, tagList: Tag[]): string {
  return address.tags
    .map((tagId) => tagList.find((t) => t.id === tagId)?.name)
    .filter(Boolean)
    .join(';')
}

export function generateExcelWorkbook(
  addresses: Address[],
  fields: ExportField[] = DEFAULT_EXPORT_FIELDS,
  tagList: Tag[] = [],
): XLSX.WorkBook {
  const headers = fields.map((f) => f.label)
  const rows = addresses.map((addr) => {
    const row: Record<string, string> = {}
    fields.forEach((field) => {
      if (field.key === 'tags') {
        row[field.label] = resolveTagNames(addr, tagList)
      } else {
        row[field.label] = addr[field.key as keyof Address] as string
      }
    })
    return row
  })

  const worksheet = XLSX.utils.json_to_sheet(rows, { header: headers })
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Addresses')
  return workbook
}

export function downloadExcelFile(
  addresses: Address[],
  fields: ExportField[] = DEFAULT_EXPORT_FIELDS,
  tagList: Tag[] = [],
  filename: string = 'addresses.xlsx',
): void {
  const workbook = generateExcelWorkbook(addresses, fields, tagList)
  XLSX.writeFile(workbook, filename)
}
