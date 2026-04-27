window.dashboardShellData = {
  brandName: '产品追溯系统',
  userName: '系统管理员',
  userRole: '平台管理中心',
  notices: 4,
  menus: [
    {
      index: 'dashboard',
      icon: 'el-icon-odometer',
      title: '总览首页',
      route: '#/dashboard',
      pageKey: 'dashboard',
      breadcrumb: '首页 / 经营看板 / 总览首页'
    },
    {
      index: 'trace-system',
      icon: 'el-icon-menu',
      title: '产品追溯系统',
      children: [
        {
          index: 'production',
          title: '生产管理',
          children: [
            {
              index: 'plant-info',
              title: '工厂信息',
              children: [
                {
                  index: 'plant-manage',
                  title: '工厂管理',
                  children: [
                    { index: 'plant-list', title: '工厂列表', route: '#/home/plant/plantinfo/plantmanage/plantlist', pageKey: 'plant-list', breadcrumb: '首页 / 生产管理 / 工厂列表' },
                    { index: 'workshop-list', title: '车间列表', route: '#/workshoplist', pageKey: 'workshop-list', breadcrumb: '首页 / 生产管理 / 车间列表' },
                    { index: 'workline', title: '产线列表', route: '#/workline', pageKey: 'workline-list', breadcrumb: '首页 / 生产管理 / 产线列表' }
                  ]
                },
                { index: 'classlist', title: '班组管理', route: '#/home/plant/plantinfo/classlist', pageKey: 'class-list', breadcrumb: '首页 / 生产管理 / 班组管理' }
              ]
            },
            {
              index: 'production-info',
              title: '生产信息',
              children: [
                { index: 'order-plus', title: '生产加工单', route: '#/orderPlus', pageKey: 'order-plus', breadcrumb: '首页 / 生产管理 / 生产加工单' },
                { index: 'order-subtask', title: '生产子加工单', route: '#/orderSubtask', pageKey: 'order-subtask', breadcrumb: '首页 / 生产管理 / 生产子加工单' },
                { index: 'order-list', title: '生产批次加工单', route: '#/orderlist', pageKey: 'order-list', breadcrumb: '首页 / 生产管理 / 生产批次加工单' },
                { index: 'receipt', title: '生产入库', route: '#/receipt', pageKey: 'receipt', breadcrumb: '首页 / 生产管理 / 生产入库' },
                { index: 'receipt-scan', title: '生产扫码记录', route: '#/receiptScan', pageKey: 'receipt-scan', breadcrumb: '首页 / 生产管理 / 生产扫码记录' },
                { index: 'relevance', title: '包装关联', route: '#/relevance', pageKey: 'relevance', breadcrumb: '首页 / 生产管理 / 包装关联' },
                { index: 'unrelevance', title: '关联解除', route: '#/unrelevance1', pageKey: 'unrelevance', breadcrumb: '首页 / 生产管理 / 关联解除' },
                { index: 'replace', title: '关联替换', route: '#/home/plant/production/replace', pageKey: 'replace', breadcrumb: '首页 / 生产管理 / 关联替换' },
                { index: 'repeatedquery', title: '重码查询', route: '#/repeatedquery', pageKey: 'repeatedquery', breadcrumb: '首页 / 生产管理 / 重码查询' },
                { index: 'harvestrate', title: '工单采集率', route: '#/harvestrate', pageKey: 'harvestrate', breadcrumb: '首页 / 生产管理 / 工单采集率' }
              ]
            }
          ]
        },
        {
          index: 'factory-logistics',
          title: '工厂物流',
          children: [
            { index: 'freight', title: '运单管理', route: '#/freight', pageKey: 'freight', breadcrumb: '首页 / 工厂物流 / 运单管理' },
            { index: 'boxcode', title: '箱码查询', route: '#/boxcode', pageKey: 'boxcode', breadcrumb: '首页 / 工厂物流 / 箱码查询' },
            { index: 'barter', title: '换货查询', route: '#/barter', pageKey: 'barter', breadcrumb: '首页 / 工厂物流 / 换货查询' },
            { index: 'findDirection', title: '批次流向查询', route: '#/findDirection', pageKey: 'findDirection', breadcrumb: '首页 / 工厂物流 / 批次流向查询' },
            { index: 'refund', title: '退货日志', route: '#/refund', pageKey: 'refund', breadcrumb: '首页 / 工厂物流 / 退货日志' },
            { index: 'transferOutOrder', title: '调拨出库单', route: '#/transferOutOrder', pageKey: 'transferOutOrder', breadcrumb: '首页 / 工厂物流 / 调拨出库单' },
            { index: 'transferOutOrderScan', title: '调拨扫码记录', route: '#/transferOutOrderScan', pageKey: 'transferOutOrderScan', breadcrumb: '首页 / 工厂物流 / 调拨扫码记录' },
            { index: 'dealersignorderlogs', title: '经销商签收单日志', route: '#/dealersignorderlogs', pageKey: 'dealersignorderlogs', breadcrumb: '首页 / 工厂物流 / 经销商签收单日志' },
            { index: 'dealersignqrcodescanlog', title: '经销商扫码签收日志', route: '#/dealersignqrcodescanlog', pageKey: 'dealersignqrcodescanlog', breadcrumb: '首页 / 工厂物流 / 经销商扫码签收日志' }
          ]
        },
        {
          index: 'channel-logistics',
          title: '渠道物流',
          children: [
            { index: 'tssttSsignWeblist', title: '终端签收记录', route: '#/tssttSsignWeblist', pageKey: 'tssttSsignWeblist', breadcrumb: '首页 / 渠道物流 / 终端签收记录' },
            { index: 'refundorderlist', title: '退货工单列表', route: '#/refundorderlist', pageKey: 'refundorderlist', breadcrumb: '首页 / 渠道物流 / 退货工单列表' },
            { index: 'sttSsignWeblist', title: '经销商签收记录', route: '#/sttSsignWeblist', pageKey: 'sttSsignWeblist', breadcrumb: '首页 / 渠道物流 / 经销商签收记录' },
            { index: 'sttSsignscancodelogs', title: '签收扫码日志', route: '#/sttSsignscancodelogs', pageKey: 'sttSsignscancodelogs', breadcrumb: '首页 / 渠道物流 / 签收扫码日志' },
            { index: 'channelinventorylist', title: '渠道库存列表', route: '#/channelinventorylist', pageKey: 'channelinventorylist', breadcrumb: '首页 / 渠道物流 / 渠道库存列表' },
            { index: 'channelinventorylogs', title: '渠道库存流水', route: '#/channelinventorylogs', pageKey: 'channelinventorylogs', breadcrumb: '首页 / 渠道物流 / 渠道库存流水' }
          ]
        },
        {
          index: 'inspection',
          title: '稽查管理',
          children: [
            { index: 'forensics', title: '稽查取证', route: '#/forensics', pageKey: 'forensics', breadcrumb: '首页 / 稽查管理 / 稽查取证' },
            { index: 'inspectrecord', title: '稽查记录', route: '#/inspectrecord', pageKey: 'inspectrecord', breadcrumb: '首页 / 稽查管理 / 稽查记录' },
            { index: 'qrcodescaninspectleveltwo', title: '二级码稽查记录', route: '#/qrcodescaninspectleveltwo', pageKey: 'qrcodescaninspectleveltwo', breadcrumb: '首页 / 稽查管理 / 二级码稽查记录' },
            { index: 'queryconsumerwarning', title: '消费者预警查询', route: '#/queryconsumerwarning', pageKey: 'queryconsumerwarning', breadcrumb: '首页 / 稽查管理 / 消费者预警查询' },
            { index: 'warningparam', title: '预警参数', route: '#/warningparam', pageKey: 'warningparam', breadcrumb: '首页 / 稽查管理 / 预警参数' }
          ]
        },
        {
          index: 'query',
          title: '查询管理',
          children: [
            { index: 'informationinquiry', title: '信息查询', route: '#/informationinquiry', pageKey: 'informationinquiry', breadcrumb: '首页 / 查询管理 / 信息查询' },
            { index: 'customerinquire', title: '客户查询', route: '#/customerinquire', pageKey: 'customerinquire', breadcrumb: '首页 / 查询管理 / 客户查询' },
            { index: 'customerquery', title: '客户窜货查询', route: '#/customerquery', pageKey: 'customerquery', breadcrumb: '首页 / 查询管理 / 客户窜货查询' },
            { index: 'dragpage', title: '流向轨迹查询', route: '#/dragpage', pageKey: 'dragpage', breadcrumb: '首页 / 查询管理 / 流向轨迹查询' }
          ]
        },
        {
          index: 'boards',
          title: '看板',
          children: [
            { index: 'dashboardOverview', title: '全渠道总览', route: '#/dashboardOverview', pageKey: 'dashboardOverview', breadcrumb: '首页 / 看板 / 全渠道总览' },
            { index: 'productionMonitoring', title: '生产监控', route: '#/productionMonitoring', pageKey: 'productionMonitoring', breadcrumb: '首页 / 看板 / 生产监控' },
            { index: 'scada-dashboard', title: 'SCADA 监控看板', route: '#/scada-dashboard', pageKey: 'scada-dashboard', breadcrumb: '首页 / 看板 / SCADA 监控看板' },
            { index: 'warehouselogistics', title: '仓储物流驾驶舱', route: '#/warehouselogistics', pageKey: 'warehouselogistics', breadcrumb: '首页 / 看板 / 仓储物流驾驶舱' },
            { index: 'inspectionManagement', title: '稽查管理看板', route: '#/inspectionManagement', pageKey: 'inspectionManagement', breadcrumb: '首页 / 看板 / 稽查管理看板' }
          ]
        }
      ]
    }
  ]
};

