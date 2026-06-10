import * as XLSX from 'xlsx';
import { type Address, type Tag } from '../types/envelope';
import {
  AddressProcessor,
  FIELD_LABELS_CN,
  parseTagsValue,
  resolveFieldKey,
  resolveTagNames,
  type ProcessAddressContext,
} from './addressUtils';

export interface ExcelParseResult {
  success: boolean;
  total: number;
  successCount: number;
  failCount: number;
  duplicateCount: number;
  addresses: Address[];
  errors: ExcelParseError[];
  autoCreatedTags: Tag[];
}

export interface ExcelParseError {
  row: number;
  message: string;
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

type ExcelFieldKey = keyof Address | 'tags';

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
  };

  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    result.errors.push({ row: 0, message: 'Excel 文件中没有工作表' });
    return result;
  }

  const worksheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
    defval: '',
    raw: false,
  });

  if (jsonData.length === 0) {
    result.errors.push({ row: 0, message: 'Excel 文件为空或没有数据行' });
    return result;
  }

  const firstRow = jsonData[0];
  const headerMapping: Map<string, ExcelFieldKey> = new Map();

  Object.keys(firstRow).forEach((header) => {
    const fieldKey = resolveFieldKey(header);
    if (fieldKey) {
      headerMapping.set(header, fieldKey);
    }
  });

  if (headerMapping.size === 0) {
    const supportedHeaders = Object.values(FIELD_LABELS_CN).join('、');
    result.errors.push({
      row: 1,
      message: `未识别到有效表头。支持的表头包括：${supportedHeaders}`,
    });
    return result;
  }

  const ctx: ProcessAddressContext = { existingAddresses, existingTags };
  const processor = new AddressProcessor(ctx);

  result.total = jsonData.length;

  jsonData.forEach((row, idx) => {
    const rowNumber = idx + 2;
    const fieldValues: Partial<Record<keyof Address, string>> = {};
    let rawTagsValue = '';

    headerMapping.forEach((fieldKey, headerKey) => {
      const value = String(row[headerKey] ?? '').trim();
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
      result.errors.push({ row: rowNumber, message: processed.error! });
      return;
    }

    if (processed.error) {
      result.failCount++;
      result.errors.push({ row: rowNumber, message: processed.error });
      return;
    }

    result.successCount++;
    result.addresses.push(processed.address!);
  });

  result.autoCreatedTags = processor.getAutoCreatedTags();
  result.success = result.failCount === 0;
  return result;
}

export function readExcelFile(
  file: File,
  existingAddresses: Address[] = [],
  existingTags: Tag[] = [],
  onProgress?: (percent: number) => void,
): Promise<ExcelParseResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const percent = Math.round((event.loaded / event.total) * 50);
        onProgress(percent);
      }
    };

    reader.onload = (event) => {
      try {
        if (onProgress) onProgress(60);
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        if (onProgress) onProgress(80);
        const result = parseExcelWorkbook(workbook, existingAddresses, existingTags);
        if (onProgress) onProgress(100);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('文件读取失败'));
    };

    reader.readAsBinaryString(file);
  });
}

export function generateExcelWorkbook(
  addresses: Address[],
  fields: ExportField[] = DEFAULT_EXPORT_FIELDS,
  tagList: Tag[] = [],
): XLSX.WorkBook {
  const headers = fields.map((f) => f.label);
  const rows = addresses.map((addr) => {
    const row: Record<string, string> = {};
    fields.forEach((field) => {
      if (field.key === 'tags') {
        row[field.label] = resolveTagNames(addr, tagList);
      } else {
        row[field.label] = addr[field.key as keyof Address] as string;
      }
    });
    return row;
  });

  const worksheet = XLSX.utils.json_to_sheet(rows, { header: headers });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Addresses');
  return workbook;
}

export function downloadExcelFile(
  addresses: Address[],
  fields: ExportField[] = DEFAULT_EXPORT_FIELDS,
  tagList: Tag[] = [],
  filename: string = 'addresses.xlsx',
): void {
  const workbook = generateExcelWorkbook(addresses, fields, tagList);
  XLSX.writeFile(workbook, filename);
}

export function generateExcelTemplate(): void {
  const exampleData: Address[] = [
    {
      name: '张三',
      phone: '13800138000',
      province: '北京市',
      city: '北京市',
      district: '海淀区',
      street: '中关村大街1号',
      postcode: '100080',
      tags: [],
    },
  ];
  downloadExcelFile(exampleData, DEFAULT_EXPORT_FIELDS, [], 'address_template.xlsx');
}
