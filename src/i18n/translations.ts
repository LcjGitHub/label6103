export type Language = 'zh' | 'en'

export interface Translations {
  app: {
    title: string
    subtitle: string
    localMock: string
  }
  nav: {
    home: string
    preview: string
    addressList: string
    switchLang: string
    zh: string
    en: string
  }
  common: {
    name: string
    phone: string
    province: string
    city: string
    district: string
    street: string
    postcode: string
    sender: string
    recipient: string
    search: string
    searchPlaceholder: string
    searchPlaceholderCompact: string
    use: string
    useThisAddress: string
    delete: string
    filled: string
    totalItems: string
    noData: string
    noMatch: string
    tryModifyKeyword: string
    confirmClear: string
    clearList: string
    noAddressInfo: string
    operation: string
    rename: string
    save: string
    cancel: string
    confirm: string
    history: string
    historyTitle: string
    historyEmpty: string
    historyLastUsed: string
    historyUse: string
    historyDelete: string
    historyClearAll: string
    historyClearConfirm: string
  }
  time: {
    justNow: string
    minutesAgo: string
    hoursAgo: string
    daysAgo: string
    dateFormat: string
  }
  template: {
    title: string
    subtitle: string
    saveTemplate: string
    templateList: string
    saveAsTemplate: string
    templateName: string
    templateNamePlaceholder: string
    emptyNameError: string
    duplicateNameError: string
    loadTemplate: string
    deleteTemplate: string
    renameTemplate: string
    deleteConfirm: string
    noTemplates: string
    created: string
    updated: string
    applySuccess: string
    saveSuccess: string
    deleteSuccess: string
    renameSuccess: string
  }
  form: {
    placeholders: {
      name: string
      phone: string
      province: string
      city: string
      citySelect: string
      district: string
      districtSelect: string
      street: string
      postcode: string
    }
  }
  home: {
    loadChineseMock: string
    loadBritishMock: string
    resetForm: string
    addressList: string
    dataSavedTip: string
    goPreview: string
  }
  preview: {
    backEdit: string
    title: string
    subtitle: string
    layout: string
    layoutLabel: string
    chineseStyle: string
    britishStyle: string
    chineseDesc: string
    britishDesc: string
    sizeLabel: string
    sizeDescription: string
    sideLabel: string
    front: string
    back: string
    currentData: string
    noRecipientTip: string
    previewScaleTip: string
    style: string
    sideDisplay: string
    exportPNG: string
    exporting: string
    exportFailed: string
    sizes: {
      small: string
      medium: string
      large: string
      custom: string
      width: string
      height: string
      mmUnit: string
      sizeRangeTip: string
      sizeOutOfRange: string
      minSize: string
      maxSize: string
    }
  }
  addressListPage: {
    title: string
    subtitle: string
    backHome: string
    continueEdit: string
  }
  csvUploader: {
    title: string
    downloadTemplate: string
    uploadHint: string
    uploadHintSub: string
    parsingFile: string
    total: string
    success: string
    duplicate: string
    fail: string
    errorDetails: string
    lineN: string
    moreErrors: string
    continueUpload: string
    uploadCsvOnly: string
    readFailed: string
  }
  printPreview: {
    title: string
    subtitle: string
    backPreview: string
    perPage: string
    perPage1: string
    perPage2: string
    perPage4: string
    perPage9: string
    print: string
    printing: string
    printTip: string
    noAddresses: string
    noAddressesTip: string
    page: string
    useCurrentOnly: string
    useAddressList: string
    dataMode: string
  }
  tags: {
    title: string
    addTag: string
    createTag: string
    editTag: string
    tagName: string
    tagNamePlaceholder: string
    tagColor: string
    tags: string
    emptyNameError: string
    duplicateNameError: string
    deleteConfirm: string
    noTags: string
    noTagsHint: string
    filterBy: string
    clearFilter: string
    manageTags: string
    autoCreated: string
    selectColor: string
  }
  envelope: {
    chinese: {
      senderLabel: string
      senderPlaceholder: string
      recipientPlaceholder: string
      stampLabel: string
      stampArea: string
    }
    british: {
      returnAddress: string
      senderPlaceholder: string
      recipientPlaceholder: string
      stamp: string
    }
  }
}

