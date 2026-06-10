import { type Address, type Tag } from '../types/envelope';
import {
  AddressProcessor,
  FIELD_LABELS_CN,
  parseTagsValue,
  resolveFieldKey,
  resolveTagNames,
  resolveTagNamesArray,
  type ProcessAddressContext,
} from './addressUtils';

export interface ParseResult {
  success: boolean;
  total: number;
  successCount: number;
  failCount: number;
  duplicateCount: number;
  addresses: Address[];
  errors: ParseError[];
  autoCreatedTags: Tag[];
}

export interface ParseError {
  line?: number;
  row?: number;
  index?: number;
  message: string;
}

export interface CsvParseResult extends ParseResult {
  errors: CsvParseError[];
}

export interface CsvParseError extends ParseError {
  line: number;
}

export interface JsonParseResult extends ParseResult {
  errors: JsonParseError[];
}

export interface JsonParseError extends ParseError {
  index: number;
}

export interface ExportField {
  key: keyof Address | 'tags';
  label: string;
}

export const DEFAULT_EXPORT_FIELDS: ExportField[] = [
  { key: 'name', label: FIELD_LABELS_CN.name },
  { key: 'phone', label: FIELD_LABELS_CN.phone },
  { key: 'province', label: FIELD_LABELS_CN.province },
  { key: 'city', label: FIELD_LABELS_CN.city },
  { key: 'district', label: FIELD_LABELS_CN.district },
  { key: 'street', label: FIELD_LABELS_CN.street },
  { key: 'postcode', label: FIELD_LABELS_CN.postcode },
  { key: 'tags', label: FIELD_LABELS_CN.tags },
];

type CsvFieldKey = keyof Address | 'tags';

function stripBom(text: string): string {
  if (text.charCodeAt(0) === 0xfeff) {
    return text.slice(1);
  }
  return text;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
  }
  result.push(current.trim());
  return result;
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
  };

  const cleanText = stripBom(text);
  const normalizedText = cleanText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalizedText.split('\n').filter((line) => line.trim().length > 0);

  if (lines.length === 0) {
    result.errors.push({ line: 0, message: 'CSV 文件为空' });
    return result;
  }

  const headerLine = parseCsvLine(lines[0]);
  const headerMapping: Map<number, CsvFieldKey> = new Map();

  headerLine.forEach((header, index) => {
    const fieldKey = resolveFieldKey(header);
    if (fieldKey) {
      headerMapping.set(index, fieldKey);
    }
  });

  if (headerMapping.size === 0) {
    const supportedHeaders = Object.values(FIELD_LABELS_CN).join('、');
    result.errors.push({
      line: 1,
      message: `未识别到有效表头。支持的表头包括：${supportedHeaders}`,
    });
    return result;
  }

  const ctx: ProcessAddressContext = { existingAddresses, existingTags };
  const processor = new AddressProcessor(ctx);

  const dataLines = lines.slice(1);
  result.total = dataLines.length;

  dataLines.forEach((line, idx) => {
    const lineNumber = idx + 2;
    const values = parseCsvLine(line);
    const fieldValues: Partial<Record<keyof Address, string>> = {};
    let rawTagsValue = '';

    headerMapping.forEach((fieldKey, colIndex) => {
      const value = values[colIndex] || '';
      if (fieldKey === 'tags') {
        rawTagsValue = value;
      } else {
        fieldValues[fieldKey as keyof Address] = value;
      }
    });

    const rawTagNames = parseTagsValue(rawTagsValue);

    const processed = processor.process(rawTagNames, fieldValues);

    if (processed.isDuplicate) {
      result.duplicateCount++;
      result.errors.push({ line: lineNumber, message: processed.error! });
      return;
    }

    if (processed.error) {
      result.failCount++;
      result.errors.push({ line: lineNumber, message: processed.error });
      return;
    }

    result.successCount++;
    result.addresses.push(processed.address!);
  });

  result.autoCreatedTags = processor.getAutoCreatedTags();
  result.success = result.failCount === 0;
  return result;
}

export function readCsvFile(
  file: File,
  existingAddresses: Address[] = [],
  existingTags: Tag[] = [],
  onProgress?: (percent: number) => void,
): Promise<CsvParseResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      }
    };

    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (onProgress) onProgress(100);
        resolve(parseCsv(text, existingAddresses, existingTags));
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('文件读取失败'));
    };

    reader.readAsText(file, 'utf-8');
  });
}