window.dashboardMetrics = {
  cardDataOne: {
    titleOne: '今日产量',
    numOne: 1280,
    titleTwo: '今日计划产量',
    numTwo: 1500,
    ratioLabel: '完成率'
  },
  cardData: [
    {
      titleOne: '今日发货量',
      numOne: 968,
      titleTwo: '今日计划发货量',
      numTwo: 1100,
      ratioLabel: '完成率'
    },
    {
      titleOne: '年度累计扫码量',
      numOne: 486320,
      titleTwo: '历史累计扫码次数',
      numTwo: 1352840
    },
    {
      titleOne: '今日用户扫码量',
      numOne: 9240,
      marginTop: '18px'
    },
    {
      titleOne: '今日用户预警数',
      numOne: 14,
      titleTwo: '年度累计用户预警数',
      numTwo: 387
    }
  ]
};

window.dashboardTrend = {
  lineChartDataOne: {
    xAxis: [
      '03-28', '03-29', '03-30', '03-31', '04-01', '04-02', '04-03', '04-04',
      '04-05', '04-06', '04-07', '04-08', '04-09', '04-10', '04-11', '04-12',
      '04-13', '04-14', '04-15', '04-16', '04-17', '04-18', '04-19', '04-20',
      '04-21', '04-22', '04-23', '04-24', '04-25', '04-26'
    ],
    series: [
      {
        name: '生产数量',
        data: [
          980, 1040, 1120, 1160, 1220, 1290, 1360, 1450, 1400, 1330,
          1280, 1390, 1420, 1500, 1530, 1490, 1460, 1380, 1340, 1310,
          1360, 1430, 1470, 1510, 1560, 1620, 1590, 1540, 1480, 1280
        ]
      },
      {
        name: '发货数量',
        data: [
          760, 810, 860, 900, 950, 980, 1020, 1080, 1110, 1050,
          1010, 1090, 1130, 1160, 1190, 1220, 1180, 1120, 1090, 1040,
          1070, 1140, 1180, 1210, 1260, 1290, 1240, 1180, 1110, 968
        ]
      }
    ]
  }
};