export const translations: Record<Language, Translations> = {
  zh: {
    app: {
      title: '信封地址排版预览器',
      subtitle: '填写寄件人 / 收件人信息，预览中式与英式信封布局',
      localMock: '本地 Mock · 无后端',
    },
    nav: {
      home: '首页',
      preview: '预览',
      addressList: '地址列表',
      switchLang: '切换语言',
      zh: '中文',
      en: 'English',
    },
    common: {
      name: '姓名',
      phone: '电话',
      province: '省/州',
      city: '城市',
      district: '区/县',
      street: '详细地址',
      postcode: '邮政编码',
      sender: '寄件人',
      recipient: '收件人',
      search: '搜索',
      searchPlaceholder: '搜索姓名、电话、地址或标签...',
      searchPlaceholderCompact: '搜索地址或标签...',
      use: '使用',
      useThisAddress: '使用此地址',
      delete: '删除',
      filled: '已填充',
      totalItems: '共 {count} 条',
      noData: '暂无地址数据',
      noMatch: '未找到匹配的地址',
      tryModifyKeyword: '尝试修改搜索关键词',
      confirmClear: '确定要清空所有地址吗？此操作不可撤销。',
      clearList: '清空列表',
      noAddressInfo: '暂无地址信息',
      operation: '操作',
      rename: '重命名',
      save: '保存',
      cancel: '取消',
      confirm: '确认',
      history: '历史记录',
      historyTitle: '最近使用的地址',
      historyEmpty: '暂无历史记录',
      historyLastUsed: '最后使用',
      historyUse: '使用',
      historyDelete: '删除',
      historyClearAll: '清空全部',
      historyClearConfirm: '确定要清空所有历史记录吗？此操作不可撤销。',
    },
    time: {
      justNow: '刚刚',
      minutesAgo: '{count} 分钟前',
      hoursAgo: '{count} 小时前',
      daysAgo: '{count} 天前',
      dateFormat: '{year}-{month}-{day}',
    },
    template: {
      title: '信封模板',
      subtitle: '收藏和管理常用的信封样式模板',
      saveTemplate: '保存模板',
      templateList: '模板列表',
      saveAsTemplate: '另存为模板',
      templateName: '模板名称',
      templateNamePlaceholder: '请输入模板名称',
      emptyNameError: '模板名称不能为空',
      duplicateNameError: '该模板名称已存在',
      loadTemplate: '应用此模板',
      deleteTemplate: '删除模板',
      renameTemplate: '重命名模板',
      deleteConfirm: '确定要删除此模板吗？此操作不可撤销。',
      noTemplates: '暂无已保存的模板，快去创建一个吧！',
      created: '创建时间',
      updated: '更新时间',
      applySuccess: '模板已成功应用',
      saveSuccess: '模板已成功保存',
      deleteSuccess: '模板已成功删除',
      renameSuccess: '模板已成功重命名',
    },
    form: {
      placeholders: {
        name: '张三 / John Smith',
        phone: '13800138000',
        province: '北京市 / England',
        city: '北京市 / London',
        citySelect: '请选择城市',
        district: '海淀区（可选）',
        districtSelect: '请选择区/县',
        street: '街道、门牌号、楼层',
        postcode: '100080 / SW1A 2AA',
      },
    },
    home: {
      loadChineseMock: '载入中式 Mock 数据',
      loadBritishMock: '载入英式 Mock 数据',
      resetForm: '清空表单',
      addressList: '地址列表',
      dataSavedTip: '数据保存在浏览器 localStorage，刷新后仍可恢复。',
      goPreview: '前往预览',
    },
    preview: {
      backEdit: '返回编辑',
      title: '信封预览',
      subtitle: '实时 CSS 排版 · 切换尺寸与版式',
      layout: '信封版式',
      layoutLabel: '版式',
      chineseStyle: '中式',
      britishStyle: '英式',
      chineseDesc: '中式：正面收件人居右，邮编框左上；背面左下为寄件人。',
      britishDesc: '英式：正面居中偏下为收件人；背面左上为 Return Address。',
      sizeLabel: '信封尺寸',
      sizeDescription: '尺寸描述',
      sideLabel: '展示面',
      front: '正面',
      back: '背面',
      currentData: '当前数据',
      noRecipientTip: '尚未填写收件人，请返回首页补充或载入 Mock 数据。',
      previewScaleTip:
        '预览按真实毫米比例换算（1 mm ≈ 3.78 px）。点击「导出 PNG」可下载当前布局高清图片。',
      style: '风格',
      sideDisplay: '展示面',
      exportPNG: '导出 PNG',
      exporting: '导出中…',
      exportFailed: '导出失败，请重试',
      sizes: {
        small: '小号 (5号)',
        medium: '中号 (6号)',
        large: '大号 (7号)',
        custom: '自定义',
        width: '宽度',
        height: '高度',
        mmUnit: '毫米 (mm)',
        sizeRangeTip: '尺寸范围：90mm - 200mm',
        sizeOutOfRange: '尺寸超出常见范围',
        minSize: '最小值',
        maxSize: '最大值',
      },
    },
    addressListPage: {
      title: '地址列表管理',
      subtitle: '管理已导入的收件人地址，快速填充到表单',
      backHome: '返回主页',
      continueEdit: '返回主页继续编辑',
    },
    csvUploader: {
      title: '批量导入地址',
      downloadTemplate: '下载CSV模板',
      uploadHint: '点击或拖拽 CSV 文件到此处上传',
      uploadHintSub: '支持中英文表头，详见模板文件',
      parsingFile: '正在解析文件...',
      total: '总数',
      success: '成功',
      duplicate: '重复',
      fail: '失败',
      errorDetails: '错误详情：',
      lineN: '第{line}行:',
      moreErrors: '... 还有 {count} 条错误',
      continueUpload: '继续上传',
      uploadCsvOnly: '请上传 CSV 格式的文件',
      readFailed: '文件读取失败，请重试',
    },
    printPreview: {
      title: '打印预览',
      subtitle: 'A4 纸张批量排版 · 选择每页信封数量',
      backPreview: '返回预览',
      perPage: '每页信封数',
      perPage1: '1 个/页',
      perPage2: '2 个/页',
      perPage4: '4 个/页',
      perPage9: '9 个/页',
      print: '打印',
      printing: '正在准备打印…',
      printTip: '打印时将隐藏所有界面元素，仅输出信封内容。请在打印对话框中选择"A4"纸张，并取消"页眉页脚"选项以获得最佳效果。',
      noAddresses: '无可用地址',
      noAddressesTip: '地址列表为空，将使用当前编辑的收件人地址生成单封信封。如需批量打印，请先导入地址列表。',
      page: '第 {current} / {total} 页',
      useCurrentOnly: '仅当前收件人',
      useAddressList: '使用地址列表',
      dataMode: '数据来源',
    },
    tags: {
      title: '标签管理',
      addTag: '添加标签',
      createTag: '创建新标签',
      editTag: '编辑标签',
      tagName: '标签名称',
      tagNamePlaceholder: '如：家人、同事、客户',
      tagColor: '标签颜色',
      tags: '标签',
      emptyNameError: '标签名称不能为空',
      duplicateNameError: '该标签名称已存在',
      deleteConfirm: '确定要删除此标签吗？所有地址中的此标签也将被移除。此操作不可撤销。',
      noTags: '暂无标签，点击右上角「添加标签」按钮创建第一个标签',
      noTagsHint: '请先在上方创建标签',
      filterBy: '按标签筛选',
      clearFilter: '清除筛选',
      manageTags: '管理标签',
    autoCreated: '自动创建标签',
    selectColor: '选择颜色',
  },
  envelope: {
    chinese: {
        senderLabel: '寄件人',
        senderPlaceholder: '（寄件人地址）',
        recipientPlaceholder: '（收件人地址）',
        stampLabel: '邮戳',
        stampArea: '贴邮票处',
      },
      british: {
        returnAddress: 'Return Address',
        senderPlaceholder: 'Sender address',
        recipientPlaceholder: 'Recipient address',
        stamp: 'Stamp',
      },
    },
  },
  en: {
    app: {
      title: 'Envelope Address Layout Previewer',
      subtitle: 'Fill in sender/recipient info, preview Chinese and British envelope layouts',
      localMock: 'Local Mock · No Backend',
    },
    nav: {
      home: 'Home',
      preview: 'Preview',
      addressList: 'Addresses',
      switchLang: 'Switch Language',
      zh: '中文',
      en: 'English',
    },
    common: {
      name: 'Name',
      phone: 'Phone',
      province: 'Province/State',
      city: 'City',
      district: 'District',
      street: 'Street Address',
      postcode: 'Postcode',
      sender: 'Sender',
      recipient: 'Recipient',
      search: 'Search',
      searchPlaceholder: 'Search name, phone, address or tag...',
      searchPlaceholderCompact: 'Search address or tag...',
      use: 'Use',
      useThisAddress: 'Use This',
      delete: 'Delete',
      filled: 'Filled',
      totalItems: '{count} items',
      noData: 'No address data yet',
      noMatch: 'No matching addresses found',
      tryModifyKeyword: 'Try modifying the search keyword',
      confirmClear: 'Are you sure you want to clear all addresses? This cannot be undone.',
      clearList: 'Clear List',
      noAddressInfo: 'No address info',
      operation: 'Actions',
      rename: 'Rename',
      save: 'Save',
      cancel: 'Cancel',
      confirm: 'Confirm',
      history: 'History',
      historyTitle: 'Recently Used Addresses',
      historyEmpty: 'No history yet',
      historyLastUsed: 'Last used',
      historyUse: 'Use',
      historyDelete: 'Delete',
      historyClearAll: 'Clear All',
      historyClearConfirm: 'Are you sure you want to clear all history? This cannot be undone.',
    },
    time: {
      justNow: 'Just now',
      minutesAgo: '{count} min ago',
      hoursAgo: '{count} hour{plural} ago',
      daysAgo: '{count} day{plural} ago',
      dateFormat: '{month}/{day}/{year}',
    },
    template: {
      title: 'Envelope Templates',
      subtitle: 'Save and manage your favorite envelope style templates',
      saveTemplate: 'Save Template',
      templateList: 'Template List',
      saveAsTemplate: 'Save as Template',
      templateName: 'Template Name',
      templateNamePlaceholder: 'Enter template name',
      emptyNameError: 'Template name cannot be empty',
      duplicateNameError: 'Template name already exists',
      loadTemplate: 'Apply This Template',
      deleteTemplate: 'Delete Template',
      renameTemplate: 'Rename Template',
      deleteConfirm: 'Are you sure you want to delete this template? This action cannot be undone.',
      noTemplates: 'No saved templates yet. Create one now!',
      created: 'Created',
      updated: 'Updated',
      applySuccess: 'Template applied successfully',
      saveSuccess: 'Template saved successfully',
      deleteSuccess: 'Template deleted successfully',
      renameSuccess: 'Template renamed successfully',
    },
    form: {
      placeholders: {
        name: 'John Smith',
        phone: '+44 20 7946 0958',
        province: 'England',
        city: 'London',
        citySelect: 'Select a city',
        district: 'Westminster (optional)',
        districtSelect: 'Select a district',
        street: '10 Downing Street',
        postcode: 'SW1A 2AA',
      },
    },
    home: {
      loadChineseMock: 'Load Chinese Mock Data',
      loadBritishMock: 'Load British Mock Data',
      resetForm: 'Clear Form',
      addressList: 'Address List',
      dataSavedTip: 'Data is saved in browser localStorage and persists after refresh.',
      goPreview: 'Go to Preview',
    },
    preview: {
      backEdit: 'Back to Edit',
      title: 'Envelope Preview',
      subtitle: 'Real-time CSS layout · Switch size and style',
      layout: 'Envelope Layout',
      layoutLabel: 'Layout',
      chineseStyle: 'Chinese',
      britishStyle: 'British',
      chineseDesc:
        'Chinese: Recipient on the right side of the front, postcode boxes top-left; sender bottom-left on the back.',
      britishDesc:
        'British: Recipient centered near the bottom on the front; Return Address top-left on the back.',
      sizeLabel: 'Envelope Size',
      sizeDescription: 'Size Description',
      sideLabel: 'Display Side',
      front: 'Front',
      back: 'Back',
      currentData: 'Current Data',
      noRecipientTip: 'No recipient filled in yet. Please go back to home or load mock data.',
      previewScaleTip:
        'Preview is scaled to real millimeters (1 mm ≈ 3.78 px). Click "Export PNG" to download a high-res image of the current layout.',
      style: 'Style',
      sideDisplay: 'Side',
      exportPNG: 'Export PNG',
      exporting: 'Exporting…',
      exportFailed: 'Export failed, please try again',
      sizes: {
        small: 'Small (No.5)',
        medium: 'Medium (No.6)',
        large: 'Large (No.7)',
        custom: 'Custom',
        width: 'Width',
        height: 'Height',
        mmUnit: 'millimeters (mm)',
        sizeRangeTip: 'Size range: 90mm - 200mm',
        sizeOutOfRange: 'Size is outside the common range',
        minSize: 'Min',
        maxSize: 'Max',
      },
    },
    addressListPage: {
      title: 'Address List Management',
      subtitle: 'Manage imported recipient addresses, quickly fill into the form',
      backHome: 'Back to Home',
      continueEdit: 'Back to Home to Continue',
    },
    csvUploader: {
      title: 'Batch Import Addresses',
      downloadTemplate: 'Download CSV Template',
      uploadHint: 'Click or drag a CSV file here to upload',
      uploadHintSub: 'Supports Chinese and English headers, see template file',
      parsingFile: 'Parsing file...',
      total: 'Total',
      success: 'Success',
      duplicate: 'Duplicate',
      fail: 'Failed',
      errorDetails: 'Error details:',
      lineN: 'Line {line}:',
      moreErrors: '... {count} more errors',
      continueUpload: 'Continue Upload',
      uploadCsvOnly: 'Please upload a CSV file',
      readFailed: 'Failed to read file, please try again',
    },
    printPreview: {
      title: 'Print Preview',
      subtitle: 'A4 batch layout · Choose envelopes per page',
      backPreview: 'Back to Preview',
      perPage: 'Per Page',
      perPage1: '1 / page',
      perPage2: '2 / page',
      perPage4: '4 / page',
      perPage9: '9 / page',
      print: 'Print',
      printing: 'Preparing to print…',
      printTip: 'All UI elements will be hidden during printing, only envelope content is output. Select "A4" paper and disable "Headers and footers" in the print dialog for best results.',
      noAddresses: 'No Addresses',
      noAddressesTip: 'The address list is empty. The current recipient will be used for a single envelope. Import addresses first for batch printing.',
      page: 'Page {current} / {total}',
      useCurrentOnly: 'Current Recipient Only',
      useAddressList: 'Use Address List',
      dataMode: 'Data Source',
    },
    tags: {
      title: 'Tag Management',
      addTag: 'Add Tag',
      createTag: 'Create New Tag',
      editTag: 'Edit Tag',
      tagName: 'Tag Name',
      tagNamePlaceholder: 'e.g. Family, Colleague, Client',
      tagColor: 'Tag Color',
      tags: 'Tags',
      emptyNameError: 'Tag name cannot be empty',
      duplicateNameError: 'Tag name already exists',
      deleteConfirm: 'Are you sure you want to delete this tag? It will be removed from all addresses. This action cannot be undone.',
      noTags: 'No tags yet. Click the "Add Tag" button in the top right to create your first tag.',
      noTagsHint: 'Please create tags above first',
      filterBy: 'Filter by tag',
      clearFilter: 'Clear filter',
      manageTags: 'Manage tags',
      autoCreated: 'Auto-created tags',
      selectColor: 'Select color',
    },
    envelope: {
      chinese: {
        senderLabel: 'Sender',
        senderPlaceholder: '(Sender address)',
        recipientPlaceholder: '(Recipient address)',
        stampLabel: 'Postmark',
        stampArea: 'Affix Stamp Here',
      },
      british: {
        returnAddress: 'Return Address',
        senderPlaceholder: 'Sender address',
        recipientPlaceholder: 'Recipient address',
        stamp: 'Stamp',
      },
    },
  },
}

export type TranslationKey = string
