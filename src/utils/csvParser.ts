import { createEmptyAddress, getAddressKey, type Address } from '../types/envelope'

export interface CsvParseResult {
  success: boolean
  total: number
  successCount: number
  failCount: number
  duplicateCount: number
  addresses: Address[]
  errors: CsvParseError[]
}

export interface CsvParseError {
  line: number
  message: string
}

const CSV_HEADERS_CN: Record<keyof Address, string> = {
  name: '姓名',
  phone: '电话',
  province: '省/州',
  city: '城市',
  district: '区/县',
  street: '详细地址',
  postcode: '邮政编码',
}

const CSV_HEADER_ALIASES: Record<string, keyof Address> = {
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

export function parseCsv(text: string, existingAddresses: Address[] = []): CsvParseResult {
  const result: CsvParseResult = {
    success: false,
    total: 0,
    successCount: 0,
    failCount: 0,
    duplicateCount: 0,
    addresses: [],
    errors: [],
  }

  const cleanText = stripBom(text)
  const normalizedText = cleanText.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  const lines = normalizedText.split('\n').filter((line) => line.trim().length > 0)

  if (lines.length === 0) {
    result.errors.push({ line: 0, message: 'CSV 文件为空' })
    return result
  }

  const headerLine = parseCsvLine(lines[0])
  const headerMapping: Map<number, keyof Address> = new Map()

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

  const dataLines = lines.slice(1)
  result.total = dataLines.length

  dataLines.forEach((line, idx) => {
    const lineNumber = idx + 2
    const values = parseCsvLine(line)
    const address = createEmptyAddress()

    headerMapping.forEach((fieldKey, colIndex) => {
      const value = values[colIndex] || ''
      ;(address as unknown as Record<string, string>)[fieldKey] = value
    })

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
        resolve(parseCsv(text, existingAddresses))
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
  const headers = ['姓名', '电话', '省/州', '城市', '区/县', '详细地址', '邮政编码']
  const example = ['张三', '13800138000', '北京市', '北京市', '海淀区', '中关村大街1号', '100080']
  return [headers.join(','), example.join(',')].join('\n')
}