window.dashboardHeatmaps = {
  customPieces: [
    { gt: 300, label: '> 300 次', color: '#2f7df6' },
    { gte: 180, lte: 300, label: '180 - 300 次', color: '#33b3ff' },
    { gte: 90, lt: 180, label: '90 - 180 次', color: '#59d68d' },
    { gt: 0, lt: 90, label: '1 - 89 次', color: '#f6c65b' },
    { value: 0, label: '无扫码', color: '#e8eef5' }
  ],
  scanData: [
    { name: '济南市', value: 286 }, { name: '青岛市', value: 312 }, { name: '淄博市', value: 126 }, { name: '枣庄市', value: 64 },
    { name: '东营市', value: 58 }, { name: '烟台市', value: 214 }, { name: '潍坊市', value: 252 }, { name: '济宁市', value: 147 },
    { name: '泰安市', value: 102 }, { name: '威海市', value: 91 }, { name: '日照市', value: 76 }, { name: '临沂市', value: 198 },
    { name: '德州市', value: 133 }, { name: '聊城市', value: 87 }, { name: '滨州市', value: 96 }, { name: '菏泽市', value: 108 }
  ],
  scanData1: [
    { name: '济南市', value: 34 }, { name: '青岛市', value: 48 }, { name: '淄博市', value: 19 }, { name: '枣庄市', value: 8 },
    { name: '东营市', value: 11 }, { name: '烟台市', value: 27 }, { name: '潍坊市', value: 31 }, { name: '济宁市', value: 23 },
    { name: '泰安市', value: 14 }, { name: '威海市', value: 12 }, { name: '日照市', value: 7 }, { name: '临沂市', value: 26 },
    { name: '德州市', value: 18 }, { name: '聊城市', value: 9 }, { name: '滨州市', value: 13 }, { name: '菏泽市', value: 16 }
  ],
  scanInspect: [
    { name: '济南市', value: 12 }, { name: '青岛市', value: 9 }, { name: '淄博市', value: 6 }, { name: '枣庄市', value: 3 },
    { name: '东营市', value: 2 }, { name: '烟台市', value: 10 }, { name: '潍坊市', value: 14 }, { name: '济宁市', value: 7 },
    { name: '泰安市', value: 5 }, { name: '威海市', value: 4 }, { name: '日照市', value: 3 }, { name: '临沂市', value: 11 },
    { name: '德州市', value: 6 }, { name: '聊城市', value: 4 }, { name: '滨州市', value: 5 }, { name: '菏泽市', value: 8 }
  ],
  cardList1: ['青岛市 · 312 次', '济南市 · 286 次', '潍坊市 · 252 次', '烟台市 · 214 次', '临沂市 · 198 次'],
  cardList11: ['青岛市 · 48 次', '济南市 · 34 次', '潍坊市 · 31 次', '烟台市 · 27 次', '临沂市 · 26 次'],
  cardList2: ['纯净水 500ml · 4,820 次', '苏打水 330ml · 3,650 次', '纯净水 350ml · 2,940 次', '弱碱水 550ml · 1,870 次', '气泡水青柠味 · 1,224 次'],
  cardList22: ['纯净水 500ml · 420 次', '苏打水 330ml · 318 次', '纯净水 350ml · 261 次', '弱碱水 550ml · 178 次', '气泡水青柠味 · 123 次'],
  cardList3: ['潍坊市 · 14 条', '济南市 · 12 条', '临沂市 · 11 条', '烟台市 · 10 条', '青岛市 · 9 条'],
  cardList4: ['纯净水 500ml · 18 条', '苏打水 330ml · 13 条', '纯净水 350ml · 11 条', '弱碱水 550ml · 7 条', '气泡水青柠味 · 5 条']
};

