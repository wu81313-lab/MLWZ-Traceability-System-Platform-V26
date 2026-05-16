(function () {
  function lineChart(xAxis, series) {
    return { xAxis: xAxis, series: series };
  }

  function buildDateAxis() {
    return [
      '2026-03-28', '2026-03-29', '2026-03-30', '2026-03-31', '2026-04-01', '2026-04-02',
      '2026-04-03', '2026-04-04', '2026-04-05', '2026-04-06', '2026-04-07', '2026-04-08',
      '2026-04-09', '2026-04-10', '2026-04-11', '2026-04-12', '2026-04-13', '2026-04-14',
      '2026-04-15', '2026-04-16', '2026-04-17', '2026-04-18', '2026-04-19', '2026-04-20',
      '2026-04-21', '2026-04-22', '2026-04-23', '2026-04-24', '2026-04-25', '2026-04-26'
    ];
  }

  var monthAxis = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  var dayAxis = buildDateAxis();
  var warehouseAxis = ['2026-04-01', '2026-04-04', '2026-04-07', '2026-04-10', '2026-04-13', '2026-04-16', '2026-04-19', '2026-04-22', '2026-04-25', '2026-04-28'];
  var zero30 = new Array(30).fill(0);
  var mapPieces = [
    { gt: 100, label: '> 100次', color: '#4f8ffb' },
    { gte: 50, lte: 100, label: '50 - 100次', color: '#31c6db' },
    { gte: 10, lt: 50, label: '10 - 50次', color: '#e6873b' },
    { gt: 0, lt: 10, label: '1 - 10次', color: '#f0dd32' },
    { value: 0, label: '无扫码', color: '#3fdc56' }
  ];

  function zeroMapData() {
    return [
      '济南市', '德州市', '聊城市', '滨州市', '东营市', '淄博市', '潍坊市', '烟台市',
      '威海市', '青岛市', '泰安市', '莱芜市', '济宁市', '日照市', '临沂市', '枣庄市', '菏泽市'
    ].map(function (name) {
      return { name: name, value: 0 };
    });
  }

  window.boardOverviewData = {
    stats: [
      { title: '今日产量', value: '0', subTitle: '今日计划产量', subValue: '0' },
      { title: '今日发货量', value: '0', subTitle: '今日计划发货量', subValue: '0' },
      { title: '年度累计扫码量', value: '5', subTitle: '历史累计扫码次数', subValue: '5' },
      { title: '今日用户扫码量', value: '0' },
      { title: '今日用户预警数', value: '0' },
      { title: '年度累计用户预警数', value: '0' }
    ],
    trend: lineChart(dayAxis, [
      { name: '产量', data: zero30.slice() },
      { name: '发货量', data: zero30.slice() }
    ]),
    lists: {
      scanCount: ['2026-04-20【2】', '2026-04-16【1】', '2026-04-02【1】', '2026-03-27【2】'],
      scanProduct: ['cjs1【5】 纯净水500ml'],
      diffCount: [],
      diffProduct: [],
      warningCount: [],
      warningProduct: []
    },
    maps: {
      pieces: mapPieces,
      scan: zeroMapData(),
      diff: zeroMapData(),
      inspect: zeroMapData()
    },
    progressCharts: {
      production: lineChart(['广西田阳生化股份有限公司', '弥特纯净水工厂', '弥特纯净水工厂02', '测试工厂'], [
        { name: '计划产量', data: [0, 0, 0, 0] },
        { name: '实际产量', data: [0, 0, 0, 0] }
      ]),
      shipping: lineChart(['广西田阳生化股份有限公司', '弥特纯净水工厂', '弥特纯净水工厂02', '测试工厂'], [
        { name: '计划发货量', data: [0, 0, 0, 0] },
        { name: '实际发货量', data: [0, 0, 0, 0] }
      ])
    }
  };

  window.productionMonitoringData = {
    stats: [
      { title: '计划产量', value: '0', subTitle: '实际产量', subValue: '0' },
      { title: '生产线OEE（设备综合效率）', value: '0' },
      { title: '小袋码采集成功率', value: '0' },
      { title: '大袋码采集成功率', value: '10' }
    ],
    charts: {
      progress: lineChart(['广西田阳生化股份有限公司', '弥特纯净水工厂', '弥特纯净水工厂02', '测试工厂'], [
        { name: '计划产量', data: [0, 0, 0, 0] },
        { name: '实际产量', data: [0, 0, 0, 0] }
      ]),
      rhythm: lineChart(monthAxis, [
        { name: '小袋码采集率', data: [120, 200, 150, 300, 280, 120, 200, 150, 300, 280, 150, 250] },
        { name: '大袋码采集率', data: [100, 250, 120, 310, 240, 100, 155, 170, 320, 230, 110, 255] },
        { name: '码垛工位采集率', data: [90, 170, 190, 250, 280, 115, 200, 145, 300, 280, 130, 230] }
      ]),
      collectStatus: lineChart(monthAxis, [
        { name: '小袋码采集率', data: [120, 200, 150, 300, 280, 120, 200, 150, 300, 280, 150, 250] },
        { name: '大袋码采集率', data: [100, 250, 120, 310, 240, 100, 155, 170, 320, 230, 110, 255] },
        { name: '码垛工位采集率', data: [90, 170, 190, 250, 280, 115, 200, 145, 300, 280, 130, 230] }
      ])
    },
    filters: {
      dateRange: [],
      factory: '',
      workshop: '',
      line: '',
      team: '',
      dataStatus: '新数据'
    },
    dataStatusOptions: ['新数据', '历史数据'],
    rows: [
      {
        id: 1,
        factory: 'MT001 弥特纯净水工厂',
        workshop: 'cj01纯净水一车间',
        line: 'cx02二号线',
        team: '',
        orderNo: 'mite2026020604',
        product: 'cjs1 纯净水500ml',
        spec: '500ml',
        planQty: 0,
        confirmQty: 0,
        batchNo: '26020604',
        expireDate: '2027-02-06',
        level1CollectQty: 0,
        level1ProductionQty: 0,
        level1Ratio: '0%',
        level2CollectQty: 0,
        level2ProductionQty: 0,
        level2Ratio: '0%',
        level3CollectQty: 0,
        level3ProductionQty: 0,
        level3Ratio: '0%',
        level4CollectQty: 0,
        level4ProductionQty: 0,
        level4Ratio: '0%',
        level5CollectQty: 0,
        level5ProductionQty: 0,
        level5Ratio: '0%',
        productionStartTime: '--',
        orderCompleteTime: '--',
        planStartTime: '--',
        planEndTime: '--',
        planDate: '--',
        productionStatus: '--',
        qualityStatus: '--'
      },
      {
        id: 2,
        factory: 'MT002 弥特纯净水工厂02',
        workshop: '',
        line: '',
        team: '',
        orderNo: '2314121',
        product: 'B001 test',
        spec: '123瓶',
        planQty: 0,
        confirmQty: 0,
        batchNo: '2314121',
        expireDate: '--',
        level1CollectQty: 0,
        level1ProductionQty: 0,
        level1Ratio: '0%',
        level2CollectQty: 0,
        level2ProductionQty: 0,
        level2Ratio: '0%',
        level3CollectQty: 0,
        level3ProductionQty: 0,
        level3Ratio: '0%',
        level4CollectQty: 0,
        level4ProductionQty: 0,
        level4Ratio: '0%',
        level5CollectQty: 0,
        level5ProductionQty: 0,
        level5Ratio: '0%',
        productionStartTime: '--',
        orderCompleteTime: '--',
        planStartTime: '--',
        planEndTime: '--',
        planDate: '--',
        productionStatus: '--',
        qualityStatus: '--'
      },
      {
        id: 3,
        factory: 'MT001 弥特纯净水工厂',
        workshop: 'cj01纯净水一车间',
        line: 'cx01一号线',
        team: '',
        orderNo: 'ces260409',
        product: 'cjs1 纯净水500ml',
        spec: '500ml',
        planQty: '100箱',
        confirmQty: 0,
        batchNo: '260409',
        expireDate: '2027-04-09',
        level1CollectQty: 0,
        level1ProductionQty: 0,
        level1Ratio: '0%',
        level2CollectQty: 0,
        level2ProductionQty: 0,
        level2Ratio: '0%',
        level3CollectQty: 0,
        level3ProductionQty: 0,
        level3Ratio: '0%',
        level4CollectQty: 0,
        level4ProductionQty: 0,
        level4Ratio: '0%',
        level5CollectQty: 0,
        level5ProductionQty: 0,
        level5Ratio: '0%',
        productionStartTime: '--',
        orderCompleteTime: '--',
        planStartTime: '--',
        planEndTime: '--',
        planDate: '--',
        productionStatus: '--',
        qualityStatus: '--'
      }
    ],
    total: 111,
    pageSize: 3
  };

  window.warehouseLogisticsData = {
    stats: [
      { title: '当日出库订单数', value: '0', subTitle: '商品数', subValue: '0' },
      { title: '近7天平均出货数量', value: '0' },
      { title: '出库扫码率', value: '0' }
    ],
    charts: {
      outboundTrend: lineChart(warehouseAxis, [{ name: '每日出库数量', data: new Array(10).fill(0) }]),
      productCount: lineChart([], [{ name: '发货数量', data: [] }]),
      codeRate: lineChart(dayAxis, [{ name: '扫码数量/实际发货数量%', data: zero30.slice() }])
    },
    filters: {
      dateRange: [],
      shipWarehouseCode: '',
      receiveWarehouseCode: '',
      status: '',
      carrier: ''
    },
    statusOptions: ['待发货', '发货中', '已完成'],
    rows: [
      {
        id: 1,
        billNo: 'XSCK213701-2608674',
        outboundNo: 'XSCK213701-2608674',
        outboundTime: '1970-01-01 08:00:00',
        shipWarehouseCode: '213701',
        shipWarehouse: '青岛仓',
        customerCode: 'KH001',
        customerName: '测试客户A',
        customerAddress: '青岛市市南区',
        productCode: 'cjs1',
        productName: '纯净水500ml',
        unit: '箱',
        planQty: 0,
        confirmQty: 0,
        scanQty: 0,
        shipStatus: '已完成'
      },
      {
        id: 2,
        billNo: 'XSCK213701-2608674',
        outboundNo: 'XSCK213701-2608674',
        outboundTime: '1970-01-01 08:00:00',
        shipWarehouseCode: '213701',
        shipWarehouse: '青岛仓',
        customerCode: 'KH001',
        customerName: '测试客户A',
        customerAddress: '青岛市市南区',
        productCode: 'cjs1',
        productName: '纯净水500ml',
        unit: '箱',
        planQty: 0,
        confirmQty: 0,
        scanQty: 0,
        shipStatus: '已完成'
      },
      {
        id: 3,
        billNo: 'XSCK213701-2608674',
        outboundNo: 'XSCK213701-2608674',
        outboundTime: '1970-01-01 08:00:00',
        shipWarehouseCode: '213701',
        shipWarehouse: '青岛仓',
        customerCode: 'KH001',
        customerName: '测试客户A',
        customerAddress: '青岛市市南区',
        productCode: 'cjs1',
        productName: '纯净水500ml',
        unit: '箱',
        planQty: 0,
        confirmQty: 0,
        scanQty: 0,
        shipStatus: '已完成'
      }
    ],
    total: 459,
    pageSize: 3
  };

  window.inspectionManagementData = {
    stats: [
      { title: '疑似稽查窜货事件总数', value: '3' },
      { title: '本周新增稽查预警数', value: '0' }
    ],
    mapTitle: '稽查窜货预警热力图-年',
    mapData: [
      { name: '潍坊市', value: 3 },
      { name: '临沂市', value: 1 }
    ].concat(zeroMapData().filter(function (item) {
      return item.name !== '潍坊市' && item.name !== '临沂市';
    })),
    mapPieces: mapPieces
  };

  window.scadaDashboardData = {
    lines: [
      {
        code: 'cx01',
        lineName: '一号线',
        orderNo: 'ces260409',
        progress: '50%',
        collected: '50箱',
        planQty: '100箱',
        lastUpload: '2026-04-09 15:16:17',
        alarmCount: 46
      }
    ],
    detail: {
      title: '弥特采集关联系统 SCADA 监控大屏',
      factory: '弥特纯净水工厂',
      workshop: '纯净水一车间',
      line: '一号线',
      orderNo: 'ces260409',
      product: '纯净水500ml',
      batch: '260409',
      date: '2026-04-09',
      progress: 50,
      collected: '50 箱',
      planQty: '100 箱',
      gauges: [
        { name: '工控机1号', rate: 99.5 },
        { name: '工控机2号', rate: 95.5 },
        { name: '工控机3号', rate: 95.5 }
      ],
      machines: [
        {
          name: '工控机1号',
          relationType: '瓶箱关联',
          collectQty: 40,
          relationRate: '99.5%',
          alarmCount: 10,
          cameras: [
            { name: '相机1号', online: true, rate: 55, collectQty: 100, failQty: 45 },
            { name: '相机2号', online: true, rate: 98, collectQty: 98, failQty: 2 }
          ]
        },
        {
          name: '工控机2号',
          relationType: '箱托关联',
          collectQty: 50,
          relationRate: '95.5%',
          alarmCount: 2,
          cameras: [
            { name: '相机1号', online: true, rate: 95, collectQty: 100, failQty: 5 },
            { name: '相机2号', online: true, rate: 98, collectQty: 98, failQty: 2 }
          ]
        },
        {
          name: '工控机3号',
          relationType: '托级别4关联',
          collectQty: 60,
          relationRate: '95.5%',
          alarmCount: 34,
          cameras: [
            { name: '相机1号', online: true, rate: 95, collectQty: 100, failQty: 5 },
            { name: '相机2号', online: true, rate: 98, collectQty: 98, failQty: 2 }
          ]
        }
      ],
      latestAlerts: [
        { title: '工控机1号', desc: '压力异常报警', time: '04-09 14:55:00' },
        { title: '工控机1号', desc: '压力异常报警', time: '04-09 14:55:00' },
        { title: '工控机1号', desc: '压力异常报警', time: '04-09 14:55:00' }
      ],
      historyAlerts: [
        { title: '工控机3号', desc: '温度过高警告', time: '04-09 14:30:00' },
        { title: '工控机3号', desc: '温度过高警告', time: '04-09 14:30:00' },
        { title: '工控机3号', desc: '温度过高警告', time: '04-09 14:30:00' },
        { title: '工控机3号', desc: '温度过高警告', time: '04-09 14:30:00' },
        { title: '工控机3号', desc: '温度过高警告', time: '04-09 14:30:00' },
        { title: '工控机3号', desc: '温度过高警告', time: '04-09 14:30:00' },
        { title: '工控机3号', desc: '温度过高警告', time: '04-09 14:30:00' },
        { title: '工控机3号', desc: '温度过高警告', time: '04-09 14:30:00' },
        { title: '工控机3号', desc: '温度过高警告', time: '04-09 14:30:00' },
        { title: '工控机3号', desc: '温度过高警告', time: '04-09 14:30:00' },
        { title: '工控机1号', desc: '压力异常报警', time: '04-09 14:25:00' },
        { title: '工控机2号', desc: '压力异常报警', time: '04-09 14:25:00' },
        { title: '工控机3号', desc: '压力异常报警', time: '04-09 14:25:00' },
        { title: '工控机3号', desc: '温度过高警告', time: '04-09 14:30:00' }
      ]
    }
  };
})();
