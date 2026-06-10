import { describe, it, expect, beforeEach } from 'vitest';
import type { Address, Tag } from '../types/envelope';
import {
  parseCsv,
  generateCsvTemplate,
  generateCsvContent,
  generateJsonTemplate,
  generateJsonContent,
  parseJson,
  type CsvParseResult,
  type JsonParseResult,
} from './csvParser';
import { FIELD_LABELS_CN } from './addressUtils';

describe('csvParser', () => {
  const existingAddresses: Address[] = [];
  const existingTags: Tag[] = [];

  beforeEach(() => {
    existingAddresses.length = 0;
    existingTags.length = 0;
  });

  describe('内部辅助函数', () => {
    it('stripBom 应正确移除 UTF-8 BOM', () => {
      const textWithBom = '\ufeff姓名,电话,省';
      const textWithoutBom = '姓名,电话,省';

      const resultWithBom = parseCsv(textWithBom);
      const resultWithoutBom = parseCsv(textWithoutBom);

      expect(resultWithBom.errors).toHaveLength(0);
      expect(resultWithoutBom.errors).toHaveLength(0);
    });
  });

  describe('parseCsv - 标准格式解析', () => {
    it('应正确解析中文表头的标准 CSV 文件', () => {
      const csvContent = [
        '姓名,电话,省/州,城市,区/县,详细地址,邮政编码,标签',
        '张三,13800138000,北京市,北京市,海淀区,中关村大街1号,100080,家人;重要',
        '李四,13900139000,上海市,上海市,浦东新区,陆家嘴金融中心88号,200120,同事',
      ].join('\n');

      const result: CsvParseResult = parseCsv(csvContent, existingAddresses, existingTags);

      expect(result.success).toBe(true);
      expect(result.total).toBe(2);
      expect(result.successCount).toBe(2);
      expect(result.failCount).toBe(0);
      expect(result.duplicateCount).toBe(0);
      expect(result.addresses).toHaveLength(2);
      expect(result.errors).toHaveLength(0);

      expect(result.addresses[0].name).toBe('张三');
      expect(result.addresses[0].phone).toBe('13800138000');
      expect(result.addresses[0].province).toBe('北京市');
      expect(result.addresses[0].city).toBe('北京市');
      expect(result.addresses[0].district).toBe('海淀区');
      expect(result.addresses[0].street).toBe('中关村大街1号');
      expect(result.addresses[0].postcode).toBe('100080');
      expect(result.autoCreatedTags).toHaveLength(3);

      expect(result.addresses[1].name).toBe('李四');
      expect(result.addresses[1].phone).toBe('13900139000');
      expect(result.addresses[1].province).toBe('上海市');
    });

    it('应正确解析英文表头的标准 CSV 文件', () => {
      const csvContent = [
        'name,phone,province,city,district,street,postcode,tags',
        'John Doe,1234567890,California,Los Angeles,Orange County,123 Main St,90001,friend;work',
        'Jane Smith,0987654321,New York,New York,Manhattan,456 Oak Ave,10001,family',
      ].join('\n');

      const result: CsvParseResult = parseCsv(csvContent, existingAddresses, existingTags);

      expect(result.success).toBe(true);
      expect(result.total).toBe(2);
      expect(result.successCount).toBe(2);
      expect(result.addresses).toHaveLength(2);

      expect(result.addresses[0].name).toBe('John Doe');
      expect(result.addresses[0].phone).toBe('1234567890');
      expect(result.addresses[0].province).toBe('California');
      expect(result.addresses[0].city).toBe('Los Angeles');
      expect(result.addresses[0].district).toBe('Orange County');
      expect(result.addresses[0].street).toBe('123 Main St');
      expect(result.addresses[0].postcode).toBe('90001');
    });

    it('应正确解析混合中英文表头的 CSV 文件', () => {
      const csvContent = [
        '姓名,phone,省/州,city,详细地址,postcode',
        '王五,13700137000,广东省,广州市,天河区珠江新城5号,510000',
      ].join('\n');

      const result: CsvParseResult = parseCsv(csvContent, existingAddresses, existingTags);

      expect(result.success).toBe(true);
      expect(result.total).toBe(1);
      expect(result.successCount).toBe(1);
      expect(result.addresses[0].name).toBe('王五');
      expect(result.addresses[0].phone).toBe('13700137000');
      expect(result.addresses[0].province).toBe('广东省');
      expect(result.addresses[0].city).toBe('广州市');
      expect(result.addresses[0].street).toBe('天河区珠江新城5号');
      expect(result.addresses[0].postcode).toBe('510000');
    });

    it('应正确解析支持的别名字段（如 地址、手机、邮编等）', () => {
      const csvContent = [
        '姓名,手机,省份,城市,区县,地址,邮编',
        '赵六,13600136000,浙江省,杭州市,西湖区,文三路100号,310000',
      ].join('\n');

      const result: CsvParseResult = parseCsv(csvContent, existingAddresses, existingTags);

      expect(result.success).toBe(true);
      expect(result.total).toBe(1);
      expect(result.successCount).toBe(1);
      expect(result.addresses[0].name).toBe('赵六');
      expect(result.addresses[0].phone).toBe('13600136000');
      expect(result.addresses[0].province).toBe('浙江省');
      expect(result.addresses[0].city).toBe('杭州市');
      expect(result.addresses[0].district).toBe('西湖区');
      expect(result.addresses[0].street).toBe('文三路100号');
      expect(result.addresses[0].postcode).toBe('310000');
    });

    it('应支持不同的换行符格式（\\n、\\r\\n、\\r）', () => {
      const csvContentLF = '姓名,电话,省/州,城市,详细地址\n张三,13800138000,北京市,北京市,中关村大街1号';
      const csvContentCRLF = '姓名,电话,省/州,城市,详细地址\r\n张三,13800138000,北京市,北京市,中关村大街1号';
      const csvContentCR = '姓名,电话,省/州,城市,详细地址\r张三,13800138000,北京市,北京市,中关村大街1号';

      const resultLF = parseCsv(csvContentLF, [], []);
      const resultCRLF = parseCsv(csvContentCRLF, [], []);
      const resultCR = parseCsv(csvContentCR, [], []);

      expect(resultLF.successCount).toBe(1);
      expect(resultLF.addresses[0].name).toBe('张三');
      expect(resultCRLF.successCount).toBe(1);
      expect(resultCRLF.addresses[0].name).toBe('张三');
      expect(resultCR.successCount).toBe(1);
      expect(resultCR.addresses[0].name).toBe('张三');
    });
  });

  describe('parseCsv - 重复地址检测', () => {
    it('应检测并跳过文件内部的重复地址', () => {
      const csvContent = [
        '姓名,电话,省/州,城市,详细地址',
        '张三,13800138000,北京市,北京市,中关村大街1号',
        '李四,13900139000,上海市,上海市,陆家嘴金融中心88号',
        '张三,13800138000,北京市,北京市,中关村大街1号',
      ].join('\n');

      const result: CsvParseResult = parseCsv(csvContent, existingAddresses, existingTags);

      expect(result.success).toBe(true);
      expect(result.total).toBe(3);
      expect(result.successCount).toBe(2);
      expect(result.duplicateCount).toBe(1);
      expect(result.failCount).toBe(0);
      expect(result.addresses).toHaveLength(2);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].line).toBe(4);
      expect(result.errors[0].message).toContain('已存在');
    });

    it('应检测并跳过与现有地址重复的记录', () => {
      const existingAddr: Address = {
        name: '张三',
        phone: '13800138000',
        province: '北京市',
        city: '北京市',
        district: '海淀区',
        street: '中关村大街1号',
        postcode: '100080',
        tags: [],
      };

      const csvContent = [
        '姓名,电话,省/州,城市,区/县,详细地址,邮政编码',
        '张三,13800138000,北京市,北京市,海淀区,中关村大街1号,100080',
        '李四,13900139000,上海市,上海市,浦东新区,陆家嘴金融中心88号,200120',
      ].join('\n');

      const result: CsvParseResult = parseCsv(csvContent, [existingAddr], existingTags);

      expect(result.success).toBe(true);
      expect(result.total).toBe(2);
      expect(result.successCount).toBe(1);
      expect(result.duplicateCount).toBe(1);
      expect(result.addresses).toHaveLength(1);
      expect(result.addresses[0].name).toBe('李四');
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('已存在');
    });

    it('应忽略大小写和前后空格进行重复检测', () => {
      const csvContent = [
        '姓名,电话,省/州,城市,详细地址',
        ' 张三 ,13800138000, 北京市 , 北京市 , 中关村大街1号 ',
        '张三,13800138000,北京市,北京市,中关村大街1号',
      ].join('\n');

      const result: CsvParseResult = parseCsv(csvContent, existingAddresses, existingTags);

      expect(result.duplicateCount).toBe(1);
      expect(result.successCount).toBe(1);
    });
  });

  describe('parseCsv - 地址完整性验证', () => {
    it('应正确标记姓名为空的记录为失败', () => {
      const csvContent = [
        '姓名,电话,省/州,城市,详细地址',
        ',13800138000,北京市,北京市,中关村大街1号',
        '李四,13900139000,上海市,上海市,陆家嘴金融中心88号',
      ].join('\n');

      const result: CsvParseResult = parseCsv(csvContent, existingAddresses, existingTags);

      expect(result.success).toBe(false);
      expect(result.total).toBe(2);
      expect(result.successCount).toBe(1);
      expect(result.failCount).toBe(1);
      expect(result.addresses).toHaveLength(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].line).toBe(2);
      expect(result.errors[0].message).toBe('姓名不能为空');
    });

    it('应正确标记地址信息不完整的记录为失败', () => {
      const csvContent = [
        '姓名,电话,省/州,城市,区/县,详细地址',
        '王五,13700137000,,,',
        '李四,13900139000,上海市,上海市,浦东新区,陆家嘴金融中心88号',
      ].join('\n');

      const result: CsvParseResult = parseCsv(csvContent, existingAddresses, existingTags);

      expect(result.success).toBe(false);
      expect(result.total).toBe(2);
      expect(result.successCount).toBe(1);
      expect(result.failCount).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].line).toBe(2);
      expect(result.errors[0].message).toContain('地址信息不完整');
    });

    it('只要有省、城市或详细地址之一就应该通过验证', () => {
      const csvContent = [
        '姓名,电话,省/州,城市,详细地址',
        '只有省,13800138000,广东省,,',
        '只有城市,13800138001,,深圳市,',
        '只有详细地址,13800138002,,,南山区科技园1号',
      ].join('\n');

      const result: CsvParseResult = parseCsv(csvContent, existingAddresses, existingTags);

      expect(result.success).toBe(true);
      expect(result.total).toBe(3);
      expect(result.successCount).toBe(3);
      expect(result.failCount).toBe(0);
      expect(result.addresses).toHaveLength(3);
    });
  });

  describe('parseCsv - 特殊字符和引号处理', () => {
    it('应正确解析包含逗号的引号包裹字段', () => {
      const csvContent = [
        '姓名,电话,省/州,城市,详细地址',
        '张三,13800138000,北京市,北京市,"中关村大街,1号"',
      ].join('\n');

      const result: CsvParseResult = parseCsv(csvContent, existingAddresses, existingTags);

      expect(result.success).toBe(true);
      expect(result.successCount).toBe(1);
      expect(result.addresses[0].street).toBe('中关村大街,1号');
    });

    it('应正确解析包含双引号的引号包裹字段', () => {
      const csvContent = [
        '姓名,电话,省/州,城市,详细地址',
        '张三,13800138000,北京市,北京市,"中关村""大厦1号"',
      ].join('\n');

      const result: CsvParseResult = parseCsv(csvContent, existingAddresses, existingTags);

      expect(result.success).toBe(true);
      expect(result.successCount).toBe(1);
      expect(result.addresses[0].street).toBe('中关村"大厦1号');
    });

    it('应正确解析包含引号包裹的字段', () => {
      const csvContent = [
        '姓名,电话,省/州,城市,详细地址',
        '张三,13800138000,北京市,北京市,"中关村大街 1 号 A 座"',
      ].join('\n');

      const result: CsvParseResult = parseCsv(csvContent, existingAddresses, existingTags);

      expect(result.success).toBe(true);
      expect(result.successCount).toBe(1);
      expect(result.addresses[0].street).toBe('中关村大街 1 号 A 座');
    });

    it('多行引号包裹字段会被 split(\\n) 拆分导致解析失败（已知限制）', () => {
      const csvContent = '姓名,电话,省/州,城市,详细地址\n张三,13800138000,北京市,北京市,"中关村大街\n1号楼\nA座"';

      const result: CsvParseResult = parseCsv(csvContent, existingAddresses, existingTags);

      expect(result.success).toBe(false);
      expect(result.failCount).toBeGreaterThan(0);
    });

    it('应正确解析包含特殊字符的字段', () => {
      const csvContent = [
        '姓名,电话,省/州,城市,详细地址',
        '张三&李四,13800138000,北京市,北京市,中关村@#$大街1号',
      ].join('\n');

      const result: CsvParseResult = parseCsv(csvContent, existingAddresses, existingTags);

      expect(result.success).toBe(true);
      expect(result.successCount).toBe(1);
      expect(result.addresses[0].name).toBe('张三&李四');
      expect(result.addresses[0].street).toBe('中关村@#$大街1号');
    });

    it('应正确解析包含中英文混合和表情符号的字段', () => {
      const csvContent = [
        '姓名,电话,省/州,城市,详细地址',
        '张三👋,13800138000,北京市,北京市,中关村科技园🚀',
      ].join('\n');

      const result: CsvParseResult = parseCsv(csvContent, existingAddresses, existingTags);

      expect(result.success).toBe(true);
      expect(result.successCount).toBe(1);
      expect(result.addresses[0].name).toBe('张三👋');
      expect(result.addresses[0].street).toBe('中关村科技园🚀');
    });
  });

  describe('parseCsv - BOM 编码处理', () => {
    it('应正确处理带 UTF-8 BOM 的 CSV 文件', () => {
      const csvContent = '\ufeff' + [
        '姓名,电话,省/州,城市,详细地址',
        '张三,13800138000,北京市,北京市,中关村大街1号',
      ].join('\n');

      const result: CsvParseResult = parseCsv(csvContent, existingAddresses, existingTags);

      expect(result.success).toBe(true);
      expect(result.total).toBe(1);
      expect(result.successCount).toBe(1);
      expect(result.addresses[0].name).toBe('张三');
      expect(result.errors).toHaveLength(0);
    });

    it('应正确处理不带 BOM 的普通 CSV 文件', () => {
      const csvContent = [
        '姓名,电话,省/州,城市,详细地址',
        '张三,13800138000,北京市,北京市,中关村大街1号',
      ].join('\n');

      const result: CsvParseResult = parseCsv(csvContent, existingAddresses, existingTags);

      expect(result.success).toBe(true);
      expect(result.successCount).toBe(1);
      expect(result.addresses[0].name).toBe('张三');
    });
  });

  describe('parseCsv - 空文件处理', () => {
    it('应正确处理完全为空的文件', () => {
      const result: CsvParseResult = parseCsv('', existingAddresses, existingTags);

      expect(result.success).toBe(false);
      expect(result.total).toBe(0);
      expect(result.successCount).toBe(0);
      expect(result.failCount).toBe(0);
      expect(result.duplicateCount).toBe(0);
      expect(result.addresses).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toBe('CSV 文件为空');
    });

    it('应正确处理只包含空白行的文件', () => {
      const result: CsvParseResult = parseCsv('\n\n   \n\n', existingAddresses, existingTags);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toBe('CSV 文件为空');
    });

    it('应正确处理只有表头没有数据的文件', () => {
      const csvContent = '姓名,电话,省/州,城市,详细地址\n';

      const result: CsvParseResult = parseCsv(csvContent, existingAddresses, existingTags);

      expect(result.success).toBe(true);
      expect(result.total).toBe(0);
      expect(result.successCount).toBe(0);
      expect(result.addresses).toHaveLength(0);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('parseCsv - 表头异常处理', () => {
    it('应正确处理表头完全不匹配的情况', () => {
      const csvContent = [
        '用户名,邮箱,年龄,性别,备注',
        '张三,zhangsan@example.com,25,男,测试用户',
      ].join('\n');

      const result: CsvParseResult = parseCsv(csvContent, existingAddresses, existingTags);

      expect(result.success).toBe(false);
      expect(result.total).toBe(0);
      expect(result.successCount).toBe(0);
      expect(result.addresses).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].line).toBe(1);
      expect(result.errors[0].message).toContain('未识别到有效表头');
      expect(result.errors[0].message).toContain(FIELD_LABELS_CN.name);
      expect(result.errors[0].message).toContain(FIELD_LABELS_CN.phone);
    });

    it('应忽略未知的表头列，只解析识别到的有效列', () => {
      const csvContent = [
        '序号,姓名,电话,备注,省/州,城市,详细地址',
        '1,张三,13800138000,VIP客户,北京市,北京市,中关村大街1号',
      ].join('\n');

      const result: CsvParseResult = parseCsv(csvContent, existingAddresses, existingTags);

      expect(result.success).toBe(true);
      expect(result.total).toBe(1);
      expect(result.successCount).toBe(1);
      expect(result.addresses[0].name).toBe('张三');
      expect(result.addresses[0].phone).toBe('13800138000');
      expect(result.addresses[0].province).toBe('北京市');
      expect(result.addresses[0].city).toBe('北京市');
      expect(result.addresses[0].street).toBe('中关村大街1号');
      expect(result.errors).toHaveLength(0);
    });

    it('应正确处理表头中的多余空格', () => {
      const csvContent = [
        ' 姓名 , 电话 , 省/州 , 城市 , 详细地址 ',
        '张三,13800138000,北京市,北京市,中关村大街1号',
      ].join('\n');

      const result: CsvParseResult = parseCsv(csvContent, existingAddresses, existingTags);

      expect(result.success).toBe(true);
      expect(result.successCount).toBe(1);
      expect(result.addresses[0].name).toBe('张三');
    });
  });

  describe('parseCsv - 标签处理', () => {
    it('应正确解析多种分隔符的标签', () => {
      const csvContent = [
        '姓名,电话,省/州,城市,详细地址,标签',
        '张三,13800138000,北京市,北京市,中关村大街1号,"家人;重要,客户"',
        '李四,13900139000,上海市,上海市,陆家嘴88号,同事|朋友',
        '王五,13700137000,广东省,广州市,珠江新城5号,VIP、高端',
      ].join('\n');

      const result: CsvParseResult = parseCsv(csvContent, existingAddresses, existingTags);

      expect(result.success).toBe(true);
      expect(result.successCount).toBe(3);
      expect(result.autoCreatedTags).toHaveLength(7);

      const tagNames = result.autoCreatedTags.map((t) => t.name);
      expect(tagNames).toContain('家人');
      expect(tagNames).toContain('重要');
      expect(tagNames).toContain('客户');
      expect(tagNames).toContain('同事');
      expect(tagNames).toContain('朋友');
      expect(tagNames).toContain('VIP');
      expect(tagNames).toContain('高端');
    });

    it('应正确关联已有标签，不重复创建', () => {
      const existingTag: Tag = {
        id: 'tag_existing_1',
        name: '家人',
        color: '#ef4444',
      };

      const csvContent = [
        '姓名,电话,省/州,城市,详细地址,标签',
        '张三,13800138000,北京市,北京市,中关村大街1号,家人;新标签',
      ].join('\n');

      const result: CsvParseResult = parseCsv(csvContent, existingAddresses, [existingTag]);

      expect(result.success).toBe(true);
      expect(result.successCount).toBe(1);
      expect(result.autoCreatedTags).toHaveLength(1);
      expect(result.autoCreatedTags[0].name).toBe('新标签');

      const addr = result.addresses[0];
      expect(addr.tags).toHaveLength(2);
      expect(addr.tags).toContain('tag_existing_1');
    });

    it('应正确处理空标签和空白标签', () => {
      const csvContent = [
        '姓名,电话,省/州,城市,详细地址,标签',
        '张三,13800138000,北京市,北京市,中关村大街1号,',
        '李四,13900139000,上海市,上海市,陆家嘴88号, ; ,',
      ].join('\n');

      const result: CsvParseResult = parseCsv(csvContent, existingAddresses, existingTags);

      expect(result.success).toBe(true);
      expect(result.successCount).toBe(2);
      expect(result.autoCreatedTags).toHaveLength(0);
      expect(result.addresses[0].tags).toHaveLength(0);
      expect(result.addresses[1].tags).toHaveLength(0);
    });
  });

  describe('generateCsvTemplate', () => {
    it('应生成包含中文表头和示例数据的 CSV 模板', () => {
      const template = generateCsvTemplate();
      const lines = template.split('\n');

      expect(lines).toHaveLength(2);

      const headers = lines[0].split(',');
      expect(headers).toEqual([
        FIELD_LABELS_CN.name,
        FIELD_LABELS_CN.phone,
        FIELD_LABELS_CN.province,
        FIELD_LABELS_CN.city,
        FIELD_LABELS_CN.district,
        FIELD_LABELS_CN.street,
        FIELD_LABELS_CN.postcode,
        FIELD_LABELS_CN.tags,
      ]);

      const example = lines[1].split(',');
      expect(example).toEqual(['张三', '13800138000', '北京市', '北京市', '海淀区', '中关村大街1号', '100080', '家人;重要']);
    });
  });

  describe('generateCsvContent', () => {
    it('应正确将地址数组转换为 CSV 内容', () => {
      const addresses: Address[] = [
        {
          name: '张三',
          phone: '13800138000',
          province: '北京市',
          city: '北京市',
          district: '海淀区',
          street: '中关村大街1号',
          postcode: '100080',
          tags: ['tag1'],
        },
        {
          name: '李四',
          phone: '13900139000',
          province: '上海市',
          city: '上海市',
          district: '浦东新区',
          street: '陆家嘴,金融中心88号',
          postcode: '200120',
          tags: ['tag2'],
        },
      ];

      const tags: Tag[] = [
        { id: 'tag1', name: '家人', color: '#ef4444' },
        { id: 'tag2', name: '同事', color: '#3b82f6' },
      ];

      const csvContent = generateCsvContent(addresses, undefined, tags);
      const lines = csvContent.split('\n');

      expect(lines).toHaveLength(3);

      const headers = lines[0].split(',');
      expect(headers[0]).toBe(FIELD_LABELS_CN.name);

      expect(lines[1]).toContain('张三');
      expect(lines[1]).toContain('13800138000');
      expect(lines[1]).toContain('家人');

      expect(lines[2]).toContain('李四');
      expect(lines[2]).toContain('"陆家嘴,金融中心88号"');
      expect(lines[2]).toContain('同事');
    });

    it('应正确转义包含逗号、引号和换行符的字段', () => {
      const addresses: Address[] = [
        {
          name: '张"三',
          phone: '13800138000',
          province: '北京市',
          city: '北京市',
          district: '海淀区',
          street: '中关村\n大街1号',
          postcode: '100080',
          tags: [],
        },
      ];

      const csvContent = generateCsvContent(addresses);
      const lines = csvContent.split('\n');

      expect(lines[1]).toContain('"张""三"');
      expect(csvContent).toContain('"中关村\n大街1号"');
    });
  });

  describe('parseJson', () => {
    it('应正确解析标准 JSON 数组格式', () => {
      const jsonContent = JSON.stringify([
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
        {
          姓名: '李四',
          电话: '13900139000',
          省: '上海市',
          城市: '上海市',
          区: '浦东新区',
          详细地址: '陆家嘴金融中心88号',
          邮政编码: '200120',
          标签: ['同事'],
        },
      ]);

      const result: JsonParseResult = parseJson(jsonContent, existingAddresses, existingTags);

      expect(result.success).toBe(true);
      expect(result.total).toBe(2);
      expect(result.successCount).toBe(2);
      expect(result.addresses).toHaveLength(2);
      expect(result.addresses[0].name).toBe('张三');
      expect(result.addresses[1].name).toBe('李四');
    });

    it('应正确处理包含 addresses/data/list 字段的对象格式', () => {
      const jsonWithAddresses = JSON.stringify({
        addresses: [
          { 姓名: '张三', 电话: '13800138000', 省: '北京市', 详细地址: '中关村大街1号' },
        ],
      });

      const jsonWithData = JSON.stringify({
        data: [
          { 姓名: '李四', 电话: '13900139000', 省: '上海市', 详细地址: '陆家嘴88号' },
        ],
      });

      const jsonWithList = JSON.stringify({
        list: [
          { 姓名: '王五', 电话: '13700137000', 省: '广东省', 详细地址: '珠江新城5号' },
        ],
      });

      const result1 = parseJson(jsonWithAddresses, [], []);
      const result2 = parseJson(jsonWithData, [], []);
      const result3 = parseJson(jsonWithList, [], []);

      expect(result1.successCount).toBe(1);
      expect(result1.addresses[0].name).toBe('张三');
      expect(result2.successCount).toBe(1);
      expect(result2.addresses[0].name).toBe('李四');
      expect(result3.successCount).toBe(1);
      expect(result3.addresses[0].name).toBe('王五');
    });

    it('应正确处理 JSON 格式错误', () => {
      const result: JsonParseResult = parseJson('{invalid json}', existingAddresses, existingTags);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toBe('JSON 格式错误，无法解析');
    });

    it('应正确处理空 JSON 文件', () => {
      const result: JsonParseResult = parseJson('', existingAddresses, existingTags);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toBe('JSON 文件为空');
    });

    it('应正确处理无数据的 JSON', () => {
      const result: JsonParseResult = parseJson('[]', existingAddresses, existingTags);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toBe('JSON 文件中没有地址数据');
    });

    it('应正确检测 JSON 中的重复地址', () => {
      const jsonContent = JSON.stringify([
        { 姓名: '张三', 电话: '13800138000', 省: '北京市', 详细地址: '中关村大街1号' },
        { 姓名: '张三', 电话: '13800138000', 省: '北京市', 详细地址: '中关村大街1号' },
      ]);

      const result: JsonParseResult = parseJson(jsonContent, existingAddresses, existingTags);

      expect(result.success).toBe(true);
      expect(result.total).toBe(2);
      expect(result.successCount).toBe(1);
      expect(result.duplicateCount).toBe(1);
    });
  });

  describe('generateJsonTemplate', () => {
    it('应生成有效的 JSON 模板', () => {
      const template = generateJsonTemplate();
      const parsed = JSON.parse(template);

      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed).toHaveLength(1);
      expect(parsed[0][FIELD_LABELS_CN.name]).toBe('张三');
      expect(parsed[0][FIELD_LABELS_CN.phone]).toBe('13800138000');
      expect(Array.isArray(parsed[0][FIELD_LABELS_CN.tags])).toBe(true);
    });
  });

  describe('generateJsonContent', () => {
    it('应正确将地址数组转换为 JSON 内容', () => {
      const addresses: Address[] = [
        {
          name: '张三',
          phone: '13800138000',
          province: '北京市',
          city: '北京市',
          district: '海淀区',
          street: '中关村大街1号',
          postcode: '100080',
          tags: ['tag1'],
        },
      ];

      const tags: Tag[] = [
        { id: 'tag1', name: '家人', color: '#ef4444' },
      ];

      const jsonContent = generateJsonContent(addresses, undefined, tags);
      const parsed = JSON.parse(jsonContent);

      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed).toHaveLength(1);
      expect(parsed[0][FIELD_LABELS_CN.name]).toBe('张三');
      expect(parsed[0][FIELD_LABELS_CN.phone]).toBe('13800138000');
      expect(parsed[0][FIELD_LABELS_CN.tags]).toEqual(['家人']);
    });
  });

  describe('综合测试场景', () => {
    it('应正确处理混合成功、失败、重复的复杂场景', () => {
      const existingAddr: Address = {
        name: '重复测试',
        phone: '13500135000',
        province: '四川省',
        city: '成都市',
        district: '武侯区',
        street: '天府大道100号',
        postcode: '610000',
        tags: [],
      };

      const csvContent = [
        '姓名,电话,省/州,城市,区/县,详细地址,邮政编码,标签',
        '成功记录1,13800138000,北京市,北京市,海淀区,中关村大街1号,100080,标签1',
        ',13900139000,上海市,上海市,浦东新区,陆家嘴88号,200120,',
        '成功记录2,13700137000,广东省,广州市,天河区,珠江新城5号,510000,标签2;标签3',
        '重复测试,13500135000,四川省,成都市,武侯区,天府大道100号,610000,',
        '地址不完整,13600136000,,,,,',
        '成功记录3,13400134000,浙江省,杭州市,西湖区,文三路100号,310000,',
      ].join('\n');

      const result: CsvParseResult = parseCsv(csvContent, [existingAddr], existingTags);

      expect(result.success).toBe(false);
      expect(result.total).toBe(6);
      expect(result.successCount).toBe(3);
      expect(result.failCount).toBe(2);
      expect(result.duplicateCount).toBe(1);
      expect(result.addresses).toHaveLength(3);
      expect(result.errors).toHaveLength(3);
      expect(result.autoCreatedTags).toHaveLength(3);

      const successNames = result.addresses.map((a) => a.name);
      expect(successNames).toContain('成功记录1');
      expect(successNames).toContain('成功记录2');
      expect(successNames).toContain('成功记录3');

      const errorMessages = result.errors.map((e) => e.message);
      expect(errorMessages).toContain('姓名不能为空');
      expect(errorMessages).toContain('该地址已存在，已跳过');
      expect(errorMessages.some((m) => m.includes('地址信息不完整'))).toBe(true);
    });

    it('多次导入之间应保持隔离，互不影响', () => {
      const csvContent1 = [
        '姓名,电话,省/州,城市,详细地址',
        '张三,13800138000,北京市,北京市,中关村大街1号',
      ].join('\n');

      const csvContent2 = [
        '姓名,电话,省/州,城市,详细地址',
        '李四,13900139000,上海市,上海市,陆家嘴金融中心88号',
      ].join('\n');

      const result1: CsvParseResult = parseCsv(csvContent1, [], []);
      const result2: CsvParseResult = parseCsv(csvContent2, [], []);

      expect(result1.successCount).toBe(1);
      expect(result1.addresses[0].name).toBe('张三');
      expect(result1.autoCreatedTags).toHaveLength(0);

      expect(result2.successCount).toBe(1);
      expect(result2.addresses[0].name).toBe('李四');
      expect(result2.autoCreatedTags).toHaveLength(0);
    });
  });
});