window.dashboardFactoryProgress = {
  barChartData: {
    xAxis: ['济南一厂', '青岛二厂', '淄博三厂', '烟台四厂', '潍坊五厂'],
    series: [
      { name: '计划产量', data: [3200, 2800, 2400, 2100, 1800] },
      { name: '实际产量', data: [2960, 2640, 2010, 1880, 1720] }
    ]
  },
  barChartData2: {
    xAxis: ['济南一厂', '青岛二厂', '淄博三厂', '烟台四厂', '潍坊五厂'],
    series: [
      { name: '计划发货', data: [2800, 2400, 2200, 1900, 1600] },
      { name: '实际发货', data: [2580, 2210, 1980, 1730, 1510] }
    ]
  }
};

window.plantListModuleData = {
  pageSize: 10,
  factoryTypes: ['瓶装水工厂', '苏打水工厂', '包装中心', '仓储中转'],
  list: [
    { id: 1, factoryCode: 'JN01', factoryName: '济南一厂', factoryType: '瓶装水工厂', address: '山东省济南市历城区工业北路 88 号', departmentCode: 'DPT-001' },
    { id: 2, factoryCode: 'QD02', factoryName: '青岛二厂', factoryType: '苏打水工厂', address: '山东省青岛市城阳区春阳路 16 号', departmentCode: 'DPT-002' },
    { id: 3, factoryCode: 'ZB03', factoryName: '淄博三厂', factoryType: '瓶装水工厂', address: '山东省淄博市张店区人民西路 66 号', departmentCode: 'DPT-003' },
    { id: 4, factoryCode: 'YT04', factoryName: '烟台四厂', factoryType: '包装中心', address: '山东省烟台市福山区永达街 22 号', departmentCode: 'DPT-004' },
    { id: 5, factoryCode: 'WF05', factoryName: '潍坊五厂', factoryType: '仓储中转', address: '山东省潍坊市高新区健康东街 109 号', departmentCode: 'DPT-005' }
  ]
};

