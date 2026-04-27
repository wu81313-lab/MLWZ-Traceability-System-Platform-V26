(function () {
  function input(key, label, placeholder, searchKeys) {
    return { key: key, label: label, type: 'input', placeholder: placeholder, searchKeys: searchKeys || [key] };
  }

  function select(key, label, options) {
    return { key: key, label: label, type: 'select', options: options || [] };
  }

  function date(key, label) {
    return { key: key, label: label, type: 'date' };
  }

  function dateRange(key, label) {
    return { key: key, label: label, type: 'daterange' };
  }

  function col(key, label, minWidth) {
    return { key: key, label: label, minWidth: minWidth || 140 };
  }

  function listSchema(options) {
    return Object.assign({
      layout: 'list',
      pageSize: 10,
      toolbar: ['search', 'reset', 'create', 'export'],
      rowActions: [
        { key: 'edit', label: '编辑' },
        { key: 'delete', label: '删除', danger: true }
      ]
    }, options || {});
  }

  function boardSchema(options) {
    return Object.assign({
      layout: 'board',
      metrics: [],
      charts: [],
      lists: []
    }, options || {});
  }

  function lineChart(xAxis, series) {
    return { xAxis: xAxis, series: series };
  }

  function buildDateAxis(days) {
    var result = [];
    for (var index = 1; index <= days; index += 1) {
      result.push('04-' + (index < 10 ? '0' + index : String(index)));
    }
    return result;
  }

  var trend30 = buildDateAxis(30);
  var trend12 = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

  window.staticModuleSchemas = {
    '#/orderSubtask': listSchema({
      title: '生产子加工单',
      variant: 'legacy-production',
      tags: ['生产管理', '生产子加工单'],
      legacyBreadcrumb: '生产管理 / 工单列表',
      expandable: true,
      legacyColumns: 4,
      toolbarButtons: [
        { key: 'search', label: '搜索', buttonType: 'primary', icon: 'el-icon-search' },
        { key: 'reset', label: '重置' },
        { key: 'columns', label: '设置表列显示' }
      ],
      filters: [
        input('orderNo', '订单', '请输入订单'),
        input('productCode', '产品编码', '请输入产品名称或编码模糊匹配', ['productCode', 'productName']),
        input('subtaskNo', '子工单', '请输入子工单'),
        date('planDate', '计划生产日期'),
        select('status', '工单状态', ['待生产', '生产中', '已完成'])
      ],
      columns: [
        col('orderNo', '生产订单号', 160),
        col('productCode', '产品编码', 120),
        col('productName', '产品名称', 160),
        col('planDate', '生产日期', 110),
        col('planQty', '计划生产数量', 110),
        col('subtaskNo', '子工单', 120),
        col('level1CollectQty', '1级采集数量', 110),
        col('level1ProductionQty', '1级生产数量', 110),
        col('level1Ratio', '1级采集率', 90),
        col('level2CollectQty', '2级采集数量', 110),
        col('level2ProductionQty', '2级生产数量', 110),
        col('level2Ratio', '2级采集率', 90),
        col('level3CollectQty', '3级采集数量', 110),
        col('level3ProductionQty', '3级生产数量', 110),
        col('level3Ratio', '3级采集率', 90),
        col('planStartTime', '计划开始时间', 130),
        col('planEndTime', '计划结束时间', 130),
        col('productionStatus', '生产状态', 100),
        col('remark', '备注', 90)
      ],
      actionWidth: 146,
      rowActions: [
        { key: 'edit', label: '修改', buttonType: 'primary' },
        { key: 'delete', label: '删除', buttonType: 'danger' }
      ],
      rows: [
        {
          id: 1,
          orderNo: 'A01',
          productCode: 'cjs1',
          productName: '纯净水500ml',
          planDate: '2026-03-05',
          planQty: 200,
          subtaskNo: 'A01-02',
          level1CollectQty: 0,
          level1ProductionQty: 0,
          level1Ratio: '0%',
          level2CollectQty: 0,
          level2ProductionQty: 0,
          level2Ratio: '0%',
          level3CollectQty: 0,
          level3ProductionQty: 0,
          level3Ratio: '0%',
          planStartTime: '',
          planEndTime: '',
          productionStatus: '未下载',
          remark: 'xxx',
          status: '待生产',
          expandText: '生产订单 A01 对应子工单 A01-02，当前无更多展开明细。'
        },
        {
          id: 2,
          orderNo: 'A01',
          productCode: 'cjs1',
          productName: '纯净水500ml',
          planDate: '2026-03-05',
          planQty: 300,
          subtaskNo: 'A01-01',
          level1CollectQty: 0,
          level1ProductionQty: 0,
          level1Ratio: '0%',
          level2CollectQty: 0,
          level2ProductionQty: 0,
          level2Ratio: '0%',
          level3CollectQty: 0,
          level3ProductionQty: 0,
          level3Ratio: '0%',
          planStartTime: '',
          planEndTime: '',
          productionStatus: '未下载',
          remark: 'xxx',
          status: '待生产',
          expandText: '生产订单 A01 对应子工单 A01-01，当前无更多展开明细。'
        },
        {
          id: 3,
          orderNo: '123',
          productCode: 'cjs1',
          productName: '纯净水500ml',
          planDate: '2026-01-18',
          planQty: 1,
          subtaskNo: '123-03',
          level1CollectQty: 0,
          level1ProductionQty: 0,
          level1Ratio: '0%',
          level2CollectQty: 0,
          level2ProductionQty: 0,
          level2Ratio: '0%',
          level3CollectQty: 0,
          level3ProductionQty: 0,
          level3Ratio: '0%',
          planStartTime: '',
          planEndTime: '',
          productionStatus: '未下载',
          remark: '111',
          status: '生产中',
          expandText: '生产订单 123 的补录子工单 123-03。'
        },
        {
          id: 4,
          orderNo: '123',
          productCode: 'cjs1',
          productName: '纯净水500ml',
          planDate: '2026-01-15',
          planQty: 100,
          subtaskNo: '123-02',
          level1CollectQty: 0,
          level1ProductionQty: 0,
          level1Ratio: '0%',
          level2CollectQty: 0,
          level2ProductionQty: 0,
          level2Ratio: '0%',
          level3CollectQty: 0,
          level3ProductionQty: 0,
          level3Ratio: '0%',
          planStartTime: '',
          planEndTime: '',
          productionStatus: '未下载',
          remark: '111',
          status: '生产中',
          expandText: '生产订单 123 的子工单 123-02。'
        },
        {
          id: 5,
          orderNo: '123',
          productCode: 'cjs1',
          productName: '纯净水500ml',
          planDate: '2026-01-12',
          planQty: 100,
          subtaskNo: '123-01',
          level1CollectQty: 0,
          level1ProductionQty: 0,
          level1Ratio: '0%',
          level2CollectQty: 0,
          level2ProductionQty: 0,
          level2Ratio: '0%',
          level3CollectQty: 0,
          level3ProductionQty: 0,
          level3Ratio: '0%',
          planStartTime: '',
          planEndTime: '',
          productionStatus: '未下载',
          remark: '111',
          status: '生产中',
          expandText: '生产订单 123 的子工单 123-01。'
        },
        {
          id: 6,
          orderNo: '1112232',
          productCode: 'cjs250',
          productName: '纯净水250ml',
          planDate: '2026-01-15',
          planQty: 20,
          subtaskNo: '1112232-02',
          level1CollectQty: 0,
          level1ProductionQty: 0,
          level1Ratio: '0%',
          level2CollectQty: 0,
          level2ProductionQty: 0,
          level2Ratio: '0%',
          level3CollectQty: 0,
          level3ProductionQty: 0,
          level3Ratio: '0%',
          planStartTime: '',
          planEndTime: '',
          productionStatus: '未下载',
          remark: '',
          status: '已完成',
          expandText: '生产订单 1112232 的子工单 1112232-02。'
        },
        {
          id: 7,
          orderNo: '1112232',
          productCode: 'cjs250',
          productName: '纯净水250ml',
          planDate: '2026-01-13',
          planQty: 10,
          subtaskNo: '1112232-01',
          level1CollectQty: 0,
          level1ProductionQty: 0,
          level1Ratio: '0%',
          level2CollectQty: 0,
          level2ProductionQty: 0,
          level2Ratio: '0%',
          level3CollectQty: 0,
          level3ProductionQty: 0,
          level3Ratio: '0%',
          planStartTime: '',
          planEndTime: '',
          productionStatus: '未下载',
          remark: '',
          status: '已完成',
          expandText: '生产订单 1112232 的子工单 1112232-01。'
        }
      ]
    }),

    '#/orderlist': listSchema({
      title: '生产批次加工单',
      variant: 'legacy-production',
      tags: ['生产管理', '生产批次加工单'],
      legacyBreadcrumb: '生产管理 / 生产批次加工单',
      legacyColumns: 4,
      toolbarButtons: [
        { key: 'search', label: '搜索', buttonType: 'primary', icon: 'el-icon-search' },
        { key: 'reset', label: '重置' },
        { key: 'export', label: '导出Excel' },
        { key: 'create', label: '新增工单' },
        { key: 'columns', label: '设置表列显示' }
      ],
      filters: [
        input('subtaskNo', '子加工单', '请输入子加工单'),
        select('factoryName', '工厂', ['MT001狮特纯净水工厂', 'mt002狮特纯净水工厂002']),
        select('workshopName', '车间', ['cj01纯净水一车间', '2314121']),
        select('lineName', '产线', ['cx01一号线', 'B001test']),
        select('productionStatus', '生产状态', ['待生产', '生产中', '已完成']),
        input('orderNo', '订单', '请输入订单'),
        input('batchNo', '批次', '请输入批次'),
        input('productCode', '产品编码', '请输入产品编码'),
        select('qualityStatus', '质检状态', ['待质检', '合格', '不合格']),
        dateRange('productionTime', '生产时间'),
        dateRange('planTime', '计划时间'),
        select('dataStatus', '数据状态', ['正常', '冻结', '作废'])
      ],
      columns: [
        col('subtaskNo', '子加工单', 170),
        col('factoryName', '工厂', 200),
        col('workshopName', '车间', 170),
        col('lineName', '产线', 140),
        col('teamName', '班组', 140),
        col('orderNo', '订单', 140),
        col('productName', '产品', 160),
        col('spec', '规格', 120),
        col('planQty', '计划生产数量', 130),
        col('confirmQty', '人工确认数量', 130),
        col('batchNo', '批次号', 140),
        col('expireDate', '有效期', 120),
        col('level1CollectQty', '1级采集数量', 120),
        { key: 'productionStatus', label: '生产状态', minWidth: 110, tag: true }
      ],
      actionWidth: 92,
      rowActions: [
        { key: 'detail', label: '按钮组', buttonType: 'primary' }
      ],
      rows: [
        {
          id: 1,
          subtaskNo: 'MT001-20260409-01',
          factoryName: 'MT001狮特纯净水工厂',
          workshopName: 'cj01纯净水一车间',
          lineName: 'cx01一号线',
          teamName: 'ces260409',
          orderNo: 'A01',
          productName: 'cjs1纯净水500ml',
          spec: '500ml',
          planQty: '100箱',
          confirmQty: '100箱',
          batchNo: '260409',
          expireDate: '2027-04-09',
          level1CollectQty: 1200,
          productionStatus: '已完成',
          productionTime: '2026-04-09',
          planTime: '2026-04-09',
          qualityStatus: '合格',
          dataStatus: '正常',
          productCode: 'cjs1'
        },
        {
          id: 2,
          subtaskNo: 'mite2026020601',
          factoryName: 'mt002狮特纯净水工厂002',
          workshopName: '2314121',
          lineName: 'B001test',
          teamName: '123托',
          orderNo: '2314121',
          productName: 'test纯净水',
          spec: '123托',
          planQty: '123托',
          confirmQty: '123托',
          batchNo: '12313',
          expireDate: '2027-02-06',
          level1CollectQty: 0,
          productionStatus: '待生产',
          productionTime: '2026-02-06',
          planTime: '2026-02-06',
          qualityStatus: '待质检',
          dataStatus: '正常',
          productCode: 'test'
        },
        {
          id: 3,
          subtaskNo: 'mite2026020602',
          factoryName: 'MT001狮特纯净水工厂',
          workshopName: 'cj01纯净水一车间',
          lineName: 'cx01一号线',
          teamName: '甲班',
          orderNo: 'gd0101',
          productName: '纯净水500ml',
          spec: '500ml',
          planQty: '200箱',
          confirmQty: '180箱',
          batchNo: '2026020602',
          expireDate: '2027-02-06',
          level1CollectQty: 2160,
          productionStatus: '生产中',
          productionTime: '2026-02-06',
          planTime: '2026-02-06',
          qualityStatus: '合格',
          dataStatus: '正常',
          productCode: 'cjs1'
        },
        {
          id: 4,
          subtaskNo: 'mite2026020603',
          factoryName: 'MT001狮特纯净水工厂',
          workshopName: 'cj02纯净水二车间',
          lineName: 'cx03三号线',
          teamName: '乙班',
          orderNo: 'gd0102',
          productName: '纯净水250ml',
          spec: '250ml',
          planQty: '90箱',
          confirmQty: '90箱',
          batchNo: '2026020603',
          expireDate: '2027-02-06',
          level1CollectQty: 1080,
          productionStatus: '已完成',
          productionTime: '2026-02-06',
          planTime: '2026-02-05',
          qualityStatus: '合格',
          dataStatus: '正常',
          productCode: 'cjs250'
        }
      ]
    }),

    '#/receipt': listSchema({
      title: '生产入库',
      variant: 'legacy-production',
      tags: ['生产管理', '生产入库'],
      legacyBreadcrumb: '生产管理 / 生产入库',
      selectable: true,
      legacyColumns: 4,
      toolbarButtons: [
        { key: 'reset', label: '重置' },
        { key: 'search', label: '搜索', buttonType: 'primary', icon: 'el-icon-search' },
        { key: 'create', label: '新增入库' }
      ],
      filters: [
        input('receiptNo', '入库单编号', '请输入入库单编号'),
        input('orderNo', '生产工单编号', '请输入生产工单编号'),
        input('subtaskNo', '生产子工单编号', '请输入生产子工单编号'),
        input('productCode', '产品编码', '请输入产品编码'),
        select('receiptType', '入库类型', ['生产入库', '补录入库']),
        select('status', '状态', ['PDA已完成', '待确认', '已取消']),
        dateRange('receiptDate', '入库日期')
      ],
      columns: [
        col('receiptNo', '入库编号', 160),
        col('orderNo', '生产工单编号', 150),
        col('productName', '产品名称', 160),
        col('scanQty', '扫码数量', 110),
        col('confirmQty', '确认数量', 110),
        col('unitName', '单位名称', 100),
        col('warehouseName', '仓库名称', 140),
        col('receiptType', '入库类型', 100),
        col('sourceType', '单据来源', 100),
        { key: 'status', label: '状态', minWidth: 110, tag: true },
        col('receiptDate', '入库日期', 120),
        col('createdAt', '创建时间', 160)
      ],
      actionWidth: 100,
      rowActions: [
        { key: 'detail', label: '确认入库', buttonType: 'primary' }
      ],
      summaryRow: ['', '合计', '', '', '864', '864', '', '', '', '', '', '', ''],
      rows: [
        {
          id: 1,
          receiptNo: 'RK202601070001',
          orderNo: '20260107',
          subtaskNo: '20260107-01',
          productCode: 'cjs1',
          productName: '纯净水500ml',
          scanQty: 864,
          confirmQty: 864,
          unitName: '箱',
          warehouseName: '物流一仓',
          receiptType: '生产入库',
          sourceType: 'PDA建单',
          status: 'PDA已完成',
          receiptDate: '2026-01-07',
          createdAt: '2026-01-07 15:12:26'
        }
      ]
    }),

    '#/receiptScan': listSchema({
      title: '生产扫码记录',
      variant: 'legacy-production',
      tags: ['生产管理', '生产扫码记录'],
      legacyBreadcrumb: '生产管理 / 生产扫码记录',
      legacyColumns: 4,
      toolbarButtons: [
        { key: 'search', label: '搜索', buttonType: 'primary', icon: 'el-icon-search' },
        { key: 'reset', label: '重置' }
      ],
      filters: [
        input('receiptNo', '入库单编号', '请输入入库单编号'),
        select('status', '状态', ['已确认', '待确认']),
        dateRange('scanTime', '入库日期')
      ],
      columns: [
        col('receiptNo', '入库单编号', 160),
        col('codeValue', '码', 220),
        col('productName', '产品名称', 160),
        col('packageLevel', '包装级别', 90),
        col('batchNo', '生产批次', 130),
        col('qty', '数量', 90),
        col('parentCode', '父级码', 190),
        col('pdaCode', 'PDA唯一码', 150),
        col('unitCode', '单位编码', 100),
        col('unitName', '单位名称', 100),
        { key: 'status', label: '状态', minWidth: 100, tag: true },
        col('scanTime', '扫码时间', 160),
        col('createdAt', '创建时间', 160),
        col('scanQty', '扫码数量', 100)
      ],
      rowActions: [],
      rows: Array.from({ length: 10 }, function (_, index) {
        var suffix = String(index + 1).padStart(3, '0');
        return {
          id: index + 1,
          receiptNo: 'RK202601070001',
          codeValue: '37010020260107' + suffix + '88',
          productName: '纯净水500ml',
          packageLevel: '2',
          batchNo: '2026010701',
          qty: 12,
          parentCode: '3134122298185281148',
          pdaCode: 'f7443ba281f8088e',
          unitCode: 'xiang',
          unitName: '箱',
          status: '已确认',
          scanTime: '2026-01-07 15:48:38',
          createdAt: '2026-01-07 15:48:38',
          scanQty: 12
        };
      })
    }),

    '#/relevance': listSchema({
      title: '包装关联',
      variant: 'legacy-production',
      tags: ['报表管理', '包装关联'],
      legacyBreadcrumb: '报表管理 / 包装关联',
      legacyColumns: 4,
      toolbarButtons: [
        { key: 'reset', label: '重置' },
        { key: 'search', label: '搜索', buttonType: 'primary', icon: 'el-icon-search' }
      ],
      filters: [
        input('orderNo', '订单', '请输入订单'),
        input('batchNo', '批次号', '请输入批次号'),
        input('childCode', '子级码', '请输入子级码'),
        input('parentCode', '父级码', '请输入父级码'),
        input('productCode', '产品编码', '请输入产品编码'),
        input('subtaskNo', '子加工单', '请输入子加工单'),
        select('packageLevel', '包装级别', ['1级包装', '2级包装', '3级包装'])
      ],
      columns: [
        col('orderNo', '订单', 140),
        col('batchNo', '批次号', 130),
        col('factoryName', '工厂', 180),
        col('subtaskNo', '子加工单', 170),
        col('childProduceQty', '子级生产数量', 120),
        col('childCollectQty', '子级采集数量', 120),
        col('productCode', '产品编码', 120),
        col('productName', '产品名称', 160),
        col('spec', '规格', 100),
        col('childCode', '子级码', 220),
        col('parentCode', '父级码', 220),
        col('productionTime', '生产时间', 150)
      ],
      rowActions: [],
      noteText: '输入盒码关联箱码，输入箱码关联盒码',
      rows: []
    }),

    '#/unrelevance1': listSchema({
      title: '关联解除',
      variant: 'legacy-production',
      tags: ['生产管理', '关联解除'],
      legacyBreadcrumb: '生产管理 / 关联解除',
      legacyColumns: 4,
      toolbarButtons: [
        { key: 'reset', label: '重置' },
        { key: 'search', label: '搜索', buttonType: 'primary', icon: 'el-icon-search' },
        { key: 'export', label: '导出Excel' }
      ],
      filters: [
        input('orderNo', '订单', '请输入订单'),
        input('batchNo', '批次号', '请输入批次号'),
        input('codeValue', '码', '请输入码'),
        dateRange('releaseTime', '解除时间')
      ],
      columns: [
        col('indexNo', '编号', 90),
        col('childCode', '子级码', 220),
        col('packageLevel', '包装级别', 100),
        col('parentCode', '父级码', 220),
        col('parentPackageLevel', '父级包装级别', 120),
        col('orderNo', '订单', 140),
        col('batchNo', '生产批次', 130),
        col('shelfLife', '保质期', 120),
        col('collectTime', '采集时间', 160),
        col('releaseTime', '解除关联时间', 160),
        col('remark', '备注', 180)
      ],
      rowActions: [],
      rows: []
    }),

    '#/home/plant/production/replace': listSchema({
      title: '关联替换查询',
      variant: 'legacy-production',
      tags: ['生产管理', '关联替换查询'],
      legacyBreadcrumb: '生产管理 / 关联替换查询',
      legacyColumns: 4,
      toolbarButtons: [
        { key: 'reset', label: '重置' },
        { key: 'search', label: '搜索', buttonType: 'primary', icon: 'el-icon-search' },
        { key: 'export', label: '导出Excel' }
      ],
      filters: [
        input('orderNo', '订单', '请输入订单'),
        input('batchNo', '批次', '请输入批次'),
        input('oldCode', '旧码', '请输入旧码'),
        dateRange('replaceTime', '替换时间')
      ],
      columns: [
        col('indexNo', '编号', 90),
        col('oldCode', '旧码', 220),
        col('newCode', '新码', 220),
        col('packageLevel', '包装级别', 100),
        col('parentCode', '父级码', 220),
        col('parentPackageLevel', '父级包装级别', 120),
        col('orderNo', '订单', 140),
        col('batchNo', '生产批次', 130),
        col('shelfLife', '保质期', 120),
        col('collectTime', '采集时间', 160),
        col('replaceTime', '关联替换时间', 160),
        col('remark', '备注', 180)
      ],
      rowActions: [],
      rows: []
    }),

    '#/repeatedquery': listSchema({
      title: '重码查询',
      variant: 'legacy-production',
      tags: ['生产管理', '重码查询'],
      legacyBreadcrumb: '生产管理 / 重码查询',
      legacyColumns: 4,
      toolbarButtons: [
        { key: 'reset', label: '重置' },
        { key: 'search', label: '搜索', buttonType: 'primary', icon: 'el-icon-search' }
      ],
      filters: [
        input('repeatCode', '盒码/箱码', '请输入盒码或箱码'),
        dateRange('createdAt', '创建时间')
      ],
      columns: [
        col('repeatCode', '重码', 220),
        col('repeatBatch', '重码批次', 140),
        col('oldBatch', '旧批次', 140),
        col('repeatOrderNo', '重码工单', 140),
        col('oldOrderNo', '旧工单', 140),
        col('packageLevel', '包装级别', 100),
        col('repeatProductCode', '重码产品编码', 140),
        col('oldProductCode', '旧产品编码', 140),
        col('createdAt', '创建时间', 160),
        col('reason', '重码原因', 160)
      ],
      rowActions: [],
      rows: []
    }),

    '#/harvestrate': listSchema({
      title: '工单采集率',
      variant: 'legacy-production',
      tags: ['生产管理', '工单采集率'],
      legacyBreadcrumb: '生产管理 / 工单采集率',
      legacyColumns: 4,
      toolbarButtons: [
        { key: 'reset', label: '重置' },
        { key: 'search', label: '搜索', buttonType: 'primary', icon: 'el-icon-search' }
      ],
      filters: [
        input('orderNo', '工单', '请输入工单'),
        input('batchNo', '批次', '请输入批次'),
        input('productCode', '产品编码', '请输入产品编码'),
        input('lineName', '生产线', '请输入生产线'),
        dateRange('productionDate', '生产日期区间')
      ],
      columns: [
        col('packageLevel', '包装级别', 140),
        col('productionQty', '生产数量', 120),
        col('collectQty', '采集数量', 120),
        col('collectRate', '采集率', 120)
      ],
      rowActions: [],
      rows: [
        { id: 1, packageLevel: '1级包装', productionQty: 84075, collectQty: 0, collectRate: '0.00%', orderNo: 'GD-001', batchNo: '20260107', productCode: 'cjs1', lineName: '一号线', productionDate: '2026-01-07' },
        { id: 2, packageLevel: '2级包装', productionQty: 1232, collectQty: 0, collectRate: '0.00%', orderNo: 'GD-001', batchNo: '20260107', productCode: 'cjs1', lineName: '一号线', productionDate: '2026-01-07' },
        { id: 3, packageLevel: '3级包装', productionQty: 18, collectQty: 0, collectRate: '0.00%', orderNo: 'GD-001', batchNo: '20260107', productCode: 'cjs1', lineName: '一号线', productionDate: '2026-01-07' },
        { id: 4, packageLevel: '4级包装', productionQty: 0, collectQty: 0, collectRate: '0.00%', orderNo: 'GD-001', batchNo: '20260107', productCode: 'cjs1', lineName: '一号线', productionDate: '2026-01-07' },
        { id: 5, packageLevel: '5级包装', productionQty: 0, collectQty: 0, collectRate: '0.00%', orderNo: 'GD-001', batchNo: '20260107', productCode: 'cjs1', lineName: '一号线', productionDate: '2026-01-07' }
      ]
    }),

    '#/freight': listSchema({
      title: '运单管理',
      tags: ['工厂物流', '运单管理'],
      toolbar: ['search', 'reset', 'export'],
      summaryCards: [
        { label: '在途运单', value: '18', desc: '今日已发车 6 单 · 异常 1 单', tone: 'primary' },
        { label: '已签收', value: '3260', desc: '近 24 小时累计签收箱数', tone: 'success' },
        { label: '待发运', value: '640', desc: '仓内待装车数量', tone: 'neutral' },
        { label: '准点率', value: '96.4%', desc: '本周工厂物流履约表现', tone: 'primary' }
      ],
      filters: [
        input('billNo', '运单号', '请输入运单号'),
        input('orderNo', '订单号', '请输入订单号'),
        input('destination', '目的地', '请输入目的地'),
        select('status', '状态', ['待发运', '处理中', '已签收'])
      ],
      columns: [
        col('billNo', '运单号', 160),
        col('orderNo', '订单号', 150),
        col('destination', '目的地', 160),
        col('carrier', '承运商', 140),
        col('qty', '发运数量', 110),
        col('shipTime', '发运时间', 160),
        col('status', '状态', 100)
      ],
      detailFields: [
        'billNo',
        'orderNo',
        'destination',
        'carrier',
        'qty',
        'shipTime',
        'status',
        { key: 'driverName', label: '司机姓名' },
        { key: 'driverPhone', label: '司机电话' },
        { key: 'carNo', label: '车牌号' },
        { key: 'routeName', label: '运输路线' },
        { key: 'remark', label: '备注信息' }
      ],
      rows: [
        { id: 1, billNo: 'YD2026042601', orderNo: 'FH-20260426-01', destination: '济南历城仓', carrier: '鲁运物流', qty: 1200, shipTime: '2026-04-26 08:16:00', status: '处理中', driverName: '赵凯', driverPhone: '138****1120', carNo: '鲁A·3F928', routeName: '济南一厂 → 历城仓', remark: '车辆已出园区，预计 14:30 到仓。' },
        { id: 2, billNo: 'YD2026042508', orderNo: 'FH-20260425-06', destination: '青岛城阳仓', carrier: '德邦快运', qty: 860, shipTime: '2026-04-25 15:40:21', status: '已签收', driverName: '刘超', driverPhone: '139****5821', carNo: '鲁B·8K216', routeName: '济南一厂 → 青岛城阳仓', remark: '16:58 完成签收，回单已回传。' },
        { id: 3, billNo: 'YD2026042403', orderNo: 'FH-20260424-03', destination: '淄博高新区仓', carrier: '壹米滴答', qty: 640, shipTime: '2026-04-24 09:27:49', status: '待发运', driverName: '待分配', driverPhone: '--', carNo: '--', routeName: '济南一厂 → 淄博高新区仓', remark: '等待月台释放后装车。' }
      ],
      rowActions: [
        { key: 'detail', label: '详情' },
        { key: 'trace', label: '轨迹' },
        { key: 'log', label: '日志' },
        { key: 'delete', label: '删除', danger: true }
      ]
    }),

    '#/boxcode': listSchema({
      title: '箱码查询',
      tags: ['工厂物流', '箱码查询'],
      toolbar: ['search', 'reset', 'export'],
      filters: [
        input('boxCode', '箱码', '请输入箱码'),
        input('orderNo', '订单号', '请输入订单号'),
        input('productName', '产品名称', '请输入产品名称'),
        input('batchNo', '批次号', '请输入批次号')
      ],
      columns: [
        col('boxCode', '箱码', 190),
        col('orderNo', '订单号', 150),
        col('productName', '产品名称', 180),
        col('batchNo', '批次号', 150),
        col('qty', '箱内数量', 100),
        col('lastNode', '最近节点', 160),
        col('updatedAt', '更新时间', 160)
      ],
      rows: [
        { id: 1, boxCode: 'BX6901028077711001', orderNo: 'FH-20260426-01', productName: '纯净水 500ml', batchNo: 'PC2026042601', qty: 24, lastNode: '成品仓 A-01', updatedAt: '2026-04-26 10:16:38' },
        { id: 2, boxCode: 'BX6901028077711002', orderNo: 'FH-20260425-06', productName: '纯净水 500ml', batchNo: 'PC2026042506', qty: 24, lastNode: '青岛经销商仓', updatedAt: '2026-04-25 19:07:22' },
        { id: 3, boxCode: 'BX6901028077711003', orderNo: 'FH-20260424-03', productName: '纯净水 350ml', batchNo: 'PC2026042402', qty: 30, lastNode: '待发区 02', updatedAt: '2026-04-24 17:13:58' }
      ]
    }),

    '#/barter': listSchema({
      title: '换货查询',
      tags: ['工厂物流', '换货查询'],
      filters: [
        input('orderNo', '换货单号', '请输入换货单号'),
        input('customer', '客户', '请输入客户名称'),
        input('productName', '产品名称', '请输入产品名称'),
        select('status', '状态', ['待审核', '处理中', '已完成'])
      ],
      columns: [
        col('orderNo', '换货单号', 160),
        col('customer', '客户', 180),
        col('productName', '产品名称', 180),
        col('qty', '数量', 100),
        col('reason', '原因', 160),
        col('applyTime', '申请时间', 160),
        col('status', '状态', 100)
      ],
      rows: [
        { id: 1, orderNo: 'HH2026042601', customer: '济南泉城商贸', productName: '纯净水 500ml', qty: 120, reason: '运输破损', applyTime: '2026-04-26 09:05:22', status: '处理中' },
        { id: 2, orderNo: 'HH2026042502', customer: '青岛和顺食品', productName: '苏打水 330ml', qty: 80, reason: '临期调换', applyTime: '2026-04-25 16:12:44', status: '待审核' },
        { id: 3, orderNo: 'HH2026042403', customer: '淄博星景便利', productName: '纯净水 350ml', qty: 60, reason: '规格错发', applyTime: '2026-04-24 13:38:29', status: '已完成' }
      ]
    }),

    '#/findDirection': listSchema({
      title: '批次流向查询',
      tags: ['工厂物流', '批次流向查询'],
      toolbar: ['search', 'reset', 'export'],
      filters: [
        input('batchNo', '批次号', '请输入批次号'),
        input('productName', '产品名称', '请输入产品名称'),
        input('fromNode', '起始节点', '请输入起始节点'),
        input('toNode', '目标节点', '请输入目标节点')
      ],
      columns: [
        col('batchNo', '批次号', 160),
        col('productName', '产品名称', 180),
        col('fromNode', '起始节点', 160),
        col('toNode', '目标节点', 160),
        col('currentNode', '当前节点', 160),
        col('updatedAt', '更新时间', 160),
        col('status', '状态', 100)
      ],
      rows: [
        { id: 1, batchNo: 'PC2026042601', productName: '纯净水 500ml', fromNode: '一号线', toNode: '济南经销商仓', currentNode: '成品仓 A', updatedAt: '2026-04-26 10:55:10', status: '处理中' },
        { id: 2, batchNo: 'PC2026042506', productName: '纯净水 500ml', fromNode: '一号线', toNode: '青岛经销商仓', currentNode: '客户签收', updatedAt: '2026-04-25 19:15:28', status: '已签收' },
        { id: 3, batchNo: 'PC2026042402', productName: '纯净水 350ml', fromNode: '三号线', toNode: '淄博分仓', currentNode: '中转仓', updatedAt: '2026-04-24 15:06:55', status: '待发运' }
      ],
      rowActions: [{ key: 'trace', label: '轨迹' }]
    }),

    '#/refund': listSchema({
      title: '退货日志',
      tags: ['工厂物流', '退货日志'],
      filters: [
        input('refundNo', '退货单号', '请输入退货单号'),
        input('customer', '客户', '请输入客户名称'),
        input('productName', '产品名称', '请输入产品名称'),
        date('refundTime', '退货时间')
      ],
      columns: [
        col('refundNo', '退货单号', 160),
        col('customer', '客户', 180),
        col('productName', '产品名称', 180),
        col('qty', '退货数量', 110),
        col('reason', '退货原因', 160),
        col('refundTime', '退货时间', 160),
        col('status', '状态', 100)
      ],
      rows: [
        { id: 1, refundNo: 'TH2026042601', customer: '济南泉城商贸', productName: '纯净水 500ml', qty: 24, reason: '箱体浸水', refundTime: '2026-04-26 12:08:02', status: '待处理' },
        { id: 2, refundNo: 'TH2026042503', customer: '青岛和顺食品', productName: '苏打水 330ml', qty: 40, reason: '外箱变形', refundTime: '2026-04-25 17:48:37', status: '已完成' },
        { id: 3, refundNo: 'TH2026042402', customer: '淄博星景便利', productName: '纯净水 350ml', qty: 18, reason: '批次调换', refundTime: '2026-04-24 14:16:40', status: '处理中' }
      ]
    }),

    '#/refundorderlist': listSchema({
      title: '退货工单列表',
      tags: ['工厂物流', '退货工单列表'],
      filters: [
        input('refundOrderNo', '退货工单号', '请输入退货工单号'),
        input('sourceOrderNo', '来源订单', '请输入来源订单'),
        select('status', '状态', ['待审核', '处理中', '已完成']),
        date('createdAt', '创建日期')
      ],
      columns: [
        col('refundOrderNo', '退货工单号', 170),
        col('sourceOrderNo', '来源订单', 150),
        col('customerName', '客户名称', 180),
        col('productName', '产品名称', 180),
        col('refundQty', '退货数量', 110),
        col('warehouse', '退货仓库', 140),
        col('status', '状态', 100),
        col('createdAt', '创建时间', 160)
      ],
      rows: [
        { id: 1, refundOrderNo: 'THGD-20260426-01', sourceOrderNo: 'FH-20260426-01', customerName: '济南泉城商贸', productName: '纯净水 500ml', refundQty: 24, warehouse: '退货暂存区', status: '处理中', createdAt: '2026-04-26 12:20:11' },
        { id: 2, refundOrderNo: 'THGD-20260425-02', sourceOrderNo: 'FH-20260425-06', customerName: '青岛和顺食品', productName: '苏打水 330ml', refundQty: 40, warehouse: '退货暂存区', status: '待审核', createdAt: '2026-04-25 18:05:27' },
        { id: 3, refundOrderNo: 'THGD-20260424-03', sourceOrderNo: 'FH-20260424-03', customerName: '淄博星景便利', productName: '纯净水 350ml', refundQty: 18, warehouse: '待检区', status: '已完成', createdAt: '2026-04-24 15:01:44' }
      ]
    }),

    '#/transferOutOrder': listSchema({
      title: '调拨出库单',
      tags: ['工厂物流', '调拨出库单'],
      filters: [
        input('transferNo', '调拨单号', '请输入调拨单号'),
        input('fromWarehouse', '调出仓库', '请输入调出仓库'),
        input('toWarehouse', '调入仓库', '请输入调入仓库'),
        select('status', '状态', ['待发运', '处理中', '已完成'])
      ],
      columns: [
        col('transferNo', '调拨单号', 170),
        col('fromWarehouse', '调出仓库', 150),
        col('toWarehouse', '调入仓库', 150),
        col('productName', '产品名称', 180),
        col('transferQty', '调拨数量', 110),
        col('operator', '操作人', 100),
        col('status', '状态', 100),
        col('updatedAt', '更新时间', 160)
      ],
      rows: [
        { id: 1, transferNo: 'DB2026042601', fromWarehouse: '成品仓 A', toWarehouse: '青岛分仓', productName: '纯净水 500ml', transferQty: 600, operator: '丁浩', status: '处理中', updatedAt: '2026-04-26 09:42:03' },
        { id: 2, transferNo: 'DB2026042502', fromWarehouse: '成品仓 B', toWarehouse: '济宁分仓', productName: '苏打水 330ml', transferQty: 360, operator: '丁浩', status: '已完成', updatedAt: '2026-04-25 16:27:19' },
        { id: 3, transferNo: 'DB2026042404', fromWarehouse: '中转仓', toWarehouse: '淄博分仓', productName: '纯净水 350ml', transferQty: 240, operator: '宋琪', status: '待发运', updatedAt: '2026-04-24 14:18:27' }
      ]
    }),

    '#/transferOutOrderScan': listSchema({
      title: '调拨扫码记录',
      tags: ['工厂物流', '调拨扫码记录'],
      filters: [
        input('scanNo', '扫码编号', '请输入扫码编号'),
        input('transferNo', '调拨单号', '请输入调拨单号'),
        select('codeLevel', '码级', ['一级码', '二级码', '三级码']),
        date('scanTime', '扫码时间')
      ],
      columns: [
        col('scanNo', '扫码编号', 160),
        col('transferNo', '调拨单号', 160),
        col('codeLevel', '码级', 110),
        col('codeValue', '码值', 220),
        col('operator', '操作人', 100),
        col('deviceName', '设备', 140),
        col('scanTime', '扫码时间', 160),
        col('result', '结果', 100)
      ],
      rows: [
        { id: 1, scanNo: 'DBSM2026042601', transferNo: 'DB2026042601', codeLevel: '三级码', codeValue: 'TD-6901028077711001', operator: '杜航', deviceName: '出库扫码枪 01', scanTime: '2026-04-26 09:47:16', result: '成功' },
        { id: 2, scanNo: 'DBSM2026042503', transferNo: 'DB2026042502', codeLevel: '二级码', codeValue: 'BX-6901028077711332', operator: '杜航', deviceName: '出库扫码枪 02', scanTime: '2026-04-25 16:38:02', result: '成功' },
        { id: 3, scanNo: 'DBSM2026042402', transferNo: 'DB2026042404', codeLevel: '一级码', codeValue: 'PX-6901028077711445', operator: '谢恒', deviceName: '中转扫码枪 01', scanTime: '2026-04-24 14:26:48', result: '异常' }
      ]
    }),

    '#/channelinventorylist': listSchema({
      title: '渠道库存列表',
      tags: ['渠道物流', '渠道库存列表'],
      toolbar: ['search', 'reset', 'export'],
      summaryCards: [
        { label: '渠道库存', value: '6060', desc: '可用库存总量 · 锁定 360', tone: 'primary' },
        { label: '安全库存达标', value: '91%', desc: '低库存渠道 2 家', tone: 'success' },
        { label: '重点预警', value: '3', desc: '需补货或盘点复核', tone: 'neutral' },
        { label: '同步时效', value: '8 分钟', desc: '最近一次库存同步延时', tone: 'primary' }
      ],
      filters: [
        input('channelName', '渠道名称', '请输入渠道名称'),
        input('warehouseName', '仓库', '请输入仓库名称'),
        input('productName', '产品名称', '请输入产品名称'),
        select('status', '状态', ['启用', '停用'])
      ],
      columns: [
        col('channelName', '渠道名称', 180),
        col('warehouseName', '仓库名称', 170),
        col('productName', '产品名称', 180),
        col('availableQty', '可用库存', 110),
        col('lockedQty', '锁定库存', 110),
        col('warningQty', '预警阈值', 110),
        col('status', '状态', 100),
        col('updatedAt', '更新时间', 160)
      ],
      detailFields: [
        'channelName',
        'warehouseName',
        'productName',
        'availableQty',
        'lockedQty',
        'warningQty',
        'status',
        'updatedAt',
        { key: 'manager', label: '库存负责人' },
        { key: 'turnoverDays', label: '周转天数' },
        { key: 'stockAccuracy', label: '账实准确率' },
        { key: 'alertState', label: '预警状态' },
        { key: 'remark', label: '库存备注' }
      ],
      rows: [
        { id: 1, channelName: '济南经销商 A', warehouseName: '济南中心仓', productName: '纯净水 500ml', availableQty: 4200, lockedQty: 240, warningQty: 800, status: '启用', updatedAt: '2026-04-26 11:26:08', manager: '杨倩', turnoverDays: '12 天', stockAccuracy: '99.2%', alertState: '正常', remark: '促销备货已提前到位。' },
        { id: 2, channelName: '青岛经销商 B', warehouseName: '青岛分仓', productName: '苏打水 330ml', availableQty: 1860, lockedQty: 120, warningQty: 600, status: '启用', updatedAt: '2026-04-25 18:09:47', manager: '王涛', turnoverDays: '9 天', stockAccuracy: '98.4%', alertState: '关注', remark: '周末有补货计划，锁定库存来自团购订单。' },
        { id: 3, channelName: '淄博终端仓', warehouseName: '淄博前置仓', productName: '纯净水 350ml', availableQty: 0, lockedQty: 0, warningQty: 200, status: '停用', updatedAt: '2026-04-24 16:22:13', manager: '李曼', turnoverDays: '0 天', stockAccuracy: '100%', alertState: '缺货', remark: '仓点暂停使用，待区域调整后恢复。' }
      ],
      rowActions: [
        { key: 'detail', label: '详情' },
        { key: 'log', label: '流水' },
        { key: 'inspect', label: '盘点' }
      ]
    }),

    '#/channelinventorylogs': listSchema({
      title: '渠道库存流水',
      tags: ['渠道物流', '渠道库存流水'],
      toolbar: ['search', 'reset', 'export'],
      summaryCards: [
        { label: '库存流水', value: '286', desc: '今日入出库 34 笔 · 锁定解锁 6 笔', tone: 'primary' },
        { label: '出库净值', value: '-120', desc: '当前筛选结果净变动量', tone: 'success' },
        { label: '待复核', value: '2', desc: '需人工核查的异常流水', tone: 'neutral' },
        { label: '同步时效', value: '5 分钟', desc: '渠道库存同步平均延时', tone: 'primary' }
      ],
      filters: [
        input('logNo', '流水编号', '请输入流水编号'),
        input('channelName', '渠道名称', '请输入渠道名称'),
        select('changeType', '变动类型', ['入库', '出库', '锁定', '解锁']),
        date('createdAt', '变动日期')
      ],
      columns: [
        col('logNo', '流水编号', 160),
        col('channelName', '渠道名称', 180),
        col('productName', '产品名称', 180),
        col('changeType', '变动类型', 110),
        col('changeQty', '变动数量', 110),
        col('afterQty', '变动后库存', 120),
        col('operator', '操作人', 100),
        col('createdAt', '变动时间', 160)
      ],
      detailFields: [
        'logNo',
        'channelName',
        'productName',
        'changeType',
        'changeQty',
        'afterQty',
        'operator',
        'createdAt',
        { key: 'warehouseName', label: '仓库名称' },
        { key: 'bizType', label: '业务类型' },
        { key: 'voucherNo', label: '关联单据' },
        { key: 'remark', label: '流水备注' }
      ],
      rows: [
        { id: 1, logNo: 'KC2026042601', channelName: '济南经销商 A', productName: '纯净水 500ml', changeType: '出库', changeQty: -120, afterQty: 4200, operator: '张帆', createdAt: '2026-04-26 11:02:18', warehouseName: '济南中心仓', bizType: '渠道发货', voucherNo: 'FH-20260426-01', remark: '按区域补货计划发出。' },
        { id: 2, logNo: 'KC2026042503', channelName: '青岛经销商 B', productName: '苏打水 330ml', changeType: '入库', changeQty: 360, afterQty: 1860, operator: '张帆', createdAt: '2026-04-25 17:12:44', warehouseName: '青岛分仓', bizType: '渠道补货', voucherNo: 'RK-20260425-03', remark: '周末活动备货入库。' },
        { id: 3, logNo: 'KC2026042407', channelName: '淄博终端仓', productName: '纯净水 350ml', changeType: '锁定', changeQty: -60, afterQty: 120, operator: '孙莹', createdAt: '2026-04-24 16:18:09', warehouseName: '淄博前置仓', bizType: '促销锁库', voucherNo: 'LK-20260424-07', remark: '锁定活动订单库存。' }
      ],
      rowActions: [{ key: 'detail', label: '详情' }, { key: 'log', label: '日志' }]
    }),

    '#/sttSsignWeblist': listSchema({
      title: '经销商签收记录',
      tags: ['渠道物流', '经销商签收记录'],
      toolbar: ['search', 'reset', 'export'],
      summaryCards: [
        { label: '签收单', value: '64', desc: '今日完成 12 单 · 异常 1 单', tone: 'primary' },
        { label: '签收率', value: '97.8%', desc: '经销商签收及时率', tone: 'success' },
        { label: '待回执', value: '3', desc: '待上传签收凭证', tone: 'neutral' },
        { label: '平均到仓', value: '3.6 小时', desc: '发运至签收平均耗时', tone: 'primary' }
      ],
      filters: [
        input('signNo', '签收单号', '请输入签收单号'),
        input('dealerName', '经销商', '请输入经销商名称'),
        input('orderNo', '订单号', '请输入订单号'),
        select('status', '状态', ['待处理', '已签收', '异常'])
      ],
      columns: [
        col('signNo', '签收单号', 170),
        col('dealerName', '经销商', 180),
        col('orderNo', '订单号', 150),
        col('productName', '产品名称', 180),
        col('signQty', '签收数量', 110),
        col('signTime', '签收时间', 160),
        col('status', '状态', 100)
      ],
      detailFields: [
        'signNo',
        'dealerName',
        'orderNo',
        'productName',
        'signQty',
        'signTime',
        'status',
        { key: 'warehouseName', label: '发货仓库' },
        { key: 'receiver', label: '签收人' },
        { key: 'signMode', label: '签收方式' },
        { key: 'proofStatus', label: '回单状态' },
        { key: 'remark', label: '签收备注' }
      ],
      rows: [
        { id: 1, signNo: 'QS2026042601', dealerName: '济南经销商 A', orderNo: 'FH-20260426-01', productName: '纯净水 500ml', signQty: 1200, signTime: '2026-04-26 13:08:32', status: '已签收', warehouseName: '成品仓 A', receiver: '赵健', signMode: '整单签收', proofStatus: '已回传', remark: '货差为 0，签收完整。' },
        { id: 2, signNo: 'QS2026042504', dealerName: '青岛经销商 B', orderNo: 'FH-20260425-06', productName: '苏打水 330ml', signQty: 860, signTime: '2026-04-25 18:50:18', status: '已签收', warehouseName: '青岛分仓', receiver: '韩珊', signMode: '到仓签收', proofStatus: '已回传', remark: '到货后 30 分钟内完成验收。' },
        { id: 3, signNo: 'QS2026042403', dealerName: '淄博前置仓', orderNo: 'FH-20260424-03', productName: '纯净水 350ml', signQty: 0, signTime: '2026-04-24 17:01:09', status: '异常', warehouseName: '中转仓', receiver: '待确认', signMode: '异常签收', proofStatus: '待补传', remark: '车辆到仓延误，暂未完成整单签收。' }
      ],
      rowActions: [{ key: 'detail', label: '详情' }, { key: 'trace', label: '回执' }, { key: 'log', label: '日志' }]
    }),

    '#/sttSsignscancodelogs': listSchema({
      title: '签收扫码日志',
      tags: ['渠道物流', '签收扫码日志'],
      toolbar: ['search', 'reset', 'export'],
      summaryCards: [
        { label: '扫码日志', value: '182', desc: '今日新增 26 条 · 异常 2 条', tone: 'primary' },
        { label: '成功率', value: '98.9%', desc: '签收节点扫码通过率', tone: 'success' },
        { label: '终端命中', value: '48', desc: '终端签收场景扫码次数', tone: 'neutral' },
        { label: '最近同步', value: '13:12', desc: '最新一条扫码日志时间', tone: 'primary' }
      ],
      filters: [
        input('scanNo', '扫码编号', '请输入扫码编号'),
        input('dealerName', '经销商', '请输入经销商名称'),
        select('scanNode', '节点', ['经销商收货', '门店验收', '终端签收']),
        date('scanTime', '扫码日期')
      ],
      columns: [
        col('scanNo', '扫码编号', 160),
        col('dealerName', '经销商', 180),
        col('scanNode', '扫码节点', 120),
        col('codeValue', '码值', 220),
        col('operator', '操作人', 100),
        col('scanTime', '扫码时间', 160),
        col('result', '结果', 100)
      ],
      detailFields: [
        'scanNo',
        'dealerName',
        'scanNode',
        'codeValue',
        'operator',
        'scanTime',
        'result',
        { key: 'deviceName', label: '扫码设备' },
        { key: 'signNo', label: '关联签收单' },
        { key: 'region', label: '扫码区域' },
        { key: 'remark', label: '日志备注' }
      ],
      rows: [
        { id: 1, scanNo: 'QSSM2026042601', dealerName: '济南经销商 A', scanNode: '经销商收货', codeValue: 'TD-6901028077711001', operator: '赵健', scanTime: '2026-04-26 13:12:11', result: '成功', deviceName: 'PDA-07', signNo: 'QS2026042601', region: '济南', remark: '整托扫码通过。' },
        { id: 2, scanNo: 'QSSM2026042503', dealerName: '青岛经销商 B', scanNode: '门店验收', codeValue: 'BX-6901028077711332', operator: '赵健', scanTime: '2026-04-25 18:54:36', result: '成功', deviceName: 'PDA-12', signNo: 'QS2026042504', region: '青岛', remark: '门店抽检扫码正常。' },
        { id: 3, scanNo: 'QSSM2026042402', dealerName: '淄博前置仓', scanNode: '终端签收', codeValue: 'PX-6901028077711445', operator: '韩珊', scanTime: '2026-04-24 17:06:52', result: '异常', deviceName: 'PDA-03', signNo: 'QS2026042403', region: '淄博', remark: '码状态与签收单不一致。' }
      ],
      rowActions: [{ key: 'detail', label: '详情' }, { key: 'log', label: '日志' }]
    }),

    '#/tssttSsignWeblist': listSchema({
      title: '终端签收记录',
      tags: ['渠道物流', '终端签收记录'],
      toolbar: ['search', 'reset', 'export'],
      summaryCards: [
        { label: '终端签收', value: '128', desc: '今日完成 24 单 · 异常 2 单', tone: 'primary' },
        { label: '门店到货率', value: '95.6%', desc: '终端签收准时达成率', tone: 'success' },
        { label: '待回访', value: '4', desc: '异常门店待客服回访', tone: 'neutral' },
        { label: '平均签收', value: '42 分钟', desc: '到店至签收平均耗时', tone: 'primary' }
      ],
      filters: [
        input('terminalNo', '终端单号', '请输入终端单号'),
        input('storeName', '门店名称', '请输入门店名称'),
        input('dealerName', '经销商', '请输入经销商名称'),
        select('status', '状态', ['待处理', '已签收', '异常'])
      ],
      columns: [
        col('terminalNo', '终端单号', 170),
        col('storeName', '门店名称', 180),
        col('dealerName', '经销商', 180),
        col('productName', '产品名称', 180),
        col('signQty', '签收数量', 110),
        col('signTime', '签收时间', 160),
        col('status', '状态', 100)
      ],
      detailFields: [
        'terminalNo',
        'storeName',
        'dealerName',
        'productName',
        'signQty',
        'signTime',
        'status',
        { key: 'receiver', label: '门店收货人' },
        { key: 'storeAddress', label: '门店地址' },
        { key: 'signMode', label: '签收方式' },
        { key: 'callbackStatus', label: '回访状态' },
        { key: 'remark', label: '签收备注' }
      ],
      rows: [
        { id: 1, terminalNo: 'ZD2026042601', storeName: '泉城便利店 01', dealerName: '济南经销商 A', productName: '纯净水 500ml', signQty: 240, signTime: '2026-04-26 13:28:17', status: '已签收', receiver: '刘琳', storeAddress: '济南市历下区解放东路 01 号', signMode: '门店扫码签收', callbackStatus: '无需回访', remark: '签收后已自动回写库存。' },
        { id: 2, terminalNo: 'ZD2026042504', storeName: '海岸便利店 07', dealerName: '青岛经销商 B', productName: '苏打水 330ml', signQty: 120, signTime: '2026-04-25 19:05:33', status: '已签收', receiver: '王辰', storeAddress: '青岛市城阳区正阳路 86 号', signMode: '到店整单签收', callbackStatus: '已完成回访', remark: '活动货架已陈列。' },
        { id: 3, terminalNo: 'ZD2026042402', storeName: '星景超市 03', dealerName: '淄博前置仓', productName: '纯净水 350ml', signQty: 0, signTime: '2026-04-24 17:15:04', status: '异常', receiver: '待确认', storeAddress: '淄博市张店区华光路 19 号', signMode: '异常签收', callbackStatus: '待回访', remark: '门店反馈少货，待经销商复核。' }
      ],
      rowActions: [{ key: 'detail', label: '详情' }, { key: 'trace', label: '回访' }, { key: 'log', label: '日志' }]
    }),

    '#/dealersignorderlogs': listSchema({
      title: '经销商签收单日志',
      tags: ['渠道物流', '经销商签收单日志'],
      toolbar: ['search', 'reset', 'export'],
      summaryCards: [
        { label: '签收日志', value: '412', desc: '今日新增 38 条 · 补录 5 条', tone: 'primary' },
        { label: '自动流转', value: '86%', desc: '系统自动推送与回写占比', tone: 'success' },
        { label: '人工补录', value: '7', desc: '需追踪的异常操作记录', tone: 'neutral' },
        { label: '最新日志', value: '13:08', desc: '最后一条签收动作时间', tone: 'primary' }
      ],
      filters: [
        input('logNo', '日志编号', '请输入日志编号'),
        input('signNo', '签收单号', '请输入签收单号'),
        input('dealerName', '经销商', '请输入经销商名称'),
        date('createdAt', '记录日期')
      ],
      columns: [
        col('logNo', '日志编号', 160),
        col('signNo', '签收单号', 160),
        col('dealerName', '经销商', 180),
        col('actionName', '日志动作', 140),
        col('remark', '备注', 220),
        col('operator', '操作人', 100),
        col('createdAt', '记录时间', 160)
      ],
      detailFields: [
        'logNo',
        'signNo',
        'dealerName',
        'actionName',
        'remark',
        'operator',
        'createdAt',
        { key: 'sourceSystem', label: '来源系统' },
        { key: 'ipAddress', label: '操作地址' },
        { key: 'traceResult', label: '回写结果' }
      ],
      rows: [
        { id: 1, logNo: 'RZ2026042601', signNo: 'QS2026042601', dealerName: '济南经销商 A', actionName: '创建签收单', remark: '系统自动生成签收任务', operator: '系统', createdAt: '2026-04-26 12:46:08', sourceSystem: '渠道物流平台', ipAddress: '10.21.8.16', traceResult: '已写入签收任务池' },
        { id: 2, logNo: 'RZ2026042602', signNo: 'QS2026042601', dealerName: '济南经销商 A', actionName: '完成签收', remark: '终端仓全量签收完成', operator: '赵健', createdAt: '2026-04-26 13:08:35', sourceSystem: 'PDA 端', ipAddress: '10.21.8.33', traceResult: '已同步库存与回单状态' },
        { id: 3, logNo: 'RZ2026042503', signNo: 'QS2026042504', dealerName: '青岛经销商 B', actionName: '补录备注', remark: '因临时断网延后同步', operator: '韩珊', createdAt: '2026-04-25 19:10:17', sourceSystem: '渠道门户', ipAddress: '10.24.6.20', traceResult: '回写成功，保留离线补录标记' }
      ],
      rowActions: [{ key: 'detail', label: '详情' }, { key: 'log', label: '追踪' }]
    }),

    '#/dealersignqrcodescanlog': listSchema({
      title: '经销商扫码签收日志',
      tags: ['渠道物流', '经销商扫码签收日志'],
      toolbar: ['search', 'reset', 'export'],
      summaryCards: [
        { label: '扫码签收', value: '236', desc: '今日 31 条 · 异常 1 条', tone: 'primary' },
        { label: '签收通过率', value: '99.1%', desc: '经销商扫码入库命中率', tone: 'success' },
        { label: '待排查', value: '1', desc: '结果异常的签收扫码', tone: 'neutral' },
        { label: '最近扫码', value: '13:10', desc: '最新签收扫码时间', tone: 'primary' }
      ],
      filters: [
        input('scanNo', '扫码编号', '请输入扫码编号'),
        input('signNo', '签收单号', '请输入签收单号'),
        input('dealerName', '经销商', '请输入经销商名称'),
        date('scanTime', '扫码日期')
      ],
      columns: [
        col('scanNo', '扫码编号', 160),
        col('signNo', '签收单号', 160),
        col('dealerName', '经销商', 180),
        col('codeValue', '码值', 220),
        col('scanNode', '扫码节点', 120),
        col('scanTime', '扫码时间', 160),
        col('result', '结果', 100)
      ],
      detailFields: [
        'scanNo',
        'signNo',
        'dealerName',
        'codeValue',
        'scanNode',
        'scanTime',
        'result',
        { key: 'deviceName', label: '扫码设备' },
        { key: 'warehouseName', label: '签收仓点' },
        { key: 'operatorName', label: '执行人' },
        { key: 'remark', label: '异常说明' }
      ],
      rows: [
        { id: 1, scanNo: 'JXS2026042601', signNo: 'QS2026042601', dealerName: '济南经销商 A', codeValue: 'TD-6901028077711001', scanNode: '经销商收货', scanTime: '2026-04-26 13:10:23', result: '成功', deviceName: 'PDA-07', warehouseName: '济南中心仓', operatorName: '赵健', remark: '经销商整托签收通过。' },
        { id: 2, scanNo: 'JXS2026042504', signNo: 'QS2026042504', dealerName: '青岛经销商 B', codeValue: 'BX-6901028077711332', scanNode: '经销商收货', scanTime: '2026-04-25 18:51:08', result: '成功', deviceName: 'PDA-12', warehouseName: '青岛分仓', operatorName: '韩珊', remark: '关联签收单已同步完成。' },
        { id: 3, scanNo: 'JXS2026042403', signNo: 'QS2026042403', dealerName: '淄博前置仓', codeValue: 'PX-6901028077711445', scanNode: '终端签收', scanTime: '2026-04-24 17:18:18', result: '异常', deviceName: 'PDA-03', warehouseName: '淄博前置仓', operatorName: '刘达', remark: '终端签收时发现码状态冲突。' }
      ],
      rowActions: [{ key: 'detail', label: '详情' }, { key: 'trace', label: '轨迹' }, { key: 'log', label: '日志' }]
    }),

    '#/customerinquire': listSchema({
      title: '客户查询',
      tags: ['稽查查询', '客户查询'],
      toolbar: ['search', 'reset', 'export'],
      summaryCards: [
        { label: '客户档案', value: '132', desc: '经销商 46 家 · 终端 86 家', tone: 'primary' },
        { label: '启用客户', value: '124', desc: '停用客户 8 家', tone: 'success' },
        { label: '重点区域', value: '6', desc: '当前重点监测地市', tone: 'neutral' },
        { label: '最近更新', value: '04-26', desc: '客户主数据最近一次维护', tone: 'primary' }
      ],
      filters: [
        input('customerName', '客户名称', '请输入客户名称'),
        input('customerCode', '客户编码', '请输入客户编码'),
        input('region', '区域', '请输入区域'),
        select('status', '状态', ['启用', '停用'])
      ],
      columns: [
        col('customerCode', '客户编码', 140),
        col('customerName', '客户名称', 180),
        col('region', '区域', 120),
        col('channelType', '渠道类型', 120),
        col('manager', '负责人', 100),
        col('phone', '联系电话', 140),
        col('status', '状态', 100),
        col('updatedAt', '更新时间', 160)
      ],
      detailFields: [
        'customerCode',
        'customerName',
        'region',
        'channelType',
        'manager',
        'phone',
        'status',
        'updatedAt',
        { key: 'address', label: '联系地址' },
        { key: 'creditLevel', label: '信用等级' },
        { key: 'cooperateSince', label: '合作时间' },
        { key: 'remark', label: '客户备注' }
      ],
      rows: [
        { id: 1, customerCode: 'KH001', customerName: '济南泉城商贸', region: '济南', channelType: '经销商', manager: '高洋', phone: '0531-86550001', status: '启用', updatedAt: '2026-04-26 09:20:12', address: '济南市历城区工业北路 88 号', creditLevel: 'A', cooperateSince: '2019-06-18', remark: '省会重点经销商，签收与库存表现稳定。' },
        { id: 2, customerCode: 'KH014', customerName: '青岛和顺食品', region: '青岛', channelType: '经销商', manager: '张超', phone: '0532-86660014', status: '启用', updatedAt: '2026-04-25 15:43:55', address: '青岛市城阳区春阳路 61 号', creditLevel: 'A-', cooperateSince: '2020-03-12', remark: '旺季渠道动销强，库存周转较快。' },
        { id: 3, customerCode: 'KH032', customerName: '淄博星景便利', region: '淄博', channelType: '终端门店', manager: '李腾', phone: '0533-82330032', status: '停用', updatedAt: '2026-04-24 11:37:24', address: '淄博市张店区华光路 102 号', creditLevel: 'B', cooperateSince: '2022-11-02', remark: '当前暂停供货，待合同续签。' }
      ],
      rowActions: [{ key: 'detail', label: '详情' }, { key: 'log', label: '档案' }]
    }),

    '#/customerquery': listSchema({
      title: '客户窜货查询',
      tags: ['稽查查询', '客户窜货查询'],
      toolbar: ['search', 'reset', 'export'],
      summaryCards: [
        { label: '窜货预警', value: '9', desc: '高风险 2 单 · 今日新增 3 单', tone: 'primary' },
        { label: '已闭环', value: '21', desc: '近 7 日已完成处理案件', tone: 'success' },
        { label: '跨区流向', value: '4', desc: '需重点追踪的异常路线', tone: 'neutral' },
        { label: '处置时效', value: '93%', desc: '48 小时内响应达成率', tone: 'primary' }
      ],
      filters: [
        input('warningNo', '预警单号', '请输入预警单号'),
        input('customerName', '客户名称', '请输入客户名称'),
        select('level', '风险等级', ['高', '中', '低']),
        date('warningTime', '预警日期')
      ],
      columns: [
        col('warningNo', '预警单号', 170),
        col('customerName', '客户名称', 180),
        col('productName', '产品名称', 180),
        col('region', '发现区域', 140),
        col('level', '风险等级', 100),
        col('warningTime', '预警时间', 160),
        col('status', '状态', 100)
      ],
      detailFields: [
        'warningNo',
        'customerName',
        'productName',
        'region',
        'level',
        'warningTime',
        'status',
        { key: 'sourceRegion', label: '来源区域' },
        { key: 'targetRegion', label: '目标区域' },
        { key: 'traceSummary', label: '流向摘要' },
        { key: 'owner', label: '处理人' },
        { key: 'remark', label: '处理备注' }
      ],
      rows: [
        { id: 1, warningNo: 'CH2026042601', customerName: '济南泉城商贸', productName: '纯净水 500ml', region: '烟台', level: '高', warningTime: '2026-04-26 10:18:03', status: '待处理', sourceRegion: '济南', targetRegion: '烟台', traceSummary: '经销商 A 备货产品出现在烟台零售网点', owner: '孙航', remark: '待联系客户核实调拨单据。' },
        { id: 2, warningNo: 'CH2026042502', customerName: '青岛和顺食品', productName: '苏打水 330ml', region: '潍坊', level: '中', warningTime: '2026-04-25 16:32:21', status: '处理中', sourceRegion: '青岛', targetRegion: '潍坊', traceSummary: '分仓直发后流入跨市批发渠道', owner: '王潇', remark: '已补充运输凭证，待复核是否授权调拨。' },
        { id: 3, warningNo: 'CH2026042404', customerName: '淄博星景便利', productName: '纯净水 350ml', region: '东营', level: '低', warningTime: '2026-04-24 14:06:45', status: '已完成', sourceRegion: '淄博', targetRegion: '东营', traceSummary: '促销赠饮样品流转至临时活动点', owner: '何源', remark: '已确认属于活动物料，不计入异常。' }
      ],
      rowActions: [{ key: 'trace', label: '轨迹' }, { key: 'detail', label: '详情' }, { key: 'log', label: '日志' }]
    }),

    '#/forensics': listSchema({
      title: '稽查取证',
      tags: ['稽查查询', '稽查取证'],
      toolbar: ['search', 'reset', 'export'],
      summaryCards: [
        { label: '待办案件', value: '7', desc: '区域督办 2 起 · 高风险 1 起', tone: 'primary' },
        { label: '已上传证据', value: '26', desc: '图片、录音、票据已归档', tone: 'success' },
        { label: '今日取证', value: '3', desc: '新增现场线索案件', tone: 'neutral' },
        { label: '平均闭环', value: '1.8 天', desc: '稽查案件平均处理时长', tone: 'primary' }
      ],
      filters: [
        input('caseNo', '案件编号', '请输入案件编号'),
        input('region', '区域', '请输入区域'),
        input('inspector', '稽查员', '请输入稽查员'),
        select('status', '状态', ['待处理', '处理中', '已完成'])
      ],
      columns: [
        col('caseNo', '案件编号', 170),
        col('region', '区域', 140),
        col('storeName', '涉事门店', 180),
        col('inspector', '稽查员', 110),
        col('evidenceCount', '证据数量', 110),
        col('submitTime', '提交时间', 160),
        col('status', '状态', 100)
      ],
      detailFields: [
        'caseNo',
        'region',
        'storeName',
        'inspector',
        'evidenceCount',
        'submitTime',
        'status',
        { key: 'sourceChannel', label: '线索来源' },
        { key: 'riskLevel', label: '风险等级' },
        { key: 'evidenceSummary', label: '证据摘要' },
        { key: 'latestProgress', label: '最新进展' },
        { key: 'remark', label: '处理备注' }
      ],
      rows: [
        { id: 1, caseNo: 'JCQZ-20260426-01', region: '烟台', storeName: '福山便利店', inspector: '王潇', evidenceCount: 6, submitTime: '2026-04-26 11:08:43', status: '处理中', sourceChannel: '消费者预警上报', riskLevel: '高', evidenceSummary: '店内陈列、扫码录像、进货单、样品照片共 6 份', latestProgress: '待区域经理复核并下发处理意见', remark: '门店配合度一般，建议尽快二次走访。' },
        { id: 2, caseNo: 'JCQZ-20260425-02', region: '潍坊', storeName: '高新区烟酒店', inspector: '王潇', evidenceCount: 4, submitTime: '2026-04-25 17:16:09', status: '已完成', sourceChannel: '渠道巡检', riskLevel: '中', evidenceSummary: '图片 3 张、购货凭证 1 份', latestProgress: '案件闭环，结果同步至风控台账', remark: '确认为窜货样品，已完成处罚通知。' },
        { id: 3, caseNo: 'JCQZ-20260424-03', region: '东营', storeName: '河口批发部', inspector: '何源', evidenceCount: 2, submitTime: '2026-04-24 14:38:21', status: '待处理', sourceChannel: '系统风险命中', riskLevel: '低', evidenceSummary: '现场照片 2 张', latestProgress: '等待片区稽查排期', remark: '先保留案件，周一安排复查。' }
      ],
      rowActions: [
        { key: 'detail', label: '详情' },
        { key: 'inspect', label: '取证' },
        { key: 'log', label: '日志' }
      ]
    }),

    '#/informationinquiry': listSchema({
      title: '信息查询',
      tags: ['稽查查询', '信息查询'],
      toolbar: ['search', 'reset', 'export'],
      summaryCards: [
        { label: '今日查询', value: '128', desc: '异常命中 4 条 · 风险 2 条', tone: 'primary' },
        { label: '正品通过', value: '96.9%', desc: '消费者与稽查双端合并口径', tone: 'success' },
        { label: '多次查询', value: '17', desc: '同码高频查询需重点关注', tone: 'neutral' },
        { label: '最近命中', value: '12:18', desc: '最后一条风险查询时间', tone: 'primary' }
      ],
      filters: [
        input('codeValue', '码值', '请输入码值'),
        input('batchNo', '批次号', '请输入批次号'),
        input('productName', '产品名称', '请输入产品名称'),
        select('result', '结果', ['正品', '风险', '异常'])
      ],
      columns: [
        col('codeValue', '码值', 220),
        col('productName', '产品名称', 180),
        col('batchNo', '批次号', 160),
        col('factoryName', '生产工厂', 160),
        col('scanCount', '查询次数', 110),
        col('lastQuery', '最近查询时间', 160),
        col('result', '结果', 100)
      ],
      detailFields: [
        'codeValue',
        'productName',
        'batchNo',
        'factoryName',
        'scanCount',
        'lastQuery',
        'result',
        { key: 'firstQuery', label: '首次查询时间' },
        { key: 'lastQueryRegion', label: '最近查询区域' },
        { key: 'verifyPath', label: '码流转路径' },
        { key: 'consumerMobile', label: '查询手机号' },
        { key: 'resultDesc', label: '结果说明' }
      ],
      rows: [
        { id: 1, codeValue: '690102807771100001', productName: '纯净水 500ml', batchNo: 'PC2026042601', factoryName: '济南一厂', scanCount: 3, lastQuery: '2026-04-26 12:18:05', result: '正品', firstQuery: '2026-04-24 08:16:21', lastQueryRegion: '济南历下', verifyPath: '工厂赋码 → 成品仓 → 济南中心仓 → 终端门店', consumerMobile: '139****8821', resultDesc: '码段、批次、区域与流向均匹配。' },
        { id: 2, codeValue: '690102807771100157', productName: '苏打水 330ml', batchNo: 'PC2026042508', factoryName: '青岛二厂', scanCount: 14, lastQuery: '2026-04-25 19:28:44', result: '风险', firstQuery: '2026-04-25 09:22:08', lastQueryRegion: '威海环翠', verifyPath: '工厂赋码 → 青岛分仓 → 经销商 B → 异地终端', consumerMobile: '151****1092', resultDesc: '同码在 3 个城市重复查询，触发异地预警。' },
        { id: 3, codeValue: '690102807771100239', productName: '纯净水 350ml', batchNo: 'PC2026042402', factoryName: '淄博三厂', scanCount: 0, lastQuery: '--', result: '异常', firstQuery: '--', lastQueryRegion: '--', verifyPath: '码数据未完整入链', consumerMobile: '--', resultDesc: '该码未找到完整工厂赋码记录，请人工复核。' }
      ],
      rowActions: [
        { key: 'detail', label: '详情' },
        { key: 'trace', label: '流向' },
        { key: 'inspect', label: '核验' }
      ]
    }),

    '#/warningparam': listSchema({
      title: '预警参数',
      tags: ['稽查查询', '预警参数'],
      summaryCards: [
        { label: '启用参数', value: '12', desc: '覆盖异地、重码、频次等规则', tone: 'primary' },
        { label: '本周调整', value: '3', desc: '均已同步到预警引擎', tone: 'success' },
        { label: '停用参数', value: '1', desc: '保留历史版本可追溯', tone: 'neutral' },
        { label: '最近发布', value: '04-26', desc: '阈值策略最近上线日期', tone: 'primary' }
      ],
      filters: [
        input('paramName', '参数名称', '请输入参数名称'),
        input('scopeName', '适用范围', '请输入适用范围'),
        select('status', '状态', ['启用', '停用']),
        date('updatedAt', '更新日期')
      ],
      columns: [
        col('paramName', '参数名称', 160),
        col('paramCode', '参数编码', 140),
        col('paramValue', '参数值', 120),
        col('scopeName', '适用范围', 180),
        col('updatedBy', '维护人', 100),
        col('updatedAt', '更新时间', 160),
        col('status', '状态', 100)
      ],
      detailFields: [
        'paramName',
        'paramCode',
        'paramValue',
        'scopeName',
        'updatedBy',
        'updatedAt',
        'status',
        { key: 'paramDesc', label: '参数说明' },
        { key: 'triggerRule', label: '触发规则' },
        { key: 'versionNo', label: '版本号' },
        { key: 'remark', label: '维护备注' }
      ],
      rows: [
        { id: 1, paramName: '异地扫码阈值', paramCode: 'WARN_REGION_01', paramValue: '3', scopeName: '全国经销商', updatedBy: '系统管理员', updatedAt: '2026-04-26 08:40:12', status: '启用', paramDesc: '同一追溯码在短周期内跨区域查询超过阈值即告警。', triggerRule: '24 小时内跨 2 个以上地市且累计查询 ≥ 3 次', versionNo: 'v2.3.1', remark: '五一前加强异地窜货监测。' },
        { id: 2, paramName: '重码查询阈值', paramCode: 'WARN_REPEAT_02', paramValue: '2', scopeName: '所有产品', updatedBy: '系统管理员', updatedAt: '2026-04-25 10:18:57', status: '启用', paramDesc: '同一追溯码重复命中次数超过阈值时触发重码预警。', triggerRule: '同日重复查询 ≥ 2 次且渠道不一致', versionNo: 'v1.8.4', remark: '与消费者预警联动。' },
        { id: 3, paramName: '门店取证延时', paramCode: 'WARN_EVI_03', paramValue: '48h', scopeName: '终端门店', updatedBy: '平台运营', updatedAt: '2026-04-24 15:22:44', status: '停用', paramDesc: '门店案件超过规定时限未上传证据时提醒。', triggerRule: '案件创建后 48 小时未补齐证据', versionNo: 'v1.2.0', remark: '当前由新督办机制替代，规则已停用。' }
      ],
      rowActions: [
        { key: 'detail', label: '详情' },
        { key: 'edit', label: '编辑' },
        { key: 'log', label: '日志' }
      ]
    }),

    '#/queryconsumerwarning': listSchema({
      title: '消费者预警查询',
      tags: ['稽查查询', '消费者预警查询'],
      toolbar: ['search', 'reset', 'export'],
      summaryCards: [
        { label: '消费者预警', value: '13', desc: '高风险 2 条 · 今日新增 4 条', tone: 'primary' },
        { label: '已回访', value: '8', desc: '已完成电话回访与核验', tone: 'success' },
        { label: '待联系', value: '3', desc: '需客服与区域联合跟进', tone: 'neutral' },
        { label: '重复来电率', value: '11%', desc: '同手机号重复咨询占比', tone: 'primary' }
      ],
      filters: [
        input('warningNo', '预警编号', '请输入预警编号'),
        input('mobile', '手机号', '请输入手机号'),
        select('level', '预警等级', ['高', '中', '低']),
        date('warningTime', '预警时间')
      ],
      columns: [
        col('warningNo', '预警编号', 170),
        col('mobile', '手机号', 150),
        col('productName', '产品名称', 180),
        col('region', '扫码区域', 140),
        col('level', '预警等级', 100),
        col('warningTime', '预警时间', 160),
        col('status', '状态', 100)
      ],
      detailFields: [
        'warningNo',
        'mobile',
        'productName',
        'region',
        'level',
        'warningTime',
        'status',
        { key: 'queryScene', label: '扫码场景' },
        { key: 'hitRule', label: '命中规则' },
        { key: 'callbackStatus', label: '回访状态' },
        { key: 'owner', label: '客服负责人' },
        { key: 'remark', label: '处理备注' }
      ],
      rows: [
        { id: 1, warningNo: 'XF2026042601', mobile: '138****5521', productName: '纯净水 500ml', region: '烟台', level: '高', warningTime: '2026-04-26 09:44:08', status: '待处理', queryScene: '便利店首次扫码', hitRule: '异地 + 高频查询', callbackStatus: '未回访', owner: '客服一组', remark: '优先核查是否为窜货终端。' },
        { id: 2, warningNo: 'XF2026042502', mobile: '151****1092', productName: '苏打水 330ml', region: '威海', level: '中', warningTime: '2026-04-25 16:20:47', status: '处理中', queryScene: '餐饮终端复扫', hitRule: '同码跨区域复扫', callbackStatus: '回访中', owner: '客服二组', remark: '消费者已提供购买门店信息。' },
        { id: 3, warningNo: 'XF2026042405', mobile: '186****7834', productName: '纯净水 350ml', region: '东营', level: '低', warningTime: '2026-04-24 14:32:58', status: '已完成', queryScene: '活动物料扫码', hitRule: '促销码段命中', callbackStatus: '已回访', owner: '客服一组', remark: '确认为地推赠饮样品，已关闭预警。' }
      ],
      rowActions: [
        { key: 'detail', label: '详情' },
        { key: 'trace', label: '轨迹' },
        { key: 'log', label: '回访' }
      ]
    }),

    '#/qrcodescaninspectleveltwo': listSchema({
      title: '二级码稽查记录',
      tags: ['稽查查询', '二级码稽查记录'],
      toolbar: ['search', 'reset', 'export'],
      summaryCards: [
        { label: '二级码核验', value: '42', desc: '今日完成 9 次 · 异常 1 次', tone: 'primary' },
        { label: '通过率', value: '97.6%', desc: '二级码验证成功率', tone: 'success' },
        { label: '异常码', value: '1', desc: '待转入案件跟进', tone: 'neutral' },
        { label: '最近核验', value: '10:18', desc: '最后一次稽查时间', tone: 'primary' }
      ],
      filters: [
        input('inspectNo', '稽查编号', '请输入稽查编号'),
        input('codeValue', '二级码', '请输入二级码'),
        input('inspector', '稽查员', '请输入稽查员'),
        date('inspectTime', '稽查时间')
      ],
      columns: [
        col('inspectNo', '稽查编号', 170),
        col('codeValue', '二级码', 220),
        col('productName', '产品名称', 180),
        col('region', '稽查区域', 140),
        col('inspector', '稽查员', 110),
        col('inspectTime', '稽查时间', 160),
        col('result', '结果', 100)
      ],
      detailFields: [
        'inspectNo',
        'codeValue',
        'productName',
        'region',
        'inspector',
        'inspectTime',
        'result',
        { key: 'dealerName', label: '关联经销商' },
        { key: 'scanNode', label: '扫码节点' },
        { key: 'verifyResult', label: '核验说明' },
        { key: 'remark', label: '补充备注' }
      ],
      rows: [
        { id: 1, inspectNo: 'EJ2026042601', codeValue: 'BX-6901028077711001', productName: '纯净水 500ml', region: '烟台', inspector: '王潇', inspectTime: '2026-04-26 10:18:55', result: '成功', dealerName: '烟台经销商 A', scanNode: '终端验真', verifyResult: '二级码与箱码关联一致，流向正常。', remark: '现场扫码通过。' },
        { id: 2, inspectNo: 'EJ2026042504', codeValue: 'BX-6901028077711332', productName: '苏打水 330ml', region: '潍坊', inspector: '王潇', inspectTime: '2026-04-25 17:11:40', result: '异常', dealerName: '青岛经销商 B', scanNode: '经销商抽检', verifyResult: '二级码与历史流向不匹配，已标记异常。', remark: '建议转入取证流程。' },
        { id: 3, inspectNo: 'EJ2026042402', codeValue: 'BX-6901028077711445', productName: '纯净水 350ml', region: '东营', inspector: '何源', inspectTime: '2026-04-24 14:26:31', result: '成功', dealerName: '东营前置仓', scanNode: '门店回访', verifyResult: '码段信息完整，物流轨迹闭环。', remark: '与消费者口径一致。' }
      ],
      rowActions: [
        { key: 'detail', label: '详情' },
        { key: 'inspect', label: '核验' },
        { key: 'log', label: '日志' }
      ]
    }),

    '#/inspectrecord': listSchema({
      title: '稽查记录',
      tags: ['稽查查询', '稽查记录'],
      toolbar: ['search', 'reset', 'export'],
      summaryCards: [
        { label: '稽查记录', value: '36', desc: '问题记录 7 条 · 已闭环 29 条', tone: 'primary' },
        { label: '发现问题', value: '3', desc: '当前待整改问题点位', tone: 'success' },
        { label: '跟进中', value: '2', desc: '待补证或待区域复核', tone: 'neutral' },
        { label: '本周巡检', value: '11', desc: '片区计划完成率 92%', tone: 'primary' }
      ],
      filters: [
        input('recordNo', '记录编号', '请输入记录编号'),
        input('region', '区域', '请输入区域'),
        input('inspector', '稽查员', '请输入稽查员'),
        select('status', '状态', ['待处理', '处理中', '已完成'])
      ],
      columns: [
        col('recordNo', '记录编号', 170),
        col('region', '区域', 140),
        col('inspectTarget', '稽查对象', 180),
        col('inspector', '稽查员', 110),
        col('issueCount', '问题数量', 110),
        col('recordTime', '记录时间', 160),
        col('status', '状态', 100)
      ],
      detailFields: [
        'recordNo',
        'region',
        'inspectTarget',
        'inspector',
        'issueCount',
        'recordTime',
        'status',
        { key: 'routePlan', label: '巡检路线' },
        { key: 'issueSummary', label: '问题摘要' },
        { key: 'resultSummary', label: '处理结果' },
        { key: 'remark', label: '补充说明' }
      ],
      rows: [
        { id: 1, recordNo: 'JCJL2026042601', region: '烟台', inspectTarget: '福山便利店', inspector: '王潇', issueCount: 2, recordTime: '2026-04-26 10:26:19', status: '处理中', routePlan: '烟台福山片区门店巡检', issueSummary: '价签不符、异地码出现', resultSummary: '已拍照取证并上报区域经理', remark: '待门店补交进货票据。' },
        { id: 2, recordNo: 'JCJL2026042503', region: '潍坊', inspectTarget: '高新区烟酒店', inspector: '王潇', issueCount: 1, recordTime: '2026-04-25 17:22:09', status: '已完成', routePlan: '潍坊高新区专项抽检', issueSummary: '单个批次流向异常', resultSummary: '核实为授权促销调拨', remark: '记录已归档。' },
        { id: 3, recordNo: 'JCJL2026042405', region: '东营', inspectTarget: '河口批发部', inspector: '何源', issueCount: 0, recordTime: '2026-04-24 14:42:17', status: '待处理', routePlan: '东营河口渠道回访', issueSummary: '暂无异常，需补充门店签收图片', resultSummary: '等待上传完整巡检资料', remark: '资料完整后自动闭环。' }
      ],
      rowActions: [
        { key: 'detail', label: '详情' },
        { key: 'inspect', label: '处理' },
        { key: 'log', label: '日志' }
      ]
    }),

    '#/dragpage': listSchema({
      title: '流向轨迹查询',
      tags: ['稽查查询', '流向轨迹查询'],
      toolbar: ['search', 'reset', 'export'],
      summaryCards: [
        { label: '轨迹查询', value: '58', desc: '今日追踪 6 条 · 高风险 1 条', tone: 'primary' },
        { label: '跨城流向', value: '14', desc: '涉及省内多区域流转', tone: 'success' },
        { label: '异常路径', value: '2', desc: '需结合取证继续核验', tone: 'neutral' },
        { label: '平均里程', value: '292km', desc: '当前样本平均流转距离', tone: 'primary' }
      ],
      filters: [
        input('traceNo', '轨迹编号', '请输入轨迹编号'),
        input('codeValue', '码值', '请输入码值'),
        input('startRegion', '起始区域', '请输入起始区域'),
        input('endRegion', '目标区域', '请输入目标区域')
      ],
      columns: [
        col('traceNo', '轨迹编号', 170),
        col('codeValue', '码值', 220),
        col('startRegion', '起始区域', 140),
        col('endRegion', '目标区域', 140),
        col('currentRegion', '当前区域', 140),
        col('distance', '流向距离', 110),
        col('updatedAt', '更新时间', 160)
      ],
      detailFields: [
        'traceNo',
        'codeValue',
        'startRegion',
        'endRegion',
        'currentRegion',
        'distance',
        'updatedAt',
        { key: 'transportPath', label: '流向路径' },
        { key: 'currentNode', label: '当前节点' },
        { key: 'riskFlag', label: '风险标记' },
        { key: 'remark', label: '轨迹备注' }
      ],
      rows: [
        { id: 1, traceNo: 'LXTJ2026042601', codeValue: '690102807771100001', startRegion: '济南', endRegion: '烟台', currentRegion: '潍坊', distance: '412km', updatedAt: '2026-04-26 12:16:28', transportPath: '济南一厂 → 济南中心仓 → 潍坊中转仓 → 烟台门店', currentNode: '潍坊中转仓', riskFlag: '正常', remark: '预计今日晚间到达终端仓。' },
        { id: 2, traceNo: 'LXTJ2026042502', codeValue: '690102807771100157', startRegion: '青岛', endRegion: '威海', currentRegion: '威海', distance: '266km', updatedAt: '2026-04-25 18:26:03', transportPath: '青岛二厂 → 青岛分仓 → 威海经销商 → 终端门店', currentNode: '威海终端门店', riskFlag: '关注', remark: '同码出现重复扫码，建议结合消费者预警查看。' },
        { id: 3, traceNo: 'LXTJ2026042404', codeValue: '690102807771100239', startRegion: '淄博', endRegion: '东营', currentRegion: '滨州', distance: '198km', updatedAt: '2026-04-24 15:31:44', transportPath: '淄博三厂 → 滨州中转仓 → 东营前置仓', currentNode: '滨州中转仓', riskFlag: '异常', remark: '轨迹停留时间过长，需排查在途滞留。' }
      ],
      rowActions: [{ key: 'trace', label: '轨迹' }, { key: 'detail', label: '详情' }, { key: 'log', label: '日志' }]
    }),

    '#/dashboardOverview': boardSchema({
      title: '全渠道总览',
      tags: ['运营总览', '全渠道总览'],
      metrics: [
        { label: '今日发货单', value: '186', desc: '已签收 142 · 签收率 76.3%' },
        { label: '渠道库存', value: '26,840', desc: '预警仓位 7 · 较昨日 +5.4%' },
        { label: '消费者预警', value: '13', desc: '高风险 2 · 已闭环 9 单' },
        { label: '稽查案件', value: '24', desc: '处理中 8 · 本周新增 6 单' }
      ],
      charts: [
        { type: 'line', title: '近 30 天签收趋势', data: lineChart(trend30, [{ name: '签收量', data: [122, 131, 148, 156, 162, 171, 180, 176, 184, 196, 205, 198, 214, 221, 232, 226, 219, 240, 252, 245, 258, 266, 271, 285, 278, 291, 304, 298, 312, 326] }]) },
        { type: 'bar', title: '区域库存排行', data: lineChart(['济南', '青岛', '烟台', '潍坊', '淄博', '威海'], [{ name: '库存量', data: [6840, 5210, 4380, 3920, 3560, 3180] }]) },
        { type: 'line', title: '近 12 月消费者验真趋势', data: lineChart(trend12, [{ name: '验真次数', data: [12, 14, 15, 16, 18, 19, 17, 21, 23, 24, 26, 28] }]) }
      ],
      lists: [
        { title: '今日高频扫码区域', items: ['1. 济南历城区 1,284 次', '2. 青岛城阳区 1,032 次', '3. 烟台芝罘区 928 次', '4. 潍坊高新区 877 次', '5. 淄博张店区 765 次'] },
        { title: '经销商签收效率榜', items: ['1. 济南经销商 A · 97%', '2. 青岛经销商 B · 95%', '3. 烟台经销商 C · 92%', '4. 淄博经销商 D · 88%', '5. 潍坊经销商 E · 86%'] },
        { title: '异常预警待办', items: ['1. 烟台区域异地扫码预警 2 单', '2. 青岛终端重码告警 1 单', '3. 潍坊渠道库存低于阈值', '4. 淄博签收超时 3 单', '5. 威海退货工单待审核 1 单'] },
        { title: '待签收订单', items: ['1. FH-20260426-11 · 济南经销商 A', '2. FH-20260426-18 · 青岛经销商 B', '3. FH-20260426-22 · 烟台经销商 C', '4. FH-20260426-25 · 淄博前置仓', '5. FH-20260426-31 · 威海渠道 D'] }
      ]
    }),

    '#/productionMonitoring': boardSchema({
      title: '生产监控',
      tags: ['生产管理', '生产监控'],
      metrics: [
        { label: '运行产线', value: '12', desc: '停机产线 2 · 开机率 85.7%' },
        { label: '今日产量', value: '18,260', desc: '达成率 93% · 目标 19,600' },
        { label: '异常报警', value: '6', desc: '已处理 4 · 处理中 2 条' },
        { label: '工单进度', value: '28', desc: '已完成 19 · 完成率 67.9%' }
      ],
      charts: [
        { type: 'line', title: '近 12 月产量趋势', data: lineChart(trend12, [{ name: '产量', data: [128, 136, 149, 158, 171, 168, 176, 183, 192, 205, 214, 221] }]) },
        { type: 'bar', title: '各车间达成率', data: lineChart(['灌装一车间', '灌装二车间', '包装车间', '装配车间', '检验车间'], [{ name: '达成率', data: [96, 91, 88, 84, 93] }]) },
        { type: 'line', title: '近 24 小时报警分布', data: lineChart(['00', '02', '04', '06', '08', '10', '12', '14', '16', '18', '20', '22'], [{ name: '报警数', data: [0, 1, 0, 1, 2, 1, 1, 2, 0, 1, 0, 0] }]) }
      ],
      lists: [
        { title: '产线预警', items: ['1. 二号线温控偏高', '2. 三号线待切换瓶型', '3. 包装线喷码偏移复核中', '4. 原料投料节拍略慢', '5. 检验线待补扫码设备'] },
        { title: '工单完成榜', items: ['1. GD-202604-001 · 96%', '2. GD-202604-004 · 91%', '3. GD-202604-008 · 88%', '4. GD-202604-010 · 85%', '5. GD-202604-011 · 82%'] },
        { title: '设备保养提醒', items: ['1. 一号线喷码机 · 今日保养', '2. 三号线贴标机 · 明日点检', '3. 包装线封箱机 · 耗材临界', '4. 检验线扫码枪 · 待校准', '5. 码垛线升降机 · 周期复检'] }
      ]
    }),

    '#/scada-dashboard': boardSchema({
      title: 'SCADA 监控看板',
      tags: ['设备看板', 'SCADA 监控'],
      metrics: [
        { label: '在线设备', value: '48', desc: '离线设备 3 · 在线率 94.1%' },
        { label: '今日报警', value: '21', desc: '紧急报警 2 · 已恢复 16 条' },
        { label: '平均 OEE', value: '87.5%', desc: '最佳产线 一号线 · 较昨日 +1.8%' },
        { label: '能耗指数', value: '68.2', desc: '峰值时段 14:00 · 低于阈值' }
      ],
      charts: [
        { type: 'line', title: '24 小时报警趋势', data: lineChart(['00', '02', '04', '06', '08', '10', '12', '14', '16', '18', '20', '22'], [{ name: '报警数', data: [2, 1, 0, 3, 2, 1, 4, 6, 3, 2, 1, 0] }]) },
        { type: 'bar', title: '设备 OEE 排名', data: lineChart(['一号线', '二号线', '三号线', '包装线', '贴标线', '码垛线'], [{ name: 'OEE', data: [92, 88, 84, 79, 83, 86] }]) },
        { type: 'line', title: '能耗时段波动', data: lineChart(['00', '03', '06', '09', '12', '15', '18', '21'], [{ name: '能耗指数', data: [52, 48, 57, 66, 72, 68, 61, 55] }]) }
      ],
      lists: [
        { title: '最新设备报警', items: ['1. 包装线温度上浮', '2. 二号线气压偏低', '3. 码垛线暂停待料', '4. 贴标线视觉校准提醒', '5. 一号线喷码缓存告警'] },
        { title: '巡检建议', items: ['1. 复核二号线空压机', '2. 清洁包装线传感器', '3. 更新码垛线保养记录', '4. 检查贴标机视觉灯源', '5. 盘点备用喷码耗材'] },
        { title: '设备停机排行', items: ['1. 包装线 · 38 分钟', '2. 二号线 · 25 分钟', '3. 贴标线 · 16 分钟', '4. 码垛线 · 12 分钟', '5. 三号线 · 8 分钟'] }
      ]
    }),

    '#/warehouselogistics': boardSchema({
      title: '仓储物流驾驶舱',
      tags: ['仓储物流', '物流驾驶舱'],
      metrics: [
        { label: '待发运订单', value: '43', desc: '紧急订单 6 · 准时率 92%' },
        { label: '在途车辆', value: '18', desc: '已到达 29 · 今日总车次 47' },
        { label: '仓库周转', value: '5.8', desc: '库位利用率 81% · 安全库存稳定' },
        { label: '退货在途', value: '9', desc: '已入退货仓 4 · 待复核 5 单' }
      ],
      charts: [
        { type: 'line', title: '近 30 天发运趋势', data: lineChart(trend30, [{ name: '发运单量', data: [42, 45, 44, 46, 48, 53, 52, 50, 56, 58, 61, 63, 62, 64, 68, 66, 65, 70, 72, 74, 73, 76, 78, 77, 80, 82, 84, 86, 85, 88] }]) },
        { type: 'bar', title: '仓库吞吐排行', data: lineChart(['成品仓 A', '成品仓 B', '中转仓', '青岛分仓', '济宁分仓'], [{ name: '吞吐量', data: [1820, 1630, 1260, 980, 840] }]) },
        { type: 'line', title: '近 12 月退货趋势', data: lineChart(trend12, [{ name: '退货单量', data: [8, 7, 9, 6, 8, 10, 7, 9, 11, 10, 8, 9] }]) }
      ],
      lists: [
        { title: '即将超时发运单', items: ['1. FH-20260426-11', '2. FH-20260426-15', '3. FH-20260426-19', '4. FH-20260426-21', '5. FH-20260426-26'] },
        { title: '在途车辆状态', items: ['1. 鲁A·Q2398 · 济南 → 烟台', '2. 鲁B·M8821 · 青岛 → 威海', '3. 鲁C·H4502 · 济宁 → 临沂', '4. 鲁D·P6729 · 淄博 → 东营', '5. 鲁E·K0916 · 潍坊 → 德州'] },
        { title: '库位预警', items: ['1. 成品仓 A · 利用率 92%', '2. 青岛分仓 · 安全库存临界', '3. 中转仓 · 待清理异常托盘', '4. 退货仓 · 待复核 5 单', '5. 济宁分仓 · 冷区温度提醒'] }
      ]
    }),

    '#/inspectionManagement': boardSchema({
      title: '稽查管理看板',
      tags: ['稽查管理', '稽查看板'],
      metrics: [
        { label: '今日预警', value: '17', desc: '高风险 3 · 已处置 11 条' },
        { label: '在办案件', value: '24', desc: '已结案 9 · 结案率 37.5%' },
        { label: '外勤稽查员', value: '12', desc: '在线 9 · 覆盖 8 个地市' },
        { label: '证据上传', value: '58', desc: '待审核 7 · 今日新增 14 条' }
      ],
      charts: [
        { type: 'line', title: '近 30 天预警闭环', data: lineChart(trend30, [{ name: '闭环数量', data: [5, 6, 4, 8, 7, 6, 9, 8, 10, 9, 11, 12, 8, 13, 12, 11, 14, 12, 15, 13, 16, 15, 14, 17, 15, 18, 17, 19, 18, 20] }]) },
        { type: 'bar', title: '地市案件分布', data: lineChart(['济南', '青岛', '烟台', '潍坊', '淄博', '威海'], [{ name: '案件数', data: [8, 6, 5, 4, 3, 2] }]) },
        { type: 'line', title: '近 12 月消费者预警', data: lineChart(trend12, [{ name: '预警数', data: [18, 16, 19, 22, 24, 21, 25, 27, 29, 28, 31, 33] }]) }
      ],
      lists: [
        { title: '高风险待处置', items: ['1. 烟台异地扫码预警', '2. 潍坊重码连续触发', '3. 威海终端异常签收', '4. 东营渠道退货频发', '5. 济宁库存异常波动'] },
        { title: '外勤进度', items: ['1. 王潇 · 烟台 · 已完成 3 点位', '2. 何源 · 东营 · 已完成 2 点位', '3. 韩珊 · 潍坊 · 取证中', '4. 赵健 · 青岛 · 复核中', '5. 刘凯 · 济南 · 待出发'] },
        { title: '证据待审核', items: ['1. JCQZ-20260426-01 · 图片 6 张', '2. JCQZ-20260425-08 · 票据 2 份', '3. JCQZ-20260424-12 · 视频 1 段', '4. JCQZ-20260424-15 · 录音 1 段', '5. JCQZ-20260423-06 · 门店陈列照片'] }
      ]
    })
  };
})();