export function generateCsvTemplate(): string {
  const headers = Object.values(FIELD_LABELS_CN);
  const example = [
    '张三',
    '13800138000',
    '北京市',
    '北京市',
    '海淀区',
    '中关村大街1号',
    '100080',
    '家人;重要',
  ];
  return [headers.join(','), example.join(',')].join('\n');
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
  };

  const cleanText = stripBom(text).trim();
  if (!cleanText) {
    result.errors.push({ index: 0, message: 'JSON 文件为空' });
    return result;
  }

  let data: unknown;
  try {
    data = JSON.parse(cleanText);
  } catch {
    result.errors.push({ index: 0, message: 'JSON 格式错误，无法解析' });
    return result;
  }

  let records: unknown[] = [];
  if (Array.isArray(data)) {
    records = data;
  } else if (data && typeof data === 'object') {
    if (Array.isArray((data as Record<string, unknown>).addresses)) {
      records = (data as Record<string, unknown>).addresses as unknown[];
    } else if (Array.isArray((data as Record<string, unknown>).data)) {
      records = (data as Record<string, unknown>).data as unknown[];
    } else if (Array.isArray((data as Record<string, unknown>).list)) {
      records = (data as Record<string, unknown>).list as unknown[];
    } else {
      records = [data];
    }
  } else {
    result.errors.push({ index: 0, message: 'JSON 数据格式不正确，应为数组或对象' });
    return result;
  }

  if (records.length === 0) {
    result.errors.push({ index: 0, message: 'JSON 文件中没有地址数据' });
    return result;
  }

  const ctx: ProcessAddressContext = { existingAddresses, existingTags };
  const processor = new AddressProcessor(ctx);

  result.total = records.length;

  records.forEach((record, idx) => {
    const index = idx + 1;
    if (!record || typeof record !== 'object') {
      result.failCount++;
      result.errors.push({ index, message: '数据格式不正确，应为对象' });
      return;
    }

    const recordObj = record as Record<string, unknown>;
    const fieldValues: Partial<Record<keyof Address, string>> = {};
    const rawTagNames: string[] = [];

    Object.entries(recordObj).forEach(([key, value]) => {
      const fieldKey = resolveFieldKey(key);
      if (fieldKey) {
        if (fieldKey === 'tags') {
          rawTagNames.push(...parseTagsValue(value));
        } else {
          fieldValues[fieldKey as keyof Address] = String(value ?? '').trim();
        }
      }
    });

    const processed = processor.process(rawTagNames, fieldValues);

    if (processed.isDuplicate) {
      result.duplicateCount++;
      result.errors.push({ index, message: processed.error! });
      return;
    }

    if (processed.error) {
      result.failCount++;
      result.errors.push({ index, message: processed.error });
      return;
    }

    result.successCount++;
    result.addresses.push(processed.address!);
  });

  result.autoCreatedTags = processor.getAutoCreatedTags();
  result.success = result.failCount === 0;
  return result;
}

export function readJsonFile(
  file: File,
  existingAddresses: Address[] = [],
  existingTags: Tag[] = [],
  onProgress?: (percent: number) => void,
): Promise<JsonParseResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      }
    };

    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (onProgress) onProgress(100);
        resolve(parseJson(text, existingAddresses, existingTags));
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('文件读取失败'));
    };

    reader.readAsText(file, 'utf-8');
  });
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
  );
}

function escapeCsvValue(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function generateCsvContent(
  addresses: Address[],
  fields: ExportField[] = DEFAULT_EXPORT_FIELDS,
  tagList: Tag[] = [],
): string {
  const headers = fields.map((f) => f.label);
  const rows = addresses.map((addr) => {
    return fields.map((field) => {
      if (field.key === 'tags') {
        return resolveTagNames(addr, tagList);
      }
      return addr[field.key as keyof Address] as string;
    });
  });

  const lines = [headers.map(escapeCsvValue).join(',')];
  rows.forEach((row) => {
    lines.push(row.map(escapeCsvValue).join(','));
  });
  return lines.join('\n');
}

export function downloadCsvFile(
  addresses: Address[],
  fields: ExportField[] = DEFAULT_EXPORT_FIELDS,
  tagList: Tag[] = [],
  filename: string = 'addresses.csv',
): void {
  const content = generateCsvContent(addresses, fields, tagList);
  const blob = new Blob(['\ufeff' + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function generateJsonContent(
  addresses: Address[],
  fields: ExportField[] = DEFAULT_EXPORT_FIELDS,
  tagList: Tag[] = [],
): string {
  const data = addresses.map((addr) => {
    const obj: Record<string, unknown> = {};
    fields.forEach((field) => {
      if (field.key === 'tags') {
        obj[field.label] = resolveTagNamesArray(addr, tagList);
      } else {
        obj[field.label] = addr[field.key as keyof Address];
      }
    });
    return obj;
  });
  return JSON.stringify(data, null, 2);
}

export function downloadJsonFile(
  addresses: Address[],
  fields: ExportField[] = DEFAULT_EXPORT_FIELDS,
  tagList: Tag[] = [],
  filename: string = 'addresses.json',
): void {
  const content = generateJsonContent(addresses, fields, tagList);
  const blob = new Blob([content], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