window.workshopListModuleData = {
  pageSize: 10,
  list: [
    { id: 11, factoryName: '济南一厂', workshopCode: 'JN01-WS01', workshopName: '灌装一车间' },
    { id: 12, factoryName: '济南一厂', workshopCode: 'JN01-WS02', workshopName: '包装车间' },
    { id: 21, factoryName: '青岛二厂', workshopCode: 'QD02-WS01', workshopName: '苏打水车间' },
    { id: 31, factoryName: '淄博三厂', workshopCode: 'ZB03-WS01', workshopName: '灌装二车间' },
    { id: 41, factoryName: '烟台四厂', workshopCode: 'YT04-WS01', workshopName: '装配车间' }
  ]
};

window.worklineListModuleData = {
  pageSize: 10,
  factories: ['济南一厂', '青岛二厂', '淄博三厂', '烟台四厂', '潍坊五厂'],
  workshops: [
    { id: 11, factoryName: '济南一厂', workshopCode: 'JN01-WS01', workshopName: '灌装一车间', workshopLabel: '灌装一车间（JN01-WS01）' },
    { id: 12, factoryName: '济南一厂', workshopCode: 'JN01-WS02', workshopName: '包装车间', workshopLabel: '包装车间（JN01-WS02）' },
    { id: 21, factoryName: '青岛二厂', workshopCode: 'QD02-WS01', workshopName: '苏打水车间', workshopLabel: '苏打水车间（QD02-WS01）' },
    { id: 31, factoryName: '淄博三厂', workshopCode: 'ZB03-WS01', workshopName: '灌装二车间', workshopLabel: '灌装二车间（ZB03-WS01）' },
    { id: 41, factoryName: '烟台四厂', workshopCode: 'YT04-WS01', workshopName: '装配车间', workshopLabel: '装配车间（YT04-WS01）' }
  ],
  list: [
    { id: 101, factoryName: '济南一厂', workshopCode: 'JN01-WS01', workshopName: '灌装一车间', workshopLabel: '灌装一车间（JN01-WS01）', lineCode: 'L-01', lineName: '一号线' },
    { id: 102, factoryName: '济南一厂', workshopCode: 'JN01-WS02', workshopName: '包装车间', workshopLabel: '包装车间（JN01-WS02）', lineCode: 'L-02', lineName: '二号线' },
    { id: 103, factoryName: '青岛二厂', workshopCode: 'QD02-WS01', workshopName: '苏打水车间', workshopLabel: '苏打水车间（QD02-WS01）', lineCode: 'L-03', lineName: '三号线' },
    { id: 104, factoryName: '淄博三厂', workshopCode: 'ZB03-WS01', workshopName: '灌装二车间', workshopLabel: '灌装二车间（ZB03-WS01）', lineCode: 'L-04', lineName: '四号线' },
    { id: 105, factoryName: '烟台四厂', workshopCode: 'YT04-WS01', workshopName: '装配车间', workshopLabel: '装配车间（YT04-WS01）', lineCode: 'L-05', lineName: '五码垛线' }
  ]
};

window.classListModuleData = {
  pageSize: 10,
  list: [
    { id: 1, classCode: 'BZ-01', className: '白班 A 组' },
    { id: 2, classCode: 'BZ-02', className: '白班 B 组' },
    { id: 3, classCode: 'YZ-01', className: '夜班 A 组' },
    { id: 4, classCode: 'YZ-02', className: '夜班 B 组' },
    { id: 5, classCode: 'QC-01', className: '质检巡查组' }
  ]
};

window.orderPlusModuleData = {
  pageSize: 10,
  visibleColumns: [
    'orderNo', 'productCode', 'productName', 'planDate', 'planQty', 'decompositionQty',
    'creator', 'level1CollectQty', 'level1Ratio', 'level2CollectQty', 'level2Ratio',
    'level3CollectQty', 'level3Ratio', 'productionStatus', 'erpStatus'
  ],
  productOptions: [
    { code: 'cjs500', name: '纯净水 500ml' },
    { code: 'cjs350', name: '纯净水 350ml' },
    { code: 'sds330', name: '苏打水 330ml' },
    { code: 'rjs550', name: '弱碱水 550ml' }
  ],
  materialOptions: [
    { code: 'cjsyl01', name: '纯净水原液', defaultBatch: 'YL-202604-01' },
    { code: 'cjsp', name: '纯净水瓶胚', defaultBatch: 'PP-202604-08' },
    { code: 'sdyll01', name: '苏打水原液', defaultBatch: 'SD-202604-03' },
    { code: 'csg01', name: '苏打水盖胚', defaultBatch: 'GB-202604-12' }
  ],
  list: [
    {
      id: 1001,
      orderNo: 'GD-202604-001',
      productCode: 'cjs500',
      productName: '纯净水 500ml',
      planDate: '2026-04-26',
      planQty: 500,
      decompositionQty: 500,
      creator: '系统管理员',
      reviewer: '李静',
      remark: '优先发货',
      level1CollectQty: 468,
      level1ProductionQty: 500,
      level1Ratio: '93.6%',
      level2CollectQty: 460,
      level2ProductionQty: 500,
      level2Ratio: '92.0%',
      level3CollectQty: 452,
      level3ProductionQty: 500,
      level3Ratio: '90.4%',
      planStartTime: '2026-04-26 08:00:00',
      planEndTime: '',
      productionStatus: '已分解',
      erpStatus: '已推送',
      erpId: 'ERP-1001',
      materials: [
        { id: 1, materialCode: 'cjsyl01', materialName: '纯净水原液', planQty: 500, splitQty: 500, batchNo: 'YL-202604-01' },
        { id: 2, materialCode: 'cjsp', materialName: '纯净水瓶胚', planQty: 500, splitQty: 500, batchNo: 'PP-202604-08' }
      ]
    },
    {
      id: 1002,
      orderNo: 'GD-202604-004',
      productCode: 'sds330',
      productName: '苏打水 330ml',
      planDate: '2026-04-25',
      planQty: 360,
      decompositionQty: 360,
      creator: '系统管理员',
      reviewer: '刘敏',
      remark: '青岛渠道专供',
      level1CollectQty: 352,
      level1ProductionQty: 360,
      level1Ratio: '97.8%',
      level2CollectQty: 344,
      level2ProductionQty: 360,
      level2Ratio: '95.6%',
      level3CollectQty: 338,
      level3ProductionQty: 360,
      level3Ratio: '93.9%',
      planStartTime: '2026-04-25 09:10:00',
      planEndTime: '2026-04-25 16:40:00',
      productionStatus: '已结束',
      erpStatus: '已推送',
      erpId: 'ERP-1002',
      materials: [
        { id: 3, materialCode: 'sdyll01', materialName: '苏打水原液', planQty: 360, splitQty: 360, batchNo: 'SD-202604-03' },
        { id: 4, materialCode: 'csg01', materialName: '苏打水盖胚', planQty: 360, splitQty: 360, batchNo: 'GB-202604-12' }
      ]
    },
    {
      id: 1003,
      orderNo: 'GD-202604-007',
      productCode: 'cjs350',
      productName: '纯净水 350ml',
      planDate: '2026-04-27',
      planQty: 320,
      decompositionQty: 0,
      creator: '系统管理员',
      reviewer: '',
      remark: '',
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
      productionStatus: '',
      erpStatus: '未推送',
      erpId: 'ERP-1003',
      materials: []
    }
  ]
};
