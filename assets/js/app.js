(function () {
  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function debounce(fn, wait) {
    var timer = null;
    return function () {
      var context = this;
      var args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () {
        fn.apply(context, args);
      }, wait);
    };
  }

  function downloadCsv(filename, rows) {
    var csv = '\ufeff' + rows.map(function (row) {
      return row.map(function (cell) {
        var text = cell == null ? '' : String(cell);
        return '"' + text.replace(/"/g, '""') + '"';
      }).join(',');
    }).join('\n');

    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }

  function createPlantForm() {
    return {
      id: null,
      factoryCode: '',
      factoryName: '',
      factoryType: '',
      address: '',
      departmentCode: ''
    };
  }

  function createWorkshopForm() {
    return {
      id: null,
      factoryName: '',
      workshopCode: '',
      workshopName: ''
    };
  }

  function createWorklineForm() {
    return {
      id: null,
      factoryName: '',
      workshopLabel: '',
      workshopCode: '',
      workshopName: '',
      lineCode: '',
      lineName: ''
    };
  }

  function createClassForm() {
    return {
      id: null,
      classCode: '',
      className: ''
    };
  }

  function createOrderMaterialDraft() {
    return {
      materialCode: '',
      planQty: '',
      batchNo: ''
    };
  }

  function createOrderForm() {
    return {
      orderNo: '',
      productCode: '',
      planQty: '',
      erpId: '',
      planDate: '',
      materials: []
    };
  }

  function formatDateTime(date) {
    var target = date || new Date();
    var year = target.getFullYear();
    var month = String(target.getMonth() + 1).padStart(2, '0');
    var day = String(target.getDate()).padStart(2, '0');
    var hour = String(target.getHours()).padStart(2, '0');
    var minute = String(target.getMinutes()).padStart(2, '0');
    var second = String(target.getSeconds()).padStart(2, '0');
    return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
  }

  function normalizeHashRoute(hash) {
    return String(hash || '').split('?')[0];
  }

  function getHashQueryParam(name) {
    var raw = String(window.location.hash || '');
    var queryIndex = raw.indexOf('?');
    if (queryIndex === -1) {
      return '';
    }
    var query = raw.slice(queryIndex + 1).split('&');
    for (var index = 0; index < query.length; index += 1) {
      var parts = query[index].split('=');
      if (parts[0] === name) {
        return decodeURIComponent(parts[1] || '');
      }
    }
    return '';
  }

  function createSchemaFilterState(filters) {
    var state = {};
    (filters || []).forEach(function (item) {
      state[item.key] = '';
    });
    return state;
  }

  function createSchemaDialogForm(columns) {
    var form = { id: null };
    (columns || []).slice(0, 6).forEach(function (item) {
      form[item.key] = '';
    });
    return form;
  }

  var LEGACY_PRODUCTION_TABS = [
    { title: '首页', route: '#/dashboard' },
    { title: '总览首页', route: '#/dashboardOverview' },
    { title: '生产监控', route: '#/productionMonitoring' },
    { title: '生产加工单', route: '#/orderPlus' },
    { title: '生产子加工单', route: '#/orderSubtask' },
    { title: '工厂列表', route: '#/home/plant/plantinfo/plantmanage/plantlist' },
    { title: '产线列表', route: '#/workline' },
    { title: '班组管理', route: '#/home/plant/plantinfo/classlist' },
    { title: '生产批次加工单', route: '#/orderlist' },
    { title: '生产入库', route: '#/receipt' },
    { title: '生产扫码记录', route: '#/receiptScan' },
    { title: '包装关联', route: '#/relevance' },
    { title: '关联解除', route: '#/unrelevance1' },
    { title: '关联替换', route: '#/home/plant/production/replace' },
    { title: '重码查询', route: '#/repeatedquery' },
    { title: '工单采集率', route: '#/harvestrate' }
  ];

  function buildLegacyProductionTabs(activeRoute) {
    return LEGACY_PRODUCTION_TABS.map(function (item) {
      return {
        title: item.title,
        route: item.route,
        active: item.route === activeRoute
      };
    });
  }

  function formatSchemaValue(value) {
    return value === 0 ? '0' : (value || '--');
  }

  function resolveSchemaTitleField(row) {
    var keys = ['logNo', 'orderNo', 'subtaskNo', 'batchNo', 'receiptNo', 'scanNo', 'relationNo', 'replaceNo', 'billNo', 'warningNo', 'caseNo', 'recordNo', 'traceNo', 'transferNo', 'refundNo', 'customerName', 'dealerName', 'storeName', 'productName'];
    for (var index = 0; index < keys.length; index += 1) {
      if (row[keys[index]]) {
        return row[keys[index]];
      }
    }
    return row.id || '当前记录';
  }

  function buildSchemaSummaryCards(schema, rows) {
    if (schema && schema.summaryCards && schema.summaryCards.length) {
      return clone(schema.summaryCards);
    }

    rows = rows || [];
    schema = schema || {};

    var columns = schema.columns || [];
    var statusColumn = columns.find(function (item) {
      return /status|result|level/i.test(item.key);
    });
    var timeColumn = columns.find(function (item) {
      return /(time|date|at)$/i.test(item.key);
    });

    var statusValues = rows.map(function (item) {
      return statusColumn ? String(item[statusColumn.key] || '') : '';
    }).filter(Boolean);

    var positiveCount = statusValues.filter(function (item) {
      return /已|成功|启用|正品/.test(item);
    }).length;
    var warningCount = statusValues.filter(function (item) {
      return /待|处理中|复核|审核/.test(item);
    }).length;
    var riskCount = statusValues.filter(function (item) {
      return /异常|失败|风险|停用|重码|取消/.test(item);
    }).length;

    var latestTime = '--';
    if (timeColumn) {
      for (var index = 0; index < rows.length; index += 1) {
        if (rows[index][timeColumn.key]) {
          latestTime = rows[index][timeColumn.key];
          break;
        }
      }
    }

    return [
      {
        label: '记录总数',
        value: String(rows.length),
        desc: '当前模块已接入静态数据',
        tone: 'primary'
      },
      {
        label: statusColumn ? (statusColumn.label + '概览') : '有效数据',
        value: String(positiveCount || rows.length),
        desc: statusColumn ? ('待处理 ' + warningCount + ' · 异常 ' + riskCount) : '支持本地新增、编辑、删除',
        tone: warningCount > riskCount ? 'success' : 'primary'
      },
      {
        label: '最近更新',
        value: latestTime === '--' ? '--' : String(latestTime).slice(0, 10),
        desc: latestTime === '--' ? '当前模块暂无时间字段' : String(latestTime),
        tone: 'neutral'
      }
    ];
  }

  function flattenMenus(menus, result) {
    (menus || []).forEach(function (item) {
      result[item.index] = item;
      if (item.children && item.children.length) {
        flattenMenus(item.children, result);
      }
    });
    return result;
  }

  function buildRouteMap(menus, result) {
    (menus || []).forEach(function (item) {
      if (item.route) {
        result[item.route] = {
          key: item.pageKey || item.index,
          menuIndex: item.index,
          title: item.title,
          breadcrumb: item.breadcrumb || ('首页 / ' + item.title)
        };
      }
      if (item.children && item.children.length) {
        buildRouteMap(item.children, result);
      }
    });
    return result;
  }

  function findMenuAncestors(menus, targetIndex, chain) {
    var nextChain = chain || [];
    for (var i = 0; i < (menus || []).length; i += 1) {
      var item = menus[i];
      if (item.index === targetIndex) {
        return nextChain;
      }
      if (item.children && item.children.length) {
        var found = findMenuAncestors(item.children, targetIndex, nextChain.concat(item.index));
        if (found) {
          return found;
        }
      }
    }
    return null;
  }

  function menuLeaf(index, title, breadcrumb, route) {
    return {
      index: index,
      pageKey: index,
      title: title,
      route: route || ('#/' + index),
      breadcrumb: breadcrumb || ('首页 / ' + title)
    };
  }

  function menuGroup(index, title, children, icon) {
    var item = {
      index: index,
      title: title,
      children: children || []
    };
    if (icon) {
      item.icon = icon;
    }
    return item;
  }

  function normalizeOrgShellData() {
    return {
      brandName: 'V26',
      userName: '系统管理员',
      userRole: '平台管理中心',
      menus: [
        menuGroup('org-code-root', '码库管理', [
          menuGroup('org-code-nontlm', '非套标生码管理', [
            menuLeaf('readycreate', '预生码管理', '码库管理 / 非套标生码管理 / 预生码管理'),
            menuLeaf('tagging/rulenews', '生码查询', '码库管理 / 非套标生码管理 / 生码查询'),
            menuLeaf('tagging/coderule', '生码规则', '码库管理 / 非套标生码管理 / 生码规则')
          ]),
          menuGroup('org-code-tlm', '套标生码管理', [
            menuLeaf('tlmQrcode/tlmreadycreate', '预生码管理', '码库管理 / 套标生码管理 / 预生码管理'),
            menuLeaf('tlmQrcode/tlmQrcodelogs', '校验查询', '码库管理 / 套标生码管理 / 校验查询'),
            menuLeaf('tlmQrcode/tlmQrcoderule', '生码规则', '码库管理 / 套标生码管理 / 生码规则'),
            menuLeaf('tlmQrcode/codelogs', '生码查询', '码库管理 / 套标生码管理 / 生码查询')
          ])
        ], 'el-icon-star-on'),
        menuGroup('org-basic-root', '基础信息', [
          menuGroup('org-product-group', '产品信息', [
            menuLeaf('productlist', '产品列表', '基础信息 / 产品信息 / 产品列表'),
            menuLeaf('productsort', '品牌设置', '基础信息 / 产品信息 / 品牌设置'),
            menuLeaf('productunit', '包装单位', '基础信息 / 产品信息 / 包装单位'),
            menuLeaf('hierarchylist', '包装关系', '基础信息 / 产品信息 / 包装关系'),
            menuLeaf('hierarchy', '包装关系(树)', '基础信息 / 产品信息 / 包装关系(树)'),
            menuLeaf('productunitconvert', '包装单位转换', '基础信息 / 产品信息 / 包装单位转换')
          ]),
          menuLeaf('store', '仓库管理', '基础信息 / 仓库管理'),
          menuLeaf('material', '原料信息', '基础信息 / 原料信息'),
          menuLeaf('enterprise', '维护企业', '基础信息 / 维护企业'),
          menuLeaf('sysconfig', '维护config表', '基础信息 / 维护config表'),
          menuLeaf('systemminiprogram', '小程序配置', '基础信息 / 小程序配置'),
          menuLeaf('industrialcomputer', '工控机信息', '基础信息 / 工控机信息')
        ], 'el-icon-s-goods'),
        menuGroup('org-internal-root', '内部组织', [
          menuLeaf('tree', '组织机构', '内部组织 / 组织机构'),
          menuLeaf('organ/departmentjob', '权限管理', '内部组织 / 权限管理'),
          menuLeaf('stafflist', '账号管理', '内部组织 / 账号管理'),
          menuLeaf('operationlogs', '日志管理', '内部组织 / 日志管理')
        ], 'el-icon-s-operation'),
        menuGroup('org-external-root', '外部组织', [
          menuGroup('org-dealer-group', '经销商管理', [
            menuLeaf('dealer', '经销商列表', '外部组织 / 经销商管理 / 经销商列表'),
            menuLeaf('dealeraddresslist', '经销商区域', '外部组织 / 经销商管理 / 经销商区域'),
            menuLeaf('dealeruserlist', '会员信息', '外部组织 / 经销商管理 / 会员信息')
          ]),
          menuGroup('org-terminal-group', '终端管理', [
            menuLeaf('Orgterminal', '终端列表', '外部组织 / 终端管理 / 终端列表'),
            menuLeaf('promoter', '会员信息', '外部组织 / 终端管理 / 会员信息')
          ]),
          menuGroup('org-wx-group', '小程序权限管理', [
            menuLeaf('WXrole', '小程序角色', '外部组织 / 小程序权限管理 / 小程序角色'),
            menuLeaf('WXmenu', '小程序菜单', '外部组织 / 小程序权限管理 / 小程序菜单')
          ])
        ], 'el-icon-s-opportunity')
      ]
    };
  }

  function getAllSystemMenus(systems) {
    return Object.keys(systems || {}).reduce(function (result, key) {
      return result.concat((systems[key] && systems[key].menus) || []);
    }, []);
  }

  function getSystemRouteOwnership(systems) {
    var result = {};
    Object.keys(systems || {}).forEach(function (key) {
      var map = buildRouteMap((systems[key] && systems[key].menus) || [], {});
      Object.keys(map).forEach(function (route) {
        result[route] = key;
      });
    });
    return result;
  }

  function buildCombinedShellData(shellData) {
    var traceShell = normalizeTsShellData(clone(shellData));
    var orgShell = normalizeOrgShellData();
    return {
      brandName: traceShell.brandName,
      userName: traceShell.userName,
      userRole: traceShell.userRole,
      systems: {
        basicInfo: {
          key: 'basicInfo',
          title: '系统基础信息',
          brandName: orgShell.brandName,
          menus: orgShell.menus,
          defaultRoute: '#/readycreate'
        },
        traceSystem: {
          key: 'traceSystem',
          title: '产品追溯系统',
          brandName: traceShell.brandName,
          menus: traceShell.menus,
          defaultRoute: '#/dashboard'
        },
        codeLibrary: {
          key: 'codeLibrary',
          title: '码库管理',
          menus: [],
          defaultRoute: '#/dashboard'
        }
      }
    };
  }

  function normalizeTsShellData(shellData) {
    shellData = shellData || {};
    shellData.brandName = '产品追溯系统';
    shellData.userName = '系统管理员';
    shellData.userRole = '平台管理中心';

    var originalMap = flattenMenus(clone(shellData.menus || []), {});

    function take(index) {
      return clone(originalMap[index] || { index: index });
    }

    function leaf(index, title, breadcrumb) {
      var item = take(index);
      item.title = title;
      if (breadcrumb) {
        item.breadcrumb = breadcrumb;
      }
      delete item.children;
      return item;
    }

    function group(index, title, children, icon) {
      var item = take(index);
      item.index = index;
      item.title = title;
      if (icon) {
        item.icon = icon;
      }
      item.children = children || [];
      return item;
    }

    var productionNode = take('production');
    productionNode.title = '生产管理';
    productionNode.icon = 'list';

    var factoryLogisticsNode = group('factory-logistics', '工厂物流', [
      leaf('freight', '运单管理', '首页 / 工厂物流 / 运单管理'),
      leaf('boxcode', '箱码查询', '首页 / 工厂物流 / 箱码查询'),
      leaf('barter', '换货查询', '首页 / 工厂物流 / 换货查询'),
      leaf('findDirection', '批次流向查询', '首页 / 工厂物流 / 批次流向查询'),
      leaf('refund', '退货日志', '首页 / 工厂物流 / 退货日志'),
      group('transfer-out-group', '调拨出库', [
        leaf('transferOutOrder', '调拨记录', '首页 / 工厂物流 / 调拨出库 / 调拨记录'),
        leaf('transferOutOrderScan', '调拨扫码记录', '首页 / 工厂物流 / 调拨出库 / 调拨扫码记录')
      ])
    ], 'table');

    var channelLogisticsNode = group('channel-logistics', '渠道物流', [
      group('dealer-logistics-group', '经销商物流', [
        group('dealer-sign-group', '经销商签收', [
          leaf('dealersignorderlogs', '签收记录', '首页 / 渠道物流 / 经销商物流 / 经销商签收 / 签收记录'),
          leaf('dealersignqrcodescanlog', '签收扫码异常记录', '首页 / 渠道物流 / 经销商物流 / 经销商签收 / 签收扫码异常记录')
        ]),
        leaf('tssttSsignWeblist', '经销商出库', '首页 / 渠道物流 / 经销商物流 / 经销商出库'),
        leaf('refundorderlist', '终端退货记录', '首页 / 渠道物流 / 经销商物流 / 终端退货记录')
      ]),
      group('terminal-logistics-group', '终端物流', [
        leaf('sttSsignWeblist', '单据签收记录', '首页 / 渠道物流 / 终端物流 / 单据签收记录'),
        leaf('sttSsignscancodelogs', '扫码签收记录', '首页 / 渠道物流 / 终端物流 / 扫码签收记录')
      ]),
      group('channel-inventory-group', '渠道库存', [
        leaf('channelinventorylist', '渠道库存列表', '首页 / 渠道物流 / 渠道库存 / 渠道库存列表'),
        leaf('channelinventorylogs', '渠道库存流水', '首页 / 渠道物流 / 渠道库存 / 渠道库存流水')
      ])
    ], 'table');

    var inspectionNode = group('inspection', '稽查管理', [
      leaf('forensics', '取证记录', '首页 / 稽查管理 / 取证记录'),
      leaf('inspectrecord', '稽查记录', '首页 / 稽查管理 / 稽查记录'),
      leaf('qrcodescaninspectleveltwo', '窜货记录', '首页 / 稽查管理 / 窜货记录'),
      leaf('queryconsumerwarning', '预警清单', '首页 / 稽查管理 / 预警清单'),
      leaf('warningparam', '配置预警参数', '首页 / 稽查管理 / 配置预警参数'),
      leaf('informationinquiry', '信息查询', '首页 / 稽查管理 / 信息查询')
    ], 'table');

    var queryNode = group('query', '查询管理', [
      leaf('customerinquire', '消费者查询页', '首页 / 查询管理 / 消费者查询页'),
      leaf('customerquery', '消费者查询记录', '首页 / 查询管理 / 消费者查询记录'),
      leaf('dragpage', 'h5扫码页面自定义', '首页 / 查询管理 / h5扫码页面自定义')
    ], 'table');

    var boardsNode = group('boards', '看板', [
      leaf('dashboardOverview', '总览首页', '首页 / 看板 / 总览首页'),
      leaf('productionMonitoring', '生产监控', '首页 / 看板 / 生产监控'),
      leaf('scada-dashboard', 'SCADA监控大屏', '首页 / 看板 / SCADA监控大屏'),
      leaf('warehouselogistics', '仓储物流', '首页 / 看板 / 仓储物流'),
      leaf('inspectionManagement', '稽查管理', '首页 / 看板 / 稽查管理')
    ], 'table');

    shellData.menus = [
      leaf('dashboard', '首页', '首页 / 首页'),
      group('trace-system', '产品追溯系统', [
        productionNode,
        factoryLogisticsNode,
        channelLogisticsNode,
        inspectionNode,
        queryNode,
        boardsNode
      ], 'tree-table')
    ];
    return shellData;
  }

  function normalizeStaticModuleSchemas(schemas) {
    function ensureSchema(route, patch) {
      schemas[route] = Object.assign({
        title: '',
        tags: [],
        legacyBreadcrumb: '',
        tsStyle: true,
        filters: [],
        toolbarButtons: [],
        columns: [],
        rows: [],
        rowActions: [],
        actionWidth: 98,
        pageSize: 10
      }, schemas[route] || {}, patch || {});
      return schemas[route];
    }

    var metaMap = {
      '#/freight': { title: '运单管理', tags: ['工厂物流', '运单管理'], legacyBreadcrumb: '工厂物流 / 运单管理', tsStyle: true, rowActions: [{ key: 'detail', label: '查看', buttonType: 'primary' }], actionWidth: 98 },
      '#/boxcode': { title: '箱码查询', tags: ['工厂物流', '箱码查询'], legacyBreadcrumb: '工厂物流 / 箱码查询', tsStyle: true, rowActions: [{ key: 'detail', label: '查看', buttonType: 'primary' }], actionWidth: 98 },
      '#/barter': { title: '换货查询', tags: ['工厂物流', '换货查询'], legacyBreadcrumb: '工厂物流 / 换货查询', tsStyle: true, rowActions: [{ key: 'detail', label: '查看', buttonType: 'primary' }], actionWidth: 98 },
      '#/findDirection': { title: '批次流向查询', tags: ['工厂物流', '批次流向查询'], legacyBreadcrumb: '工厂物流 / 批次流向查询', tsStyle: true, rowActions: [{ key: 'trace', label: '轨迹', buttonType: 'primary' }], actionWidth: 98 },
      '#/refund': { title: '退货查询', tags: ['工厂物流', '退货日志'], legacyBreadcrumb: '物流管理 / 退货查询', tsStyle: true, rowActions: [{ key: 'detail', label: '产品明细', buttonType: 'primary' }], actionWidth: 112 },
      '#/transferOutOrder': { title: '调拨记录', tags: ['工厂物流', '调拨出库', '调拨记录'], legacyBreadcrumb: '工厂物流 / 调拨出库 / 调拨记录', tsStyle: true, rowActions: [{ key: 'detail', label: '查看', buttonType: 'primary' }], actionWidth: 98 },
      '#/transferOutOrderScan': { title: '调拨扫码记录', tags: ['工厂物流', '调拨出库', '调拨扫码记录'], legacyBreadcrumb: '工厂物流 / 调拨出库 / 调拨扫码记录', tsStyle: true, rowActions: [{ key: 'detail', label: '查看', buttonType: 'primary' }], actionWidth: 98 },
      '#/dealersignorderlogs': { title: '签收记录', tags: ['渠道物流', '经销商物流', '经销商签收', '签收记录'], legacyBreadcrumb: '渠道物流 / 经销商物流 / 经销商签收 / 签收记录', tsStyle: true, rowActions: [{ key: 'detail', label: '查看', buttonType: 'primary' }], actionWidth: 98 },
      '#/dealersignqrcodescanlog': { title: '签收扫码异常记录', tags: ['渠道物流', '经销商物流', '经销商签收', '签收扫码异常记录'], legacyBreadcrumb: '渠道物流 / 经销商物流 / 经销商签收 / 签收扫码异常记录', tsStyle: true, rowActions: [{ key: 'detail', label: '查看', buttonType: 'primary' }], actionWidth: 98 },
      '#/tssttSsignWeblist': { title: '经销商出库', tags: ['渠道物流', '经销商物流', '经销商出库'], legacyBreadcrumb: '渠道物流 / 经销商物流 / 经销商出库', tsStyle: true, rowActions: [{ key: 'detail', label: '查看', buttonType: 'primary' }], actionWidth: 98 },
      '#/refundorderlist': { title: '终端退货记录', tags: ['渠道物流', '经销商物流', '终端退货记录'], legacyBreadcrumb: '渠道物流 / 经销商物流 / 终端退货记录', tsStyle: true, rowActions: [{ key: 'detail', label: '查看', buttonType: 'primary' }], actionWidth: 98 },
      '#/sttSsignWeblist': { title: '单据签收记录', tags: ['渠道物流', '终端物流', '单据签收记录'], legacyBreadcrumb: '渠道物流 / 终端物流 / 单据签收记录', tsStyle: true, rowActions: [{ key: 'detail', label: '查看', buttonType: 'primary' }], actionWidth: 98 },
      '#/sttSsignscancodelogs': { title: '扫码签收记录', tags: ['渠道物流', '终端物流', '扫码签收记录'], legacyBreadcrumb: '渠道物流 / 终端物流 / 扫码签收记录', tsStyle: true, rowActions: [{ key: 'detail', label: '查看', buttonType: 'primary' }], actionWidth: 98 },
      '#/channelinventorylist': { title: '渠道库存列表', tags: ['渠道物流', '渠道库存', '渠道库存列表'], legacyBreadcrumb: '渠道物流 / 渠道库存 / 渠道库存列表', tsStyle: true, rowActions: [{ key: 'detail', label: '查看', buttonType: 'primary' }], actionWidth: 98 },
      '#/channelinventorylogs': { title: '渠道库存流水', tags: ['渠道物流', '渠道库存', '渠道库存流水'], legacyBreadcrumb: '渠道物流 / 渠道库存 / 渠道库存流水', tsStyle: true, rowActions: [{ key: 'detail', label: '查看', buttonType: 'primary' }], actionWidth: 98 },
      '#/forensics': { title: '取证记录', tags: ['稽查管理', '取证记录'], legacyBreadcrumb: '稽查管理 / 取证记录', tsStyle: true, rowActions: [{ key: 'detail', label: '查看', buttonType: 'primary' }], actionWidth: 98 },
      '#/inspectrecord': { title: '稽查记录', tags: ['稽查管理', '稽查记录'], legacyBreadcrumb: '稽查管理 / 稽查记录', tsStyle: true, rowActions: [{ key: 'detail', label: '查看', buttonType: 'primary' }], actionWidth: 98 },
      '#/qrcodescaninspectleveltwo': { title: '窜货记录', tags: ['稽查管理', '窜货记录'], legacyBreadcrumb: '稽查管理 / 窜货记录', tsStyle: true, rowActions: [{ key: 'inspect', label: '查看', buttonType: 'primary' }], actionWidth: 98 },
      '#/queryconsumerwarning': { title: '预警清单', tags: ['稽查管理', '预警清单'], legacyBreadcrumb: '稽查管理 / 预警清单', tsStyle: true, rowActions: [{ key: 'detail', label: '查看', buttonType: 'primary' }], actionWidth: 98 },
      '#/warningparam': { title: '配置预警参数', tags: ['稽查管理', '配置预警参数'], legacyBreadcrumb: '稽查管理 / 配置预警参数', tsStyle: true, rowActions: [{ key: 'edit', label: '编辑', buttonType: 'primary' }], actionWidth: 98 },
      '#/informationinquiry': { title: '信息查询', tags: ['稽查管理', '信息查询'], legacyBreadcrumb: '稽查管理 / 信息查询', tsStyle: true, rowActions: [{ key: 'detail', label: '查看', buttonType: 'primary' }], actionWidth: 98 },
      '#/customerinquire': { title: '消费者查询页', tags: ['查询管理', '消费者查询页'], legacyBreadcrumb: '查询管理 / 消费者查询页', tsStyle: true, rowActions: [{ key: 'detail', label: '查看', buttonType: 'primary' }], actionWidth: 98 },
      '#/customerquery': { title: '消费者查询记录', tags: ['查询管理', '消费者查询记录'], legacyBreadcrumb: '查询管理 / 消费者查询记录', tsStyle: true, rowActions: [{ key: 'detail', label: '查看', buttonType: 'primary' }], actionWidth: 98 },
      '#/dragpage': { title: 'h5扫码页面自定义', tags: ['查询管理', 'h5扫码页面自定义'], legacyBreadcrumb: '查询管理 / h5扫码页面自定义', tsStyle: true, rowActions: [{ key: 'detail', label: '查看', buttonType: 'primary' }], actionWidth: 98 },
      '#/readycreate': { title: '预生码管理', tags: ['系统基础信息', '码库管理', '非套标生码管理', '预生码管理'], legacyBreadcrumb: '码库管理 / 非套标生码管理 / 预生码管理', tsStyle: true },
      '#/tagging/rulenews': { title: '生码查询表', tags: ['系统基础信息', '码库管理', '非套标生码管理', '生码查询'], legacyBreadcrumb: '码库管理 / 非套标生码管理 / 生码查询', tsStyle: true },
      '#/tagging/coderule': { title: '生码规则', tags: ['系统基础信息', '码库管理', '非套标生码管理', '生码规则'], legacyBreadcrumb: '码库管理 / 非套标生码管理 / 生码规则', tsStyle: true },
      '#/tlmQrcode/tlmreadycreate': { title: '预生码管理', tags: ['系统基础信息', '码库管理', '套标生码管理', '预生码管理'], legacyBreadcrumb: '码库管理 / 套标生码管理 / 预生码管理', tsStyle: true },
      '#/tlmQrcode/tlmQrcodelogs': { title: '校验查询', tags: ['系统基础信息', '码库管理', '套标生码管理', '校验查询'], legacyBreadcrumb: '码库管理 / 套标生码管理 / 校验查询', tsStyle: true },
      '#/tlmQrcode/tlmQrcoderule': { title: '生码规则', tags: ['系统基础信息', '码库管理', '套标生码管理', '生码规则'], legacyBreadcrumb: '码库管理 / 套标生码管理 / 生码规则', tsStyle: true },
      '#/tlmQrcode/codelogs': { title: '生码查询表', tags: ['系统基础信息', '码库管理', '套标生码管理', '生码查询'], legacyBreadcrumb: '码库管理 / 套标生码管理 / 生码查询', tsStyle: true },
      '#/productlist': { title: '产品列表', tags: ['系统基础信息', '基础信息', '产品信息', '产品列表'], legacyBreadcrumb: '基础信息 / 产品信息 / 产品列表', tsStyle: true },
      '#/productsort': { title: '品牌设置', tags: ['系统基础信息', '基础信息', '产品信息', '品牌设置'], legacyBreadcrumb: '基础信息 / 产品信息 / 品牌设置', tsStyle: true },
      '#/productunit': { title: '包装单位', tags: ['系统基础信息', '基础信息', '产品信息', '包装单位'], legacyBreadcrumb: '基础信息 / 产品信息 / 包装单位', tsStyle: true },
      '#/hierarchylist': { title: '包装关系', tags: ['系统基础信息', '基础信息', '产品信息', '包装关系'], legacyBreadcrumb: '基础信息 / 产品信息 / 包装关系', tsStyle: true },
      '#/hierarchy': { title: '包装关系(树)', tags: ['系统基础信息', '基础信息', '产品信息', '包装关系(树)'], legacyBreadcrumb: '基础信息 / 产品信息 / 包装关系(树)', tsStyle: true },
      '#/productunitconvert': { title: '包装单位转换', tags: ['系统基础信息', '基础信息', '产品信息', '包装单位转换'], legacyBreadcrumb: '基础信息 / 产品信息 / 包装单位转换', tsStyle: true },
      '#/store': { title: '仓库管理', tags: ['系统基础信息', '基础信息', '仓库管理'], legacyBreadcrumb: '基础信息 / 仓库管理', tsStyle: true },
      '#/material': { title: '原料信息', tags: ['系统基础信息', '基础信息', '原料信息'], legacyBreadcrumb: '基础信息 / 原料信息', tsStyle: true },
      '#/enterprise': { title: '维护企业', tags: ['系统基础信息', '基础信息', '维护企业'], legacyBreadcrumb: '基础信息 / 维护企业', tsStyle: true },
      '#/sysconfig': { title: '维护config表', tags: ['系统基础信息', '基础信息', '维护config表'], legacyBreadcrumb: '基础信息 / 维护config表', tsStyle: true },
      '#/systemminiprogram': { title: '小程序配置', tags: ['系统基础信息', '基础信息', '小程序配置'], legacyBreadcrumb: '基础信息 / 小程序配置', tsStyle: true },
      '#/industrialcomputer': { title: '工控机信息', tags: ['系统基础信息', '基础信息', '工控机信息'], legacyBreadcrumb: '基础信息 / 工控机信息', tsStyle: true },
      '#/tree': { title: '组织机构', tags: ['系统基础信息', '内部组织', '组织机构'], legacyBreadcrumb: '内部组织 / 组织机构', tsStyle: true },
      '#/organ/departmentjob': { title: '权限管理', tags: ['系统基础信息', '内部组织', '权限管理'], legacyBreadcrumb: '内部组织 / 权限管理', tsStyle: true },
      '#/stafflist': { title: '账号管理', tags: ['系统基础信息', '内部组织', '账号管理'], legacyBreadcrumb: '内部组织 / 账号管理', tsStyle: true },
      '#/operationlogs': { title: '日志管理', tags: ['系统基础信息', '内部组织', '日志管理'], legacyBreadcrumb: '内部组织 / 日志管理', tsStyle: true },
      '#/dealer': { title: '经销商列表', tags: ['系统基础信息', '外部组织', '经销商管理', '经销商列表'], legacyBreadcrumb: '外部组织 / 经销商管理 / 经销商列表', tsStyle: true },
      '#/dealeraddresslist': { title: '经销商区域', tags: ['系统基础信息', '外部组织', '经销商管理', '经销商区域'], legacyBreadcrumb: '外部组织 / 经销商管理 / 经销商区域', tsStyle: true },
      '#/dealeruserlist': { title: '会员信息', tags: ['系统基础信息', '外部组织', '经销商管理', '会员信息'], legacyBreadcrumb: '外部组织 / 经销商管理 / 会员信息', tsStyle: true },
      '#/Orgterminal': { title: '终端列表', tags: ['系统基础信息', '外部组织', '终端管理', '终端列表'], legacyBreadcrumb: '外部组织 / 终端管理 / 终端列表', tsStyle: true },
      '#/promoter': { title: '会员信息', tags: ['系统基础信息', '外部组织', '终端管理', '会员信息'], legacyBreadcrumb: '外部组织 / 终端管理 / 会员信息', tsStyle: true },
      '#/WXrole': { title: '小程序角色', tags: ['系统基础信息', '外部组织', '小程序权限管理', '小程序角色'], legacyBreadcrumb: '外部组织 / 小程序权限管理 / 小程序角色', tsStyle: true },
      '#/WXmenu': { title: '小程序菜单', tags: ['系统基础信息', '外部组织', '小程序权限管理', '小程序菜单'], legacyBreadcrumb: '外部组织 / 小程序权限管理 / 小程序菜单', tsStyle: true }
    };

    Object.keys(metaMap).forEach(function (route) {
      ensureSchema(route, metaMap[route]);
    });

    if (schemas['#/refund']) {
      Object.assign(schemas['#/refund'], {
        filters: [
          { key: 'refundCustomerCode', label: '退货客户编码', type: 'input', placeholder: '请输入退货客户编码', searchKeys: ['refundCustomerCode'] },
          { key: 'refundCustomerName', label: '退货客户名称', type: 'input', placeholder: '请输入退货客户名称', searchKeys: ['refundCustomerName'] },
          { key: 'refundNo', label: '退货单号', type: 'input', placeholder: '请输入退货单号', searchKeys: ['refundNo'] },
          { key: 'billType', label: '单据类型', type: 'select', options: ['销售退货'] }
        ],
        toolbarButtons: [
          { key: 'reset', label: '重置' },
          { key: 'search', label: '搜索', buttonType: 'primary', icon: 'el-icon-search' }
        ],
        columns: [
          { key: 'refundNo', label: '退货单号', minWidth: 160 },
          { key: 'creatorAccount', label: '制单人账号', minWidth: 120 },
          { key: 'creatorName', label: '制单人姓名', minWidth: 110 },
          { key: 'refundCustomerCode', label: '退货客户编码', minWidth: 120 },
          { key: 'refundCustomerName', label: '退货客户名称', minWidth: 180 },
          { key: 'createdAt', label: '制单时间', minWidth: 160 },
          { key: 'actualRefundTime', label: '实际退货时间', minWidth: 160 }
        ],
        rows: [
          { id: 1, refundNo: 'TH260117135602', creatorAccount: 'djz', creatorName: '邓剑军', refundCustomerCode: 'gdfc', refundCustomerName: '广东发财商贸有限公司', createdAt: '2026-01-17 13:56:41', actualRefundTime: '', billType: '销售退货' },
          { id: 2, refundNo: 'TH260112175209', creatorAccount: 'ls', creatorName: '李四', refundCustomerCode: 'gdfc', refundCustomerName: '广东发财商贸有限公司', createdAt: '2026-01-12 17:52:27', actualRefundTime: '', billType: '销售退货' },
          { id: 3, refundNo: 'TH260107120012', creatorAccount: 'ls', creatorName: '李四', refundCustomerCode: 'gdfc', refundCustomerName: '广东发财商贸有限公司', createdAt: '2026-01-07 12:00:28', actualRefundTime: '2026-01-07 14:21:30', billType: '销售退货' },
          { id: 4, refundNo: 'TH260107115114', creatorAccount: 'ls', creatorName: '李四', refundCustomerCode: 'gdfc', refundCustomerName: '广东发财商贸有限公司', createdAt: '2026-01-07 11:54:15', actualRefundTime: '2026-01-07 13:06:12', billType: '销售退货' }
        ]
      });
    }

    if (schemas['#/forensics']) {
      Object.assign(schemas['#/forensics'], {
        filters: [
          { key: 'productName', label: '商品名称', type: 'input', placeholder: '请输入商品名称', searchKeys: ['productName'] },
          { key: 'barcode', label: '条码', type: 'input', placeholder: '请输入条码', searchKeys: ['barcode'] }
        ],
        toolbarButtons: [
          { key: 'reset', label: '重置' },
          { key: 'search', label: '搜索', buttonType: 'primary', icon: 'el-icon-search' },
          { key: 'export', label: '导出Excel', buttonType: 'primary' }
        ],
        columns: [
          { key: 'serialNo', label: '流水编号', minWidth: 110 },
          { key: 'inspectAccount', label: '稽查账号', minWidth: 110 },
          { key: 'inspector', label: '稽查人员', minWidth: 110 },
          { key: 'productName', label: '商品名称', minWidth: 110 },
          { key: 'barcode', label: '商品条码', minWidth: 200 },
          { key: 'spec', label: '规格', minWidth: 90 },
          { key: 'remark', label: '备注', minWidth: 100 },
          { key: 'uploadTime', label: '上传时间', minWidth: 160 },
          { key: 'evidenceImage', label: '取证图片', minWidth: 130 }
        ],
        rows: [
          { id: 8, serialNo: '8', inspectAccount: 'laoliu', inspector: '老六', productName: '纯净水500ml', barcode: '2_134144789942854011', spec: '500ml', remark: '', uploadTime: '2026-02-28 11:54:00', evidenceImage: '图片' },
          { id: 7, serialNo: '7', inspectAccount: 'laoliu', inspector: '老六', productName: '纯净水500ml', barcode: '2_134144789942854011', spec: '500ml', remark: 'xxxx', uploadTime: '2026-02-06 11:03:49', evidenceImage: '二维码' },
          { id: 6, serialNo: '6', inspectAccount: '', inspector: '', productName: '纯净水500ml', barcode: '2_134122298513615363', spec: '500ml', remark: '', uploadTime: '2026-01-28 10:53:12', evidenceImage: '截图' },
          { id: 5, serialNo: '5', inspectAccount: '', inspector: '', productName: '纯净水500ml', barcode: '2_134122298513615363', spec: '500ml', remark: '', uploadTime: '2026-01-28 10:39:22', evidenceImage: '加载失败' }
        ]
      });
    }

    if (schemas['#/inspectrecord']) {
      Object.assign(schemas['#/inspectrecord'], {
        title: '稽查记录流水',
        filters: [
          { key: 'productCode', label: '产品编码', type: 'input', placeholder: '请输入产品名称模糊匹配或者下拉', searchKeys: ['productCode', 'productName'] },
          { key: 'inspectCode', label: '稽查码', type: 'input', placeholder: '请输入稽查码', searchKeys: ['inspectCode'] },
          { key: 'outboundCode', label: '出库码', type: 'input', placeholder: '请输入出库码', searchKeys: ['outboundCode'] },
          { key: 'productionBatch', label: '生产批次', type: 'input', placeholder: '请输入生产批次', searchKeys: ['productionBatch'] },
          { key: 'inspector', label: '稽查人员', type: 'input', placeholder: '请输入稽查人员', searchKeys: ['inspector'] },
          { key: 'inspectYear', label: '稽查年份', type: 'date' },
          { key: 'inspectTime', label: '稽查时间', type: 'daterange' }
        ],
        toolbarButtons: [
          { key: 'reset', label: '重置' },
          { key: 'search', label: '搜索', buttonType: 'primary', icon: 'el-icon-search' },
          { key: 'export', label: '导出Excel', buttonType: 'primary' }
        ],
        columns: [
          { key: 'inspector', label: '稽查人员', minWidth: 100 },
          { key: 'productName', label: '产品', minWidth: 220 },
          { key: 'productionBatch', label: '生产批次', minWidth: 120 },
          { key: 'inspectCode', label: '稽查码', minWidth: 150 },
          { key: 'outboundCode', label: '出库码', minWidth: 160 },
          { key: 'dealerCode', label: '经销商编码', minWidth: 120 },
          { key: 'dealerName', label: '经销商名称', minWidth: 180 }
        ],
        rows: [
          { id: 1, inspector: '老六', productName: 'cjs1纯净水500ml', productionBatch: 'cs262201', inspectCode: '2_134144789942854011', outboundCode: '2_134144789942854011', dealerCode: 'gdfc', dealerName: '广东发财商贸有限公司', productCode: 'cjs1' },
          { id: 2, inspector: '老六', productName: 'cjs1纯净水500ml', productionBatch: 'cs262201', inspectCode: '2_134144789942854011', outboundCode: '2_134144789942854011', dealerCode: 'gdfc', dealerName: '广东发财商贸有限公司', productCode: 'cjs1' },
          { id: 3, inspector: 'test1', productName: 'cjs1纯净水500ml', productionBatch: '2026010701', inspectCode: '2134122298233313700', outboundCode: '2134122298233313700', dealerCode: 'gdfc', dealerName: '广东发财商贸有限公司', productCode: 'cjs1' }
        ]
      });
    }

    if (schemas['#/queryconsumerwarning']) {
      Object.assign(schemas['#/queryconsumerwarning'], {
        filters: [
          { key: 'productCode', label: '产品编码', type: 'input', placeholder: '请输入产品名称模糊匹配或者下拉', searchKeys: ['productCode', 'productName'] },
          { key: 'codeValue', label: '码', type: 'input', placeholder: '请输入码', searchKeys: ['codeValue'] },
          { key: 'outboundNo', label: '出库单号', type: 'input', placeholder: '请输入出库单号', searchKeys: ['outboundNo'] },
          { key: 'warningTime', label: '预警时间', type: 'daterange' },
          { key: 'scanType', label: '扫码类型', type: 'select', options: ['全部', '消费者扫码', '经销商扫码'] }
        ],
        toolbarButtons: [
          { key: 'reset', label: '重置' },
          { key: 'search', label: '搜索', buttonType: 'primary', icon: 'el-icon-search' },
          { key: 'export', label: '导出Excel', buttonType: 'primary' }
        ],
        columns: [
          { key: 'outboundNo', label: '出库单号', minWidth: 150 },
          { key: 'codeValue', label: '码', minWidth: 150 },
          { key: 'openid', label: 'openid', minWidth: 120 },
          { key: 'packageLevel', label: '包装级别', minWidth: 110 },
          { key: 'productName', label: '产品', minWidth: 160 },
          { key: 'scanType', label: '扫码类型', minWidth: 120 },
          { key: 'warningTimeText', label: '预警时间', minWidth: 150 },
          { key: 'arrivalRegion', label: '发货到达区域', minWidth: 140 },
          { key: 'consumerRegion', label: '消费者扫码区域', minWidth: 140 }
        ],
        rows: []
      });
    }

    if (schemas['#/warningparam']) {
      Object.assign(schemas['#/warningparam'], {
        filters: [],
        toolbarButtons: [],
        columns: [
          { key: 'configKey', label: '配置key', minWidth: 180 },
          { key: 'configValue', label: '配置值', minWidth: 180 },
          { key: 'description', label: '中文描述', minWidth: 460 }
        ],
        rowActions: [{ key: 'edit', label: '配置预警参数', buttonType: 'primary' }],
        actionWidth: 180,
        rows: [
          { id: 1, configKey: 'threshold', configValue: '0', description: '追溯系统消费者扫码，非抵达区域阈值比例（按发货单号+产品计算）' }
        ]
      });
    }

    if (schemas['#/informationinquiry']) {
      Object.assign(schemas['#/informationinquiry'], {
        simpleQuery: true,
        queryTitle: '产品信息查询',
        filters: [{ key: 'queryCode', label: '查询码', type: 'input', placeholder: '请输入查询的码', searchKeys: ['queryCode'] }]
      });
    }

    if (schemas['#/customerinquire']) {
      Object.assign(schemas['#/customerinquire'], {
        simpleQuery: true,
        queryTitle: '产品防伪查询',
        filters: [{ key: 'queryCode', label: '查询码', type: 'input', placeholder: '请输入查询的码', searchKeys: ['queryCode'] }]
      });
    }

    if (schemas['#/customerquery']) {
      Object.assign(schemas['#/customerquery'], {
        title: '消费者扫码查询',
        filters: [
          { key: 'codeValue', label: '码', type: 'input', placeholder: '请输入码', searchKeys: ['codeValue'] },
          { key: 'productCode', label: '产品编码', type: 'input', placeholder: '请输入产品名称模糊匹配匹配或者下拉', searchKeys: ['productCode', 'productName'] },
          { key: 'brandName', label: '品牌', type: 'select', options: ['请选择', '弥特'] },
          { key: 'scanTime', label: '扫码时间', type: 'daterange' },
          { key: 'scanType', label: '扫码类型', type: 'select', options: ['全部', '消费者扫码', '经销商扫码'] }
        ],
        toolbarButtons: [
          { key: 'reset', label: '重置' },
          { key: 'search', label: '搜索', buttonType: 'primary', icon: 'el-icon-search' },
          { key: 'export', label: '导出Excel', buttonType: 'primary' }
        ],
        columns: [
          { key: 'productName', label: '产品编码', minWidth: 150 },
          { key: 'codeValue', label: '码', minWidth: 120 },
          { key: 'openid', label: 'openid', minWidth: 120 },
          { key: 'brandId', label: '品牌ID', minWidth: 100 },
          { key: 'brandNameText', label: '品牌名称', minWidth: 100 },
          { key: 'province', label: '省份', minWidth: 90 },
          { key: 'city', label: '城市', minWidth: 90 },
          { key: 'district', label: '地区', minWidth: 90 },
          { key: 'scanTimeText', label: '扫码时间', minWidth: 150 },
          { key: 'dealerCode', label: '经销商编码', minWidth: 120 }
        ],
        rows: [
          { id: 1, productName: 'cjs1纯净水500ml', codeValue: '2_1341414426...', openid: '', brandId: '1', brandNameText: '弥特', province: '广东省', city: '广州市', district: '', scanTimeText: '2026-04-20 16:30:11', dealerCode: '' },
          { id: 2, productName: 'cjs1纯净水500ml', codeValue: '2_1341414426...', openid: '', brandId: '1', brandNameText: '弥特', province: '广东省', city: '广州市', district: '', scanTimeText: '2026-04-20 15:21:06', dealerCode: 'gdfc' },
          { id: 3, productName: 'cjs1纯净水500ml', codeValue: '2510170TDQP5I9', openid: '', brandId: '1', brandNameText: '弥特', province: '广东省', city: '广州市', district: '黄埔区', scanTimeText: '2026-04-16 10:16:28', dealerCode: 'gdfc' }
        ],
        total: 46,
        pageSize: 10
      });
    }

    if (schemas['#/barter']) {
      Object.assign(schemas['#/barter'], {
        filters: [
          { key: 'billNo', label: '运单号', type: 'input', placeholder: '请输入运单号', searchKeys: ['billNo'] },
          { key: 'outboundNo', label: '出库单号', type: 'input', placeholder: '请输入出库单号', searchKeys: ['outboundNo'] },
          { key: 'batchNo', label: '批次号', type: 'input', placeholder: '请输入批次号', searchKeys: ['batchNo'] },
          { key: 'productCode', label: '产品编码', type: 'input', placeholder: '请输入产品编码', searchKeys: ['productCode', 'productName'] },
          { key: 'oldCode', label: '旧码', type: 'input', placeholder: '请输入旧码', searchKeys: ['oldCode'] },
          { key: 'newCode', label: '新码', type: 'input', placeholder: '请输入新码', searchKeys: ['newCode'] },
          { key: 'packageLevel', label: '包装级别', type: 'input', placeholder: '请输入包装级别', searchKeys: ['packageLevel'] },
          { key: 'scanDate', label: '扫码日期', type: 'daterange' }
        ],
        toolbarButtons: [
          { key: 'reset', label: '重置' },
          { key: 'search', label: '搜索', buttonType: 'primary', icon: 'el-icon-search' },
          { key: 'export', label: '导出Excel', buttonType: 'primary' }
        ],
        columns: [
          { key: 'billNo', label: '运单号', minWidth: 150 },
          { key: 'outboundNo', label: '出库单号', minWidth: 150 },
          { key: 'batchNo', label: '批次号', minWidth: 140 },
          { key: 'customerName', label: '客户', minWidth: 160 },
          { key: 'productName', label: '产品', minWidth: 160 },
          { key: 'oldCode', label: '旧码', minWidth: 150 },
          { key: 'newCode', label: '新码', minWidth: 150 },
          { key: 'packageLevel', label: '包装级别', minWidth: 110 },
          { key: 'scanTime', label: '扫码时间', minWidth: 150 }
        ],
        rows: []
      });
    }

    if (schemas['#/boxcode']) {
      Object.assign(schemas['#/boxcode'], {
        filters: [
          { key: 'billNo', label: '运单号', type: 'input', placeholder: '请输入运单号', searchKeys: ['billNo'] },
          { key: 'batchNo', label: '批次号', type: 'input', placeholder: '请输入批次号', searchKeys: ['batchNo'] },
          { key: 'outboundNo', label: '出库单号', type: 'input', placeholder: '请输入出库单号', searchKeys: ['outboundNo'] },
          { key: 'productCode', label: '产品编码', type: 'input', placeholder: '请输入产品名称', searchKeys: ['productCode', 'productName'] },
          { key: 'boxCode', label: '箱码', type: 'input', placeholder: '请输入箱码', searchKeys: ['boxCode'] },
          { key: 'year', label: '年份', type: 'date' }
        ],
        toolbarButtons: [
          { key: 'search', label: '搜索', buttonType: 'primary', icon: 'el-icon-search' },
          { key: 'export', label: '导出Excel', buttonType: 'primary' }
        ],
        columns: [
          { key: 'billNo', label: '运单号', minWidth: 140 },
          { key: 'outboundNo', label: '出库单号', minWidth: 140 },
          { key: 'warehouseName', label: '发货仓库', minWidth: 120 },
          { key: 'customerName', label: '客户', minWidth: 160 },
          { key: 'productName', label: '产品', minWidth: 160 },
          { key: 'boxCode', label: '箱码', minWidth: 170 },
          { key: 'packageLevel', label: '包装级别', minWidth: 100 },
          { key: 'parentCode', label: '父级码', minWidth: 160 },
          { key: 'packageUnit', label: '包装单位', minWidth: 100 },
          { key: 'minUnitQty', label: '最小单位数量', minWidth: 110 },
          { key: 'outboundBatch', label: '出库批次', minWidth: 120 }
        ],
        rows: [
          { id: 1, billNo: 'YD2026020501', outboundNo: 'CK2026020501', warehouseName: '物流一仓', customerName: '广东发财商贸有限公司', productName: '纯净水500ml', boxCode: 'X202602051018001', packageLevel: '2', parentCode: '3134122298185281148', packageUnit: '箱', minUnitQty: '12', outboundBatch: '2026020501', year: '2026-02-05' },
          { id: 2, billNo: 'YD2026020502', outboundNo: 'CK2026020502', warehouseName: '物流一仓', customerName: '终端A', productName: '纯净水500ml', boxCode: 'X202602051018002', packageLevel: '2', parentCode: '3134122298185281149', packageUnit: '箱', minUnitQty: '12', outboundBatch: '2026020502', year: '2026-02-05' }
        ]
      });
    }

    if (schemas['#/findDirection']) {
      Object.assign(schemas['#/findDirection'], {
        filters: [
          { key: 'batchNo', label: '批次号', type: 'input', placeholder: '请输入批次号', searchKeys: ['batchNo'] },
          { key: 'outboundDate', label: '创建时间', type: 'daterange' }
        ],
        toolbarButtons: [
          { key: 'reset', label: '重置' },
          { key: 'search', label: '搜索', buttonType: 'primary', icon: 'el-icon-search' }
        ],
        columns: [
          { key: 'batchNo', label: '批次', minWidth: 120 },
          { key: 'outboundNo', label: '出库单号', minWidth: 140 },
          { key: 'productCode', label: '产品编码', minWidth: 90 },
          { key: 'productName', label: '产品名称', minWidth: 140 },
          { key: 'dealerCode', label: '经销商编码', minWidth: 100 },
          { key: 'dealerName', label: '经销商名称', minWidth: 180 },
          { key: 'actualQty', label: '实际出库数量', minWidth: 110 },
          { key: 'scanQty', label: '扫码数量', minWidth: 90 },
          { key: 'dealerAddress', label: '经销商地址', minWidth: 150 },
          { key: 'warehouseCode', label: '仓库编码', minWidth: 90 },
          { key: 'warehouseName', label: '仓库名称', minWidth: 120 },
          { key: 'outboundDate', label: '出库日期', minWidth: 150 },
          { key: 'status', label: '状态', minWidth: 90 }
        ],
        rows: [
          { id: 1, batchNo: '2026010701', outboundNo: 'CK20260107', productCode: 'cjs1', productName: '纯净水500ml', dealerCode: 'gdfc', dealerName: '广东发财商贸有限公司', actualQty: '72', scanQty: '72', dealerAddress: '', warehouseCode: 'wlyc001', warehouseName: '物流一仓', outboundDate: '2026-01-07 11:50:13', status: '已签收' },
          { id: 2, batchNo: '202601290001A', outboundNo: 'OUT202601290001', productCode: 'cjs1', productName: '纯净水500ml', dealerCode: 'gdfc', dealerName: '广东发财商贸有限公司', actualQty: '72', scanQty: '72', dealerAddress: '地址1', warehouseCode: 'wlyc001', warehouseName: '物流一仓', outboundDate: '2026-01-29 16:59:17', status: '已发货' },
          { id: 3, batchNo: 'cs262201', outboundNo: 'yd26020401', productCode: 'cjs1', productName: '纯净水500ml', dealerCode: 'gdfc', dealerName: '广东发财商贸有限公司', actualQty: '5', scanQty: '5', dealerAddress: '11122', warehouseCode: 'wlyc001', warehouseName: '物流一仓', outboundDate: '2026-02-04 15:10:31', status: '已签收' }
        ],
        total: 25,
        pageSize: 10
      });
    }

    if (schemas['#/transferOutOrder']) {
      Object.assign(schemas['#/transferOutOrder'], {
        filters: [
          { key: 'fromWarehouse', label: '发货仓库编码', type: 'select', options: ['物流一仓', '物流二仓'] },
          { key: 'toWarehouse', label: '收货仓库编码', type: 'select', options: ['物流一仓', '物流二仓'] },
          { key: 'status', label: '状态', type: 'select', options: ['待出库', '已出库'] },
          { key: 'transferDate', label: '时间', type: 'daterange' }
        ],
        toolbarButtons: [
          { key: 'search', label: '搜索', buttonType: 'primary', icon: 'el-icon-search' },
          { key: 'reset', label: '重置' },
          { key: 'create', label: '新增出库', buttonType: 'primary' }
        ],
        rowActions: [
          { key: 'edit', label: '编辑', buttonType: 'primary' },
          { key: 'confirm', label: '确认调拨', buttonType: 'primary' },
          { key: 'delete', label: '删除', buttonType: 'danger' }
        ],
        actionWidth: 220,
        columns: [
          { key: 'transferNo', label: '调拨单号', minWidth: 150 },
          { key: 'creatorName', label: '建单人', minWidth: 90 },
          { key: 'fromWarehouse', label: '发货仓库', minWidth: 140 },
          { key: 'toWarehouse', label: '收货仓库', minWidth: 140 },
          { key: 'transferDate', label: '调拨日期', minWidth: 110 },
          { key: 'pdaDoneTime', label: 'PDA完成时间', minWidth: 120 },
          { key: 'status', label: '单据状态', minWidth: 100 },
          { key: 'syncStatus', label: 'T+状态', minWidth: 90 },
          { key: 'remark', label: '备注', minWidth: 120 }
        ],
        rows: [
          { id: 1, transferNo: 'DBD20260204000001', creatorName: '李四', fromWarehouse: '物流一仓', toWarehouse: '物流二仓', transferDate: '2026-02-04', pdaDoneTime: '', status: '待出库', syncStatus: '未同步', remark: '' },
          { id: 2, transferNo: 'DBD20260203000001', creatorName: '李四', fromWarehouse: '物流一仓', toWarehouse: '物流二仓', transferDate: '2026-02-03', pdaDoneTime: '', status: '待出库', syncStatus: '未同步', remark: '' }
        ],
        total: 2,
        pageSize: 10
      });
    }

    if (schemas['#/transferOutOrderScan']) {
      Object.assign(schemas['#/transferOutOrderScan'], {
        filters: [
          { key: 'transferNo', label: '调拨单号', type: 'input', placeholder: '请输入调拨单号', searchKeys: ['transferNo'] },
          { key: 'scanCode', label: '码', type: 'input', placeholder: '请输入码', searchKeys: ['parentCode', 'childCode'] },
          { key: 'status', label: '状态', type: 'select', options: ['全部', '已完成', '待处理'] },
          { key: 'scanDate', label: '时间', type: 'daterange' }
        ],
        toolbarButtons: [
          { key: 'search', label: '搜索', buttonType: 'primary', icon: 'el-icon-search' },
          { key: 'reset', label: '重置' }
        ],
        columns: [
          { key: 'transferNo', label: '调拨单号', minWidth: 150 },
          { key: 'productCode', label: '产品编码', minWidth: 90 },
          { key: 'productName', label: '产品名称', minWidth: 120 },
          { key: 'packageLevel', label: '包装级别', minWidth: 90 },
          { key: 'productionBatch', label: '生产批次', minWidth: 110 },
          { key: 'transferBatch', label: '调拨批次', minWidth: 110 },
          { key: 'quantity', label: '数量', minWidth: 60 },
          { key: 'parentCode', label: '父级码', minWidth: 160 },
          { key: 'childCode', label: '子级码', minWidth: 180 }
        ],
        rows: [
          { id: 1, transferNo: 'DBD20260203000001', productCode: 'cjs1', productName: '纯净水500ml', packageLevel: '2', productionBatch: '2026010701', transferBatch: '', quantity: '12', parentCode: '3134122298185281148', childCode: '2134122298270512682', status: '已完成' },
          { id: 2, transferNo: 'DBD20260204000001', productCode: 'cjs1', productName: '纯净水500ml', packageLevel: '2', productionBatch: '2026010701', transferBatch: '', quantity: '12', parentCode: '3134122298185281148', childCode: '2134122298206018269', status: '已完成' },
          { id: 3, transferNo: 'DBD20260204000001', productCode: 'cjs1', productName: '纯净水500ml', packageLevel: '2', productionBatch: '2026010701', transferBatch: '', quantity: '12', parentCode: '3134122298185281148', childCode: '2134122298225286811', status: '已完成' }
        ],
        total: 74,
        pageSize: 10
      });
    }

    if (schemas['#/dealersignorderlogs']) {
      Object.assign(schemas['#/dealersignorderlogs'], {
        filters: [
          { key: 'outboundNo', label: '出库单号', type: 'input', placeholder: '出库单号', searchKeys: ['outboundNo'] },
          { key: 'dealerCode', label: '经销商编码', type: 'input', placeholder: '经销商编码', searchKeys: ['dealerCode'] },
          { key: 'dealerName', label: '经销商名称', type: 'input', placeholder: '经销商名称', searchKeys: ['dealerName'] }
        ],
        toolbarButtons: [
          { key: 'reset', label: '重置' },
          { key: 'search', label: '查询', buttonType: 'primary', icon: 'el-icon-search' }
        ],
        rowActions: [
          { key: 'detail', label: '查看产品', buttonType: 'primary' },
          { key: 'evidence', label: '取证图片', buttonType: 'primary' }
        ],
        actionWidth: 190,
        columns: [
          { key: 'outboundNo', label: '出库单号', minWidth: 100 },
          { key: 'billNo', label: '运单号', minWidth: 100 },
          { key: 'dealerName', label: '经销商名称', minWidth: 120 },
          { key: 'dealerCode', label: '经销商编码', minWidth: 110 },
          { key: 'warehouseName', label: '发货仓库', minWidth: 100 },
          { key: 'warehouseCode', label: '发货仓库编码', minWidth: 120 },
          { key: 'dealerAddress', label: '经销商地址', minWidth: 120 },
          { key: 'signAddress', label: '签收地址', minWidth: 150 }
        ],
        rows: [
          { id: 1, outboundNo: 'CK20260222...', billNo: 'e28c69826...', dealerName: '广东发财商贸有限公司', dealerCode: 'gdfc', warehouseName: '物流一仓', warehouseCode: 'wlyc001', dealerAddress: '', signAddress: '广东省广州市黄埔区' },
          { id: 2, outboundNo: 'CK20260107', billNo: 'YD20260107', dealerName: '广东发财商贸有限公司', dealerCode: 'gdfc', warehouseName: '物流一仓', warehouseCode: 'wlyc001', dealerAddress: '', signAddress: '广东省广州市' },
          { id: 3, outboundNo: 'yd26020401', billNo: '6c727b5d2...', dealerName: '广东发财商贸有限公司', dealerCode: 'gdfc', warehouseName: '物流一仓', warehouseCode: 'wlyc001', dealerAddress: '11122', signAddress: '广东省广州市' }
        ],
        total: 3,
        pageSize: 10
      });
    }

    if (schemas['#/dealersignqrcodescanlog']) {
      Object.assign(schemas['#/dealersignqrcodescanlog'], {
        filters: [
          { key: 'outboundNo', label: '出库单号', type: 'input', placeholder: '出库单号', searchKeys: ['outboundNo'] },
          { key: 'dealerCode', label: '经销商编码', type: 'input', placeholder: '经销商编码', searchKeys: ['dealerCode'] },
          { key: 'scanCode', label: '码', type: 'input', placeholder: '请输入码', searchKeys: ['scanCode'] }
        ],
        toolbarButtons: [
          { key: 'reset', label: '重置' },
          { key: 'search', label: '查询', buttonType: 'primary', icon: 'el-icon-search' }
        ],
        columns: [
          { key: 'outboundNo', label: '出库单号', minWidth: 140 },
          { key: 'billNo', label: '运单号', minWidth: 140 },
          { key: 'productCode', label: '产品编码', minWidth: 100 },
          { key: 'productName', label: '产品名称', minWidth: 140 },
          { key: 'errorCode', label: '异常码', minWidth: 180 },
          { key: 'createdAt', label: '创建时间', minWidth: 150 }
        ],
        rows: [],
        total: 0,
        pageSize: 10
      });
    }

    if (schemas['#/tssttSsignWeblist']) {
      Object.assign(schemas['#/tssttSsignWeblist'], {
        title: '经销商出库',
        filters: [
          { key: 'outboundNo', label: '出库单号', type: 'input', placeholder: '请输入出库单号', searchKeys: ['outboundNo'] },
          { key: 'receiveCode', label: '收货编码', type: 'input', placeholder: '请输入收货编码', searchKeys: ['customerCode'] },
          { key: 'dealerCode', label: '经销商编码', type: 'input', placeholder: '请输入经销商编码', searchKeys: ['dealerCode'] },
          { key: 'status', label: '状态', type: 'select', options: ['所有', '已送达', '未送达'] },
          { key: 'createdAt', label: '建单日期', type: 'daterange' },
          { key: 'deliveryAt', label: '送达日期', type: 'daterange' },
          { key: 'signAt', label: '签收日期', type: 'daterange' }
        ],
        toolbarButtons: [
          { key: 'reset', label: '重置' },
          { key: 'search', label: '查询', buttonType: 'primary', icon: 'el-icon-search' },
          { key: 'export', label: '导出', buttonType: 'primary' }
        ],
        rowActions: [
          { key: 'box', label: '查看箱码', buttonType: 'primary' },
          { key: 'photo', label: '查询签收照片', buttonType: 'primary' }
        ],
        actionWidth: 220,
        columns: [
          { key: 'dealerCode', label: '经销商编码', minWidth: 110 },
          { key: 'dealerName', label: '经销商名称', minWidth: 160 },
          { key: 'customerCode', label: '客户编码', minWidth: 160 },
          { key: 'customerName', label: '客户名称', minWidth: 100 },
          { key: 'signer', label: '签收人', minWidth: 90 },
          { key: 'signerPhone', label: '签收人手机号', minWidth: 120 }
        ],
        rows: [
          { id: 1, dealerCode: 'gdfc', dealerName: '广东发财商贸有限公司', customerCode: '2c124912c5884159a...', customerName: '终端A', signer: '', signerPhone: '', outboundNo: 'HP20260228...', status: '已送达' },
          { id: 2, dealerCode: 'gdfc', dealerName: '广东发财商贸有限公司', customerCode: '2c124912c5884159a...', customerName: '终端A', signer: '', signerPhone: '', outboundNo: 'HP20260228...', status: '已送达' },
          { id: 3, dealerCode: '77acc51897a54fd6b1...', dealerName: '二级经销商2', customerCode: '65950a59de0c4a3cbf...', customerName: '终端2B', signer: '老刘', signerPhone: '13971072325', outboundNo: 'HP20260205...', status: '未送达' }
        ],
        total: 13,
        pageSize: 10
      });
    }

    if (schemas['#/refundorderlist']) {
      Object.assign(schemas['#/refundorderlist'], {
        filters: [
          { key: 'refundNo', label: '退货单号', type: 'input', placeholder: '请输入退货单号', searchKeys: ['refundNo'] },
          { key: 'customerCode', label: '收货客户编码', type: 'input', placeholder: '请输入收货客户编码', searchKeys: ['customerCode'] },
          { key: 'dealerCode', label: '经销商编码', type: 'input', placeholder: '请输入经销商编码', searchKeys: ['dealerCode'] },
          { key: 'status', label: '状态', type: 'select', options: ['所有', '已退货', '处理中'] },
          { key: 'createdAt', label: '建单日期', type: 'daterange' },
          { key: 'refundAt', label: '退货日期', type: 'daterange' }
        ],
        toolbarButtons: [
          { key: 'reset', label: '重置' },
          { key: 'search', label: '查询', buttonType: 'primary', icon: 'el-icon-search' },
          { key: 'export', label: '导出', buttonType: 'primary' }
        ],
        columns: [
          { key: 'dealerCode', label: '经销商编码', minWidth: 110 },
          { key: 'dealerName', label: '经销商名称', minWidth: 160 },
          { key: 'customerCode', label: '客户编码', minWidth: 160 },
          { key: 'customerName', label: '客户名称', minWidth: 100 },
          { key: 'createdAt', label: '建单时间', minWidth: 150 },
          { key: 'refundAt', label: '退货时间', minWidth: 150 },
          { key: 'deliverAddress', label: '送达地址', minWidth: 170 },
          { key: 'status', label: '状态', minWidth: 90 }
        ],
        rows: [
          { id: 1, dealerCode: 'gdfc', dealerName: '广东发财商贸有限公司', customerCode: '2c124912c5884159a...', customerName: '终端A', createdAt: '2026-03-03 17:43:11', refundAt: '', deliverAddress: '', status: '处理中', refundNo: 'TH2026030301' },
          { id: 2, dealerCode: 'gdfc', dealerName: '广东发财商贸有限公司', customerCode: '2c124912c5884159a...', customerName: '终端A', createdAt: '2026-02-28 13:08:11', refundAt: '2026-02-28 13:15:11', deliverAddress: '广东省广州市增城区荔新街', status: '已退货', refundNo: 'TH2026022801' },
          { id: 3, dealerCode: 'gdfc', dealerName: '广东发财商贸有限公司', customerCode: 'a15523e2fa5647a7ac...', customerName: '二级经销商', createdAt: '2026-02-05 16:11:37', refundAt: '2026-02-05 16:12:55', deliverAddress: '广东省广州市黄埔区西成中街', status: '已退货', refundNo: 'TH2026020501' }
        ],
        total: 3,
        pageSize: 10
      });
    }

    if (schemas['#/sttSsignWeblist']) {
      Object.assign(schemas['#/sttSsignWeblist'], {
        title: '单据签收记录',
        filters: [
          { key: 'outboundNo', label: '出库单号', type: 'input', placeholder: '请输入出库单号', searchKeys: ['outboundNo'] },
          { key: 'receiveCode', label: '收货编码', type: 'input', placeholder: '请输入收货编码', searchKeys: ['customerCode'] },
          { key: 'dealerCode', label: '经销商编码', type: 'input', placeholder: '请输入经销商编码', searchKeys: ['dealerCode'] },
          { key: 'createdAt', label: '建单日期', type: 'daterange' },
          { key: 'signAt', label: '签收日期', type: 'daterange' }
        ],
        toolbarButtons: [
          { key: 'reset', label: '重置' },
          { key: 'search', label: '搜索', buttonType: 'primary', icon: 'el-icon-search' },
          { key: 'export', label: '导出', buttonType: 'primary' }
        ],
        rowActions: [
          { key: 'box', label: '查看箱码', buttonType: 'primary' },
          { key: 'photo', label: '查询签收照片', buttonType: 'primary' }
        ],
        actionWidth: 220,
        columns: [
          { key: 'dealerCode', label: '经销商编码', minWidth: 110 },
          { key: 'dealerName', label: '经销商名称', minWidth: 160 },
          { key: 'customerCode', label: '客户编码', minWidth: 160 },
          { key: 'customerName', label: '客户名称', minWidth: 100 },
          { key: 'signer', label: '签收人', minWidth: 90 },
          { key: 'signerPhone', label: '签收人手机号', minWidth: 120 }
        ],
        rows: [
          { id: 1, dealerCode: '77acc51897a54fd6b1...', dealerName: '二级经销商2', customerCode: '65950a59de0c4a3cbf...', customerName: '终端2B', signer: '老刘', signerPhone: '13971072325', outboundNo: 'HP2026020501' },
          { id: 2, dealerCode: 'gdfc', dealerName: '广东发财商贸有限公司', customerCode: '2c124912c5884159a...', customerName: '终端A', signer: '用户A', signerPhone: '13971072325', outboundNo: 'HP2026020502' }
        ],
        total: 2,
        pageSize: 10
      });
    }

    if (schemas['#/sttSsignscancodelogs']) {
      Object.assign(schemas['#/sttSsignscancodelogs'], {
        title: '扫码签收记录',
        filters: [
          { key: 'outboundNo', label: '出库单号', type: 'input', placeholder: '请输入出库单号', searchKeys: ['outboundNo'] },
          { key: 'receiveCode', label: '收货编码', type: 'input', placeholder: '请输入收货编码', searchKeys: ['receiveCode'] },
          { key: 'signNo', label: '签收单号', type: 'input', placeholder: '请输入签收单号', searchKeys: ['signNo'] },
          { key: 'status', label: '状态', type: 'select', options: ['所有', '已送达', '未送达'] }
        ],
        toolbarButtons: [
          { key: 'reset', label: '重置' },
          { key: 'search', label: '搜索', buttonType: 'primary', icon: 'el-icon-search' }
        ],
        columns: [
          { key: 'customerCode', label: '客户编码', minWidth: 150 },
          { key: 'customerName', label: '客户名称', minWidth: 120 },
          { key: 'signer', label: '签收人', minWidth: 90 },
          { key: 'signerPhone', label: '签收人手机号', minWidth: 120 },
          { key: 'createdAt', label: '建单时间', minWidth: 150 },
          { key: 'signAt', label: '签收时间', minWidth: 150 },
          { key: 'signAddress', label: '签收地址', minWidth: 150 },
          { key: 'deliveryAt', label: '送达时间', minWidth: 150 },
          { key: 'deliveryAddress', label: '送达地址', minWidth: 180 },
          { key: 'outboundNo', label: '出库单号', minWidth: 150 },
          { key: 'receiveCode', label: '收货编码', minWidth: 150 },
          { key: 'status', label: '状态', minWidth: 90 }
        ],
        rows: [
          { id: 1, customerCode: '2c124912c5884159a...', customerName: '终端A', signer: '', signerPhone: '', createdAt: '2026-02-28 12:55:21', signAt: '2026-02-28 12:55:21', signAddress: '', deliveryAt: '2026-02-28 12:55:21', deliveryAddress: '广东省广州市黄埔区穗东街...', outboundNo: '202602282c124912c5...', receiveCode: '2c124912c5884159ac...', status: '已送达', signNo: 'QS2026022801' },
          { id: 2, customerCode: '2c124912c5884159a...', customerName: '终端A', signer: '', signerPhone: '', createdAt: '2026-02-28 13:05:38', signAt: '', signAddress: '', deliveryAt: '2026-02-28 13:05:38', deliveryAddress: '广东省广州市增城区荔新街...', outboundNo: 'HP2026022858010000...', receiveCode: '2c124912c5884159ac...', status: '未送达', signNo: 'QS2026022802' },
          { id: 3, customerCode: '65950a59de0c4a3cbf...', customerName: '终端2B', signer: '', signerPhone: '', createdAt: '2026-02-05 17:31:52', signAt: '', signAddress: '', deliveryAt: '2026-02-05 17:31:52', deliveryAddress: '广东省广州市黄埔区西成中街', outboundNo: 'HP2026020574980000...', receiveCode: '65950a59de0c4a3cbf...', status: '未送达', signNo: 'QS2026020501' }
        ],
        total: 10,
        pageSize: 10
      });
    }

    if (schemas['#/channelinventorylist']) {
      Object.assign(schemas['#/channelinventorylist'], {
        filters: [
          { key: 'channelCode', label: '渠道编码', type: 'input', placeholder: '请输入渠道编码', searchKeys: ['channelCode'] },
          { key: 'productCode', label: '产品编码', type: 'input', placeholder: '请输入产品编码', searchKeys: ['productCode'] },
          { key: 'productName', label: '产品名称', type: 'input', placeholder: '请输入产品名称', searchKeys: ['productName'] },
          { key: 'channelType', label: '渠道类型', type: 'select', options: ['所有', '终端门店', '经销商'] }
        ],
        toolbarButtons: [
          { key: 'reset', label: '重置' },
          { key: 'search', label: '搜索', buttonType: 'primary', icon: 'el-icon-search' }
        ],
        columns: [
          { key: 'channelCode', label: '渠道编码', minWidth: 320 },
          { key: 'channelName', label: '渠道名称', minWidth: 90 },
          { key: 'channelType', label: '渠道类型', minWidth: 90 },
          { key: 'productCode', label: '产品编码', minWidth: 90 },
          { key: 'productName', label: '产品名称', minWidth: 110 },
          { key: 'inventoryQty', label: '库存数量', minWidth: 90 },
          { key: 'packageUnit', label: '包装单位', minWidth: 90 },
          { key: 'createdAt', label: '创建时间', minWidth: 150 }
        ],
        rows: [
          { id: 1, channelCode: '65950a59de0c4a3cbfea530347e4c82c', channelName: '终端2B', channelType: '终端门店', productCode: 'cjs1', productName: '纯净水500ml', inventoryQty: '123', packageUnit: 'ping', createdAt: '2026-02-05 17:36:18' },
          { id: 2, channelCode: '2c124912c5884159ac42463d746022b5', channelName: '终端A', channelType: '终端门店', productCode: 'cjs1', productName: '纯净水500ml', inventoryQty: '123', packageUnit: 'ping', createdAt: '2026-02-05 17:27:27' },
          { id: 3, channelCode: '77acc51897a54fd6b1def6709ce050a5', channelName: '', channelType: '经销商', productCode: 'cjs1', productName: '纯净水500ml', inventoryQty: '-492', packageUnit: 'ping', createdAt: '2026-02-05 17:00:24' },
          { id: 4, channelCode: 'a15523e2fa5647a7acb60ff1eadb3d35', channelName: '', channelType: '终端门店', productCode: 'cjs1', productName: '纯净水500ml', inventoryQty: '-246', packageUnit: 'ping', createdAt: '2026-02-05 16:12:55' },
          { id: 5, channelCode: 'gdfc', channelName: '', channelType: '经销商', productCode: 'cjs1', productName: '纯净水500ml', inventoryQty: '18081', packageUnit: 'ping', createdAt: '2026-02-05 16:01:45' }
        ],
        total: 5,
        pageSize: 10
      });
    }

    if (schemas['#/channelinventorylogs']) {
      Object.assign(schemas['#/channelinventorylogs'], {
        filters: [
          { key: 'channelCode', label: '渠道编码', type: 'input', placeholder: '请输入渠道编码', searchKeys: ['channelCode'] },
          { key: 'productCode', label: '产品编码', type: 'input', placeholder: '请输入产品编码', searchKeys: ['productCode'] },
          { key: 'productName', label: '产品名称', type: 'input', placeholder: '请输入产品名称', searchKeys: ['productName'] },
          { key: 'logType', label: '流水类型', type: 'select', options: ['所有', '出库', '签收', '退货', '调拨'] },
          { key: 'createdAt', label: '创建时间', type: 'daterange' }
        ],
        toolbarButtons: [
          { key: 'reset', label: '重置' },
          { key: 'search', label: '搜索', buttonType: 'primary', icon: 'el-icon-search' },
          { key: 'export', label: '导出', buttonType: 'primary' }
        ],
        columns: [
          { key: 'channelCode', label: '渠道编码', minWidth: 220 },
          { key: 'channelName', label: '渠道名称', minWidth: 110 },
          { key: 'channelType', label: '渠道类型', minWidth: 100 },
          { key: 'productCode', label: '产品编码', minWidth: 90 },
          { key: 'productName', label: '产品名称', minWidth: 120 },
          { key: 'logType', label: '流水类型', minWidth: 100 },
          { key: 'changeQty', label: '变动数量', minWidth: 90 },
          { key: 'beforeQty', label: '变动前库存', minWidth: 100 },
          { key: 'afterQty', label: '变动后库存', minWidth: 100 },
          { key: 'bizNo', label: '关联单号', minWidth: 140 },
          { key: 'createdAt', label: '创建时间', minWidth: 150 }
        ],
        rows: [
          { id: 1, channelCode: 'gdfc', channelName: '广东发财商贸有限公司', channelType: '经销商', productCode: 'cjs1', productName: '纯净水500ml', logType: '出库', changeQty: '-72', beforeQty: '18153', afterQty: '18081', bizNo: 'HP2026022801', createdAt: '2026-02-28 12:55:21' },
          { id: 2, channelCode: '2c124912c5884159ac42463d746022b5', channelName: '终端A', channelType: '终端门店', productCode: 'cjs1', productName: '纯净水500ml', logType: '签收', changeQty: '+123', beforeQty: '0', afterQty: '123', bizNo: 'QS2026022801', createdAt: '2026-02-28 13:05:38' },
          { id: 3, channelCode: 'a15523e2fa5647a7acb60ff1eadb3d35', channelName: '终端门店', channelType: '终端门店', productCode: 'cjs1', productName: '纯净水500ml', logType: '退货', changeQty: '-246', beforeQty: '0', afterQty: '-246', bizNo: 'TH2026020501', createdAt: '2026-02-05 16:12:55' }
        ],
        total: 3,
        pageSize: 10
      });
    }

    if (schemas['#/qrcodescaninspectleveltwo']) {
      Object.assign(schemas['#/qrcodescaninspectleveltwo'], {
        title: '窜货记录',
        filters: [
          { key: 'productCode', label: '产品编码', type: 'input', placeholder: '请输入产品名称模糊匹配', searchKeys: ['productCode', 'productName'] },
          { key: 'codeValue', label: '码', type: 'input', placeholder: '请输入码', searchKeys: ['codeValue'] },
          { key: 'productionBatch', label: '生产批次', type: 'input', placeholder: '请输入生产批次', searchKeys: ['productionBatch'] },
          { key: 'dealerCode', label: '经销商编码', type: 'input', placeholder: '请输入经销商编码', searchKeys: ['dealerCode'] },
          { key: 'dealerName', label: '经销商名称', type: 'input', placeholder: '请输入经销商名称', searchKeys: ['dealerName'] },
          { key: 'systemJudge', label: '系统判断', type: 'select', options: ['系统判断', '正常', '窜货'] },
          { key: 'manualJudge', label: '手工系统', type: 'select', options: ['手工系统', '正常', '窜货'] },
          { key: 'finalJudge', label: '最终判断', type: 'select', options: ['最终判断', '未判断', '正常', '窜货'] }
        ],
        toolbarButtons: [
          { key: 'reset', label: '重置' },
          { key: 'search', label: '搜索', buttonType: 'primary', icon: 'el-icon-search' },
          { key: 'export', label: '导出Excel', buttonType: 'primary' }
        ],
        rowActions: [
          { key: 'detail', label: '查看取证图片', buttonType: 'primary' }
        ],
        actionWidth: 120,
        columns: [
          { key: 'inspector', label: '稽查人员', minWidth: 80 },
          { key: 'outboundNo', label: '出库单号', minWidth: 100 },
          { key: 'productCode', label: '产品编码', minWidth: 80 },
          { key: 'systemJudge', label: '系统判断', minWidth: 90 },
          { key: 'systemJudgeTime', label: '系统判断时间', minWidth: 130 },
          { key: 'manualJudge', label: '人工判断', minWidth: 90 },
          { key: 'manualJudgeTime', label: '人工判断时间', minWidth: 130 },
          { key: 'finalJudge', label: '最终判断', minWidth: 100 },
          { key: 'finalJudgeTime', label: '最终判断时间', minWidth: 130 }
        ],
        rows: [
          { id: 1, inspector: '小程序...', outboundNo: 'CK2026...', productCode: 'cjs1', systemJudge: '正常', systemJudgeTime: '2026-01-27 14:05:14', manualJudge: '窜货', manualJudgeTime: '2026-01-27 14:05:14', finalJudge: '未判断', finalJudgeTime: '', codeValue: '2_1341...', productionBatch: '2026010701', dealerCode: 'gdfc', dealerName: '广东发财商贸有限公司' },
          { id: 2, inspector: 'test1', outboundNo: 'OB002', productCode: 'cjs1', systemJudge: '正常', systemJudgeTime: '2026-02-02 14:57:45', manualJudge: '窜货', manualJudgeTime: '2026-02-02 14:57:47', finalJudge: '未判断', finalJudgeTime: '', codeValue: '2_1341...', productionBatch: '2026012901', dealerCode: 'gdfc', dealerName: '广东发财商贸有限公司' },
          { id: 3, inspector: '老六', outboundNo: 'yd2602...', productCode: 'cjs1', systemJudge: '正常', systemJudgeTime: '2026-02-06 11:04:11', manualJudge: '窜货', manualJudgeTime: '2026-02-28 11:49:06', finalJudge: '未判断', finalJudgeTime: '', codeValue: '2510170TDQP5I9', productionBatch: '2026010701', dealerCode: 'gdfc', dealerName: '广东发财商贸有限公司' }
        ],
        total: 3,
        pageSize: 10
      });
    }

    [
      {
        route: '#/readycreate',
        filters: [
          { key: 'orderNo', label: '订单', type: 'input', placeholder: '请输入订单号', searchKeys: ['orderNo'] },
          { key: 'supplierCode', label: '供应商编码', type: 'input', placeholder: '请输入供应商编码', searchKeys: ['supplierCode'] },
          { key: 'status', label: '生码状态', type: 'select', options: ['全部', '待生成', '已完成', '已关闭'] },
          { key: 'codeType', label: '类型', type: 'select', options: ['全部', '追溯码', '营销码'] },
          { key: 'createdAt', label: '创建时间', type: 'daterange' }
        ],
        toolbarButtons: [{ key: 'search', label: '搜索', buttonType: 'primary', icon: 'el-icon-search' }, { key: 'reset', label: '重置' }, { key: 'create', label: '新增', buttonType: 'primary' }, { key: 'export', label: '导出Excel', buttonType: 'primary' }],
        rowActions: [{ key: 'generate', label: '生码', buttonType: 'primary' }],
        columns: [{ key: 'codeNo', label: '编码', minWidth: 140 }, { key: 'brandCode', label: '品牌编码', minWidth: 100 }, { key: 'productName', label: '产品', minWidth: 140 }, { key: 'codeType', label: '类型', minWidth: 90 }, { key: 'orderNo', label: '订单', minWidth: 120 }, { key: 'supplierCode', label: '供应商', minWidth: 120 }, { key: 'ruleName', label: '生码规则', minWidth: 140 }, { key: 'planQty', label: '计划生码数量', minWidth: 110 }, { key: 'generatedQty', label: '实际生码数量', minWidth: 110 }, { key: 'lossRate', label: '损耗率', minWidth: 90 }, { key: 'status', label: '生码状态', minWidth: 90 }, { key: 'encrypted', label: '是否加密', minWidth: 90 }, { key: 'createdAt', label: '创建时间', minWidth: 150 }, { key: 'updatedAt', label: '修改时间', minWidth: 150 }, { key: 'marketingActive', label: '营销扫码是否激活', minWidth: 140 }],
        rows: [{ id: 1, codeNo: 'SC260425001', brandCode: 'MT', productName: '纯净水500ml', codeType: '追溯码', orderNo: 'PO2026042501', supplierCode: 'SUP001', ruleName: '纯净水通用规则', planQty: '100000', generatedQty: '100000', lossRate: '0%', status: '已完成', encrypted: '否', createdAt: '2026-04-25 14:12:08', updatedAt: '2026-04-25 15:02:08', marketingActive: '是' }, { id: 2, codeNo: 'SC260426002', brandCode: 'MT', productName: '苏打水330ml', codeType: '营销码', orderNo: 'PO2026042602', supplierCode: 'SUP009', ruleName: '苏打水促销规则', planQty: '50000', generatedQty: '26000', lossRate: '1.1%', status: '待生成', encrypted: '是', createdAt: '2026-04-26 09:23:41', updatedAt: '2026-04-26 10:02:20', marketingActive: '否' }]
      },
      {
        route: '#/tagging/rulenews',
        noteText: '请输入查询条件，否则只显示前1000条数据',
        filters: [{ key: 'orderNo', label: '订单', type: 'input', placeholder: '请输入订单号', searchKeys: ['orderNo'] }, { key: 'supplierCode', label: '供应商编号', type: 'input', placeholder: '请输入供应商编号', searchKeys: ['supplierCode'] }, { key: 'traceCode', label: '追溯码', type: 'input', placeholder: '请输入追溯码', searchKeys: ['traceCode'] }],
        toolbarButtons: [{ key: 'search', label: '搜索', buttonType: 'primary', icon: 'el-icon-search' }, { key: 'reset', label: '重置' }, { key: 'export', label: '导出Excel', buttonType: 'primary' }],
        columns: [{ key: 'rowNo', label: '编号', minWidth: 80 }, { key: 'productCode', label: '产品编码', minWidth: 100 }, { key: 'orderNo', label: '订单', minWidth: 120 }, { key: 'supplierCode', label: '供应商', minWidth: 120 }, { key: 'marketingCode', label: '营销码', minWidth: 180 }, { key: 'traceCode', label: '追溯码', minWidth: 180 }, { key: 'createdAt', label: '生码时间', minWidth: 150 }],
        rows: [{ id: 1, rowNo: '1', productCode: 'cjs1', orderNo: 'PO2026042501', supplierCode: 'SUP001', marketingCode: 'MK26042500001', traceCode: 'TR26042500001', createdAt: '2026-04-25 14:20:11' }]
      },
      {
        route: '#/tagging/coderule',
        filters: [{ key: 'ruleName', label: '规则名称', type: 'input', placeholder: '请输入规则名称', searchKeys: ['ruleName'] }],
        toolbarButtons: [{ key: 'search', label: '搜索', buttonType: 'primary', icon: 'el-icon-search' }, { key: 'reset', label: '重置' }, { key: 'create', label: '新增规则', buttonType: 'primary' }],
        rowActions: [{ key: 'edit', label: '编辑', buttonType: 'primary' }],
        columns: [{ key: 'ruleName', label: '规则名称', minWidth: 150 }, { key: 'linkUrl', label: '链接', minWidth: 180 }, { key: 'maxQty', label: '单次最大生码量', minWidth: 120 }, { key: 'productCode', label: '产品编码', minWidth: 100 }, { key: 'createdAt', label: '创建时间', minWidth: 150 }],
        rows: [{ id: 1, ruleName: '纯净水通用规则', linkUrl: 'https://cdn.mock/trace/cjs1', maxQty: '100000', productCode: 'cjs1', createdAt: '2026-04-03 10:22:11' }, { id: 2, ruleName: '苏打水促销规则', linkUrl: 'https://cdn.mock/trace/sds1', maxQty: '50000', productCode: 'sds1', createdAt: '2026-04-18 16:08:09' }]
      },
      {
        route: '#/tlmQrcode/tlmreadycreate',
        filters: [{ key: 'orderNo', label: '订单', type: 'input', placeholder: '请输入订单号', searchKeys: ['orderNo'] }, { key: 'originOrderNo', label: '原单号', type: 'input', placeholder: '请输入原单号', searchKeys: ['originOrderNo'] }, { key: 'supplierCode', label: '供应商编码', type: 'input', placeholder: '请输入供应商编码', searchKeys: ['supplierCode'] }, { key: 'status', label: '生码状态', type: 'select', options: ['全部', '待生成', '已完成', '已关闭'] }, { key: 'codeType', label: '类型', type: 'select', options: ['全部', '追溯码', '营销码'] }, { key: 'createdAt', label: '创建时间', type: 'daterange' }, { key: 'factoryName', label: '工厂', type: 'input', placeholder: '请输入工厂', searchKeys: ['factoryName'] }, { key: 'spec', label: '规格', type: 'input', placeholder: '请输入规格', searchKeys: ['spec'] }],
        toolbarButtons: [{ key: 'search', label: '搜索', buttonType: 'primary', icon: 'el-icon-search' }, { key: 'reset', label: '重置' }, { key: 'create', label: '新增', buttonType: 'primary' }, { key: 'export', label: '导出Excel', buttonType: 'primary' }],
        rowActions: [{ key: 'download', label: '下载', buttonType: 'primary' }, { key: 'generate', label: '生码', buttonType: 'primary' }, { key: 'edit', label: '修改', buttonType: 'primary' }],
        actionWidth: 230,
        columns: [{ key: 'codeNo', label: '编码', minWidth: 140 }, { key: 'productCode', label: '产品编码', minWidth: 100 }, { key: 'productName', label: '产品名称', minWidth: 140 }, { key: 'brandCode', label: '品牌编码', minWidth: 100 }, { key: 'orderNo', label: '订单', minWidth: 120 }, { key: 'originOrderNo', label: '原单号', minWidth: 120 }, { key: 'supplierCode', label: '供应商', minWidth: 120 }, { key: 'planQty', label: '计划生码数量', minWidth: 110 }, { key: 'generatedQty', label: '实际生码数量', minWidth: 110 }, { key: 'lossRate', label: '损耗率', minWidth: 90 }, { key: 'erpLineNo', label: 'ERP行号', minWidth: 90 }, { key: 'factoryName', label: '工厂', minWidth: 100 }, { key: 'spec', label: '规格', minWidth: 100 }, { key: 'status', label: '生码状态', minWidth: 90 }, { key: 'encrypted', label: '是否加密', minWidth: 90 }, { key: 'downloadCount', label: '下载次数', minWidth: 90 }, { key: 'uploadAt', label: '上传时间', minWidth: 150 }, { key: 'createdAt', label: '创建时间', minWidth: 150 }],
        rows: [{ id: 1, codeNo: 'TLM260421001', productCode: 'cjs1', productName: '纯净水500ml', brandCode: 'MT', orderNo: 'PO2026042101', originOrderNo: 'ERP26042101', supplierCode: 'SUP001', planQty: '80000', generatedQty: '80000', lossRate: '0.5%', erpLineNo: '10', factoryName: '济南工厂', spec: '500ml', status: '已完成', encrypted: '否', downloadCount: '2', uploadAt: '2026-04-21 12:03:02', createdAt: '2026-04-21 11:18:02' }]
      },
      {
        route: '#/tlmQrcode/tlmQrcodelogs',
        title: '内外码查询',
        filters: [{ key: 'innerCode', label: '内码', type: 'input', placeholder: '请输入内码', searchKeys: ['innerCode'] }, { key: 'outerCode', label: '外码', type: 'input', placeholder: '请输入外码', searchKeys: ['outerCode'] }, { key: 'result', label: '是否匹配', type: 'select', options: ['全部', '通过', '失败'] }, { key: 'verifyAt', label: '创建时间', type: 'daterange' }],
        toolbarButtons: [{ key: 'search', label: '搜索', buttonType: 'primary', icon: 'el-icon-search' }, { key: 'reset', label: '重置' }, { key: 'export', label: '导出Excel', buttonType: 'primary' }],
        columns: [{ key: 'codeNo', label: '编码', minWidth: 120 }, { key: 'creatorAccount', label: '创建人账号', minWidth: 110 }, { key: 'creatorName', label: '创建人名称', minWidth: 110 }, { key: 'innerCode', label: '内码', minWidth: 180 }, { key: 'outerCode', label: '外码', minWidth: 180 }, { key: 'result', label: '是否匹配', minWidth: 90 }, { key: 'verifyAt', label: '创建时间', minWidth: 150 }],
        rows: [{ id: 1, codeNo: '1', creatorAccount: 'mtadmin', creatorName: '管理员', innerCode: 'INNER2604260001', outerCode: 'OUTER2604260001', result: '通过', verifyAt: '2026-04-26 10:16:22' }, { id: 2, codeNo: '2', creatorAccount: 'mtadmin', creatorName: '管理员', innerCode: 'INNER2604260019', outerCode: 'OUTER2604269999', result: '失败', verifyAt: '2026-04-26 11:43:09' }]
      },
      {
        route: '#/tlmQrcode/tlmQrcoderule',
        filters: [{ key: 'ruleName', label: '规则名称', type: 'input', placeholder: '请输入规则名称', searchKeys: ['ruleName'] }, { key: 'brandCode', label: '品牌', type: 'input', placeholder: '请输入品牌编码', searchKeys: ['brandCode'] }, { key: 'productCode', label: '产品编码', type: 'input', placeholder: '请输入产品编码', searchKeys: ['productCode'] }],
        toolbarButtons: [{ key: 'search', label: '搜索', buttonType: 'primary', icon: 'el-icon-search' }, { key: 'reset', label: '重置' }, { key: 'create', label: '新增规则', buttonType: 'primary' }],
        rowActions: [{ key: 'detail', label: '生码详情', buttonType: 'primary' }],
        columns: [{ key: 'ruleId', label: '规则id', minWidth: 90 }, { key: 'ruleName', label: '规则名称', minWidth: 150 }, { key: 'maxPackageLevel', label: '最大包装级别', minWidth: 110 }, { key: 'maxPackageQty', label: '最大包装级别生码量', minWidth: 140 }, { key: 'productCode', label: '产品编码', minWidth: 100 }, { key: 'packageRatio', label: '包装比例', minWidth: 100 }],
        rows: [{ id: 1, ruleId: '1001', ruleName: '套标规则A', maxPackageLevel: '箱码', maxPackageQty: '24', productCode: 'cjs1', packageRatio: '1:24' }]
      },
      {
        route: '#/tlmQrcode/codelogs',
        filters: [{ key: 'innerCode', label: '内码', type: 'input', placeholder: '请输入内码', searchKeys: ['innerCode'] }, { key: 'outerCode', label: '外码', type: 'input', placeholder: '请输入外码', searchKeys: ['outerCode'] }, { key: 'workOrderNo', label: '工单号', type: 'input', placeholder: '请输入工单号', searchKeys: ['workOrderNo'] }, { key: 'productCode', label: '产品编码', type: 'input', placeholder: '请输入产品编码', searchKeys: ['productCode'] }],
        toolbarButtons: [{ key: 'search', label: '搜索', buttonType: 'primary', icon: 'el-icon-search' }, { key: 'reset', label: '重置' }],
        columns: [{ key: 'hashId', label: '哈希ID', minWidth: 140 }, { key: 'rowId', label: 'ID', minWidth: 100 }, { key: 'market', label: '市场', minWidth: 100 }, { key: 'workOrderNo', label: '订单号', minWidth: 120 }, { key: 'packageLevel', label: '包装级别', minWidth: 90 }, { key: 'productCode', label: '产品代码', minWidth: 100 }, { key: 'innerCode', label: '内码', minWidth: 180 }, { key: 'outerCode', label: '外码', minWidth: 180 }, { key: 'supplierId', label: '供应商ID', minWidth: 100 }, { key: 'tableName', label: '表名', minWidth: 120 }, { key: 'tableNo', label: '表编号', minWidth: 100 }, { key: 'createdAt', label: '创建时间', minWidth: 150 }],
        rows: []
      },
      {
        route: '#/productlist',
        filters: [{ key: 'productCode', label: '产品编码', type: 'input', placeholder: '请输入产品编码', searchKeys: ['productCode'] }, { key: 'productName', label: '产品名称', type: 'input', placeholder: '请输入产品名称', searchKeys: ['productName'] }, { key: 'brandName', label: '品牌', type: 'input', placeholder: '请输入品牌', searchKeys: ['brandName'] }],
        toolbarButtons: [{ key: 'reset', label: '重置' }, { key: 'search', label: '搜索', buttonType: 'primary', icon: 'el-icon-search' }, { key: 'create', label: '新增产品', buttonType: 'primary' }],
        columns: [{ key: 'productCode', label: '产品编码', minWidth: 100 }, { key: 'productName', label: '产品名称', minWidth: 140 }, { key: 'brandName', label: '品牌名称', minWidth: 120 }, { key: 'spec', label: '规格', minWidth: 100 }, { key: 'packageUnit', label: '包装单位', minWidth: 100 }, { key: 'status', label: '状态', minWidth: 90 }, { key: 'createdAt', label: '创建时间', minWidth: 150 }],
        rows: [{ id: 1, productCode: 'cjs1', productName: '纯净水500ml', brandName: '弥特', spec: '500ml', packageUnit: '瓶', status: '启用', createdAt: '2026-03-12 09:10:00' }, { id: 2, productCode: 'sds1', productName: '苏打水330ml', brandName: '弥特', spec: '330ml', packageUnit: '罐', status: '启用', createdAt: '2026-03-18 15:28:10' }]
      },
      { route: '#/productsort', filters: [{ key: 'brandName', label: '品牌名称', type: 'input', placeholder: '请输入品牌名称', searchKeys: ['brandName'] }], toolbarButtons: [{ key: 'reset', label: '重置' }, { key: 'search', label: '搜索', buttonType: 'primary', icon: 'el-icon-search' }, { key: 'create', label: '新增品牌', buttonType: 'primary' }], columns: [{ key: 'brandId', label: '品牌ID', minWidth: 90 }, { key: 'brandName', label: '品牌名称', minWidth: 140 }, { key: 'brandEn', label: '英文名称', minWidth: 140 }, { key: 'status', label: '状态', minWidth: 90 }, { key: 'createdAt', label: '创建时间', minWidth: 150 }], rows: [{ id: 1, brandId: '1', brandName: '弥特', brandEn: 'MT', status: '启用', createdAt: '2026-03-01 10:00:00' }] },
      { route: '#/productunit', filters: [{ key: 'unitName', label: '包装单位', type: 'input', placeholder: '请输入包装单位', searchKeys: ['unitName'] }], toolbarButtons: [{ key: 'reset', label: '重置' }, { key: 'search', label: '搜索', buttonType: 'primary', icon: 'el-icon-search' }, { key: 'create', label: '新增单位', buttonType: 'primary' }], columns: [{ key: 'unitCode', label: '单位编码', minWidth: 100 }, { key: 'unitName', label: '单位名称', minWidth: 120 }, { key: 'unitAlias', label: '单位别名', minWidth: 120 }, { key: 'status', label: '状态', minWidth: 90 }], rows: [{ id: 1, unitCode: 'bottle', unitName: '瓶', unitAlias: '个', status: '启用' }, { id: 2, unitCode: 'box', unitName: '箱', unitAlias: '件', status: '启用' }] },
      { route: '#/hierarchylist', filters: [{ key: 'productName', label: '产品名称', type: 'input', placeholder: '请输入产品名称', searchKeys: ['productName'] }], toolbarButtons: [{ key: 'reset', label: '重置' }, { key: 'search', label: '搜索', buttonType: 'primary', icon: 'el-icon-search' }], columns: [{ key: 'productName', label: '产品名称', minWidth: 140 }, { key: 'parentUnit', label: '上级包装', minWidth: 120 }, { key: 'childUnit', label: '下级包装', minWidth: 120 }, { key: 'convertQty', label: '转换数量', minWidth: 100 }, { key: 'status', label: '状态', minWidth: 90 }], rows: [{ id: 1, productName: '纯净水500ml', parentUnit: '箱', childUnit: '瓶', convertQty: '24', status: '启用' }] },
      { route: '#/hierarchy', filters: [{ key: 'productName', label: '产品名称', type: 'input', placeholder: '请输入产品名称', searchKeys: ['productName'] }], toolbarButtons: [{ key: 'search', label: '搜索', buttonType: 'primary', icon: 'el-icon-search' }], columns: [{ key: 'nodeName', label: '包装节点', minWidth: 140 }, { key: 'nodeCode', label: '节点编码', minWidth: 120 }, { key: 'parentName', label: '上级节点', minWidth: 120 }, { key: 'ratio', label: '转换比', minWidth: 90 }], rows: [{ id: 1, nodeName: '箱', nodeCode: 'BOX', parentName: '--', ratio: '1' }, { id: 2, nodeName: '瓶', nodeCode: 'BOT', parentName: '箱', ratio: '24' }] },
      { route: '#/productunitconvert', filters: [{ key: 'productName', label: '产品名称', type: 'input', placeholder: '请输入产品名称', searchKeys: ['productName'] }], toolbarButtons: [{ key: 'reset', label: '重置' }, { key: 'search', label: '搜索', buttonType: 'primary', icon: 'el-icon-search' }], columns: [{ key: 'productName', label: '产品名称', minWidth: 140 }, { key: 'sourceUnit', label: '源单位', minWidth: 100 }, { key: 'targetUnit', label: '目标单位', minWidth: 100 }, { key: 'ratio', label: '转换比例', minWidth: 100 }, { key: 'remark', label: '备注', minWidth: 140 }], rows: [{ id: 1, productName: '纯净水500ml', sourceUnit: '箱', targetUnit: '瓶', ratio: '1:24', remark: '默认转换' }] },
      { route: '#/store', filters: [{ key: 'storeCode', label: '仓库编码', type: 'input', placeholder: '请输入仓库编码', searchKeys: ['storeCode'] }, { key: 'storeName', label: '仓库名称', type: 'input', placeholder: '请输入仓库名称', searchKeys: ['storeName'] }], toolbarButtons: [{ key: 'reset', label: '重置' }, { key: 'search', label: '搜索', buttonType: 'primary', icon: 'el-icon-search' }, { key: 'create', label: '新增仓库', buttonType: 'primary' }], columns: [{ key: 'storeCode', label: '仓库编码', minWidth: 120 }, { key: 'storeName', label: '仓库名称', minWidth: 140 }, { key: 'storeType', label: '仓库类型', minWidth: 100 }, { key: 'principal', label: '负责人', minWidth: 100 }, { key: 'address', label: '仓库地址', minWidth: 200 }, { key: 'status', label: '状态', minWidth: 90 }], rows: [{ id: 1, storeCode: 'wlyc001', storeName: '物流一仓', storeType: '成品仓', principal: '张峰', address: '济南市高新区工业南路', status: '启用' }] },
      { route: '#/material', filters: [{ key: 'materialCode', label: '原料编码', type: 'input', placeholder: '请输入原料编码', searchKeys: ['materialCode'] }, { key: 'materialName', label: '原料名称', type: 'input', placeholder: '请输入原料名称', searchKeys: ['materialName'] }], toolbarButtons: [{ key: 'reset', label: '重置' }, { key: 'search', label: '搜索', buttonType: 'primary', icon: 'el-icon-search' }, { key: 'create', label: '新增原料', buttonType: 'primary' }], columns: [{ key: 'materialCode', label: '原料编码', minWidth: 120 }, { key: 'materialName', label: '原料名称', minWidth: 160 }, { key: 'spec', label: '规格', minWidth: 100 }, { key: 'unit', label: '单位', minWidth: 90 }, { key: 'supplier', label: '供应商', minWidth: 140 }, { key: 'status', label: '状态', minWidth: 90 }], rows: [{ id: 1, materialCode: 'cjsyl01', materialName: '纯净水原液', spec: '桶', unit: 'kg', supplier: '山东原料供应链', status: '启用' }] },
      { route: '#/enterprise', filters: [{ key: 'enterpriseName', label: '企业名称', type: 'input', placeholder: '请输入企业名称', searchKeys: ['enterpriseName'] }], toolbarButtons: [{ key: 'reset', label: '重置' }, { key: 'search', label: '搜索', buttonType: 'primary', icon: 'el-icon-search' }, { key: 'create', label: '新增企业', buttonType: 'primary' }], columns: [{ key: 'enterpriseCode', label: '企业编码', minWidth: 120 }, { key: 'enterpriseName', label: '企业名称', minWidth: 180 }, { key: 'licenseNo', label: '统一社会信用代码', minWidth: 180 }, { key: 'contact', label: '联系人', minWidth: 100 }, { key: 'phone', label: '联系电话', minWidth: 120 }], rows: [{ id: 1, enterpriseCode: 'ENT001', enterpriseName: '山东弥特科技有限公司', licenseNo: '91370100XXXXXX', contact: '赵敏', phone: '0531-88886666' }] },
      { route: '#/sysconfig', filters: [{ key: 'configKey', label: '配置Key', type: 'input', placeholder: '请输入配置Key', searchKeys: ['configKey'] }], toolbarButtons: [{ key: 'reset', label: '重置' }, { key: 'search', label: '搜索', buttonType: 'primary', icon: 'el-icon-search' }], columns: [{ key: 'configKey', label: '配置Key', minWidth: 160 }, { key: 'configValue', label: '配置值', minWidth: 160 }, { key: 'description', label: '描述', minWidth: 280 }], rows: [{ id: 1, configKey: 'miniapp.name', configValue: '弥特溯源', description: '小程序名称' }, { id: 2, configKey: 'qrcode.expire.day', configValue: '365', description: '码有效期（天）' }] },
      { route: '#/systemminiprogram', filters: [{ key: 'appName', label: '小程序名称', type: 'input', placeholder: '请输入小程序名称', searchKeys: ['appName'] }], toolbarButtons: [{ key: 'reset', label: '重置' }, { key: 'search', label: '搜索', buttonType: 'primary', icon: 'el-icon-search' }, { key: 'create', label: '新增配置', buttonType: 'primary' }], columns: [{ key: 'appName', label: '小程序名称', minWidth: 150 }, { key: 'appId', label: 'AppID', minWidth: 180 }, { key: 'appSecret', label: 'AppSecret', minWidth: 200 }, { key: 'status', label: '状态', minWidth: 90 }], rows: [{ id: 1, appName: '弥特溯源小程序', appId: 'wx1234567890abcd', appSecret: '******', status: '启用' }] },
      { route: '#/industrialcomputer', filters: [{ key: 'deviceCode', label: '设备编码', type: 'input', placeholder: '请输入设备编码', searchKeys: ['deviceCode'] }, { key: 'lineName', label: '产线名称', type: 'input', placeholder: '请输入产线名称', searchKeys: ['lineName'] }], toolbarButtons: [{ key: 'reset', label: '重置' }, { key: 'search', label: '搜索', buttonType: 'primary', icon: 'el-icon-search' }, { key: 'create', label: '新增设备', buttonType: 'primary' }], columns: [{ key: 'deviceCode', label: '设备编码', minWidth: 120 }, { key: 'deviceName', label: '设备名称', minWidth: 140 }, { key: 'lineName', label: '所属产线', minWidth: 140 }, { key: 'ip', label: 'IP地址', minWidth: 130 }, { key: 'status', label: '状态', minWidth: 90 }, { key: 'lastOnlineAt', label: '最后在线时间', minWidth: 150 }], rows: [{ id: 1, deviceCode: 'IPC-001', deviceName: '灌装线工控机1', lineName: '一号线', ip: '192.168.1.21', status: '在线', lastOnlineAt: '2026-04-26 14:28:00' }] },
      {
        route: '#/tree',
        title: '组织机构',
        variant: 'org-tree',
        legacyBreadcrumb: '基础资料 / 组织机构',
        tsStyle: false,
        showSettingsButton: true,
        orgTree: [
          {
            id: 'mit',
            name: '弥特科技',
            count: 1,
            locked: true,
            members: [
              { id: 1, name: '管理员', role: '主管', account: 'admin', phone: '', createdAt: '2024-11-18 11:14:55', enabled: true }
            ],
            children: [
              {
                id: 'marketing',
                name: '市场部',
                count: 6,
                members: [
                  { id: 2, name: '市场管理员', role: '主管', account: 'market01', phone: '13800010001', createdAt: '2025-01-08 09:12:31', enabled: true },
                  { id: 3, name: '推广专员', role: '成员', account: 'market02', phone: '13800010002', createdAt: '2025-01-11 14:08:20', enabled: true },
                  { id: 4, name: '陈敏', role: '成员', account: 'chenmin', phone: '13800010003', createdAt: '2025-03-19 10:22:04', enabled: false },
                  { id: 5, name: '周洋', role: '成员', account: 'zhouyang', phone: '13800010004', createdAt: '2025-04-02 11:42:58', enabled: true },
                  { id: 6, name: '刘静', role: '成员', account: 'liujing', phone: '13800010005', createdAt: '2025-04-09 16:30:12', enabled: true },
                  { id: 7, name: '王楠', role: '成员', account: 'wangnan', phone: '13800010006', createdAt: '2025-05-21 13:18:47', enabled: true }
                ],
                children: [
                  { id: 'tuoxin', name: '拓新部', count: 0, members: [], children: [] }
                ]
              },
              { id: 'dealer', name: '经销商', count: 0, members: [], children: [] },
              {
                id: 'production-mgmt',
                name: '生产管理部',
                count: 1,
                members: [
                  { id: 8, name: '生产主管', role: '主管', account: 'produce01', phone: '13800020001', createdAt: '2025-02-18 08:35:16', enabled: true }
                ],
                children: []
              },
              {
                id: 'logistics',
                name: '物流部',
                count: 4,
                members: [
                  { id: 9, name: '物流主管', role: '主管', account: 'logis01', phone: '13800030001', createdAt: '2025-02-21 09:12:44', enabled: true },
                  { id: 10, name: '仓储员', role: '成员', account: 'store01', phone: '13800030002', createdAt: '2025-02-23 10:05:17', enabled: true },
                  { id: 11, name: '调度员', role: '成员', account: 'dispatch01', phone: '13800030003', createdAt: '2025-03-01 15:49:28', enabled: true },
                  { id: 12, name: '司机管理员', role: '成员', account: 'driver01', phone: '13800030004', createdAt: '2025-03-04 17:26:11', enabled: false }
                ],
                children: []
              }
            ]
          }
        ]
      },
      { route: '#/organ/departmentjob', filters: [{ key: 'roleName', label: '权限名称', type: 'input', placeholder: '请输入权限名称', searchKeys: ['roleName'] }], toolbarButtons: [{ key: 'reset', label: '重置' }, { key: 'search', label: '搜索', buttonType: 'primary', icon: 'el-icon-search' }, { key: 'create', label: '新增权限', buttonType: 'primary' }], columns: [{ key: 'roleCode', label: '权限编码', minWidth: 120 }, { key: 'roleName', label: '权限名称', minWidth: 160 }, { key: 'dataRange', label: '数据范围', minWidth: 120 }, { key: 'status', label: '状态', minWidth: 90 }, { key: 'createdAt', label: '创建时间', minWidth: 150 }], rows: [{ id: 1, roleCode: 'ROLE_ADMIN', roleName: '平台管理员', dataRange: '全部数据', status: '启用', createdAt: '2026-02-01 10:00:00' }] },
      { route: '#/stafflist', filters: [{ key: 'account', label: '账号', type: 'input', placeholder: '请输入账号', searchKeys: ['account'] }, { key: 'staffName', label: '姓名', type: 'input', placeholder: '请输入姓名', searchKeys: ['staffName'] }], toolbarButtons: [{ key: 'reset', label: '重置' }, { key: 'search', label: '搜索', buttonType: 'primary', icon: 'el-icon-search' }, { key: 'create', label: '新增账号', buttonType: 'primary' }], columns: [{ key: 'account', label: '账号', minWidth: 120 }, { key: 'staffName', label: '姓名', minWidth: 120 }, { key: 'department', label: '所属部门', minWidth: 140 }, { key: 'phone', label: '手机号', minWidth: 120 }, { key: 'status', label: '状态', minWidth: 90 }, { key: 'lastLoginAt', label: '最后登录时间', minWidth: 150 }], rows: [{ id: 1, account: 'mtadmin', staffName: '管理员', department: '总部', phone: '13900000000', status: '启用', lastLoginAt: '2026-04-26 08:01:11' }] },
      { route: '#/dealer', filters: [{ key: 'dealerCode', label: '经销商编码', type: 'input', placeholder: '请输入经销商编码', searchKeys: ['dealerCode'] }, { key: 'dealerName', label: '经销商名称', type: 'input', placeholder: '请输入经销商名称', searchKeys: ['dealerName'] }], toolbarButtons: [{ key: 'reset', label: '重置' }, { key: 'search', label: '搜索', buttonType: 'primary', icon: 'el-icon-search' }, { key: 'create', label: '新增经销商', buttonType: 'primary' }], columns: [{ key: 'dealerCode', label: '经销商编码', minWidth: 120 }, { key: 'dealerName', label: '经销商名称', minWidth: 180 }, { key: 'level', label: '等级', minWidth: 90 }, { key: 'contact', label: '联系人', minWidth: 100 }, { key: 'phone', label: '联系电话', minWidth: 120 }, { key: 'status', label: '状态', minWidth: 90 }], rows: [{ id: 1, dealerCode: 'gdfc', dealerName: '广东发财商贸有限公司', level: '一级', contact: '刘总', phone: '13800112233', status: '启用' }] },
      { route: '#/dealeraddresslist', filters: [{ key: 'dealerName', label: '经销商名称', type: 'input', placeholder: '请输入经销商名称', searchKeys: ['dealerName'] }, { key: 'province', label: '省份', type: 'input', placeholder: '请输入省份', searchKeys: ['province'] }], toolbarButtons: [{ key: 'reset', label: '重置' }, { key: 'search', label: '搜索', buttonType: 'primary', icon: 'el-icon-search' }], columns: [{ key: 'dealerName', label: '经销商名称', minWidth: 180 }, { key: 'province', label: '省份', minWidth: 90 }, { key: 'city', label: '城市', minWidth: 90 }, { key: 'district', label: '区域', minWidth: 120 }, { key: 'address', label: '详细地址', minWidth: 180 }], rows: [{ id: 1, dealerName: '广东发财商贸有限公司', province: '广东省', city: '广州市', district: '白云区', address: '机场路 88 号' }] },
      { route: '#/dealeruserlist', filters: [{ key: 'nickName', label: '会员昵称', type: 'input', placeholder: '请输入会员昵称', searchKeys: ['nickName'] }, { key: 'dealerName', label: '经销商名称', type: 'input', placeholder: '请输入经销商名称', searchKeys: ['dealerName'] }], toolbarButtons: [{ key: 'reset', label: '重置' }, { key: 'search', label: '搜索', buttonType: 'primary', icon: 'el-icon-search' }], columns: [{ key: 'nickName', label: '会员昵称', minWidth: 120 }, { key: 'phone', label: '手机号', minWidth: 120 }, { key: 'dealerName', label: '所属经销商', minWidth: 180 }, { key: 'level', label: '会员等级', minWidth: 90 }, { key: 'joinAt', label: '加入时间', minWidth: 150 }], rows: [{ id: 1, nickName: '经销商会员A', phone: '13877889900', dealerName: '广东发财商贸有限公司', level: '银卡', joinAt: '2026-03-09 13:20:00' }] },
      { route: '#/Orgterminal', filters: [{ key: 'terminalCode', label: '终端编码', type: 'input', placeholder: '请输入终端编码', searchKeys: ['terminalCode'] }, { key: 'storeName', label: '终端名称', type: 'input', placeholder: '请输入终端名称', searchKeys: ['storeName'] }], toolbarButtons: [{ key: 'reset', label: '重置' }, { key: 'search', label: '搜索', buttonType: 'primary', icon: 'el-icon-search' }, { key: 'create', label: '新增终端', buttonType: 'primary' }], columns: [{ key: 'terminalCode', label: '终端编码', minWidth: 120 }, { key: 'storeName', label: '终端名称', minWidth: 160 }, { key: 'dealerName', label: '所属经销商', minWidth: 180 }, { key: 'contact', label: '联系人', minWidth: 100 }, { key: 'phone', label: '联系电话', minWidth: 120 }, { key: 'address', label: '地址', minWidth: 180 }], rows: [{ id: 1, terminalCode: 'ZD001', storeName: '终端A', dealerName: '广东发财商贸有限公司', contact: '王店长', phone: '13912344321', address: '广州市天河区体育西路 10 号' }] },
      { route: '#/promoter', filters: [{ key: 'nickName', label: '会员昵称', type: 'input', placeholder: '请输入会员昵称', searchKeys: ['nickName'] }, { key: 'storeName', label: '终端名称', type: 'input', placeholder: '请输入终端名称', searchKeys: ['storeName'] }], toolbarButtons: [{ key: 'reset', label: '重置' }, { key: 'search', label: '搜索', buttonType: 'primary', icon: 'el-icon-search' }], columns: [{ key: 'nickName', label: '会员昵称', minWidth: 120 }, { key: 'phone', label: '手机号', minWidth: 120 }, { key: 'storeName', label: '所属终端', minWidth: 160 }, { key: 'level', label: '等级', minWidth: 90 }, { key: 'joinAt', label: '加入时间', minWidth: 150 }], rows: [{ id: 1, nickName: '终端会员A', phone: '13611223344', storeName: '终端A', level: '普通', joinAt: '2026-03-21 18:02:00' }] },
      { route: '#/WXrole', filters: [{ key: 'roleName', label: '角色名称', type: 'input', placeholder: '请输入角色名称', searchKeys: ['roleName'] }], toolbarButtons: [{ key: 'reset', label: '重置' }, { key: 'search', label: '搜索', buttonType: 'primary', icon: 'el-icon-search' }, { key: 'create', label: '新增角色', buttonType: 'primary' }], columns: [{ key: 'roleCode', label: '角色编码', minWidth: 120 }, { key: 'roleName', label: '角色名称', minWidth: 140 }, { key: 'description', label: '角色说明', minWidth: 200 }, { key: 'status', label: '状态', minWidth: 90 }], rows: [{ id: 1, roleCode: 'WX_ADMIN', roleName: '小程序管理员', description: '拥有全部小程序后台权限', status: '启用' }] },
      { route: '#/WXmenu', filters: [{ key: 'menuName', label: '菜单名称', type: 'input', placeholder: '请输入菜单名称', searchKeys: ['menuName'] }], toolbarButtons: [{ key: 'search', label: '搜索', buttonType: 'primary', icon: 'el-icon-search' }, { key: 'create', label: '新增菜单', buttonType: 'primary' }], columns: [{ key: 'menuName', label: '菜单名称', minWidth: 140 }, { key: 'menuCode', label: '菜单编码', minWidth: 120 }, { key: 'parentName', label: '上级菜单', minWidth: 120 }, { key: 'path', label: '路径', minWidth: 160 }, { key: 'status', label: '状态', minWidth: 90 }], rows: [{ id: 1, menuName: '首页', menuCode: 'home', parentName: '--', path: '/pages/home/index', status: '启用' }, { id: 2, menuName: '扫码查询', menuCode: 'scan', parentName: '首页', path: '/pages/scan/index', status: '启用' }] }
    ].forEach(function (config) {
      ensureSchema(config.route, config);
    });

    ensureSchema('#/operationlogs', {
      title: '日志管理',
      tags: ['系统基础信息', '内部组织', '日志管理'],
      legacyBreadcrumb: '内部组织 / 日志管理',
      tsStyle: true,
      filters: [
        { key: 'operationTime', label: '操作时间', type: 'daterange' },
        { key: 'operationType', label: '操作类型', type: 'select', options: ['用户登录', '用户退出', '工单创建', '工单修改', '工单关闭', '追溯码关联', '追溯码作废', '追溯码置换', '设备状态变更', '数据备份', '数据还原'] },
        { key: 'userAccount', label: '用户账号', type: 'input', placeholder: '请输入用户账号或操作人', searchKeys: ['userAccount', 'operatorName'] }
      ],
      toolbarButtons: [
        { key: 'reset', label: '重置' },
        { key: 'search', label: '搜索', buttonType: 'primary', icon: 'el-icon-search' },
        { key: 'export', label: '导出Excel', buttonType: 'primary' }
      ],
      rowActions: [{ key: 'detail', label: '详情', buttonType: 'primary' }],
      actionWidth: 98,
      pageSize: 10,
      columns: [
        { key: 'logNo', label: '日志编号', minWidth: 150 },
        { key: 'operationTime', label: '操作时间', minWidth: 160 },
        { key: 'operationType', label: '操作类型', minWidth: 120 },
        { key: 'userAccount', label: '用户账号', minWidth: 120 },
        { key: 'operatorName', label: '操作人', minWidth: 100 },
        { key: 'operationContent', label: '操作内容', minWidth: 260 },
        { key: 'result', label: '执行结果', minWidth: 100 },
        { key: 'relatedObject', label: '关联对象', minWidth: 170 },
        { key: 'exceptionHint', label: '异常线索', minWidth: 220 }
      ],
      detailFields: [
        'logNo',
        'operationTime',
        'operationType',
        'userAccount',
        'operatorName',
        'operationContent',
        'result',
        'relatedObject',
        'exceptionHint',
        { key: 'businessModule', label: '业务模块' },
        { key: 'sourceTerminal', label: '来源终端' },
        { key: 'ipAddress', label: 'IP地址' },
        { key: 'failureReason', label: '失败原因' },
        { key: 'suggestion', label: '处理建议' },
        { key: 'requestSummary', label: '请求摘要' }
      ],
      rows: [
        { id: 1, logNo: 'LOG20260514001', operationTime: '2026-05-14 08:02:11', operationType: '用户登录', userAccount: 'mtadmin', operatorName: '管理员', operationContent: '登录平台管理中心', result: '成功', relatedObject: '后台门户', exceptionHint: '--', businessModule: '内部组织', sourceTerminal: 'Web后台', ipAddress: '10.10.8.21', failureReason: '--', suggestion: '--', requestSummary: '账号 mtadmin 完成密码登录并进入系统基础信息。' },
        { id: 2, logNo: 'LOG20260514002', operationTime: '2026-05-14 08:27:36', operationType: '工单创建', userAccount: 'zhangsan', operatorName: '张三', operationContent: '创建生产批次加工单 GD-20260514-001', result: '成功', relatedObject: '工单 GD-20260514-001', exceptionHint: '--', businessModule: '生产管理', sourceTerminal: 'Web后台', ipAddress: '10.10.8.34', failureReason: '--', suggestion: '--', requestSummary: '产品 cjs1，计划数量 1200，生产线 一号线。' },
        { id: 3, logNo: 'LOG20260514003', operationTime: '2026-05-14 09:06:18', operationType: '追溯码关联', userAccount: 'wangwu', operatorName: '王五', operationContent: '提交父子码包装关联任务', result: '失败', relatedObject: '父码 3134122298185281148', exceptionHint: '关联错误：子码层级与父码包装关系不一致', businessModule: '生产管理', sourceTerminal: 'PDA-包装线02', ipAddress: '10.10.18.52', failureReason: '关联错误，码值 2134122298206018269 已存在上一层包装关系。', suggestion: '复核父子码层级和包装关系配置，确认后重新上传关联任务。', requestSummary: '父码 3134122298185281148，子码 2134122298206018269，包装级别 2。' },
        { id: 4, logNo: 'LOG20260514004', operationTime: '2026-05-14 09:42:05', operationType: '设备状态变更', userAccount: 'system', operatorName: '系统', operationContent: '读码器离线，自动记录设备状态', result: '异常', relatedObject: '读码器 RC-02 / 包装二线', exceptionHint: '读码器离线：最近心跳 09:39:11，连续 3 次未响应', businessModule: '设备看板', sourceTerminal: 'SCADA监控', ipAddress: '192.168.1.42', failureReason: '设备心跳超时，扫码上传通道不可用。', suggestion: '检查读码器电源、网线和工控机采集服务，再观察心跳恢复情况。', requestSummary: '设备 RC-02 状态从 在线 变更为 离线。' },
        { id: 5, logNo: 'LOG20260514005', operationTime: '2026-05-14 10:15:27', operationType: '工单修改', userAccount: 'lisi', operatorName: '李四', operationContent: '修改工单 GD-20260514-001 的计划数量', result: '成功', relatedObject: '工单 GD-20260514-001', exceptionHint: '--', businessModule: '生产管理', sourceTerminal: 'Web后台', ipAddress: '10.10.8.35', failureReason: '--', suggestion: '--', requestSummary: '计划数量由 1200 调整为 1500。' },
        { id: 6, logNo: 'LOG20260514006', operationTime: '2026-05-14 11:03:49', operationType: '追溯码作废', userAccount: 'mtadmin', operatorName: '管理员', operationContent: '作废异常追溯码 2_134144789942854011', result: '成功', relatedObject: '追溯码 2_134144789942854011', exceptionHint: '重码风险已关闭', businessModule: '码库管理', sourceTerminal: 'Web后台', ipAddress: '10.10.8.21', failureReason: '--', suggestion: '--', requestSummary: '作废原因：稽查复核确认重复查询异常。' },
        { id: 7, logNo: 'LOG20260514007', operationTime: '2026-05-14 13:28:32', operationType: '追溯码置换', userAccount: 'zhaoliu', operatorName: '赵六', operationContent: '将旧码 2134122298270512682 置换为新码 2134122298270512999', result: '成功', relatedObject: '换码单 REP-20260514-003', exceptionHint: '--', businessModule: '生产管理', sourceTerminal: 'Web后台', ipAddress: '10.10.8.48', failureReason: '--', suggestion: '--', requestSummary: '旧码已解除关联，新码已写入包装关系。' },
        { id: 8, logNo: 'LOG20260514008', operationTime: '2026-05-14 14:06:44', operationType: '数据备份', userAccount: 'backup', operatorName: '备份任务', operationContent: '执行平台关键数据备份', result: '成功', relatedObject: 'backup-20260514-1400.zip', exceptionHint: '--', businessModule: '系统维护', sourceTerminal: '定时任务', ipAddress: '10.10.2.10', failureReason: '--', suggestion: '--', requestSummary: '备份范围：组织、账号、工单、码库、关联关系。' },
        { id: 9, logNo: 'LOG20260514009', operationTime: '2026-05-14 14:31:20', operationType: '工单修改', userAccount: 'wangwu', operatorName: '王五', operationContent: 'PDA 回传工单采集结果', result: '失败', relatedObject: '工单 GD-20260514-002', exceptionHint: '数据上传失败：PDA 离线缓存未同步', businessModule: '生产管理', sourceTerminal: 'PDA-包装线01', ipAddress: '10.10.18.41', failureReason: '网络超时，工控机同步队列积压 12 条。', suggestion: '检查 PDA 网络和工控机采集服务，确认离线缓存重新上传。', requestSummary: '上传批次 2026051402，采集数量 360，失败节点 sync/upload。' },
        { id: 10, logNo: 'LOG20260514010', operationTime: '2026-05-14 15:12:58', operationType: '工单关闭', userAccount: 'zhangsan', operatorName: '张三', operationContent: '关闭生产批次加工单 GD-20260514-001', result: '成功', relatedObject: '工单 GD-20260514-001', exceptionHint: '--', businessModule: '生产管理', sourceTerminal: 'Web后台', ipAddress: '10.10.8.34', failureReason: '--', suggestion: '--', requestSummary: '关闭前已完成采集率校验和入库确认。' },
        { id: 11, logNo: 'LOG20260514011', operationTime: '2026-05-14 16:25:16', operationType: '数据还原', userAccount: 'mtadmin', operatorName: '管理员', operationContent: '还原测试环境码库数据', result: '异常', relatedObject: 'restore-20260513-2200.zip', exceptionHint: '还原完成但发现 2 条关联记录需复核', businessModule: '系统维护', sourceTerminal: 'Web后台', ipAddress: '10.10.8.21', failureReason: '还原后校验发现关联关系版本不一致。', suggestion: '核对还原包版本和当前包装关系配置，必要时重新执行校验任务。', requestSummary: '还原范围：码库、包装关系、工单快照。' },
        { id: 12, logNo: 'LOG20260514012', operationTime: '2026-05-14 17:40:03', operationType: '用户退出', userAccount: 'lisi', operatorName: '李四', operationContent: '退出平台管理中心', result: '成功', relatedObject: '后台门户', exceptionHint: '--', businessModule: '内部组织', sourceTerminal: 'Web后台', ipAddress: '10.10.8.35', failureReason: '--', suggestion: '--', requestSummary: '用户主动退出登录。' }
      ]
    });

    return schemas;
  }

  window.staticModuleSchemas = normalizeStaticModuleSchemas(window.staticModuleSchemas || {});

  var MENU_SVG_ICONS = {
    list: {
      viewBox: '0 0 128 128',
      paths: [
        'M1.585 12.087c0 6.616 3.974 11.98 8.877 11.98 4.902 0 8.877-5.364 8.877-11.98 0-6.616-3.975-11.98-8.877-11.98-4.903 0-8.877 5.364-8.877 11.98zM125.86.107H35.613c-1.268 0-2.114 1.426-2.114 2.852v18.255c0 1.712 1.057 2.853 2.114 2.853h90.247c1.268 0 2.114-1.426 2.114-2.853V2.96c0-1.711-1.057-2.852-2.114-2.852zM.106 62.86c0 6.615 3.974 11.979 8.876 11.979 4.903 0 8.877-5.364 8.877-11.98 0-6.616-3.974-11.98-8.877-11.98-4.902 0-8.876 5.364-8.876 11.98zM124.17 50.88H33.921c-1.268 0-2.114 1.425-2.114 2.851v18.256c0 1.711 1.057 2.852 2.114 2.852h90.247c1.268 0 2.114-1.426 2.114-2.852V53.73c0-1.426-.846-2.852-2.114-2.852zM.106 115.913c0 6.616 3.974 11.98 8.876 11.98 4.903 0 8.877-5.364 8.877-11.98 0-6.616-3.974-11.98-8.877-11.98-4.902 0-8.876 5.364-8.876 11.98zm124.064-11.98H33.921c-1.268 0-2.114 1.426-2.114 2.853v18.255c0 1.711 1.057 2.852 2.114 2.852h90.247c1.268 0 2.114-1.426 2.114-2.852v-18.255c0-1.427-.846-2.853-2.114-2.853z'
      ]
    },
    table: {
      viewBox: '0 0 128 128',
      paths: [
        'M.006.064h127.988v31.104H.006V.064zm0 38.016h38.396v41.472H.006V38.08zm0 48.384h38.396v41.472H.006V86.464zM44.802 38.08h38.396v41.472H44.802V38.08zm0 48.384h38.396v41.472H44.802V86.464zM89.598 38.08h38.396v41.472H89.598zm0 48.384h38.396v41.472H89.598z',
        'M.006.064h127.988v31.104H.006V.064zm0 38.016h38.396v41.472H.006V38.08zm0 48.384h38.396v41.472H.006V86.464zM44.802 38.08h38.396v41.472H44.802V38.08zm0 48.384h38.396v41.472H44.802V86.464zM89.598 38.08h38.396v41.472H89.598zm0 48.384h38.396v41.472H89.598z'
      ]
    },
    'tree-table': {
      viewBox: '0 0 128 128',
      paths: [
        'M44.8 0h79.543C126.78 0 128 1.422 128 4.267v23.466c0 2.845-1.219 4.267-3.657 4.267H44.8c-2.438 0-3.657-1.422-3.657-4.267V4.267C41.143 1.422 42.362 0 44.8 0zm22.857 48h56.686c2.438 0 3.657 1.422 3.657 4.267v23.466c0 2.845-1.219 4.267-3.657 4.267H67.657C65.22 80 64 78.578 64 75.733V52.267C64 49.422 65.219 48 67.657 48zm0 48h56.686c2.438 0 3.657 1.422 3.657 4.267v23.466c0 2.845-1.219 4.267-3.657 4.267H67.657C65.22 128 64 126.578 64 123.733v-23.466C64 97.422 65.219 96 67.657 96zM50.286 68.267c2.02 0 3.657-1.91 3.657-4.267 0-2.356-1.638-4.267-3.657-4.267H17.37V32h6.4c2.02 0 3.658-1.91 3.658-4.267V4.267C27.429 1.91 25.79 0 23.77 0H3.657C1.637 0 0 1.91 0 4.267v23.466C0 30.09 1.637 32 3.657 32h6.4v80c0 2.356 1.638 4.267 3.657 4.267h36.572c2.02 0 3.657-1.91 3.657-4.267 0-2.356-1.638-4.267-3.657-4.267H17.37V68.267h32.915z'
      ]
    }
  };

  var MENU_DEFAULT_ICONS = {
    production: 'list',
    'factory-logistics': 'table',
    'channel-logistics': 'table',
    inspection: 'table',
    query: 'table',
    boards: 'table'
  };

  Vue.component('menu-icon', {
    props: {
      icon: {
        type: String,
        default: ''
      }
    },
    render: function (createElement) {
      var icon = this.icon || '';
      var svgIcon = MENU_SVG_ICONS[icon];
      if (svgIcon) {
        return createElement('svg', {
          class: 'menu-icon menu-svg-icon',
          attrs: {
            'aria-hidden': 'true',
            viewBox: svgIcon.viewBox
          }
        }, svgIcon.paths.map(function (path, index) {
          return createElement('path', {
            key: index,
            attrs: { d: path }
          });
        }));
      }
      return createElement('i', {
        class: ['menu-icon', icon]
      });
    }
  });

  Vue.component('menu-tree-item', {
    props: {
      item: {
        type: Object,
        required: true
      }
    },
    computed: {
      resolvedIcon: function () {
        return this.item.icon || MENU_DEFAULT_ICONS[this.item.index] || '';
      }
    },
    template: `
      <el-submenu v-if="item.children && item.children.length" :index="item.index">
        <template slot="title">
          <menu-icon v-if="resolvedIcon" :icon="resolvedIcon"></menu-icon>
          <span class="menu-label">{{ item.title }}</span>
        </template>
        <menu-tree-item v-for="child in item.children" :key="child.index" :item="child"></menu-tree-item>
      </el-submenu>
      <el-menu-item v-else :index="item.index">
        <menu-icon v-if="resolvedIcon" :icon="resolvedIcon"></menu-icon>
        <span slot="title" class="menu-label">{{ item.title }}</span>
      </el-menu-item>
    `
  });

  Vue.component('core-card', {
    props: {
      cardInfo: {
        type: Object,
        default: function () {
          return {};
        }
      }
    },
    computed: {
      ratioValue: function () {
        if (!this.cardInfo.ratioLabel || !this.cardInfo.numTwo) {
          return '';
        }
        return ((this.cardInfo.numOne / this.cardInfo.numTwo) * 100).toFixed(2);
      },
      ratioClass: function () {
        return Number(this.ratioValue) >= 100 ? 'is-success' : 'is-danger';
      }
    },
    template: `
      <div class="core-card">
        <div class="core-card__label" :style="{ marginTop: cardInfo.marginTop || '0' }">{{ cardInfo.titleOne || '--' }}</div>
        <div class="core-card__value">{{ cardInfo.numOne != null ? cardInfo.numOne : '--' }}</div>
        <template v-if="cardInfo.titleTwo">
          <div class="core-card__label">{{ cardInfo.titleTwo }}</div>
          <div class="core-card__value core-card__subvalue">{{ cardInfo.numTwo != null ? cardInfo.numTwo : '--' }}</div>
        </template>
        <div v-if="cardInfo.ratioLabel" class="core-card__ratio" :class="ratioClass">{{ cardInfo.ratioLabel }}: {{ ratioValue }}%</div>
      </div>
    `
  });

  var chartResizeMixin = {
    mounted: function () {
      this.__resizeHandler__ = debounce(this.resizeChart, 120);
      window.addEventListener('resize', this.__resizeHandler__);
    },
    beforeDestroy: function () {
      window.removeEventListener('resize', this.__resizeHandler__);
      this.destroyChart();
    },
    methods: {
      resizeChart: function () {
        if (this.chart) {
          this.chart.resize();
        }
      },
      destroyChart: function () {
        if (this.chart) {
          this.chart.dispose();
          this.chart = null;
        }
      }
    }
  };

  Vue.component('line-chart', {
    mixins: [chartResizeMixin],
    props: {
      title: String,
      chartData: Object,
      chartOptions: {
        type: Object,
        default: function () {
          return {};
        }
      }
    },
    data: function () {
      return {
        chart: null
      };
    },
    mounted: function () {
      this.chart = echarts.init(this.$refs.canvas);
      this.renderChart();
    },
    watch: {
      chartData: {
        deep: true,
        handler: function () {
          this.renderChart();
        }
      }
    },
    methods: {
      renderChart: function () {
        if (!this.chart || !this.chartData) {
          return;
        }

        var chartOptions = this.chartOptions || {};
        var colors = chartOptions.colors || ['#2f7df6', '#36cfc9'];
        var areaColors = chartOptions.areaColors || ['rgba(47, 125, 246, 0.18)', 'rgba(54, 207, 201, 0.16)'];
        var showArea = chartOptions.area !== false;
        var series = (this.chartData.series || []).map(function (item, index) {
          var current = {
            name: item.name,
            type: 'line',
            smooth: chartOptions.smooth !== false,
            symbol: chartOptions.symbol || 'circle',
            symbolSize: chartOptions.symbolSize == null ? 7 : chartOptions.symbolSize,
            showSymbol: !!chartOptions.showSymbol,
            emphasis: { focus: 'series' },
            data: item.data,
            lineStyle: { width: chartOptions.lineWidth || 3, color: colors[index % colors.length] },
            itemStyle: { color: colors[index % colors.length] }
          };
          if (showArea) {
            current.areaStyle = { color: areaColors[index % areaColors.length] };
          }
          return current;
        });

        this.chart.setOption({
          animationDuration: 900,
          color: colors,
          title: {
            text: this.title,
            left: chartOptions.titleLeft || 'center',
            top: chartOptions.titleTop == null ? 2 : chartOptions.titleTop,
            textStyle: {
              fontSize: chartOptions.titleFontSize || 16,
              fontWeight: 700,
              color: chartOptions.titleColor || '#1d3247'
            }
          },
          tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(21, 36, 52, 0.92)',
            borderWidth: 0,
            textStyle: { color: '#fff' }
          },
          legend: {
            top: chartOptions.legendTop == null ? 2 : chartOptions.legendTop,
            right: chartOptions.legendRight == null ? 16 : chartOptions.legendRight,
            left: chartOptions.legendLeft,
            itemWidth: chartOptions.legendItemWidth || 14,
            itemHeight: chartOptions.legendItemHeight || 10,
            icon: chartOptions.legendIcon || 'circle',
            textStyle: { color: chartOptions.legendColor || '#627386' }
          },
          grid: {
            left: chartOptions.gridLeft == null ? 20 : chartOptions.gridLeft,
            right: chartOptions.gridRight == null ? 18 : chartOptions.gridRight,
            top: chartOptions.gridTop == null ? 48 : chartOptions.gridTop,
            bottom: chartOptions.gridBottom == null ? 16 : chartOptions.gridBottom,
            containLabel: true
          },
          xAxis: {
            type: 'category',
            boundaryGap: !!chartOptions.boundaryGap,
            data: this.chartData.xAxis || [],
            axisLine: { lineStyle: { color: '#d9e3ef' } },
            axisLabel: {
              color: chartOptions.axisLabelColor || '#7b8998',
              interval: chartOptions.xAxisLabelInterval == null ? 'auto' : chartOptions.xAxisLabelInterval
            },
            axisTick: { show: false }
          },
          yAxis: {
            type: 'value',
            min: chartOptions.yMin,
            max: chartOptions.yMax,
            splitNumber: chartOptions.splitNumber || 4,
            axisLine: { show: false },
            axisLabel: {
              color: chartOptions.axisLabelColor || '#7b8998',
              formatter: chartOptions.yAxisLabelFormatter
            },
            splitLine: { lineStyle: { color: '#edf2f8' } }
          },
          series: series
        });
      }
    },
    template: '<div ref="canvas" class="chart-box"></div>'
  });

  Vue.component('bar-chart', {
    mixins: [chartResizeMixin],
    props: {
      title: String,
      chartData: Object,
      chartOptions: {
        type: Object,
        default: function () {
          return {};
        }
      }
    },
    data: function () {
      return { chart: null };
    },
    mounted: function () {
      this.chart = echarts.init(this.$refs.canvas);
      this.renderChart();
    },
    watch: {
      chartData: {
        deep: true,
        handler: function () {
          this.renderChart();
        }
      }
    },
    methods: {
      renderChart: function () {
        if (!this.chart || !this.chartData) {
          return;
        }

        var chartOptions = this.chartOptions || {};
        var colors = chartOptions.colors || ['#2f7df6', '#5ad8a6'];
        this.chart.setOption({
          animationDuration: 900,
          title: {
            text: this.title,
            left: chartOptions.titleLeft || 'center',
            top: chartOptions.titleTop == null ? 2 : chartOptions.titleTop,
            textStyle: { fontSize: chartOptions.titleFontSize || 16, fontWeight: 700, color: chartOptions.titleColor || '#1d3247' }
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            backgroundColor: 'rgba(21, 36, 52, 0.92)',
            borderWidth: 0,
            textStyle: { color: '#fff' }
          },
          legend: {
            top: chartOptions.legendTop == null ? 2 : chartOptions.legendTop,
            right: chartOptions.legendRight == null ? 16 : chartOptions.legendRight,
            left: chartOptions.legendLeft,
            textStyle: { color: chartOptions.legendColor || '#627386' }
          },
          grid: {
            left: chartOptions.gridLeft == null ? 32 : chartOptions.gridLeft,
            right: chartOptions.gridRight == null ? 20 : chartOptions.gridRight,
            top: chartOptions.gridTop == null ? 50 : chartOptions.gridTop,
            bottom: chartOptions.gridBottom == null ? 26 : chartOptions.gridBottom,
            containLabel: true
          },
          xAxis: {
            type: 'category',
            data: this.chartData.xAxis || [],
            axisLine: { lineStyle: { color: '#d9e3ef' } },
            axisLabel: { color: chartOptions.axisLabelColor || '#7b8998' },
            axisTick: { show: false }
          },
          yAxis: {
            type: 'value',
            min: chartOptions.yMin,
            max: chartOptions.yMax,
            splitNumber: chartOptions.splitNumber,
            axisLine: { show: false },
            axisLabel: { color: '#7b8998' },
            splitLine: { lineStyle: { color: '#edf2f8' } }
          },
          series: (this.chartData.series || []).map(function (item, index) {
            return {
              name: item.name,
              type: 'bar',
              barWidth: '24%',
              data: item.data,
              itemStyle: { color: colors[index % colors.length], borderRadius: [8, 8, 0, 0] },
              label: { show: true, position: 'top', color: '#627386', fontSize: 11 }
            };
          })
        });
      }
    },
    template: '<div ref="canvas" class="chart-box"></div>'
  });

  Vue.component('shandong-map', {
    mixins: [chartResizeMixin],
    props: {
      title: String,
      mapData: Array,
      pieces: Array,
      chartOptions: {
        type: Object,
        default: function () {
          return {};
        }
      }
    },
    data: function () {
      return {
        chart: null
      };
    },
    computed: {
      hasRegisteredMap: function () {
        return !!(window.echarts && echarts.getMap && echarts.getMap('山东'));
      }
    },
    mounted: function () {
      if (this.hasRegisteredMap) {
        this.chart = echarts.init(this.$refs.canvas);
        this.renderChart();
      }
    },
    watch: {
      mapData: {
        deep: true,
        handler: function () {
          this.renderChart();
        }
      },
      pieces: {
        deep: true,
        handler: function () {
          this.renderChart();
        }
      }
    },
    methods: {
      renderChart: function () {
        if (!this.chart) {
          return;
        }

        var chartOptions = this.chartOptions || {};
        var visualMap = {
          type: 'piecewise',
          pieces: this.pieces || [],
          orient: chartOptions.visualOrient || 'horizontal',
          itemWidth: chartOptions.visualItemWidth || 16,
          itemHeight: chartOptions.visualItemHeight || 10,
          itemGap: chartOptions.visualItemGap || 18,
          text: chartOptions.visualText,
          textGap: chartOptions.visualTextGap || 8,
          textStyle: {
            color: chartOptions.visualTextColor || '#6b7b8c',
            fontSize: chartOptions.visualFontSize || 12
          }
        };
        if (chartOptions.visualLeft !== undefined) {
          visualMap.left = chartOptions.visualLeft;
        }
        if (chartOptions.visualRight !== undefined) {
          visualMap.right = chartOptions.visualRight;
        }
        if (chartOptions.visualTop !== undefined) {
          visualMap.top = chartOptions.visualTop;
        }
        if (chartOptions.visualBottom !== undefined) {
          visualMap.bottom = chartOptions.visualBottom;
        } else {
          visualMap.bottom = 2;
        }

        this.chart.clear();
        this.chart.setOption({
          animationDuration: 900,
          title: {
            text: this.title || '',
            left: chartOptions.titleLeft || 'center',
            top: chartOptions.titleTop == null ? 8 : chartOptions.titleTop,
            textStyle: {
              fontSize: chartOptions.titleFontSize || 16,
              fontWeight: 700,
              color: chartOptions.titleColor || '#1d3247'
            }
          },
          tooltip: {
            trigger: 'item',
            formatter: function (params) {
              var value = params && params.value != null ? params.value : 0;
              return params.name + '：' + value + ' 次';
            },
            backgroundColor: 'rgba(21, 36, 52, 0.92)',
            borderWidth: 0,
            textStyle: { color: '#fff' }
          },
          visualMap: visualMap,
          series: [
            {
              type: 'map',
              map: '山东',
              roam: false,
              zoom: chartOptions.zoom || 1.08,
              top: chartOptions.mapTop == null ? 56 : chartOptions.mapTop,
              bottom: chartOptions.mapBottom == null ? 44 : chartOptions.mapBottom,
              label: {
                show: chartOptions.showLabel !== false,
                color: chartOptions.labelColor || '#4c6278',
                fontSize: chartOptions.labelFontSize || 12
              },
              emphasis: {
                label: { color: '#1f2d3d' },
                itemStyle: {
                  areaColor: '#77d6ff',
                  borderColor: '#ffffff'
                }
              },
              itemStyle: {
                areaColor: chartOptions.areaColor || '#eef3f8',
                borderColor: '#ffffff',
                borderWidth: chartOptions.borderWidth || 1.2,
                shadowBlur: chartOptions.shadowBlur == null ? 10 : chartOptions.shadowBlur,
                shadowColor: chartOptions.shadowColor || 'rgba(47, 125, 246, 0.06)'
              },
              data: this.mapData || []
            }
          ]
        });
      }
    },
    template: `
      <div class="map-chart-card">
        <div v-if="hasRegisteredMap" ref="canvas" class="map-box map-box--echart"></div>
        <div v-else class="empty-panel">山东地图资源未加载</div>
      </div>
    `
  });

  Vue.component('list-card', {
    props: {
      title: String,
      listData: Array,
      showBadge: {
        type: Boolean,
        default: true
      },
      showIndex: {
        type: Boolean,
        default: true
      },
      centerTitle: Boolean,
      centerItems: Boolean,
      plain: Boolean,
      emptyText: {
        type: String,
        default: '暂无数据'
      }
    },
    template: `
      <div class="list-card" :class="{ 'list-card--center-title': centerTitle, 'list-card--center-items': centerItems, 'list-card--plain': plain }">
        <div class="list-card__header">
          <div class="list-card__title">{{ title }}</div>
          <div v-if="showBadge" class="list-card__badge">{{ (listData || []).length }}</div>
        </div>
        <div class="list-card__body">
          <div v-for="(item, index) in listData" :key="index" class="list-card__item" :title="item">
            <span v-if="showIndex" class="list-card__index">{{ index + 1 }}</span>
            <span class="list-card__text">{{ item }}</span>
          </div>
          <div v-if="!(listData || []).length && emptyText" class="list-card__empty">{{ emptyText }}</div>
        </div>
      </div>
    `
  });

  Vue.component('placeholder-page', {
    props: {
      routeMeta: {
        type: Object,
        default: function () {
          return {};
        }
      }
    },
    template: `
      <div class="plant-page">
        <section v-if="!isLegacyProduction" class="module-tagbar">
          <span class="module-tag module-tag--active">{{ routeMeta.title || '模块页面' }}</span>
        </section>

        <section v-if="!isLegacyProduction" class="module-breadcrumb-card">
          <div class="placeholder-breadcrumb">{{ routeMeta.breadcrumb || '首页 / 模块页面' }}</div>
        </section>

        <section class="section-card placeholder-module-card">
          <div class="placeholder-module-card__icon"><i class="el-icon-data-line"></i></div>
          <div class="placeholder-module-card__title">{{ routeMeta.title || '模块页面' }}骨架已接入</div>
          <div class="placeholder-module-card__desc">该模块路由、菜单层级、标题和静态页面容器已经接入，下一步按目标站逐页做 1:1 还原。</div>
          <div class="placeholder-module-card__meta">
            <span>当前路由：{{ routeMeta.route || '--' }}</span>
            <span>状态：待精细还原</span>
          </div>
        </section>
      </div>
    `
  });

  Vue.component('org-tree-page', {
    props: {
      schemaState: {
        type: Object,
        default: function () {
          return {};
        }
      }
    },
    data: function () {
      return {
        personKeyword: '',
        treeKeyword: '',
        selectedId: 'mit',
        currentPage: 1,
        pageSize: 10,
        treeProps: {
          children: 'children',
          label: 'name'
        }
      };
    },
    computed: {
      nodes: function () {
        return this.schemaState.orgTree || [];
      },
      filteredNodes: function () {
        return this.filterTree(this.nodes, this.treeKeyword);
      },
      selectedNode: function () {
        return this.findNode(this.nodes, this.selectedId) || this.nodes[0] || {};
      },
      selectedChildren: function () {
        return this.selectedNode.children || [];
      },
      memberRows: function () {
        var keyword = String(this.personKeyword || '').toLowerCase();
        var members = this.selectedNode.members || [];
        if (!keyword) {
          return members;
        }
        return members.filter(function (item) {
          return [item.name, item.role, item.account, item.phone].some(function (value) {
            return String(value || '').toLowerCase().indexOf(keyword) > -1;
          });
        });
      },
      pagedMembers: function () {
        var start = (this.currentPage - 1) * this.pageSize;
        return this.memberRows.slice(start, start + this.pageSize);
      },
      isSelectedRoot: function () {
        return !!this.selectedNode.locked;
      }
    },
    watch: {
      memberRows: function (rows) {
        var maxPage = Math.max(1, Math.ceil(rows.length / this.pageSize));
        if (this.currentPage > maxPage) {
          this.currentPage = maxPage;
        }
      }
    },
    methods: {
      findNode: function (nodes, id) {
        for (var index = 0; index < (nodes || []).length; index += 1) {
          var item = nodes[index];
          if (item.id === id) {
            return item;
          }
          var found = this.findNode(item.children || [], id);
          if (found) {
            return found;
          }
        }
        return null;
      },
      filterTree: function (nodes, keyword) {
        var text = String(keyword || '').trim();
        if (!text) {
          return nodes;
        }
        return (nodes || []).reduce(function (result, item) {
          var children = this.filterTree(item.children || [], text);
          var matched = item.name.indexOf(text) > -1;
          if (matched || children.length) {
            result.push(Object.assign({}, item, { children: children }));
          }
          return result;
        }.bind(this), []);
      },
      selectNode: function (data) {
        if (!data || !data.id) {
          return;
        }
        this.selectedId = data.id;
        this.currentPage = 1;
      },
      nodeLabel: function (data, suffix) {
        return (data.name || '--') + '(' + (data.count || 0) + suffix + ')';
      },
      handlePageChange: function (page) {
        this.currentPage = page;
      },
      handleStaticAction: function (label) {
        this.$message.info('静态演示动作：' + label);
      },
      beforeUpload: function () {
        this.$message.info('静态演示页暂未接入上传接口');
        return false;
      }
    },
    template: `
      <div class="org-tree-page">
        <section class="legacy-breadcrumb">{{ schemaState.legacyBreadcrumb || '基础资料 / 组织机构' }}</section>

        <section class="section-card legacy-card org-tree-card">
          <aside class="org-tree-sidebar">
            <div class="org-person-search">
              <el-input v-model.trim="personKeyword" size="mini" placeholder="按人员名称查询" clearable @keyup.enter.native="currentPage = 1"></el-input>
              <el-button size="mini" type="primary" icon="el-icon-search" @click="currentPage = 1"></el-button>
            </div>

            <div class="org-import-actions">
              <el-button size="mini" type="primary" @click="handleStaticAction('下载导入模板')">
                <a class="org-template-link" href="https://dev.mtkj.fun/org/tpls/部门模板.xlsx">下载导入模板</a>
              </el-button>
              <el-upload action="#" :auto-upload="false" :show-file-list="false" :before-upload="beforeUpload" class="org-upload">
                <el-button size="mini" type="success">点击上传</el-button>
              </el-upload>
            </div>

            <el-input v-model.trim="treeKeyword" size="mini" placeholder="输入部门名称进行过滤" clearable class="org-tree-filter"></el-input>

            <el-tree class="org-tree-list" :data="filteredNodes" :props="treeProps" node-key="id" default-expand-all :expand-on-click-node="false" @node-click="selectNode">
              <span class="org-tree-node" :class="{ 'is-active': data.id === selectedId }" slot-scope="{ node, data }">
                <i class="el-icon-folder-opened"></i>
                <span>{{ nodeLabel(data, '人') }}</span>
              </span>
            </el-tree>
          </aside>

          <main class="org-tree-main">
            <header class="org-dept-header">
              <h3>{{ selectedNode.name || '--' }}</h3>
              <div class="org-dept-header__actions">
                <el-button size="mini" icon="el-icon-edit-outline" @click="handleStaticAction('编辑')">编辑</el-button>
                <el-button size="mini" icon="el-icon-delete" :disabled="isSelectedRoot" @click="handleStaticAction('删除')">删除</el-button>
              </div>
            </header>

            <h3 class="org-section-title"><i class="el-icon-s-operation"></i>下级部门</h3>
            <div class="org-action-strip">
              <el-button size="mini" icon="el-icon-circle-plus" @click="handleStaticAction('添加子部门')">添加子部门</el-button>
              <el-button size="mini" @click="handleStaticAction('关联经销商')">关联经销商</el-button>
            </div>
            <div class="org-child-list">
              <button v-for="child in selectedChildren" :key="child.id" type="button" class="org-child-row" @click="selectNode(child)">
                <i class="el-icon-folder-opened"></i>
                <span>{{ nodeLabel(child, '') }}</span>
              </button>
              <div v-if="!selectedChildren.length" class="org-empty-line">暂无下级部门</div>
            </div>

            <h3 class="org-section-title org-section-title--members"><i class="el-icon-user-solid"></i>部门人员</h3>
            <div class="org-action-strip org-action-strip--members">
              <el-button size="mini" icon="el-icon-circle-plus" @click="handleStaticAction('添加成员(批量)')">添加成员(批量)</el-button>
              <el-button size="mini" icon="el-icon-circle-plus" @click="handleStaticAction('创建成员')">创建成员</el-button>
              <el-button size="mini" @click="handleStaticAction('调整部门')">调整部门</el-button>
              <el-button size="mini" icon="el-icon-delete" class="org-danger-button" @click="handleStaticAction('批量删除')">批量删除</el-button>
            </div>

            <el-table class="legacy-table org-member-table" :data="pagedMembers" empty-text="暂无部门人员数据">
              <el-table-column type="selection" width="42"></el-table-column>
              <el-table-column label="人员" min-width="150">
                <template slot-scope="{ row }">
                  <span class="org-member-name">{{ row.name }}</span>
                  <span v-if="row.role" class="org-role-tag">{{ row.role }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="account" label="账号名称" min-width="150"></el-table-column>
              <el-table-column prop="phone" label="手机号" min-width="150"></el-table-column>
              <el-table-column prop="createdAt" label="创建时间" min-width="170"></el-table-column>
              <el-table-column label="状态" width="120">
                <template slot-scope="{ row }">
                  <el-switch v-model="row.enabled" disabled></el-switch>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="100">
                <template slot-scope="{ row }">
                  <el-button size="mini" type="text" icon="el-icon-delete" @click="handleStaticAction('删除' + row.name)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>

            <div class="org-pagination">
              <span>共 {{ memberRows.length }} 条</span>
              <el-pagination background layout="prev, pager, next, jumper" :page-size="pageSize" :current-page.sync="currentPage" :total="memberRows.length" @current-change="handlePageChange"></el-pagination>
            </div>
          </main>
        </section>

        <button v-if="schemaState.showSettingsButton !== false" type="button" class="legacy-floating-settings" @click="handleStaticAction('设置')">
          <i class="el-icon-setting"></i>
        </button>
      </div>
    `
  });

  Vue.component('module-page', {
    props: {
      routeMeta: {
        type: Object,
        default: function () {
          return {};
        }
      }
    },
    data: function () {
      return {
        schemaState: null,
        sourceList: [],
        filterForm: {},
        pageSize: 10,
        currentPage: 1,
        detailVisible: false,
        detailTitle: '',
        detailRow: null,
        dialogVisible: false,
        dialogMode: 'create',
        dialogForm: {}
      };
    },
    computed: {
      schemaExists: function () {
        return !!this.schemaState;
      },
      isBoardLayout: function () {
        return this.schemaExists && this.schemaState.layout === 'board';
      },
      isOrgTreeLayout: function () {
        return this.schemaExists && this.schemaState.variant === 'org-tree';
      },
      isSimpleQueryPage: function () {
        return this.schemaExists && !this.isBoardLayout && !this.isOrgTreeLayout && !this.isLegacyProduction && !!this.schemaState.simpleQuery;
      },
      isTsListLayout: function () {
        return this.schemaExists && !this.isBoardLayout && !this.isOrgTreeLayout && !this.isLegacyProduction && !this.isSimpleQueryPage && !!this.schemaState.tsStyle;
      },
      isLegacyProduction: function () {
        return this.schemaExists && this.schemaState.variant === 'legacy-production';
      },
      filteredList: function () {
        var self = this;
        if (!this.schemaExists || this.isBoardLayout) {
          return [];
        }

        return this.sourceList.filter(function (row) {
          return (self.schemaState.filters || []).every(function (filter) {
            var value = self.filterForm[filter.key];
            if (value == null || value === '') {
              return true;
            }
            if (filter.type === 'select' || filter.type === 'date') {
              return String(row[filter.key] || '') === String(value);
            }
            if (filter.type === 'daterange') {
              if (!Array.isArray(value) || value.length < 2 || !row[filter.key]) {
                return true;
              }
              var rowValue = String(row[filter.key]).slice(0, 10);
              return rowValue >= String(value[0]).slice(0, 10) && rowValue <= String(value[1]).slice(0, 10);
            }
            return (filter.searchKeys || [filter.key]).some(function (key) {
              return String(row[key] || '').toLowerCase().indexOf(String(value).toLowerCase()) > -1;
            });
          });
        });
      },
      pagedList: function () {
        if (!this.schemaExists || this.isBoardLayout) {
          return [];
        }
        var start = (this.currentPage - 1) * this.pageSize;
        return this.filteredList.slice(start, start + this.pageSize);
      },
      summaryCards: function () {
        if (!this.schemaExists || this.isBoardLayout) {
          return [];
        }
        return buildSchemaSummaryCards(this.schemaState, this.filteredList);
      },
      dialogColumns: function () {
        return this.schemaExists && !this.isBoardLayout ? (this.schemaState.columns || []).slice(0, 6) : [];
      },
      detailFields: function () {
        var self = this;
        if (!this.schemaExists || this.isBoardLayout) {
          return [];
        }
        if (!this.schemaState.detailFields || !this.schemaState.detailFields.length) {
          return (this.schemaState.columns || []).slice(0, 10);
        }
        return this.schemaState.detailFields.map(function (item) {
          if (typeof item === 'string') {
            return (self.schemaState.columns || []).find(function (column) {
              return column.key === item;
            }) || { key: item, label: item };
          }
          return item;
        });
      },
      legacyTabs: function () {
        if (!this.isLegacyProduction) {
          return [];
        }
        return clone(this.schemaState.legacyTabs && this.schemaState.legacyTabs.length ? this.schemaState.legacyTabs : buildLegacyProductionTabs(this.routeMeta.route));
      },
      tsToolbarButtons: function () {
        var schema = this.schemaState || {};
        if (schema.toolbarButtons && schema.toolbarButtons.length) {
          return clone(schema.toolbarButtons);
        }
        return (schema.toolbar || []).map(function (key) {
          var map = {
            reset: { key: 'reset', label: '重置' },
            search: { key: 'search', label: '搜索', buttonType: 'primary', icon: 'el-icon-search' },
            create: { key: 'create', label: '新增' },
            export: { key: 'export', label: '导出Excel' }
          };
          return map[key];
        }).filter(Boolean);
      }
    },
    watch: {
      'routeMeta.route': function () {
        this.initializeSchema();
      },
      filteredList: function (list) {
        if (this.isBoardLayout) {
          return;
        }
        var maxPage = Math.max(1, Math.ceil(list.length / this.pageSize));
        if (this.currentPage > maxPage) {
          this.currentPage = maxPage;
        }
      }
    },
    created: function () {
      this.initializeSchema();
    },
    methods: {
      initializeSchema: function () {
        var schemas = window.staticModuleSchemas || {};
        var schema = schemas[this.routeMeta.route];
        this.schemaState = schema ? clone(schema) : null;
        this.sourceList = schema ? clone(schema.rows || []) : [];
        this.filterForm = schema ? createSchemaFilterState(schema.filters) : {};
        this.dialogForm = schema ? createSchemaDialogForm(schema.columns) : {};
        this.pageSize = schema && schema.pageSize ? schema.pageSize : 10;
        this.currentPage = 1;
        this.dialogVisible = false;
        this.detailVisible = false;
        this.detailTitle = '';
        this.detailRow = null;
      },
      hasToolbar: function (key) {
        return this.schemaExists && !this.isBoardLayout && (this.schemaState.toolbar || []).indexOf(key) > -1;
      },
      handleLegacyTab: function (item) {
        if (item && item.route) {
          window.location.hash = item.route;
        }
      },
      getLegacyButtonType: function (action) {
        return action && action.buttonType ? action.buttonType : 'default';
      },
      getLegacyActionClass: function (action) {
        return action && action.buttonType ? ('is-' + action.buttonType) : '';
      },
      handleLegacyToolbarAction: function (action) {
        if (!action || !action.key) {
          return;
        }
        if (action.key === 'search') {
          this.handleSearch();
          return;
        }
        if (action.key === 'reset') {
          this.resetFilters();
          return;
        }
        if (action.key === 'create') {
          this.openCreateDialog();
          return;
        }
        if (action.key === 'export') {
          this.exportRows();
          return;
        }
        if (action.key === 'columns' || action.key === 'settings') {
          this.$message.info('静态演示页暂未接入该设置能力');
          return;
        }
        this.$message.info('静态演示动作：' + action.label);
      },
      legacySummaryMethod: function (param) {
        var summary = (this.schemaState && this.schemaState.summaryRow) || [];
        if (!summary.length) {
          return param.columns.map(function (_, index) {
            return index === 0 ? '合计' : '';
          });
        }
        return summary;
      },
      getSummaryCardClass: function (card) {
        return card && card.tone ? ('is-' + card.tone) : 'is-primary';
      },
      resetFilters: function () {
        this.filterForm = createSchemaFilterState(this.schemaState.filters);
        this.currentPage = 1;
      },
      handleSearch: function () {
        this.currentPage = 1;
      },
      handlePageChange: function (page) {
        this.currentPage = page;
      },
      handleSizeChange: function (size) {
        this.pageSize = size;
        this.currentPage = 1;
      },
      openCreateDialog: function () {
        this.dialogMode = 'create';
        this.dialogForm = createSchemaDialogForm(this.schemaState.columns);
        this.dialogVisible = true;
      },
      openEditDialog: function (row) {
        this.dialogMode = 'edit';
        this.dialogForm = clone(row);
        this.dialogVisible = true;
      },
      openDetailDialog: function (row, action) {
        this.detailRow = clone(row);
        this.detailTitle = (action && action.label ? action.label : '详情') + ' - ' + resolveSchemaTitleField(row);
        this.detailVisible = true;
      },
      saveDialog: function () {
        var self = this;
        var requiredColumns = this.dialogColumns.slice(0, 3);
        var invalid = requiredColumns.some(function (item) {
          return !self.dialogForm[item.key];
        });
        if (invalid) {
          this.$message.warning('请先补全主要字段');
          return;
        }
        if (this.dialogMode === 'create') {
          this.dialogForm.id = Date.now();
          this.sourceList.unshift(clone(this.dialogForm));
          this.$message.success('已新增静态演示数据');
        } else {
          var target = this.sourceList.find(function (item) {
            return item.id === self.dialogForm.id;
          });
          if (target) {
            Object.assign(target, clone(this.dialogForm));
          }
          this.$message.success('已更新静态演示数据');
        }
        this.dialogVisible = false;
        this.currentPage = 1;
      },
      deleteRow: function (row) {
        var self = this;
        this.$confirm('确认删除该记录吗？此操作仅影响本地演示数据。', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(function () {
          self.sourceList = self.sourceList.filter(function (item) {
            return item.id !== row.id;
          });
          self.$message.success('已删除本地演示数据');
        }).catch(function () {});
      },
      handleRowAction: function (action, row) {
        if (action.key === 'edit') {
          this.openEditDialog(row);
          return;
        }
        if (action.key === 'delete') {
          this.deleteRow(row);
          return;
        }
        if (action.key === 'trace') {
          this.openDetailDialog(row, action);
          return;
        }
        if (action.key === 'detail' || action.key === 'log' || action.key === 'inspect') {
          this.openDetailDialog(row, action);
          return;
        }
        this.$message.info('静态演示动作：' + action.label);
      },
      exportRows: function () {
        var rows = [(this.schemaState.columns || []).map(function (item) { return item.label; })];
        this.filteredList.forEach(function (item) {
          rows.push((this.schemaState.columns || []).map(function (column) {
            return item[column.key];
          }));
        }, this);
        downloadCsv((this.schemaState.title || '模块数据') + '-静态导出.csv', rows);
        this.$message.success('已导出静态 CSV');
      },
      formatCell: function (row, column) {
        return formatSchemaValue(row[column.key]);
      },
      resolveSchemaTitleField: function (row) {
        return resolveSchemaTitleField(row || {});
      },
      formatDetailValue: function (field) {
        if (!this.detailRow) {
          return '--';
        }
        var value = this.detailRow[field.key];
        if (Array.isArray(value)) {
          return value.map(function (item) {
            return typeof item === 'object' ? JSON.stringify(item) : String(item);
          }).join(' / ');
        }
        if (value && typeof value === 'object') {
          return JSON.stringify(value);
        }
        return formatSchemaValue(value);
      },
      tagType: function (value) {
        if (value === '已完成' || value === '已处理' || value === '已签收' || value === '成功' || value === '启用' || value === '正品') {
          return 'success';
        }
        if (value === '待处理' || value === '待审核' || value === '待执行' || value === '待发运' || value === '复核中' || value === '处理中') {
          return 'warning';
        }
        if (value === '异常' || value === '失败' || value === '重码' || value === '风险' || value === '停用' || value === '已取消') {
          return 'danger';
        }
        return 'info';
      }
    },
    template: `
      <div class="plant-page">
        <template v-if="schemaExists">
          <section v-if="!isLegacyProduction && !isTsListLayout && !isOrgTreeLayout" class="module-tagbar">
            <span v-for="(tag, index) in schemaState.tags || [routeMeta.title]" :key="tag + index" class="module-tag" :class="{ 'module-tag--active': index === (schemaState.tags || []).length - 1 }">{{ tag }}</span>
          </section>

          <section v-if="!isLegacyProduction && !isTsListLayout && !isOrgTreeLayout" class="module-breadcrumb-card">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item v-for="(item, index) in (routeMeta.breadcrumb || '').split(' / ')" :key="item + index">{{ item }}</el-breadcrumb-item>
            </el-breadcrumb>
          </section>

          <template v-if="isBoardLayout">
            <section class="section-card module-board-card">
              <div class="module-info-bar module-board-head">
                <div>
                  <div class="module-info-bar__title">{{ schemaState.title }}</div>
                  <div class="module-info-bar__desc">{{ routeMeta.route || '--' }} · 静态驾驶舱视图</div>
                </div>
                <div class="module-info-bar__meta">
                  <span>指标 {{ (schemaState.metrics || []).length }}</span>
                  <span>图表 {{ (schemaState.charts || []).length }}</span>
                  <span>榜单 {{ (schemaState.lists || []).length }}</span>
                </div>
              </div>
              <div class="module-board-metrics">
                <div v-for="(metric, index) in schemaState.metrics" :key="metric.label + index" class="module-board-metric">
                  <div class="module-board-metric__label">{{ metric.label }}</div>
                  <div class="module-board-metric__value">{{ metric.value }}</div>
                  <div class="module-board-metric__desc">{{ metric.desc }}</div>
                </div>
              </div>
            </section>

            <section v-if="schemaState.charts && schemaState.charts.length" class="section-card module-board-card">
              <div class="module-board-chart-grid" :class="{ 'is-single': schemaState.charts.length === 1 }">
                <line-chart v-for="chart in schemaState.charts" v-if="chart.type === 'line'" :key="chart.title" :title="chart.title" :chart-data="chart.data"></line-chart>
                <bar-chart v-for="chart in schemaState.charts" v-if="chart.type === 'bar'" :key="chart.title" :title="chart.title" :chart-data="chart.data"></bar-chart>
              </div>
            </section>

            <section v-if="schemaState.lists && schemaState.lists.length" class="section-card module-board-card">
              <div class="module-board-list-grid">
                <list-card v-for="panel in schemaState.lists" :key="panel.title" :title="panel.title" :list-data="panel.items"></list-card>
              </div>
            </section>
          </template>

          <template v-else-if="isOrgTreeLayout">
            <org-tree-page :schema-state="schemaState"></org-tree-page>
          </template>

          <template v-else-if="isLegacyProduction">
            <section class="legacy-breadcrumb">{{ schemaState.legacyBreadcrumb || routeMeta.breadcrumb || '--' }}</section>

            <section class="section-card legacy-card legacy-filter-card">
              <div class="legacy-filter-grid" :class="{ 'is-three': (schemaState.legacyColumns || 4) === 3 }">
                <div v-for="filter in schemaState.filters" :key="filter.key" class="legacy-filter-item" :class="{ 'is-wide': filter.type === 'daterange' }">
                  <label class="legacy-filter-item__label">{{ filter.label }}</label>
                  <el-input v-if="filter.type === 'input'" v-model.trim="filterForm[filter.key]" :placeholder="filter.placeholder || ('请输入' + filter.label)" clearable @keyup.enter.native="handleSearch"></el-input>
                  <el-select v-else-if="filter.type === 'select'" v-model="filterForm[filter.key]" clearable :placeholder="filter.placeholder || ('请选择' + filter.label)">
                    <el-option v-for="option in filter.options" :key="option" :label="option" :value="option"></el-option>
                  </el-select>
                  <el-date-picker v-else-if="filter.type === 'date'" v-model="filterForm[filter.key]" type="date" value-format="yyyy-MM-dd" placeholder="选择日期" style="width: 100%;"></el-date-picker>
                  <el-date-picker v-else-if="filter.type === 'daterange'" v-model="filterForm[filter.key]" type="daterange" value-format="yyyy-MM-dd" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期" style="width: 100%;"></el-date-picker>
                </div>
              </div>

              <div class="legacy-toolbar-actions">
                <el-button v-for="action in (schemaState.toolbarButtons || [])" :key="action.key" size="mini" :type="getLegacyButtonType(action)" :plain="!!action.plain" :icon="action.icon" @click="handleLegacyToolbarAction(action)">{{ action.label }}</el-button>
              </div>
            </section>

            <section class="section-card legacy-card legacy-table-card">
              <div class="legacy-table-card__title">{{ schemaState.title }}</div>
              <el-table class="legacy-table" :data="pagedList" border stripe :show-summary="!!(schemaState.summaryRow && schemaState.summaryRow.length)" :summary-method="legacySummaryMethod" :empty-text="'暂无' + schemaState.title + '数据'">
                <el-table-column v-if="schemaState.selectable" type="selection" width="42"></el-table-column>
                <el-table-column v-if="schemaState.expandable" type="expand" width="42">
                  <template slot-scope="{ row }">
                    <div class="legacy-expand">
                      <div v-if="row.expandText" class="legacy-expand__text">{{ row.expandText }}</div>
                      <div v-else class="legacy-expand__text">暂无明细</div>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column v-for="column in schemaState.columns" :key="column.key" :prop="column.key" :label="column.label" :min-width="column.minWidth || column.width || 120" :width="column.width" show-overflow-tooltip>
                  <template slot-scope="{ row }">
                    <el-tag v-if="column.tag || String(column.key).toLowerCase().indexOf('status') > -1 || column.key === 'result'" size="mini" :type="tagType(formatCell(row, column))">{{ formatCell(row, column) }}</el-tag>
                    <span v-else>{{ formatCell(row, column) }}</span>
                  </template>
                </el-table-column>
                <el-table-column v-if="schemaState.rowActions && schemaState.rowActions.length" label="操作" :width="schemaState.actionWidth || 160" fixed="right">
                  <template slot-scope="{ row }">
                    <div class="legacy-action-group">
                      <el-button v-for="action in schemaState.rowActions" :key="action.key" size="mini" :type="getLegacyButtonType(action)" :class="getLegacyActionClass(action)" @click="handleRowAction(action, row)">{{ action.label }}</el-button>
                    </div>
                  </template>
                </el-table-column>
              </el-table>

              <div v-if="schemaState.noteText" class="legacy-note-block">
                <div class="legacy-note-block__title">备注:</div>
                <div class="legacy-note-block__content">{{ schemaState.noteText }}</div>
              </div>

              <div class="legacy-pagination">
                <div class="legacy-pagination__total">共 {{ filteredList.length }} 条</div>
                <el-pagination background layout="prev, pager, next, jumper, sizes" :page-sizes="[10, 20, 50, 100]" :page-size="pageSize" :current-page.sync="currentPage" :total="filteredList.length" @current-change="handlePageChange" @size-change="handleSizeChange"></el-pagination>
              </div>
            </section>

            <button v-if="schemaState.showSettingsButton !== false" type="button" class="legacy-floating-settings" @click="handleLegacyToolbarAction({ key: 'settings', label: '设置' })">
              <i class="el-icon-setting"></i>
            </button>
          </template>

          <template v-else-if="isSimpleQueryPage">
            <section class="legacy-breadcrumb">{{ schemaState.legacyBreadcrumb || routeMeta.breadcrumb || '--' }}</section>

            <section class="simple-query-page">
              <div class="simple-query-page__title">{{ schemaState.queryTitle || schemaState.title }}</div>
              <div class="simple-query-page__toolbar">
                <label class="simple-query-page__label">请输入查询的码:</label>
                <el-input v-model.trim="filterForm.queryCode" placeholder="请输入查询的码"></el-input>
                <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
              </div>
            </section>

            <button v-if="schemaState.showSettingsButton !== false" type="button" class="legacy-floating-settings" @click="handleLegacyToolbarAction({ key: 'settings', label: '设置' })">
              <i class="el-icon-setting"></i>
            </button>
          </template>

          <template v-else-if="isTsListLayout">
            <section class="legacy-breadcrumb">{{ schemaState.legacyBreadcrumb || routeMeta.breadcrumb || '--' }}</section>

            <section v-if="(schemaState.filters && schemaState.filters.length) || tsToolbarButtons.length" class="section-card legacy-card legacy-filter-card">
              <div class="legacy-filter-grid" :class="{ 'is-three': (schemaState.legacyColumns || 4) === 3 }">
                <div v-for="filter in schemaState.filters" :key="filter.key" class="legacy-filter-item" :class="{ 'is-wide': filter.type === 'daterange' }">
                  <label class="legacy-filter-item__label">{{ filter.label }}</label>
                  <el-input v-if="filter.type === 'input'" v-model.trim="filterForm[filter.key]" :placeholder="filter.placeholder || ('请输入' + filter.label)" clearable @keyup.enter.native="handleSearch"></el-input>
                  <el-select v-else-if="filter.type === 'select'" v-model="filterForm[filter.key]" clearable :placeholder="filter.placeholder || ('请选择' + filter.label)">
                    <el-option v-for="option in filter.options" :key="option" :label="option" :value="option"></el-option>
                  </el-select>
                  <el-date-picker v-else-if="filter.type === 'date'" v-model="filterForm[filter.key]" type="date" value-format="yyyy-MM-dd" placeholder="选择日期" style="width: 100%;"></el-date-picker>
                  <el-date-picker v-else-if="filter.type === 'daterange'" v-model="filterForm[filter.key]" type="daterange" value-format="yyyy-MM-dd" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期" style="width: 100%;"></el-date-picker>
                </div>
              </div>

              <div v-if="tsToolbarButtons.length" class="legacy-toolbar-actions legacy-toolbar-actions--ts">
                <el-button v-for="action in tsToolbarButtons" :key="action.key" size="mini" :type="getLegacyButtonType(action)" :plain="!!action.plain" :icon="action.icon" @click="handleLegacyToolbarAction(action)">{{ action.label }}</el-button>
              </div>
            </section>

            <section class="section-card legacy-card legacy-table-card">
              <div class="legacy-table-card__title">{{ schemaState.title }}</div>
              <el-table class="legacy-table" :data="pagedList" border :empty-text="'暂无' + schemaState.title + '数据'">
                <el-table-column v-for="column in schemaState.columns" :key="column.key" :prop="column.key" :label="column.label" :min-width="column.minWidth || column.width || 120" :width="column.width" show-overflow-tooltip>
                  <template slot-scope="{ row }">
                    <el-tag v-if="column.tag || String(column.key).toLowerCase().indexOf('status') > -1 || column.key === 'result' || column.key === 'level'" size="mini" :type="tagType(formatCell(row, column))">{{ formatCell(row, column) }}</el-tag>
                    <span v-else>{{ formatCell(row, column) }}</span>
                  </template>
                </el-table-column>
                <el-table-column v-if="schemaState.rowActions && schemaState.rowActions.length" label="操作" :width="schemaState.actionWidth || 160" fixed="right">
                  <template slot-scope="{ row }">
                    <div class="legacy-action-group">
                      <el-button v-for="action in schemaState.rowActions" :key="action.key" size="mini" :type="getLegacyButtonType(action)" :class="getLegacyActionClass(action)" @click="handleRowAction(action, row)">{{ action.label }}</el-button>
                    </div>
                  </template>
                </el-table-column>
              </el-table>

              <div class="legacy-pagination">
                <div class="legacy-pagination__total">共 {{ filteredList.length }} 条</div>
                <el-pagination background layout="prev, pager, next, jumper, sizes" :page-sizes="[10, 20, 50]" :page-size="pageSize" :current-page.sync="currentPage" :total="filteredList.length" @current-change="handlePageChange" @size-change="handleSizeChange"></el-pagination>
              </div>
            </section>

            <button v-if="schemaState.showSettingsButton !== false" type="button" class="legacy-floating-settings" @click="handleLegacyToolbarAction({ key: 'settings', label: '设置' })">
              <i class="el-icon-setting"></i>
            </button>
          </template>

          <template v-else>
            <section v-if="summaryCards.length" class="section-card module-summary-card">
              <div class="module-summary-grid">
                <div v-for="(card, index) in summaryCards" :key="card.label + index" class="module-summary-item" :class="getSummaryCardClass(card)">
                  <div class="module-summary-item__label">{{ card.label }}</div>
                  <div class="module-summary-item__value">{{ card.value }}</div>
                  <div class="module-summary-item__desc">{{ card.desc }}</div>
                </div>
              </div>
            </section>

            <section class="section-card module-list-card">
              <div class="module-info-bar">
                <div>
                  <div class="module-info-bar__title">{{ schemaState.title }}</div>
                  <div class="module-info-bar__desc">{{ routeMeta.route || '--' }} · 全静态演示数据</div>
                </div>
                <div class="module-info-bar__meta">
                  <span>当前页 {{ currentPage }}</span>
                  <span>页容量 {{ pageSize }}</span>
                </div>
              </div>

              <div class="module-filter-grid">
                <div v-for="filter in schemaState.filters" :key="filter.key" class="module-filter-item">
                  <label class="module-filter-item__label">{{ filter.label }}</label>
                  <el-input v-if="filter.type === 'input'" v-model.trim="filterForm[filter.key]" :placeholder="filter.placeholder || ('请输入' + filter.label)" clearable @keyup.enter.native="handleSearch"></el-input>
                  <el-select v-else-if="filter.type === 'select'" v-model="filterForm[filter.key]" clearable :placeholder="'请选择' + filter.label">
                    <el-option v-for="option in filter.options" :key="option" :label="option" :value="option"></el-option>
                  </el-select>
                  <el-date-picker v-else-if="filter.type === 'date'" v-model="filterForm[filter.key]" type="date" value-format="yyyy-MM-dd" placeholder="选择日期" style="width: 100%;"></el-date-picker>
                </div>
              </div>

              <div class="module-toolbar-actions">
                <el-button v-if="hasToolbar('reset')" @click="resetFilters">重置</el-button>
                <el-button v-if="hasToolbar('search')" type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
                <el-button v-if="hasToolbar('create')" @click="openCreateDialog">新增</el-button>
                <el-button v-if="hasToolbar('export')" @click="exportRows">导出 Excel</el-button>
              </div>

              <div class="module-table-title">{{ schemaState.title }}</div>
              <el-table class="plant-table module-table" :data="pagedList" border stripe highlight-current-row :empty-text="'暂无' + schemaState.title + '数据'">
                <el-table-column v-for="column in schemaState.columns" :key="column.key" :prop="column.key" :label="column.label" :min-width="column.minWidth" show-overflow-tooltip>
                  <template slot-scope="{ row }">
                    <el-tag v-if="String(column.key).toLowerCase().indexOf('status') > -1 || column.key === 'result' || column.key === 'level'" size="mini" :type="tagType(formatCell(row, column))">{{ formatCell(row, column) }}</el-tag>
                    <span v-else>{{ formatCell(row, column) }}</span>
                  </template>
                </el-table-column>
                <el-table-column v-if="schemaState.rowActions && schemaState.rowActions.length" label="操作" min-width="180" fixed="right">
                  <template slot-scope="{ row }">
                    <div class="table-action-group">
                      <el-button v-for="action in schemaState.rowActions" :key="action.key" type="text" :class="{ 'is-danger': action.danger }" @click="handleRowAction(action, row)">{{ action.label }}</el-button>
                    </div>
                  </template>
                </el-table-column>
              </el-table>

              <div class="plant-pagination">
                <div class="plant-pagination__total">共 {{ filteredList.length }} 条</div>
                <el-pagination background layout="prev, pager, next, jumper, sizes" :page-sizes="[10, 20, 50]" :page-size="pageSize" :current-page.sync="currentPage" :total="filteredList.length" @current-change="handlePageChange" @size-change="handleSizeChange"></el-pagination>
              </div>
            </section>
          </template>

          <el-dialog :title="dialogMode === 'create' ? ('新增' + (schemaState.title || '记录')) : ('编辑' + (schemaState.title || '记录'))" :visible.sync="dialogVisible" width="560px">
            <el-form label-width="110px" @submit.native.prevent>
              <el-form-item v-for="column in dialogColumns" :key="column.key" :label="column.label">
                <el-input v-model.trim="dialogForm[column.key]" :placeholder="'请输入' + column.label"></el-input>
              </el-form-item>
            </el-form>
            <span slot="footer">
              <el-button @click="dialogVisible = false">取消</el-button>
              <el-button type="primary" @click="saveDialog">保存</el-button>
            </span>
          </el-dialog>

          <el-dialog :title="detailTitle || (schemaState.title + '详情')" :visible.sync="detailVisible" width="760px" top="8vh">
            <div v-if="detailRow" class="module-detail-panel">
              <div class="module-detail-panel__hero">
                <div class="module-detail-panel__title">{{ resolveSchemaTitleField(detailRow) }}</div>
                <div class="module-detail-panel__subtitle">{{ schemaState.title }} · 静态详情视图</div>
              </div>
              <div class="module-detail-grid">
                <div v-for="field in detailFields" :key="field.key" class="module-detail-item">
                  <div class="module-detail-item__label">{{ field.label }}</div>
                  <div class="module-detail-item__value">{{ formatDetailValue(field) }}</div>
                </div>
              </div>
            </div>
            <span slot="footer">
              <el-button @click="detailVisible = false">关闭</el-button>
            </span>
          </el-dialog>
        </template>

        <template v-else>
          <section class="module-tagbar">
            <span class="module-tag module-tag--active">{{ routeMeta.title || '模块页面' }}</span>
          </section>
          <section class="module-breadcrumb-card">
            <div class="placeholder-breadcrumb">{{ routeMeta.breadcrumb || '首页 / 模块页面' }}</div>
          </section>
          <section class="section-card placeholder-module-card">
            <div class="placeholder-module-card__icon"><i class="el-icon-data-line"></i></div>
            <div class="placeholder-module-card__title">{{ routeMeta.title || '模块页面' }}骨架已接入</div>
            <div class="placeholder-module-card__desc">该模块路由、菜单层级、标题和静态页面容器已经接入，下一步按目标站逐页做 1:1 还原。</div>
            <div class="placeholder-module-card__meta">
              <span>当前路由：{{ routeMeta.route || '--' }}</span>
              <span>状态：待精细还原</span>
            </div>
          </section>
        </template>
      </div>
    `
  });

  Vue.component('dashboard-page', {
    data: function () {
      return {
        metrics: clone(window.dashboardMetrics),
        trend: clone(window.dashboardTrend),
        heatmaps: clone(window.dashboardHeatmaps),
        factoryProgress: clone(window.dashboardFactoryProgress)
      };
    },
    template: `
      <div class="dashboard-editor-container">
        <section class="section-card section-card--compact">
          <div class="metric-grid">
            <core-card :card-info="metrics.cardDataOne"></core-card>
            <core-card v-for="(item, index) in metrics.cardData" :key="index" :card-info="item"></core-card>
          </div>
        </section>

        <section class="section-card">
          <line-chart title="近30天每日产量和发货量趋势" :chart-data="trend.lineChartDataOne"></line-chart>
        </section>

        <section class="section-card">
          <div class="map-section">
            <list-card title="30天扫码数量统计" :list-data="heatmaps.cardList1"></list-card>
            <div class="map-board">
              <shandong-map title="用户扫码分布热力图" :map-data="heatmaps.scanData" :pieces="heatmaps.customPieces"></shandong-map>
            </div>
            <list-card title="30天扫码产品统计" :list-data="heatmaps.cardList2"></list-card>
          </div>
        </section>

        <section class="section-card">
          <div class="map-section">
            <list-card title="30天异地扫码数量统计" :list-data="heatmaps.cardList11"></list-card>
            <div class="map-board">
              <shandong-map title="用户异地扫码分布热力图" :map-data="heatmaps.scanData1" :pieces="heatmaps.customPieces"></shandong-map>
            </div>
            <list-card title="30天异地扫码产品统计" :list-data="heatmaps.cardList22"></list-card>
          </div>
        </section>

        <section class="section-card">
          <div class="map-section">
            <list-card title="30天窜货预警数量统计" :list-data="heatmaps.cardList3"></list-card>
            <div class="map-board">
              <shandong-map title="稽查窜货预警热力图" :map-data="heatmaps.scanInspect" :pieces="heatmaps.customPieces"></shandong-map>
            </div>
            <list-card title="30天窜货预警产品统计" :list-data="heatmaps.cardList4"></list-card>
          </div>
        </section>

        <section class="section-card">
          <div class="factory-grid">
            <bar-chart title="当日工厂生产进度统计" :chart-data="factoryProgress.barChartData"></bar-chart>
            <bar-chart title="当日工厂发货进度统计" :chart-data="factoryProgress.barChartData2"></bar-chart>
          </div>
        </section>
      </div>
    `
  });

  Vue.component('board-kpi-card', {
    props: {
      item: {
        type: Object,
        default: function () {
          return {};
        }
      }
    },
    template: `
      <div class="board-kpi-card">
        <div class="board-kpi-card__title">{{ item.title }}</div>
        <div class="board-kpi-card__value">{{ item.value || '0' }}</div>
        <div v-if="item.subTitle" class="board-kpi-card__sub">{{ item.subTitle }}</div>
        <div v-if="item.subTitle" class="board-kpi-card__subvalue">{{ item.subValue || '0' }}</div>
      </div>
    `
  });

  Vue.component('dashboard-overview-page', {
    data: function () {
      return clone(window.boardOverviewData || {});
    },
    template: `
      <div class="ts-board-page ts-board-page--overview">
        <section class="section-card ts-board-card">
          <div class="ts-board-kpi-grid ts-board-kpi-grid--6">
            <board-kpi-card v-for="(item, index) in stats" :key="item.title + index" :item="item"></board-kpi-card>
          </div>
        </section>

        <section class="section-card ts-board-card">
          <line-chart
            title="近30天每日产量和发货量趋势"
            :chart-data="trend"
            :chart-options="{ colors: ['#4f8ffb', '#ff7b7b'], area: false, lineWidth: 2, legendIcon: 'circle', legendTop: 10, legendRight: 26, gridLeft: 18, gridRight: 18, gridTop: 48, gridBottom: 20, yMin: 0, yMax: 1, splitNumber: 5, titleTop: 8, xAxisLabelInterval: 2 }"></line-chart>
        </section>

        <section class="section-card ts-board-card">
          <div class="map-section">
            <list-card title="30天扫码数量统计" :list-data="lists.scanCount" :show-badge="false" :show-index="false" :center-title="true" :center-items="true" :plain="true" empty-text=""></list-card>
            <div class="map-board">
              <shandong-map title="用户扫码分布热力图-年" :map-data="maps.scan" :pieces="maps.pieces" :chart-options="{ titleTop: 6, mapTop: 38, mapBottom: 12, zoom: 1.14, visualOrient: 'vertical', visualRight: 14, visualBottom: 34, visualItemWidth: 14, visualItemHeight: 14, visualItemGap: 8, visualText: ['高', '低'], visualTextGap: 10, shadowBlur: 0, borderWidth: 1 }"></shandong-map>
            </div>
            <list-card title="30天扫码产品统计" :list-data="lists.scanProduct" :show-badge="false" :show-index="false" :center-title="true" :center-items="true" :plain="true" empty-text=""></list-card>
          </div>
        </section>

        <section class="section-card ts-board-card">
          <div class="map-section">
            <list-card title="30天异地扫码数量统计" :list-data="lists.diffCount" :show-badge="false" :show-index="false" :center-title="true" :center-items="true" :plain="true" empty-text=""></list-card>
            <div class="map-board">
              <shandong-map title="用户异地扫码分布热力图-年" :map-data="maps.diff" :pieces="maps.pieces" :chart-options="{ titleTop: 6, mapTop: 38, mapBottom: 12, zoom: 1.14, visualOrient: 'vertical', visualRight: 14, visualBottom: 34, visualItemWidth: 14, visualItemHeight: 14, visualItemGap: 8, visualText: ['高', '低'], visualTextGap: 10, shadowBlur: 0, borderWidth: 1 }"></shandong-map>
            </div>
            <list-card title="30天异地扫码产品统计" :list-data="lists.diffProduct" :show-badge="false" :show-index="false" :center-title="true" :center-items="true" :plain="true" empty-text=""></list-card>
          </div>
        </section>

        <section class="section-card ts-board-card">
          <div class="map-section">
            <list-card title="30天窜货预警数量统计" :list-data="lists.warningCount" :show-badge="false" :show-index="false" :center-title="true" :center-items="true" :plain="true" empty-text=""></list-card>
            <div class="map-board">
              <shandong-map title="稽查窜货预警热力图-年" :map-data="maps.inspect" :pieces="maps.pieces" :chart-options="{ titleTop: 6, mapTop: 38, mapBottom: 12, zoom: 1.14, visualOrient: 'vertical', visualRight: 14, visualBottom: 34, visualItemWidth: 14, visualItemHeight: 14, visualItemGap: 8, visualText: ['高', '低'], visualTextGap: 10, shadowBlur: 0, borderWidth: 1 }"></shandong-map>
            </div>
            <list-card title="30天窜货预警产品统计" :list-data="lists.warningProduct" :show-badge="false" :show-index="false" :center-title="true" :center-items="true" :plain="true" empty-text=""></list-card>
          </div>
        </section>

        <section class="section-card ts-board-card">
          <div class="factory-grid">
            <bar-chart title="当日工厂生产进度统计" :chart-data="progressCharts.production"></bar-chart>
            <bar-chart title="当日工厂发货进度统计" :chart-data="progressCharts.shipping"></bar-chart>
          </div>
        </section>
      </div>
    `
  });

  Vue.component('production-monitoring-page', {
    data: function () {
      var source = clone(window.productionMonitoringData || {});
      return {
        stats: source.stats || [],
        charts: source.charts || {},
        filters: source.filters || {},
        dataStatusOptions: source.dataStatusOptions || [],
        rows: source.rows || [],
        total: source.total || 0,
        pageSize: source.pageSize || 3,
        currentPage: 1
      };
    },
    computed: {
      pagedRows: function () {
        var start = (this.currentPage - 1) * this.pageSize;
        return this.rows.slice(start, start + this.pageSize);
      }
    },
    methods: {
      handleReset: function () {
        this.filters = clone((window.productionMonitoringData || {}).filters || {});
        this.currentPage = 1;
      }
    },
    template: `
      <div class="ts-board-page ts-board-page--production">
        <section class="section-card ts-board-card">
          <div class="ts-board-kpi-grid ts-board-kpi-grid--4">
            <board-kpi-card v-for="(item, index) in stats" :key="item.title + index" :item="item"></board-kpi-card>
          </div>
        </section>
        <section class="section-card ts-board-card"><bar-chart title="当日工厂生产进度统计" :chart-data="charts.progress" :chart-options="{ titleTop: 8, legendTop: 8, legendRight: 16, gridTop: 56, gridBottom: 28, gridLeft: 30, gridRight: 20, yMin: 0, yMax: 1, splitNumber: 5 }"></bar-chart></section>
        <section class="section-card ts-board-card"><line-chart title="生产节拍监控" :chart-data="charts.rhythm" :chart-options="{ colors: ['#2f7df6', '#f05a4a', '#2eaa58'], areaColors: ['rgba(47,125,246,0.12)', 'rgba(240,90,74,0.08)', 'rgba(46,170,88,0.08)'], lineWidth: 2, symbolSize: 3, showSymbol: true, yMin: 0, yMax: 350, splitNumber: 7, legendTop: 8, legendRight: 12, gridTop: 52, gridBottom: 28 }"></line-chart></section>
        <section class="section-card ts-board-card"><line-chart title="采集率状态" :chart-data="charts.collectStatus" :chart-options="{ colors: ['#2f7df6', '#f05a4a', '#2eaa58'], areaColors: ['rgba(47,125,246,0.12)', 'rgba(240,90,74,0.08)', 'rgba(46,170,88,0.08)'], lineWidth: 2, symbolSize: 3, showSymbol: true, yMin: 0, yMax: 350, splitNumber: 7, legendTop: 8, legendRight: 12, gridTop: 52, gridBottom: 28 }"></line-chart></section>
        <section class="section-card ts-board-card">
          <div class="ts-filter-grid ts-filter-grid--production">
            <div class="ts-filter-item ts-filter-item--wide ts-filter-item--date"><label>生产时间</label><el-date-picker v-model="filters.dateRange" type="daterange" value-format="yyyy-MM-dd" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker></div>
            <div class="ts-filter-item"><label>工厂</label><el-select v-model="filters.factory" clearable placeholder="请选择"></el-select></div>
            <div class="ts-filter-item"><label>车间</label><el-select v-model="filters.workshop" clearable placeholder="请选择"></el-select></div>
            <div class="ts-filter-item"><label>产线</label><el-select v-model="filters.line" clearable placeholder="请选择"></el-select></div>
            <div class="ts-filter-item"><label>生产班组</label><el-input v-model="filters.team" placeholder="请输入生产班组"></el-input></div>
            <div class="ts-filter-item"><label>数据状态</label><el-select v-model="filters.dataStatus" clearable placeholder="请选择"><el-option v-for="item in dataStatusOptions" :key="item" :label="item" :value="item"></el-option></el-select></div>
            <div class="ts-filter-actions"><el-button @click="handleReset">重置</el-button><el-button type="primary">搜索</el-button><el-button type="primary">导出Excel</el-button></div>
          </div>
        </section>
        <section class="section-card ts-board-card ts-table-card">
          <div class="ts-table-card__title">生产数据明细表</div>
          <el-table class="legacy-table" :data="pagedRows" border>
            <el-table-column prop="factory" label="工厂" min-width="150"></el-table-column>
            <el-table-column prop="workshop" label="车间" min-width="130"></el-table-column>
            <el-table-column prop="line" label="产线" min-width="110"></el-table-column>
            <el-table-column prop="team" label="班组" min-width="100"></el-table-column>
            <el-table-column prop="orderNo" label="订单" min-width="120"></el-table-column>
            <el-table-column prop="product" label="产品" min-width="170"></el-table-column>
            <el-table-column prop="spec" label="规格" min-width="90"></el-table-column>
            <el-table-column prop="planQty" label="计划生产数量" min-width="110"></el-table-column>
            <el-table-column prop="confirmQty" label="人工确认数量" min-width="110"></el-table-column>
            <el-table-column prop="batchNo" label="批次号" min-width="110"></el-table-column>
            <el-table-column prop="expireDate" label="有效期" min-width="120"></el-table-column>
            <el-table-column prop="level1CollectQty" label="1级采集数量" min-width="110"></el-table-column>
            <el-table-column prop="level1ProductionQty" label="1级生产数量" min-width="110"></el-table-column>
            <el-table-column prop="level1Ratio" label="1级采集率" min-width="100"></el-table-column>
            <el-table-column prop="level2CollectQty" label="2级采集数量" min-width="110"></el-table-column>
            <el-table-column prop="level2ProductionQty" label="2级生产数量" min-width="110"></el-table-column>
            <el-table-column prop="level2Ratio" label="2级采集率" min-width="100"></el-table-column>
            <el-table-column prop="level3CollectQty" label="3级采集数量" min-width="110"></el-table-column>
            <el-table-column prop="level3ProductionQty" label="3级生产数量" min-width="110"></el-table-column>
            <el-table-column prop="level3Ratio" label="3级采集率" min-width="100"></el-table-column>
            <el-table-column prop="level4CollectQty" label="4级采集数量" min-width="110"></el-table-column>
            <el-table-column prop="level4ProductionQty" label="4级生产数量" min-width="110"></el-table-column>
            <el-table-column prop="level4Ratio" label="4级采集率" min-width="100"></el-table-column>
            <el-table-column prop="level5CollectQty" label="5级采集数量" min-width="110"></el-table-column>
            <el-table-column prop="level5ProductionQty" label="5级生产数量" min-width="110"></el-table-column>
            <el-table-column prop="level5Ratio" label="5级采集率" min-width="100"></el-table-column>
            <el-table-column prop="productionStartTime" label="生产开始时间" min-width="150"></el-table-column>
            <el-table-column prop="orderCompleteTime" label="工单完成时间" min-width="150"></el-table-column>
            <el-table-column prop="planStartTime" label="计划开始时间" min-width="150"></el-table-column>
            <el-table-column prop="planEndTime" label="计划完成时间" min-width="150"></el-table-column>
            <el-table-column prop="planDate" label="计划生产日期" min-width="140"></el-table-column>
            <el-table-column prop="productionStatus" label="生产状态" min-width="110"></el-table-column>
            <el-table-column prop="qualityStatus" label="质检状态" min-width="110"></el-table-column>
          </el-table>
          <div class="legacy-pagination">
            <div class="legacy-pagination__total">共 {{ total }} 条</div>
            <el-pagination background layout="prev, pager, next, jumper, sizes" :page-size="pageSize" :page-sizes="[3]" :current-page.sync="currentPage" :total="total"></el-pagination>
          </div>
        </section>
      </div>
    `
  });

  Vue.component('warehouse-logistics-page', {
    data: function () {
      var source = clone(window.warehouseLogisticsData || {});
      return {
        stats: source.stats || [],
        charts: source.charts || {},
        filters: source.filters || {},
        statusOptions: source.statusOptions || [],
        rows: source.rows || [],
        total: source.total || 0,
        pageSize: source.pageSize || 3,
        currentPage: 1
      };
    },
    computed: {
      pagedRows: function () {
        var start = (this.currentPage - 1) * this.pageSize;
        return this.rows.slice(start, start + this.pageSize);
      }
    },
    methods: {
      handleReset: function () {
        this.filters = clone((window.warehouseLogisticsData || {}).filters || {});
        this.currentPage = 1;
      }
    },
    template: `
      <div class="ts-board-page ts-board-page--warehouse">
        <section class="section-card ts-board-card">
          <div class="ts-board-kpi-grid ts-board-kpi-grid--3">
            <board-kpi-card v-for="(item, index) in stats" :key="item.title + index" :item="item"></board-kpi-card>
          </div>
        </section>
        <section class="section-card ts-board-card"><line-chart title="当月出库数量趋势图" :chart-data="charts.outboundTrend" :chart-options="{ colors: ['#4f8ffb'], area: false, lineWidth: 2, yMin: 0, yMax: 1, splitNumber: 5, titleTop: 8, legendTop: 8, legendRight: 18, gridTop: 48, gridBottom: 20, xAxisLabelInterval: 1 }"></line-chart></section>
        <section class="section-card ts-board-card"><bar-chart title="当月发货产品数" :chart-data="charts.productCount" :chart-options="{ colors: ['#2f7df6'], titleTop: 8, legendTop: 8, legendRight: 18, gridTop: 50, gridBottom: 26 }"></bar-chart></section>
        <section class="section-card ts-board-card"><line-chart title="近30天发货扫码率趋势图" :chart-data="charts.codeRate" :chart-options="{ colors: ['#4f8ffb'], area: false, lineWidth: 2, yMin: 0, yMax: 1, splitNumber: 5, titleTop: 8, legendTop: 8, legendRight: 18, gridTop: 48, gridBottom: 20, xAxisLabelInterval: 2 }"></line-chart></section>
        <section class="section-card ts-board-card">
          <div class="ts-filter-grid ts-filter-grid--warehouse">
            <div class="ts-filter-item ts-filter-item--wide ts-filter-item--date"><label>日期服务</label><el-date-picker v-model="filters.dateRange" type="daterange" value-format="yyyy-MM-dd" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker></div>
            <div class="ts-filter-item"><label>发货仓库编码</label><el-input v-model="filters.shipWarehouseCode" placeholder="请输入仓库名称"></el-input></div>
            <div class="ts-filter-item"><label>收货仓库编码</label><el-input v-model="filters.receiveWarehouseCode" placeholder="请输入仓库名称"></el-input></div>
            <div class="ts-filter-item"><label>状态</label><el-select v-model="filters.status" clearable placeholder="请选择状态"><el-option v-for="item in statusOptions" :key="item" :label="item" :value="item"></el-option></el-select></div>
            <div class="ts-filter-item"><label>承运商</label><el-input v-model="filters.carrier" placeholder="请输入承运商"></el-input></div>
            <div class="ts-filter-actions"><el-button @click="handleReset">重置</el-button><el-button type="primary">搜索</el-button></div>
          </div>
        </section>
        <section class="section-card ts-board-card ts-table-card">
          <div class="ts-table-card__title">当日出库订单状态表</div>
          <el-table class="legacy-table" :data="pagedRows" border>
            <el-table-column prop="billNo" label="运单号" min-width="170"></el-table-column>
            <el-table-column prop="outboundNo" label="出库单号" min-width="170"></el-table-column>
            <el-table-column prop="outboundTime" label="出库时间" min-width="150"></el-table-column>
            <el-table-column prop="shipWarehouseCode" label="发货仓库编码" min-width="120"></el-table-column>
            <el-table-column prop="shipWarehouse" label="发货仓库" min-width="120"></el-table-column>
            <el-table-column prop="customerCode" label="客户编码" min-width="120"></el-table-column>
            <el-table-column prop="customerName" label="客户名称" min-width="130"></el-table-column>
            <el-table-column prop="customerAddress" label="客户地址" min-width="140"></el-table-column>
            <el-table-column prop="productCode" label="产品编码" min-width="100"></el-table-column>
            <el-table-column prop="productName" label="产品名称" min-width="130"></el-table-column>
            <el-table-column prop="unit" label="单位" min-width="80"></el-table-column>
            <el-table-column prop="planQty" label="计划出库数量" min-width="110"></el-table-column>
            <el-table-column prop="confirmQty" label="出库人工确认数量" min-width="130"></el-table-column>
            <el-table-column prop="scanQty" label="扫码数量" min-width="90"></el-table-column>
            <el-table-column prop="shipStatus" label="发货状态" min-width="90"></el-table-column>
          </el-table>
          <div class="legacy-pagination">
            <div class="legacy-pagination__total">共 {{ total }} 条</div>
            <el-pagination background layout="prev, pager, next, jumper, sizes" :page-size="pageSize" :page-sizes="[3]" :current-page.sync="currentPage" :total="total"></el-pagination>
          </div>
        </section>
      </div>
    `
  });

  Vue.component('inspection-management-page', {
    data: function () {
      return clone(window.inspectionManagementData || {});
    },
    template: `
      <div class="ts-board-page ts-board-page--inspection">
        <section class="section-card ts-board-card">
          <div class="ts-board-kpi-grid ts-board-kpi-grid--2">
            <board-kpi-card v-for="(item, index) in stats" :key="item.title + index" :item="item"></board-kpi-card>
          </div>
        </section>
        <section class="section-card ts-board-card">
          <div class="ts-inspection-map">
            <shandong-map :title="mapTitle" :map-data="mapData" :pieces="mapPieces" :chart-options="{ titleTop: 6, mapTop: 42, mapBottom: 18, zoom: 1.16, visualOrient: 'vertical', visualRight: 18, visualBottom: 44, visualItemWidth: 14, visualItemHeight: 14, visualItemGap: 8, visualText: ['高', '低'], visualTextGap: 10, shadowBlur: 0, borderWidth: 1 }"></shandong-map>
          </div>
        </section>
      </div>
    `
  });

  Vue.component('scada-gauge', {
    mixins: [chartResizeMixin],
    props: {
      item: Object
    },
    data: function () {
      return { chart: null };
    },
    mounted: function () {
      this.chart = echarts.init(this.$refs.canvas);
      this.renderChart();
    },
    watch: {
      item: {
        deep: true,
        handler: function () {
          this.renderChart();
        }
      }
    },
    methods: {
      renderChart: function () {
        if (!this.chart || !this.item) return;
        this.chart.setOption({
          series: [{
            type: 'gauge',
            startAngle: 200,
            endAngle: -20,
            min: 0,
            max: 100,
            progress: { show: true, width: 10, roundCap: true, itemStyle: { color: '#27ff6d' } },
            axisLine: { lineStyle: { width: 10, color: [[0.8, '#ff2e2e'], [0.95, '#ffe100'], [1, '#27ff6d']] } },
            splitLine: { distance: -12, length: 8, lineStyle: { color: '#fff', width: 2 } },
            axisTick: { show: false },
            axisLabel: { color: '#fff', distance: -28, fontSize: 8 },
            anchor: { show: false },
            pointer: { width: 4, itemStyle: { color: '#27ff6d' } },
            title: { show: false },
            detail: { valueAnimation: false, formatter: '{value}%', color: '#2aff4d', fontSize: 22, offsetCenter: [0, '58%'] },
            data: [{ value: this.item.rate }]
          }]
        });
      }
    },
    template: '<div ref="canvas" class="scada-gauge"></div>'
  });

  Vue.component('scada-dashboard-page', {
    data: function () {
      return {
        source: clone(window.scadaDashboardData || {}),
        nowText: formatDateTime(new Date()),
        showDetail: !!getHashQueryParam('worklineCode')
      };
    },
    created: function () {
      var self = this;
      this.timer = setInterval(function () {
        self.nowText = formatDateTime(new Date());
        self.showDetail = !!getHashQueryParam('worklineCode');
      }, 1000);
    },
    beforeDestroy: function () {
      clearInterval(this.timer);
    },
    methods: {
      openLineDetail: function (code) {
        window.location.hash = '#/scada-dashboard?worklineCode=' + code;
        this.showDetail = true;
      },
      backToLines: function () {
        window.location.hash = '#/scada-dashboard';
        this.showDetail = false;
      },
      cameraRingStyle: function (rate) {
        return { background: 'conic-gradient(#23ff50 ' + (rate * 3.6) + 'deg, rgba(255,255,255,0.08) 0)' };
      }
    },
    template: `
      <div>
        <div v-if="!showDetail" class="ts-board-page">
          <section class="section-card ts-board-card">
            <div class="scada-line-list">
              <div v-for="line in source.lines" :key="line.code" class="scada-line-card" @dblclick="openLineDetail(line.code)">
                <div class="scada-line-card__title">{{ line.lineName }} / {{ line.code }}</div>
                <div>工单：{{ line.orderNo }}</div>
                <div>生产进度：{{ line.progress }}</div>
                <div>最后上传：{{ line.lastUpload }}</div>
                <div>报警数量：{{ line.alarmCount }}</div>
                <div class="scada-line-card__hint">双击查看详情</div>
              </div>
            </div>
          </section>
        </div>
        <div v-else class="scada-screen">
          <div class="scada-screen__header">
            <div class="scada-screen__brand"><img src="assets/images/logo.png" alt="logo"></div>
            <div class="scada-screen__title">{{ source.detail.title }}</div>
            <div class="scada-screen__meta">
              <div>👤 弥特测试</div>
              <div>{{ nowText }}</div>
            </div>
          </div>
          <div class="scada-screen__subbar">
            <span>工厂: <em>{{ source.detail.factory }}</em></span>
            <span>车间: <em>{{ source.detail.workshop }}</em></span>
            <span>产线: <em>{{ source.detail.line }}</em></span>
            <span>工单号: <em>{{ source.detail.orderNo }}</em></span>
            <span>产品: <em>{{ source.detail.product }}</em></span>
            <span>批次: <em>{{ source.detail.batch }}</em></span>
            <span>日期: <em>{{ source.detail.date }}</em></span>
            <button type="button" class="scada-back-btn" @click="backToLines">← 返回产线列表</button>
          </div>
          <div class="scada-screen__body">
            <div class="scada-main">
              <div class="scada-top-grid">
                <div class="scada-progress-card">
                  <div class="scada-panel-title">生产进度</div>
                  <div class="scada-progress-bar"><span :style="{ width: source.detail.progress + '%' }"></span><strong>{{ source.detail.progress }}%</strong></div>
                  <div class="scada-progress-row"><span>已采集:</span><b>{{ source.detail.collected }}</b></div>
                  <div class="scada-progress-row"><span>计划数量:</span><b>{{ source.detail.planQty }}</b></div>
                </div>
                <div class="scada-gauge-panel">
                  <div class="scada-panel-title">设备关联率</div>
                  <div class="scada-gauge-grid">
                    <div v-for="item in source.detail.gauges" :key="item.name" class="scada-gauge-card">
                      <scada-gauge :item="item"></scada-gauge>
                      <div class="scada-gauge-card__name">{{ item.name }}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="scada-machine-grid">
                <div v-for="machine in source.detail.machines" :key="machine.name" class="scada-machine-card">
                  <div class="scada-machine-card__head"><span>{{ machine.name }}</span><em>运行中</em></div>
                  <div class="scada-metrics-grid">
                    <div class="scada-mini-card"><label>关联级别</label><strong>{{ machine.relationType }}</strong></div>
                    <div class="scada-mini-card"><label>采集数量</label><strong>{{ machine.collectQty }}</strong></div>
                    <div class="scada-mini-card scada-mini-card--success"><label>关联率</label><strong>{{ machine.relationRate }}</strong></div>
                    <div class="scada-mini-card scada-mini-card--danger"><label>报警次数</label><strong>{{ machine.alarmCount }}</strong></div>
                  </div>
                  <div class="scada-camera-title">相机监控</div>
                  <div class="scada-camera-grid">
                    <div v-for="camera in machine.cameras" :key="camera.name" class="scada-camera-card">
                      <div class="scada-camera-card__head"><span>{{ camera.name }}</span><em>在线</em></div>
                      <div class="scada-camera-card__body">
                        <div class="scada-camera-ring" :style="cameraRingStyle(camera.rate)"><span>{{ camera.rate }}%</span></div>
                        <div class="scada-camera-stats">
                          <div><b>{{ camera.collectQty }}</b><span>采集数</span></div>
                          <div><b>{{ camera.failQty }}</b><span>失败数</span></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="scada-alerts">
              <div class="scada-alerts__block">
                <div class="scada-alerts__title">最新预警信息</div>
                <div v-for="(item, index) in source.detail.latestAlerts" :key="item.title + index" class="scada-alert-card">
                  <div><strong>{{ item.title }}</strong><span>{{ item.time }}</span></div>
                  <p>{{ item.desc }}</p>
                </div>
              </div>
              <div class="scada-alerts__block">
                <div class="scada-alerts__title scada-alerts__title--history">历史预警</div>
                <div class="scada-alerts__history">
                  <div v-for="(item, index) in source.detail.historyAlerts" :key="item.title + index" class="scada-alert-card is-history">
                    <div><strong>{{ item.title }}</strong><span>{{ item.time }}</span></div>
                    <p>{{ item.desc }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
  });

  Vue.component('freight-page', {
    data: function () {
      return {
        filters: {
          billNo: '',
          productCode: '',
          outboundNo: '',
          customerName: '',
          outboundDate: [],
          createdAt: [],
          warehouseCode: '',
          shipStatus: ''
        },
        statusOptions: ['待发货', '已发货', '部分发货'],
        rows: [
          {
            id: 1,
            billNo: 'YD2026042601',
            outboundNo: 'CK2026042601',
            outboundTime: '2026-04-26 09:20:11',
            shipWarehouseCode: 'JN001',
            shipWarehouse: '济南成品仓',
            customerCode: 'KH001',
            customerName: '广东发财商贸有限公司',
            customerAddress: '广东省广州市白云区',
            productCode: 'cjs1',
            productName: '纯净水500ml',
            unit: '箱',
            planQty: 0,
            confirmQty: 0,
            scanQty: 0,
            shipStatus: '待发货',
            remark: ''
          }
        ],
        productBatchRows: [],
        pageSize: 10,
        currentPage: 1,
        batchPage: 1
      };
    },
    computed: {
      pagedRows: function () {
        var start = (this.currentPage - 1) * this.pageSize;
        return this.rows.slice(start, start + this.pageSize);
      }
    },
    methods: {
      handleReset: function () {
        this.filters = {
          billNo: '',
          productCode: '',
          outboundNo: '',
          customerName: '',
          outboundDate: [],
          createdAt: [],
          warehouseCode: '',
          shipStatus: ''
        };
        this.currentPage = 1;
      },
      handleAction: function (action) {
        var tips = {
          export: '已导出静态运单数据',
          template: '已生成静态导入模板',
          import: '静态演示页未接入导入能力',
          create: '静态演示页未接入新增出库单能力'
        };
        this.$message({
          type: action === 'import' ? 'warning' : 'success',
          message: tips[action] || '操作已完成'
        });
      }
    },
    template: `
      <div class="plant-page">
        <section class="legacy-breadcrumb">物流管理 / 运单管理</section>

        <section class="section-card legacy-card legacy-filter-card">
          <div class="legacy-filter-grid">
            <div class="legacy-filter-item"><label class="legacy-filter-item__label">运单号</label><el-input v-model.trim="filters.billNo" placeholder="请输入运单号"></el-input></div>
            <div class="legacy-filter-item"><label class="legacy-filter-item__label">产品编码</label><el-input v-model.trim="filters.productCode" placeholder="请输入产品名称"></el-input></div>
            <div class="legacy-filter-item"><label class="legacy-filter-item__label">出库单号</label><el-input v-model.trim="filters.outboundNo" placeholder="请输入出库单号"></el-input></div>
            <div class="legacy-filter-item"><label class="legacy-filter-item__label">客户名称</label><el-input v-model.trim="filters.customerName" placeholder="请输入客户名称"></el-input></div>
            <div class="legacy-filter-item is-wide"><label class="legacy-filter-item__label">出库日期</label><el-date-picker v-model="filters.outboundDate" type="daterange" value-format="yyyy-MM-dd" range-separator="-" start-placeholder="开始日" end-placeholder="结束日" style="width:100%;"></el-date-picker></div>
            <div class="legacy-filter-item is-wide"><label class="legacy-filter-item__label">创建时间</label><el-date-picker v-model="filters.createdAt" type="daterange" value-format="yyyy-MM-dd" range-separator="-" start-placeholder="开始日" end-placeholder="结束日" style="width:100%;"></el-date-picker></div>
            <div class="legacy-filter-item"><label class="legacy-filter-item__label">仓库编码</label><el-input v-model.trim="filters.warehouseCode" placeholder="请输入仓库编码"></el-input></div>
            <div class="legacy-filter-item"><label class="legacy-filter-item__label">发货状态</label><el-select v-model="filters.shipStatus" clearable placeholder="请选择发货状态"><el-option v-for="item in statusOptions" :key="item" :label="item" :value="item"></el-option></el-select></div>
          </div>

          <div class="legacy-toolbar-actions legacy-toolbar-actions--ts legacy-toolbar-actions--wrap">
            <el-button size="mini" @click="handleReset">重置</el-button>
            <el-button size="mini" type="primary" icon="el-icon-search">搜索</el-button>
            <el-button size="mini" type="primary" @click="handleAction('export')">导出Excel</el-button>
            <el-button size="mini" type="primary" @click="handleAction('template')">下载导入模板</el-button>
            <el-button size="mini" type="primary" @click="handleAction('import')">导入</el-button>
            <el-button size="mini" type="primary" @click="handleAction('create')">新增出库单</el-button>
          </div>
        </section>

        <section class="section-card legacy-card legacy-table-card">
          <div class="legacy-table-card__title">运单管理</div>
          <el-table class="legacy-table" :data="pagedRows" border empty-text="暂无数据">
            <el-table-column prop="billNo" label="运单号" min-width="190"></el-table-column>
            <el-table-column prop="outboundNo" label="出库单号" min-width="170"></el-table-column>
            <el-table-column prop="outboundTime" label="出库时间" min-width="150"></el-table-column>
            <el-table-column prop="shipWarehouseCode" label="发货仓库编码" min-width="120"></el-table-column>
            <el-table-column prop="shipWarehouse" label="发货仓库" min-width="120"></el-table-column>
            <el-table-column prop="customerCode" label="客户编码" min-width="120"></el-table-column>
            <el-table-column prop="customerName" label="客户名称" min-width="180"></el-table-column>
            <el-table-column prop="customerAddress" label="客户地址" min-width="170"></el-table-column>
            <el-table-column prop="productCode" label="产品编码" min-width="100"></el-table-column>
            <el-table-column prop="productName" label="产品名称" min-width="130"></el-table-column>
            <el-table-column prop="unit" label="单位" min-width="80"></el-table-column>
            <el-table-column prop="planQty" label="计划出库数量" min-width="110"></el-table-column>
            <el-table-column prop="confirmQty" label="出库人工确认数量" min-width="130"></el-table-column>
            <el-table-column prop="scanQty" label="扫码数量" min-width="90"></el-table-column>
            <el-table-column prop="shipStatus" label="发货状态" min-width="100"></el-table-column>
            <el-table-column prop="remark" label="备注" min-width="120"></el-table-column>
            <el-table-column label="操作" width="110" fixed="right">
              <template slot-scope="{ row }">
                <el-button size="mini" type="primary" @click="$message.info('静态演示：查看运单 ' + row.billNo)">查看</el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="legacy-pagination">
            <div class="legacy-pagination__total">共 {{ rows.length }} 条</div>
            <el-pagination background layout="prev, pager, next, jumper, sizes" :page-sizes="[10]" :page-size="pageSize" :current-page.sync="currentPage" :total="rows.length"></el-pagination>
          </div>
        </section>

        <section class="section-card legacy-card legacy-table-card">
          <div class="legacy-table-card__title">产品批次表</div>
          <el-table class="legacy-table" :data="productBatchRows" border empty-text="暂无数据">
            <el-table-column prop="outboundNo" label="出库单号" min-width="160"></el-table-column>
            <el-table-column prop="productCode" label="产品编码" min-width="120"></el-table-column>
            <el-table-column prop="productName" label="产品名称" min-width="150"></el-table-column>
            <el-table-column prop="batchNo" label="批次" min-width="120"></el-table-column>
            <el-table-column prop="planBatch" label="计划批次" min-width="120"></el-table-column>
            <el-table-column prop="planQty" label="计划出库数量" min-width="110"></el-table-column>
            <el-table-column prop="scanQty" label="扫码出库数量" min-width="110"></el-table-column>
            <el-table-column prop="actualQty" label="实际出库数量" min-width="110"></el-table-column>
            <el-table-column prop="createdAt" label="创建时间" min-width="150"></el-table-column>
          </el-table>

          <div class="legacy-pagination">
            <div class="legacy-pagination__total">共 {{ productBatchRows.length }} 条</div>
            <el-pagination background layout="prev, pager, next, jumper, sizes" :page-sizes="[10]" :page-size="10" :current-page.sync="batchPage" :total="productBatchRows.length"></el-pagination>
          </div>
        </section>

        <button type="button" class="legacy-floating-settings" @click="$message.info('静态演示页暂未接入该设置能力')">
          <i class="el-icon-setting"></i>
        </button>
      </div>
    `
  });

  Vue.component('dragpage-editor-page', {
    data: function () {
      return {
        blocks: [
          { key: 'carousel', label: '轮播图', icon: 'el-icon-picture-outline' },
          { key: 'image', label: '图片', icon: 'el-icon-picture' },
          { key: 'text', label: '文本', icon: 'el-icon-document' },
          { key: 'graphic', label: '图文', icon: 'el-icon-postcard' },
          { key: 'shield', label: '防伪标识', icon: 'el-icon-medal' },
          { key: 'detail', label: '产品详情', icon: 'el-icon-shopping-bag-2' },
          { key: 'space', label: '上下间距', icon: 'el-icon-sort' },
          { key: 'divider', label: '分隔线', icon: 'el-icon-minus' }
        ],
        pageLayouts: ['默认布局'],
        pageForm: {
          layout: '默认布局',
          bgColor: '#ffffff',
          bgImageName: '',
          sidePadding: 24,
          remark: '两面针H5自定义页面'
        },
        infoRows: [
          { label: '产品名称:', value: 'product_name' },
          { label: '规格:', value: 'specs' },
          { label: '首次扫码时间:', value: 'create_time' },
          { label: '扫码次数:', value: 'count' },
          { label: '生产时间:', value: 'productTime' },
          { label: '有效期:', value: 'periodDate' }
        ]
      };
    },
    methods: {
      handlePaletteClick: function (item) {
        this.$message.success('静态演示：已选中组件「' + item.label + '」');
      }
    },
    template: `
      <div class="dragpage-editor">
        <div class="dragpage-editor__sidebar">
          <button v-for="item in blocks" :key="item.key" type="button" class="dragpage-block" @click="handlePaletteClick(item)">
            <i :class="item.icon"></i>
            <span>{{ item.label }}</span>
          </button>
        </div>

        <div class="dragpage-editor__stage">
          <div class="dragpage-phone">
            <div class="dragpage-phone__notch">
              <span></span>
              <em></em>
            </div>
            <div class="dragpage-phone__statusbar">
              <span>9:41 AM</span>
              <span>100%</span>
            </div>
            <div class="dragpage-phone__page-title">查询结果</div>
            <div class="dragpage-phone__hero">
              <img src="assets/images/logo.png" alt="logo">
              <div class="dragpage-phone__hero-banner"></div>
            </div>
            <div class="dragpage-phone__section-title">溯源信息查询</div>
            <div class="dragpage-phone__auth-card">
              <div class="dragpage-phone__auth-title">官方正品</div>
              <div class="dragpage-phone__auth-desc">该产品信息已通过数字化溯源系统认证</div>
            </div>
            <div class="dragpage-phone__info-list">
              <div v-for="row in infoRows" :key="row.label" class="dragpage-phone__info-row">
                <label>{{ row.label }}</label>
                <span>{{ row.value }}</span>
              </div>
            </div>
            <button type="button" class="dragpage-phone__submit">提交页面</button>
          </div>
        </div>

        <div class="dragpage-editor__settings">
          <div class="dragpage-settings-card">
            <div class="dragpage-settings-card__title">页面</div>
            <el-select v-model="pageForm.layout" placeholder="请选择布局">
              <el-option v-for="item in pageLayouts" :key="item" :label="item" :value="item"></el-option>
            </el-select>
          </div>

          <div class="dragpage-settings-card">
            <div class="dragpage-settings-card__note">页面基础设置（轮播图左右边距固定为0）</div>
          </div>

          <div class="dragpage-settings-card">
            <div class="dragpage-settings-row">
              <label>背景颜色</label>
              <input v-model="pageForm.bgColor" type="color" class="dragpage-color-input">
            </div>
            <div class="dragpage-settings-row">
              <label>背景图片</label>
              <div class="dragpage-settings-actions">
                <el-button type="primary" size="mini">上传图片</el-button>
                <el-button size="mini">清空</el-button>
              </div>
            </div>
            <div class="dragpage-settings-row">
              <label>左右边距</label>
              <el-input-number v-model="pageForm.sidePadding" :min="0" :max="48" size="mini"></el-input-number>
            </div>
            <div class="dragpage-settings-row dragpage-settings-row--textarea">
              <label>页面备注</label>
              <el-input v-model="pageForm.remark" type="textarea" :rows="4"></el-input>
            </div>
          </div>
        </div>

        <button type="button" class="legacy-floating-settings" @click="$message.info('静态演示页暂未接入该设置能力')">
          <i class="el-icon-setting"></i>
        </button>
      </div>
    `
  });

  Vue.component('plant-list-page', {
    data: function () {
      return {
        sourceList: clone(window.plantListModuleData.list),
        factoryTypes: clone(window.plantListModuleData.factoryTypes),
        pageSize: window.plantListModuleData.pageSize || 10,
        currentPage: 1,
        filterForm: {
          factoryCode: '',
          factoryType: ''
        },
        dialogVisible: false,
        dialogMode: 'create',
        dialogForm: createPlantForm()
      };
    },
    computed: {
      filteredList: function () {
        var code = (this.filterForm.factoryCode || '').trim().toLowerCase();
        var type = this.filterForm.factoryType;
        return this.sourceList.filter(function (item) {
          var codeMatched = !code || String(item.factoryCode || '').toLowerCase().indexOf(code) > -1;
          var typeMatched = !type || item.factoryType === type;
          return codeMatched && typeMatched;
        });
      },
      pagedList: function () {
        var start = (this.currentPage - 1) * this.pageSize;
        return this.filteredList.slice(start, start + this.pageSize);
      }
    },
    watch: {
      filteredList: function (list) {
        var maxPage = Math.max(1, Math.ceil(list.length / this.pageSize));
        if (this.currentPage > maxPage) {
          this.currentPage = maxPage;
        }
      }
    },
    methods: {
      handleSearch: function () {
        this.currentPage = 1;
      },
      handleReset: function () {
        this.filterForm.factoryCode = '';
        this.filterForm.factoryType = '';
        this.currentPage = 1;
      },
      handlePageChange: function (page) {
        this.currentPage = page;
      },
      openCreateDialog: function () {
        this.dialogMode = 'create';
        this.dialogForm = createPlantForm();
        this.dialogVisible = true;
      },
      openEditDialog: function (row) {
        this.dialogMode = 'edit';
        this.dialogForm = clone(row);
        this.dialogVisible = true;
      },
      submitDialog: function () {
        var form = this.dialogForm;
        if (!form.factoryCode || !form.factoryName || !form.factoryType || !form.address) {
          this.$message.warning('请先完整填写工厂信息');
          return;
        }

        if (this.dialogMode === 'create') {
          form.id = Date.now();
          this.sourceList.unshift(clone(form));
          this.$message.success('已新增静态工厂数据');
        } else {
          var target = this.sourceList.find(function (item) {
            return item.id === form.id;
          });
          if (target) {
            Object.assign(target, clone(form));
          }
          this.$message.success('已更新静态工厂数据');
        }

        this.dialogVisible = false;
        this.currentPage = 1;
      },
      confirmDelete: function (row) {
        var self = this;
        this.$confirm('确认删除该工厂记录吗？此操作仅影响本地演示数据。', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(function () {
          self.sourceList = self.sourceList.filter(function (item) {
            return item.id !== row.id;
          });
          self.$message.success('已删除本地演示数据');
        }).catch(function () {});
      },
      goWorkshopList: function () {
        window.location.hash = '#/workshoplist';
        this.$message.info('已切换到车间列表演示页，可继续扩展工厂联动');
      },
      goLineList: function () {
        window.location.hash = '#/workline';
        this.$message.info('静态导出会下载当前筛选结果 CSV 文件');
      },
      exportExcel: function () {
        var rows = [['工厂编号', '工厂名称', '工厂类别', '地址', '关联部门编码']];
        this.filteredList.forEach(function (item) {
          rows.push([item.factoryCode, item.factoryName, item.factoryType, item.address, item.departmentCode]);
        });
        downloadCsv('工厂列表-静态导出.csv', rows);
        this.$message.success('已导出本地静态 CSV');
      }
    },
    template: `
      <div class="plant-page">
        <section class="module-tagbar">
          <span class="module-tag module-tag--active">工厂列表</span>
        </section>

        <section class="module-breadcrumb-card">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item>生产管理</el-breadcrumb-item>
            <el-breadcrumb-item>工厂列表</el-breadcrumb-item>
          </el-breadcrumb>
        </section>

        <section class="section-card plant-module-card">
          <div class="plant-toolbar">
            <div class="plant-toolbar__filters">
              <div class="plant-filter-item">
                <label class="plant-filter-item__label">工厂编号</label>
                <el-input v-model.trim="filterForm.factoryCode" placeholder="请输入工厂编号" clearable @keyup.enter.native="handleSearch"></el-input>
              </div>
              <div class="plant-filter-item">
                <label class="plant-filter-item__label">工厂类别</label>
                <el-select v-model="filterForm.factoryType" placeholder="请选择工厂类别" clearable>
                  <el-option v-for="item in factoryTypes" :key="item" :label="item" :value="item"></el-option>
                </el-select>
              </div>
            </div>

            <div class="plant-toolbar__actions">
              <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
              <el-button @click="handleReset">重置</el-button>
              <el-button type="primary" plain icon="el-icon-plus" @click="openCreateDialog">新建工厂</el-button>
              <el-button type="primary" plain @click="exportExcel">导出 Excel</el-button>
            </div>
          </div>

          <div class="plant-table-wrap">
            <el-table class="plant-table" :data="pagedList" border empty-text="暂无工厂数据">
              <el-table-column prop="factoryCode" label="工厂编号" min-width="120"></el-table-column>
              <el-table-column prop="factoryName" label="工厂名称" min-width="220" show-overflow-tooltip></el-table-column>
              <el-table-column prop="factoryType" label="工厂类别" min-width="120"></el-table-column>
              <el-table-column prop="address" label="地址" min-width="150" show-overflow-tooltip></el-table-column>
              <el-table-column prop="departmentCode" label="关联部门编码" min-width="140"></el-table-column>
              <el-table-column label="操作" min-width="220" fixed="right">
                <template slot-scope="{ row }">
                  <div class="table-action-group">
                    <el-button type="text" @click="openEditDialog(row)">编辑</el-button>
                    <el-button type="text" class="is-danger" @click="confirmDelete(row)">删除</el-button>
                    <el-button type="text" @click="goWorkshopList(row)">车间列表</el-button>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <div class="plant-pagination">
            <div class="plant-pagination__total">共 {{ filteredList.length }} 条</div>
            <el-pagination background layout="prev, pager, next, jumper" :page-size="pageSize" :current-page.sync="currentPage" :total="filteredList.length" @current-change="handlePageChange"></el-pagination>
          </div>
        </section>

        <el-dialog :title="dialogMode === 'create' ? '新建工厂' : '编辑工厂'" :visible.sync="dialogVisible" width="560px">
          <el-form label-width="96px" @submit.native.prevent>
            <el-form-item label="工厂编号"><el-input v-model.trim="dialogForm.factoryCode" placeholder="请输入工厂编号"></el-input></el-form-item>
            <el-form-item label="工厂名称"><el-input v-model.trim="dialogForm.factoryName" placeholder="请输入工厂名称"></el-input></el-form-item>
            <el-form-item label="工厂类别">
              <el-select v-model="dialogForm.factoryType" placeholder="请选择工厂类别" style="width: 100%;">
                <el-option v-for="item in factoryTypes" :key="item" :label="item" :value="item"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="地址"><el-input v-model.trim="dialogForm.address" placeholder="请输入地址"></el-input></el-form-item>
            <el-form-item label="部门编码"><el-input v-model.trim="dialogForm.departmentCode" placeholder="请输入关联部门编码"></el-input></el-form-item>
          </el-form>
          <span slot="footer">
            <el-button @click="dialogVisible = false">鍙栨秷</el-button>
            <el-button type="primary" @click="submitDialog">淇濆瓨</el-button>
          </span>
        </el-dialog>
      </div>
    `
  });

  Vue.component('workshop-list-page', {
    data: function () {
      var plantList = clone((window.plantListModuleData && window.plantListModuleData.list) || []);
      var workshopList = clone((window.workshopListModuleData && window.workshopListModuleData.list) || []);
      var factoryList = plantList.map(function (item) {
        return {
          factory_uuid: item.id,
          factory_code: item.factoryCode,
          factory_name: item.factoryName,
          factory_label: item.factoryCode + '|' + item.factoryName
        };
      });
      var factoryMap = {};

      factoryList.forEach(function (item) {
        factoryMap[item.factory_name] = item;
        factoryMap[item.factory_code] = item;
      });

      return {
        sourceList: workshopList.map(function (item) {
          var matchedFactory = factoryMap[item.factoryName] || {};
          var factoryCode = item.factoryCode || matchedFactory.factory_code || String(item.workshopCode || '').split('-')[0] || '';
          var factoryName = matchedFactory.factory_name || item.factoryName || '';
          return {
            id: item.id,
            workshop_uuid: 'WK-' + item.id,
            factory_uuid: matchedFactory.factory_uuid || item.id,
            factory_code: factoryCode,
            factory_name: factoryName,
            factory_display: factoryCode + factoryName,
            workshop_code: item.workshopCode || '',
            workshop_name: item.workshopName || ''
          };
        }),
        factorylist: factoryList,
        currentPage: 1,
        searchform: {
          factory_code: null,
          workshop_uuid: null,
          workshop_code: null,
          workshop_name: null,
          factory_sub_code: null,
          pageSize: (window.workshopListModuleData && window.workshopListModuleData.pageSize) || 10
        },
        listLoading: false,
        downloadLoading: false,
        filename: '车间列表',
        autoWidth: true,
        bookType: 'xlsx',
        dialogVisible: false,
        editVisible: false,
        form: {
          factory_code: null,
          workshop_uuid: '',
          workshop_code: '',
          workshop_name: '',
          factory_uuid: ''
        },
        formadd: {
          factory_code: null,
          workshop_code: '',
          workshop_name: '',
          factory_uuid: ''
        },
        rules: {
          workshop_name: [{ required: true, message: '请输入车间名称', trigger: 'blur' }],
          factory_code: [{ required: true, message: '请输入工厂名称', trigger: 'change' }],
          workshop_code: [
            { required: true, message: '请输入车间编号', trigger: 'blur' },
            {
              validator: function (rule, value, callback) {
                if (!/^[0-9a-zA-Z_-~`.@#$^&*()¥-]+$/.test(String(value || ''))) {
                  callback(new Error('不能输入 %!=/:;“’ 等特殊字符与中文'));
                  return;
                }
                callback();
              },
              trigger: 'blur'
            }
          ]
        }
      };
    },
    computed: {
      filteredList: function () {
        var factoryCode = this.searchform.factory_code;
        var workshopCode = (this.searchform.workshop_code || '').trim().toLowerCase();
        var workshopName = (this.searchform.workshop_name || '').trim().toLowerCase();

        return this.sourceList.filter(function (item) {
          var factoryMatched = !factoryCode || item.factory_code === factoryCode;
          var codeMatched = !workshopCode || String(item.workshop_code || '').toLowerCase().indexOf(workshopCode) > -1;
          var nameMatched = !workshopName || String(item.workshop_name || '').toLowerCase().indexOf(workshopName) > -1;
          return factoryMatched && codeMatched && nameMatched;
        });
      },
      pageSize: function () {
        return Number(this.searchform.pageSize) || 10;
      },
      pagedList: function () {
        var start = (this.currentPage - 1) * this.pageSize;
        return this.filteredList.slice(start, start + this.pageSize);
      }
    },
    watch: {
      filteredList: function (list) {
        var maxPage = Math.max(1, Math.ceil(list.length / this.pageSize));
        if (this.currentPage > maxPage) {
          this.currentPage = maxPage;
        }
      }
    },
    methods: {
      handleSearch: function () {
        this.currentPage = 1;
      },
      resetForm: function (formName) {
        if (formName === 'searchform') {
          this.searchform.factory_code = null;
          this.searchform.workshop_uuid = null;
          this.searchform.workshop_code = null;
          this.searchform.workshop_name = null;
          this.searchform.factory_sub_code = null;
          this.currentPage = 1;
          return;
        }
        if (this.$refs[formName] && this.$refs[formName].resetFields) {
          this.$refs[formName].resetFields();
        }
      },
      handleReset: function () {
        this.resetForm('searchform');
      },
      currentchange: function (page) {
        this.currentPage = page;
      },
      pagesize: function (size) {
        this.searchform.pageSize = size;
        this.currentPage = 1;
      },
      handlePageChange: function (page) {
        this.currentchange(page);
      },
      syncFactoryUuid: function (targetKey) {
        var factoryCode = this[targetKey].factory_code;
        var matchedFactory = this.factorylist.find(function (item) {
          return item.factory_code === factoryCode;
        });
        this[targetKey].factory_uuid = matchedFactory ? matchedFactory.factory_uuid : '';
      },
      selectRow: function (row) {
        var matchedFactory = this.factorylist.find(function (item) {
          return item.factory_code === row.factory_code;
        }) || {};

        this.form.factory_code = row.factory_code;
        this.form.workshop_code = row.workshop_code;
        this.form.workshop_name = row.workshop_name;
        this.form.factory_uuid = matchedFactory.factory_uuid || row.factory_uuid;
        this.form.workshop_uuid = row.workshop_uuid;
      },
      openCreateDialog: function () {
        this.resetForm('formadd');
        this.formadd.factory_uuid = '';
        this.dialogVisible = true;
      },
      openEditDialog: function (row) {
        this.selectRow(row);
        this.editVisible = true;
      },
      submitadd: function (formName) {
        var self = this;

        if (!this.$refs[formName]) {
          return;
        }

        this.$refs[formName].validate(function (valid) {
          var matchedFactory;

          if (!valid) {
            return false;
          }

          self.syncFactoryUuid('formadd');
          matchedFactory = self.factorylist.find(function (item) {
            return item.factory_code === self.formadd.factory_code;
          }) || {};

          self.sourceList.unshift({
            id: Date.now(),
            workshop_uuid: 'WK-' + Date.now(),
            factory_uuid: self.formadd.factory_uuid,
            factory_code: self.formadd.factory_code,
            factory_name: matchedFactory.factory_name || '',
            factory_display: (self.formadd.factory_code || '') + (matchedFactory.factory_name || ''),
            workshop_code: self.formadd.workshop_code,
            workshop_name: self.formadd.workshop_name
          });

          self.dialogVisible = false;
          self.currentPage = 1;
          self.$message({ type: 'success', message: '添加成功!' });
        });
      },
      submit: function (formName) {
        var self = this;

        if (!this.$refs[formName]) {
          return;
        }

        this.$refs[formName].validate(function (valid) {
          var matchedFactory;
          var target;

          if (!valid) {
            return false;
          }

          self.syncFactoryUuid('form');
          matchedFactory = self.factorylist.find(function (item) {
            return item.factory_code === self.form.factory_code;
          }) || {};
          target = self.sourceList.find(function (item) {
            return item.workshop_uuid === self.form.workshop_uuid;
          });

          if (target) {
            target.factory_uuid = self.form.factory_uuid;
            target.factory_code = self.form.factory_code;
            target.factory_name = matchedFactory.factory_name || '';
            target.factory_display = (self.form.factory_code || '') + (matchedFactory.factory_name || '');
            target.workshop_code = self.form.workshop_code;
            target.workshop_name = self.form.workshop_name;
          }

          self.editVisible = false;
          self.$message({ type: 'success', message: '修改成功!' });
        });
      },
      confirmDelete: function (row) {
        this.selectRow(row);
        this.deletedata();
      },
      deletedata: function () {
        var self = this;

        this.$confirm('此操作将永久删除该车间信息, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(function () {
          self.sourceList = self.sourceList.filter(function (item) {
            return item.workshop_uuid !== self.form.workshop_uuid;
          });
          self.$message({ type: 'success', message: '删除成功!' });
        }).catch(function () {
          self.$message({ type: 'info', message: '已取消删除' });
        });
      },
      goLineList: function (row) {
        this.selectRow(row);
        window.location.hash = '#/workline?workshopCode=' + encodeURIComponent(row.workshop_code || '');
      },
      exportExcel: function () {
        var rows = [['工厂', '车间编号', '车间名称']];

        this.filteredList.forEach(function (item) {
          rows.push([item.factory_display, item.workshop_code, item.workshop_name]);
        });

        downloadCsv('车间列表.xlsx.csv', rows);
        this.$message({ type: 'success', message: '已导出本地静态 CSV' });
      },
      handleDownload: function () {
        this.exportExcel();
      }
    },
    template: `
      <div class="legacy-admin-page">
        <div class="legacy-admin-crumbs">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item><i class="el-icon-date"></i> 生产管理</el-breadcrumb-item>
            <el-breadcrumb-item>车间列表</el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="legacy-admin-container">
          <div class="legacy-admin-handle-box">
            <el-form ref="searchform" :model="searchform" label-width="90px" @keyup.enter.native="handleSearch">
              <el-row :gutter="18">
                <el-col :span="6">
                  <el-form-item label="工厂名称" prop="factory_code">
                    <el-select v-model="searchform.factory_code" filterable placeholder="请选择工厂" style="width: 100%;">
                      <el-option v-for="item in factorylist" :key="item.factory_code" :label="item.factory_label" :value="item.factory_code"></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="车间编号" prop="workshop_code">
                    <el-input v-model.trim="searchform.workshop_code" clearable placeholder="请输入车间编号"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="车间名称" prop="workshop_name">
                    <el-input v-model.trim="searchform.workshop_name" clearable placeholder="请输入车间名称"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row>
                <el-col :span="16" class="legacy-admin-actions">
                  <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
                  <el-button @click="resetForm('searchform')">重置</el-button>
                  <el-button type="primary" icon="el-icon-plus" @click="openCreateDialog">新建车间</el-button>
                  <el-button :loading="downloadLoading" type="primary" icon="el-icon-document" @click="handleDownload">导出Excel</el-button>
                </el-col>
              </el-row>
            </el-form>
          </div>

          <el-divider></el-divider>

          <el-row class="row-bg" type="flex">
            <el-col :span="24">
              <el-table v-loading="listLoading" class="legacy-admin-table" element-loading-text="拼命加载中" :data="pagedList" border style="width: 100%;" @row-click="selectRow">
                <el-table-column prop="factory_display" label="工厂" min-width="200" show-overflow-tooltip></el-table-column>
                <el-table-column prop="workshop_code" label="车间编号" min-width="100" show-overflow-tooltip></el-table-column>
                <el-table-column prop="workshop_name" label="车间名称" min-width="100" show-overflow-tooltip></el-table-column>
                <el-table-column prop="action" label="操作" width="250">
                  <template slot-scope="{ row }">
                    <el-button-group>
                      <el-button type="primary" plain size="mini" @click.stop="openEditDialog(row)">修改</el-button>
                      <el-button type="danger" plain size="mini" @click.stop="confirmDelete(row)">删除</el-button>
                      <el-button type="primary" plain size="mini" @click.stop="goLineList(row)">产线列表</el-button>
                    </el-button-group>
                  </template>
                </el-table-column>
              </el-table>
            </el-col>
          </el-row>

          <br>

          <el-dialog title="编辑" :visible.sync="editVisible" center width="30%" @close="resetForm('form')">
            <el-form ref="form" :model="form" :rules="rules" label-width="100px">
              <el-row>
                <el-form-item label="工厂编号" prop="factory_code">
                  <el-select v-model="form.factory_code" placeholder="请选择工厂" style="width: 80%;" @change="syncFactoryUuid('form')">
                    <el-option v-for="item in factorylist" :key="item.factory_code" :label="item.factory_label" :value="item.factory_code"></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="车间编号" prop="workshop_code">
                  <el-input v-model.trim="form.workshop_code" placeholder="请输入车间编号" style="width: 80%;"></el-input>
                </el-form-item>
                <el-form-item label="车间名称" prop="workshop_name">
                  <el-input v-model.trim="form.workshop_name" placeholder="请输入车间名称" style="width: 80%;"></el-input>
                </el-form-item>
              </el-row>
            </el-form>
            <span slot="footer" class="dialog-footer">
              <el-button @click="editVisible = false">取 消</el-button>
              <el-button type="primary" @click="submit('form')">确 定</el-button>
            </span>
          </el-dialog>

          <el-dialog title="添加" :visible.sync="dialogVisible" width="28%" center @close="resetForm('formadd')">
            <el-form ref="formadd" :model="formadd" :rules="rules" label-width="100px" class="legacy-admin-dialog-form">
              <el-row>
                <el-form-item label="工厂编号" prop="factory_code">
                  <el-select v-model="formadd.factory_code" placeholder="请选择工厂" style="width: 80%;" @change="syncFactoryUuid('formadd')">
                    <el-option v-for="item in factorylist" :key="item.factory_code" :label="item.factory_label" :value="item.factory_code"></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="车间编号" prop="workshop_code">
                  <el-input v-model.trim="formadd.workshop_code" placeholder="请输入车间编号" style="width: 80%;"></el-input>
                </el-form-item>
                <el-form-item label="车间名称" prop="workshop_name">
                  <el-input v-model.trim="formadd.workshop_name" placeholder="请输入车间名称" style="width: 80%;"></el-input>
                </el-form-item>
              </el-row>
            </el-form>
            <span slot="footer" class="dialog-footer">
              <el-button @click="dialogVisible = false">取 消</el-button>
              <el-button @click="resetForm('formadd')">重置</el-button>
              <el-button type="primary" @click="submitadd('formadd')">确 定</el-button>
            </span>
          </el-dialog>

          <el-pagination background class="legacy-admin-pagination" :current-page.sync="currentPage" :page-sizes="[10, 20, 50, 100]" layout="total,prev, pager, next,jumper,sizes" :page-size="pageSize" :total="filteredList.length" @current-change="currentchange" @size-change="pagesize"></el-pagination>
          <el-divider></el-divider>
        </div>
      </div>
    `
  });

  Vue.component('workline-list-page', {
    data: function () {
      return {
        sourceList: clone(window.worklineListModuleData.list),
        factories: clone(window.worklineListModuleData.factories),
        workshops: clone(window.worklineListModuleData.workshops),
        pageSize: window.worklineListModuleData.pageSize || 10,
        currentPage: 1,
        filterForm: {
          factoryName: '',
          workshopLabel: '',
          lineCode: ''
        },
        dialogVisible: false,
        dialogMode: 'create',
        dialogForm: createWorklineForm()
      };
    },
    computed: {
      workshopOptions: function () {
        var factoryName = this.filterForm.factoryName;
        return this.workshops.filter(function (item) {
          return !factoryName || item.factoryName === factoryName;
        });
      },
      dialogWorkshopOptions: function () {
        var factoryName = this.dialogForm.factoryName;
        return this.workshops.filter(function (item) {
          return !factoryName || item.factoryName === factoryName;
        });
      },
      filteredList: function () {
        var factoryName = this.filterForm.factoryName;
        var workshopLabel = this.filterForm.workshopLabel;
        var lineCode = (this.filterForm.lineCode || '').trim().toLowerCase();
        return this.sourceList.filter(function (item) {
          var factoryMatched = !factoryName || item.factoryName === factoryName;
          var workshopMatched = !workshopLabel || item.workshopLabel === workshopLabel;
          var lineMatched = !lineCode || String(item.lineCode || '').toLowerCase().indexOf(lineCode) > -1;
          return factoryMatched && workshopMatched && lineMatched;
        });
      },
      pagedList: function () {
        var start = (this.currentPage - 1) * this.pageSize;
        return this.filteredList.slice(start, start + this.pageSize);
      }
    },
    watch: {
      filteredList: function (list) {
        var maxPage = Math.max(1, Math.ceil(list.length / this.pageSize));
        if (this.currentPage > maxPage) {
          this.currentPage = maxPage;
        }
      },
      'filterForm.factoryName': function () {
        var self = this;
        if (!this.workshopOptions.some(function (item) { return item.workshopLabel === self.filterForm.workshopLabel; })) {
          this.filterForm.workshopLabel = '';
        }
      },
      'dialogForm.factoryName': function () {
        var self = this;
        if (!this.dialogWorkshopOptions.some(function (item) { return item.workshopLabel === self.dialogForm.workshopLabel; })) {
          this.dialogForm.workshopLabel = '';
          this.dialogForm.workshopCode = '';
          this.dialogForm.workshopName = '';
        }
      }
    },
    methods: {
      handleSearch: function () {
        this.currentPage = 1;
      },
      handleReset: function () {
        this.filterForm.factoryName = '';
        this.filterForm.workshopLabel = '';
        this.filterForm.lineCode = '';
        this.currentPage = 1;
      },
      handlePageChange: function (page) {
        this.currentPage = page;
      },
      handleSizeChange: function (size) {
        this.pageSize = size;
        this.currentPage = 1;
      },
      syncWorkshopMeta: function (target, options) {
        var workshop = (options || this.workshops).find(function (item) {
          return item.workshopLabel === target.workshopLabel && item.factoryName === target.factoryName;
        });
        if (workshop) {
          target.workshopCode = workshop.workshopCode;
          target.workshopName = workshop.workshopName;
          return;
        }
        target.workshopCode = '';
        target.workshopName = '';
      },
      openCreateDialog: function () {
        this.dialogMode = 'create';
        this.dialogForm = createWorklineForm();
        this.dialogVisible = true;
      },
      openEditDialog: function (row) {
        this.dialogMode = 'edit';
        this.dialogForm = clone(row);
        this.dialogVisible = true;
      },
      submitDialog: function () {
        var form = clone(this.dialogForm);
        this.syncWorkshopMeta(form, this.workshops);
        if (!form.factoryName || !form.workshopLabel || !form.lineCode || !form.lineName) {
          this.$message.warning('请先完整填写产线信息');
          return;
        }

        if (this.dialogMode === 'create') {
          form.id = Date.now();
          this.sourceList.unshift(form);
          this.$message.success('已新增静态产线数据');
        } else {
          var target = this.sourceList.find(function (item) {
            return item.id === form.id;
          });
          if (target) {
            Object.assign(target, form);
          }
          this.$message.success('已更新静态产线数据');
        }

        this.dialogVisible = false;
        this.currentPage = 1;
      },
      confirmDelete: function (row) {
        var self = this;
        this.$confirm('确认删除该产线记录吗？此操作仅影响本地演示数据。', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(function () {
          self.sourceList = self.sourceList.filter(function (item) {
            return item.id !== row.id;
          });
          self.$message.success('已删除本地演示数据');
        }).catch(function () {});
      },
      exportExcel: function () {
        var rows = [['工厂', '车间', '产线编号', '产线名称']];
        this.filteredList.forEach(function (item) {
          rows.push([item.factoryName, item.workshopLabel, item.lineCode, item.lineName]);
        });
        downloadCsv('产线列表-静态导出.csv', rows);
        this.$message.success('已导出本地静态 CSV');
      }
    },
    template: `
      <div class="plant-page">
        <section class="module-tagbar">
          <span class="module-tag">工厂列表</span>
          <span class="module-tag">车间列表</span>
          <span class="module-tag module-tag--active">产线列表</span>
        </section>

        <section class="module-breadcrumb-card">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item>生产管理</el-breadcrumb-item>
            <el-breadcrumb-item>产线列表</el-breadcrumb-item>
          </el-breadcrumb>
        </section>

        <section class="section-card plant-module-card">
          <div class="plant-toolbar">
            <div class="plant-toolbar__filters">
              <div class="plant-filter-item">
                <label class="plant-filter-item__label">工厂名称</label>
                <el-select v-model="filterForm.factoryName" placeholder="请选择工厂" clearable>
                  <el-option v-for="item in factories" :key="item" :label="item" :value="item"></el-option>
                </el-select>
              </div>
              <div class="plant-filter-item">
                <label class="plant-filter-item__label">车间名称</label>
                <el-select v-model="filterForm.workshopLabel" placeholder="请选择车间" clearable>
                  <el-option v-for="item in workshopOptions" :key="item.id" :label="item.workshopLabel" :value="item.workshopLabel"></el-option>
                </el-select>
              </div>
              <div class="plant-filter-item">
                <label class="plant-filter-item__label">产线编号</label>
                <el-input v-model.trim="filterForm.lineCode" placeholder="请输入产线编号" clearable @keyup.enter.native="handleSearch"></el-input>
              </div>
            </div>

            <div class="plant-toolbar__actions">
              <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
              <el-button @click="handleReset">重置</el-button>
              <el-button type="primary" plain icon="el-icon-plus" @click="openCreateDialog">新建产线</el-button>
              <el-button type="primary" plain @click="exportExcel">导出 Excel</el-button>
            </div>
          </div>

          <div class="plant-table-wrap">
            <el-table class="plant-table" :data="pagedList" border empty-text="暂无产线数据">
              <el-table-column prop="factoryName" label="工厂" min-width="240" show-overflow-tooltip></el-table-column>
              <el-table-column prop="workshopLabel" label="车间" min-width="220" show-overflow-tooltip></el-table-column>
              <el-table-column prop="lineCode" label="产线编号" min-width="140"></el-table-column>
              <el-table-column prop="lineName" label="产线名称" min-width="180" show-overflow-tooltip></el-table-column>
              <el-table-column label="操作" min-width="160" fixed="right">
                <template slot-scope="{ row }">
                  <div class="table-action-group">
                    <el-button type="text" @click="openEditDialog(row)">编辑</el-button>
                    <el-button type="text" class="is-danger" @click="confirmDelete(row)">删除</el-button>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <div class="plant-pagination">
            <div class="plant-pagination__total">共 {{ filteredList.length }} 条</div>
            <el-pagination background layout="sizes, prev, pager, next" :page-sizes="[10, 20, 50]" :page-size="pageSize" :current-page.sync="currentPage" :total="filteredList.length" @current-change="handlePageChange" @size-change="handleSizeChange"></el-pagination>
          </div>
        </section>

        <el-dialog :title="dialogMode === 'create' ? '新建产线' : '编辑产线'" :visible.sync="dialogVisible" width="560px">
          <el-form label-width="96px" @submit.native.prevent>
            <el-form-item label="工厂名称">
              <el-select v-model="dialogForm.factoryName" placeholder="请选择工厂" style="width: 100%;">
                <el-option v-for="item in factories" :key="item" :label="item" :value="item"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="车间名称">
              <el-select v-model="dialogForm.workshopLabel" placeholder="请选择车间" style="width: 100%;">
                <el-option v-for="item in dialogWorkshopOptions" :key="item.id" :label="item.workshopLabel" :value="item.workshopLabel"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="产线编号"><el-input v-model.trim="dialogForm.lineCode" placeholder="请输入产线编号"></el-input></el-form-item>
            <el-form-item label="产线名称"><el-input v-model.trim="dialogForm.lineName" placeholder="请输入产线名称"></el-input></el-form-item>
          </el-form>
          <span slot="footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="submitDialog">保存</el-button>
          </span>
        </el-dialog>
      </div>
    `
  });

  Vue.component('class-list-page', {
    data: function () {
      return {
        sourceList: clone(window.classListModuleData.list),
        pageSize: window.classListModuleData.pageSize || 10,
        currentPage: 1,
        filterForm: {
          classCode: '',
          className: ''
        },
        dialogVisible: false,
        dialogMode: 'create',
        dialogForm: createClassForm()
      };
    },
    computed: {
      filteredList: function () {
        var classCode = (this.filterForm.classCode || '').trim().toLowerCase();
        var className = (this.filterForm.className || '').trim().toLowerCase();
        return this.sourceList.filter(function (item) {
          var codeMatched = !classCode || String(item.classCode || '').toLowerCase().indexOf(classCode) > -1;
          var nameMatched = !className || String(item.className || '').toLowerCase().indexOf(className) > -1;
          return codeMatched && nameMatched;
        });
      },
      pagedList: function () {
        var start = (this.currentPage - 1) * this.pageSize;
        return this.filteredList.slice(start, start + this.pageSize);
      }
    },
    watch: {
      filteredList: function (list) {
        var maxPage = Math.max(1, Math.ceil(list.length / this.pageSize));
        if (this.currentPage > maxPage) {
          this.currentPage = maxPage;
        }
      }
    },
    methods: {
      handleSearch: function () {
        this.currentPage = 1;
      },
      handleReset: function () {
        this.filterForm.classCode = '';
        this.filterForm.className = '';
        this.currentPage = 1;
      },
      handlePageChange: function (page) {
        this.currentPage = page;
      },
      openCreateDialog: function () {
        this.dialogMode = 'create';
        this.dialogForm = createClassForm();
        this.dialogVisible = true;
      },
      openEditDialog: function (row) {
        this.dialogMode = 'edit';
        this.dialogForm = clone(row);
        this.dialogVisible = true;
      },
      submitDialog: function () {
        var form = this.dialogForm;
        if (!form.classCode || !form.className) {
          this.$message.warning('请先完整填写班组信息');
          return;
        }

        if (this.dialogMode === 'create') {
          form.id = Date.now();
          this.sourceList.unshift(clone(form));
          this.$message.success('已新增静态班组数据');
        } else {
          var target = this.sourceList.find(function (item) {
            return item.id === form.id;
          });
          if (target) {
            Object.assign(target, clone(form));
          }
          this.$message.success('已更新静态班组数据');
        }

        this.dialogVisible = false;
        this.currentPage = 1;
      },
      confirmDelete: function (row) {
        var self = this;
        this.$confirm('确认删除该班组记录吗？此操作仅影响本地演示数据。', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(function () {
          self.sourceList = self.sourceList.filter(function (item) {
            return item.id !== row.id;
          });
          self.$message.success('已删除本地演示数据');
        }).catch(function () {});
      }
    },
    template: `
      <div class="plant-page">
        <section class="module-tagbar">
          <span class="module-tag">宸ュ巶淇℃伅</span>
          <span class="module-tag module-tag--active">鐝粍绠＄悊</span>
        </section>

        <section class="module-breadcrumb-card">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item>鐢熶骇绠＄悊</el-breadcrumb-item>
            <el-breadcrumb-item>鐝粍绠＄悊</el-breadcrumb-item>
          </el-breadcrumb>
        </section>

        <section class="section-card plant-module-card">
          <div class="plant-toolbar">
            <div class="plant-toolbar__filters">
              <div class="plant-filter-item">
                <label class="plant-filter-item__label">班组编码</label>
                <el-input v-model.trim="filterForm.classCode" placeholder="请输入班组编码" clearable @keyup.enter.native="handleSearch"></el-input>
              </div>
              <div class="plant-filter-item">
                <label class="plant-filter-item__label">班组名称</label>
                <el-input v-model.trim="filterForm.className" placeholder="请输入班组名称" clearable @keyup.enter.native="handleSearch"></el-input>
              </div>
            </div>

            <div class="plant-toolbar__actions plant-toolbar__actions--compact">
              <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
              <el-button @click="handleReset">重置</el-button>
            </div>

            <div class="plant-toolbar__actions plant-toolbar__actions--bare">
              <el-button type="primary" plain icon="el-icon-plus" @click="openCreateDialog">新建班组</el-button>
            </div>
          </div>

          <div class="plant-table-wrap">
            <el-table class="plant-table" :data="pagedList" border empty-text="暂无班组数据">
              <el-table-column prop="classCode" label="班组编号" min-width="220"></el-table-column>
              <el-table-column prop="className" label="班组名称" min-width="260"></el-table-column>
              <el-table-column label="操作" min-width="160" fixed="right">
                <template slot-scope="{ row }">
                  <div class="table-action-group">
                    <el-button type="text" @click="openEditDialog(row)">编辑</el-button>
                    <el-button type="text" class="is-danger" @click="confirmDelete(row)">删除</el-button>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <div class="plant-pagination">
            <div class="plant-pagination__total">共 {{ filteredList.length }} 条</div>
            <el-pagination background layout="prev, pager, next" :page-size="pageSize" :current-page.sync="currentPage" :total="filteredList.length" @current-change="handlePageChange"></el-pagination>
          </div>
        </section>

        <el-dialog :title="dialogMode === 'create' ? '新建班组' : '编辑班组'" :visible.sync="dialogVisible" width="520px">
          <el-form label-width="96px" @submit.native.prevent>
            <el-form-item label="班组编号"><el-input v-model.trim="dialogForm.classCode" placeholder="请输入班组编号"></el-input></el-form-item>
            <el-form-item label="班组名称"><el-input v-model.trim="dialogForm.className" placeholder="请输入班组名称"></el-input></el-form-item>
          </el-form>
          <span slot="footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="submitDialog">保存</el-button>
          </span>
        </el-dialog>
      </div>
    `
  });

  Vue.component('order-plus-page', {
    data: function () {
      var moduleData = clone(window.orderPlusModuleData || {});
      return {
        sourceList: moduleData.list || [],
        productOptions: moduleData.productOptions || [],
        materialOptions: moduleData.materialOptions || [],
        pageSize: moduleData.pageSize || 10,
        currentPage: 1,
        filterForm: {
          orderNo: '',
          productKeyword: '',
          erpId: '',
          planDate: ''
        },
        createPanelVisible: false,
        createForm: createOrderForm(),
        materialDraft: createOrderMaterialDraft(),
        columnDialogVisible: false,
        visibleColumnKeys: clone(moduleData.visibleColumns || []),
        allColumns: [
          { key: 'orderNo', label: '生产订单号', minWidth: 150 },
          { key: 'productCode', label: '产品编码', minWidth: 120 },
          { key: 'productName', label: '产品名称', minWidth: 180 },
          { key: 'planDate', label: '计划生产日期', minWidth: 130 },
          { key: 'planQty', label: '计划生产数量', minWidth: 120 },
          { key: 'decompositionQty', label: '分解数量', minWidth: 110 },
          { key: 'creator', label: '创建人', minWidth: 100 },
          { key: 'reviewer', label: '审核人', minWidth: 100 },
          { key: 'remark', label: '备注', minWidth: 120 },
          { key: 'level1CollectQty', label: '1级采集数量', minWidth: 120 },
          { key: 'level1ProductionQty', label: '1级生产数量', minWidth: 120 },
          { key: 'level1Ratio', label: '1级采集率', minWidth: 110 },
          { key: 'level2CollectQty', label: '2级采集数量', minWidth: 120 },
          { key: 'level2ProductionQty', label: '2级生产数量', minWidth: 120 },
          { key: 'level2Ratio', label: '2级采集率', minWidth: 110 },
          { key: 'level3CollectQty', label: '3级采集数量', minWidth: 120 },
          { key: 'level3ProductionQty', label: '3级生产数量', minWidth: 120 },
          { key: 'level3Ratio', label: '3级采集率', minWidth: 110 },
          { key: 'planStartTime', label: '计划开始时间', minWidth: 160 },
          { key: 'planEndTime', label: '计划结束时间', minWidth: 160 },
          { key: 'productionStatus', label: '生产状态', minWidth: 110 },
          { key: 'erpStatus', label: 'ERP状态', minWidth: 110 }
        ]
      };
    },
    computed: {
      legacyTabs: function () {
        return buildLegacyProductionTabs('#/orderPlus');
      },
      visibleColumns: function () {
        var self = this;
        return this.allColumns.filter(function (item) {
          return self.visibleColumnKeys.indexOf(item.key) > -1;
        });
      },
      filteredList: function () {
        var orderNo = (this.filterForm.orderNo || '').trim().toLowerCase();
        var productKeyword = (this.filterForm.productKeyword || '').trim().toLowerCase();
        var erpId = (this.filterForm.erpId || '').trim().toLowerCase();
        var planDate = this.filterForm.planDate;
        return this.sourceList.filter(function (item) {
          var orderMatched = !orderNo || String(item.orderNo || '').toLowerCase().indexOf(orderNo) > -1;
          var productMatched = !productKeyword || (
            String(item.productCode || '').toLowerCase().indexOf(productKeyword) > -1 ||
            String(item.productName || '').toLowerCase().indexOf(productKeyword) > -1
          );
          var erpMatched = !erpId || String(item.erpId || '').toLowerCase().indexOf(erpId) > -1;
          var dateMatched = !planDate || item.planDate === planDate;
          return orderMatched && productMatched && erpMatched && dateMatched;
        });
      },
      pagedList: function () {
        var start = (this.currentPage - 1) * this.pageSize;
        return this.filteredList.slice(start, start + this.pageSize);
      }
    },
    watch: {
      filteredList: function (list) {
        var maxPage = Math.max(1, Math.ceil(list.length / this.pageSize));
        if (this.currentPage > maxPage) {
          this.currentPage = maxPage;
        }
      }
    },
    methods: {
      handleSearch: function () {
        this.currentPage = 1;
      },
      handleReset: function () {
        this.filterForm.orderNo = '';
        this.filterForm.productKeyword = '';
        this.filterForm.erpId = '';
        this.filterForm.planDate = '';
        this.currentPage = 1;
      },
      handlePageChange: function (page) {
        this.currentPage = page;
      },
      handleSizeChange: function (size) {
        this.pageSize = size;
        this.currentPage = 1;
      },
      getProductName: function (code) {
        var target = this.productOptions.find(function (item) {
          return item.code === code;
        });
        return target ? target.name : '';
      },
      getMaterialInfo: function (code) {
        return this.materialOptions.find(function (item) {
          return item.code === code;
        }) || null;
      },
      openCreatePanel: function () {
        this.createForm = createOrderForm();
        this.materialDraft = createOrderMaterialDraft();
        this.createPanelVisible = true;
      },
      closeCreatePanel: function () {
        this.createPanelVisible = false;
      },
      resetMaterialDraft: function () {
        this.materialDraft = createOrderMaterialDraft();
      },
      addMaterialDraft: function () {
        var draft = clone(this.materialDraft);
        var materialInfo = this.getMaterialInfo(draft.materialCode);
        if (!draft.materialCode || !draft.planQty) {
          this.$message.warning('请先填写完整的原料记录');
          return;
        }
        if (!draft.batchNo && materialInfo) {
          draft.batchNo = materialInfo.defaultBatch;
        }
        this.createForm.materials.push({
          id: Date.now() + Math.floor(Math.random() * 1000),
          materialCode: draft.materialCode,
          materialName: materialInfo ? materialInfo.name : draft.materialCode,
          planQty: Number(draft.planQty),
          splitQty: Number(draft.planQty),
          batchNo: draft.batchNo || ''
        });
        this.resetMaterialDraft();
      },
      removeCreateMaterial: function (index) {
        this.createForm.materials.splice(index, 1);
      },
      submitCreateOrder: function () {
        var form = clone(this.createForm);
        if (!form.orderNo || !form.productCode || !form.planQty || !form.planDate) {
          this.$message.warning('请先完整填写工单基础信息');
          return;
        }
        if (!form.materials.length) {
          this.$message.warning('请至少生成一条原料记录');
          return;
        }

        form.id = Date.now();
        form.productName = this.getProductName(form.productCode);
        form.planQty = Number(form.planQty);
        form.decompositionQty = form.materials.reduce(function (sum, item) {
          return sum + Number(item.planQty || 0);
        }, 0);
        form.creator = '系统管理员';
        form.reviewer = '';
        form.remark = '';
        form.level1CollectQty = 0;
        form.level1ProductionQty = 0;
        form.level1Ratio = '0%';
        form.level2CollectQty = 0;
        form.level2ProductionQty = 0;
        form.level2Ratio = '0%';
        form.level3CollectQty = 0;
        form.level3ProductionQty = 0;
        form.level3Ratio = '0%';
        form.planStartTime = '';
        form.planEndTime = '';
        form.productionStatus = '';
        form.erpStatus = '未推送';

        this.sourceList.unshift(form);
        this.createPanelVisible = false;
        this.currentPage = 1;
        this.$message.success('已新增静态工单数据');
      },
      formatColumnValue: function (row, key) {
        var value = row[key];
        if (value === 0) {
          return '0';
        }
        return value || '--';
      },
      erpTagType: function (status) {
        return status === '未推送' ? 'info' : 'success';
      },
      productionTagType: function (status) {
        if (status === '已结束') {
          return 'danger';
        }
        if (status === '已分解') {
          return 'success';
        }
        return 'info';
      },
      createDefaultMaterialsForRow: function (row) {
        if (row.materials && row.materials.length) {
          return row.materials;
        }
        var planQty = Number(row.planQty || 0);
        var defaultCodes = row.productCode === 'sds330' ? ['sdyll01', 'csg01'] : ['cjsyl01', 'cjsp'];
        var self = this;
        row.materials = defaultCodes.map(function (code, index) {
          var material = self.getMaterialInfo(code);
          return {
            id: row.id * 100 + index,
            materialCode: code,
            materialName: material ? material.name : code,
            planQty: planQty,
            splitQty: planQty,
            batchNo: material ? material.defaultBatch : ''
          };
        });
        return row.materials;
      },
      splitOrder: function (row) {
        row.decompositionQty = Number(row.planQty || 0);
        row.productionStatus = '已分解';
        if (!row.planStartTime) {
          row.planStartTime = formatDateTime(new Date());
        }
        this.createDefaultMaterialsForRow(row);
        this.$message.success('已更新静态分解状态');
      },
      endOrder: function (row) {
        row.productionStatus = '已结束';
        row.planEndTime = formatDateTime(new Date());
        this.$message.success('已结束静态工单');
      },
      deleteOrder: function (row) {
        var self = this;
        this.$confirm('确认删除该工单记录吗？此操作仅影响本地演示数据。', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(function () {
          self.sourceList = self.sourceList.filter(function (item) {
            return item.id !== row.id;
          });
          self.$message.success('已删除本地演示数据');
        }).catch(function () {});
      },
      openColumnDialog: function () {
        this.columnDialogVisible = true;
      }
    },
    template: `
      <div class="plant-page order-page">
        <section class="legacy-breadcrumb">生产管理 / 生产加工单</section>

        <section class="section-card legacy-card legacy-filter-card order-toolbar-card">
          <div class="legacy-filter-grid">
            <div class="legacy-filter-item">
              <label class="legacy-filter-item__label">订单号</label>
              <el-input v-model.trim="filterForm.orderNo" placeholder="请输入订单号" clearable @keyup.enter.native="handleSearch"></el-input>
            </div>
            <div class="legacy-filter-item">
              <label class="legacy-filter-item__label">产品编码</label>
              <el-input v-model.trim="filterForm.productKeyword" placeholder="请输入产品名称或编码模糊匹配" clearable @keyup.enter.native="handleSearch"></el-input>
            </div>
            <div class="legacy-filter-item">
              <label class="legacy-filter-item__label">erpId</label>
              <el-input v-model.trim="filterForm.erpId" placeholder="请输入 erpId" clearable @keyup.enter.native="handleSearch"></el-input>
            </div>
            <div class="legacy-filter-item">
              <label class="legacy-filter-item__label">计划生产日期</label>
              <el-date-picker v-model="filterForm.planDate" type="date" value-format="yyyy-MM-dd" placeholder="选择日期" style="width: 100%;"></el-date-picker>
            </div>
          </div>

          <div class="legacy-toolbar-actions">
            <el-button size="mini" @click="handleReset">重置</el-button>
            <el-button size="mini" type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
            <el-button size="mini" @click="openCreatePanel">新增工单</el-button>
            <el-button size="mini" @click="openColumnDialog">设置表列显示</el-button>
          </div>
        </section>

        <section v-if="createPanelVisible" class="section-card legacy-card order-create-panel">
          <div class="order-create-panel__header">
            <div class="order-create-panel__title">新增工单</div>
            <el-button type="text" @click="closeCreatePanel">收起</el-button>
          </div>

          <div class="order-create-grid">
            <div class="order-filter-item">
              <label class="order-filter-item__label is-required">工单号</label>
              <el-input v-model.trim="createForm.orderNo" placeholder="请输入工单号"></el-input>
            </div>
            <div class="order-filter-item">
              <label class="order-filter-item__label is-required">产品编码</label>
              <el-select v-model="createForm.productCode" filterable placeholder="请输入产品名称或编码模糊匹配" style="width: 100%;">
                <el-option v-for="item in productOptions" :key="item.code" :label="item.code + ' / ' + item.name" :value="item.code"></el-option>
              </el-select>
            </div>
            <div class="order-filter-item">
              <label class="order-filter-item__label is-required">计划生产数量</label>
              <el-input v-model.trim="createForm.planQty" placeholder="请输入计划生产数量"></el-input>
            </div>
            <div class="order-filter-item">
              <label class="order-filter-item__label">erp_id</label>
              <el-input v-model.trim="createForm.erpId" placeholder="请输入 erp_id"></el-input>
            </div>
            <div class="order-filter-item">
              <label class="order-filter-item__label is-required">计划生产日期</label>
              <el-date-picker v-model="createForm.planDate" type="date" value-format="yyyy-MM-dd" placeholder="选择日期" style="width: 100%;"></el-date-picker>
            </div>
          </div>

          <div class="order-material-card">
            <div class="order-material-card__title">产品用料记录</div>

            <div class="order-material-toolbar">
              <div class="order-filter-grid order-filter-grid--nested">
                <div class="order-filter-item">
                  <label class="order-filter-item__label is-required">原料编码</label>
                  <el-select v-model="materialDraft.materialCode" filterable placeholder="请输入原料名称或编码模糊匹配" style="width: 100%;">
                    <el-option v-for="item in materialOptions" :key="item.code" :label="item.code + ' / ' + item.name" :value="item.code"></el-option>
                  </el-select>
                </div>
                <div class="order-filter-item">
                  <label class="order-filter-item__label is-required">原料计划数量</label>
                  <el-input v-model.trim="materialDraft.planQty" placeholder="请输入原料计划数量"></el-input>
                </div>
                <div class="order-filter-item">
                  <label class="order-filter-item__label">原料批次</label>
                  <el-input v-model.trim="materialDraft.batchNo" placeholder="请输入原料批次"></el-input>
                </div>
              </div>

              <div class="order-toolbar-actions order-toolbar-actions--nested">
                <el-button size="mini" @click="resetMaterialDraft">重置</el-button>
                <el-button size="mini" type="primary" @click="addMaterialDraft">生成</el-button>
              </div>
            </div>

            <div class="order-material-table">
              <el-table class="plant-table legacy-table" :data="createForm.materials" border empty-text="暂无数据">
                <el-table-column prop="materialCode" label="原料编码" min-width="150"></el-table-column>
                <el-table-column prop="materialName" label="原料名称" min-width="160"></el-table-column>
                <el-table-column prop="planQty" label="原料计划数量" min-width="130"></el-table-column>
                <el-table-column prop="batchNo" label="原料批次" min-width="160"></el-table-column>
                <el-table-column label="操作" min-width="110" fixed="right">
                  <template slot-scope="{ $index }">
                    <el-button size="mini" type="danger" @click="removeCreateMaterial($index)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>

            <div class="order-create-panel__footer">
              <el-button type="primary" @click="submitCreateOrder">提交</el-button>
            </div>
          </div>
        </section>

        <section class="section-card legacy-card legacy-table-card order-table-card">
          <div class="legacy-table-card__title">生产加工单</div>
          <el-table class="plant-table legacy-table order-table" :data="pagedList" border row-key="id">
            <el-table-column type="expand" width="46">
              <template slot-scope="{ row }">
                <div class="legacy-expand">
                  <el-table v-if="row.materials && row.materials.length" class="plant-table legacy-table" :data="row.materials" border>
                    <el-table-column prop="materialCode" label="原料编码" min-width="150"></el-table-column>
                    <el-table-column prop="materialName" label="原料名称" min-width="180"></el-table-column>
                    <el-table-column prop="planQty" label="原料计划数量" min-width="120"></el-table-column>
                    <el-table-column prop="splitQty" label="原料拆分数量" min-width="120"></el-table-column>
                  </el-table>
                  <div v-else class="order-expand__empty">暂无原料记录</div>
                </div>
              </template>
            </el-table-column>

            <el-table-column v-for="column in visibleColumns" :key="column.key" :prop="column.key" :label="column.label" :min-width="column.minWidth" show-overflow-tooltip>
              <template slot-scope="{ row }">
                <el-tag v-if="column.key === 'erpStatus'" size="mini" :type="erpTagType(row.erpStatus)">{{ formatColumnValue(row, column.key) }}</el-tag>
                <el-tag v-else-if="column.key === 'productionStatus' && row.productionStatus" size="mini" :type="productionTagType(row.productionStatus)">{{ row.productionStatus }}</el-tag>
                <span v-else>{{ formatColumnValue(row, column.key) }}</span>
              </template>
            </el-table-column>

            <el-table-column label="操作" min-width="170" fixed="right">
              <template slot-scope="{ row }">
                <div class="legacy-action-group">
                  <el-button size="mini" type="danger" @click="endOrder(row)">结束</el-button>
                  <el-button size="mini" type="primary" @click="splitOrder(row)">分解</el-button>
                  <el-button size="mini" type="danger" @click="deleteOrder(row)">删除</el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>

          <div class="legacy-pagination">
            <div class="legacy-pagination__total">共 {{ filteredList.length }} 条</div>
            <el-pagination background layout="prev, pager, next, jumper, sizes" :page-sizes="[10, 20, 50]" :page-size="pageSize" :current-page.sync="currentPage" :total="filteredList.length" @current-change="handlePageChange" @size-change="handleSizeChange"></el-pagination>
          </div>
        </section>

        <button type="button" class="legacy-floating-settings" @click="openColumnDialog">
          <i class="el-icon-setting"></i>
        </button>

        <el-dialog title="设置表列显示" :visible.sync="columnDialogVisible" width="520px">
          <el-checkbox-group v-model="visibleColumnKeys" class="order-column-grid">
            <el-checkbox v-for="item in allColumns" :key="item.key" :label="item.key">{{ item.label }}</el-checkbox>
          </el-checkbox-group>
          <span slot="footer">
            <el-button @click="columnDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="columnDialogVisible = false">确定</el-button>
          </span>
        </el-dialog>
      </div>
    `
  });

  new Vue({
    el: '#app',
    data: function () {
      return {
        shellData: buildCombinedShellData(clone(window.dashboardShellData)),
        menuMap: {},
        routeMap: {},
        routeSystemMap: {},
        openMenuIndexes: [],
        collapsed: false,
        currentHash: window.location.hash || '#/dashboard',
        currentRouteHash: normalizeHashRoute(window.location.hash || '#/dashboard'),
        currentRoute: 'dashboard',
        activeSystemKey: 'traceSystem',
        visitedTags: [],
        layoutDrawerOpen: false,
        layoutConfig: {
          tagsView: true,
          fixedHeader: false,
          sidebarLogo: true
        }
      };
    },
    computed: {
      currentMenus: function () {
        var systems = this.shellData.systems || {};
        return (systems[this.activeSystemKey] && systems[this.activeSystemKey].menus) || [];
      },
      currentBrandName: function () {
        var systems = this.shellData.systems || {};
        var activeSystem = systems[this.activeSystemKey] || {};
        return activeSystem.brandName || this.shellData.brandName || 'V26';
      },
      routeMeta: function () {
        return this.routeMap[this.currentRouteHash] || this.routeMap['#/dashboard'] || {
          key: 'dashboard',
          menuIndex: 'dashboard',
          title: '首页',
          breadcrumb: '首页 / 首页',
          route: '#/dashboard'
        };
      },
      activeMenu: function () {
        return this.routeMeta.menuIndex;
      },
      isWorkshopShell: function () {
        return this.currentRoute === 'workshop-list';
      },
      isScadaFullscreen: function () {
        return this.currentRoute === 'scada-dashboard' && this.currentHash.indexOf('worklineCode=') > -1;
      },
      noticeCount: function () {
        return (window.dashboardShellData && window.dashboardShellData.notices) || 4;
      },
      showLayoutDrawer: function () {
        return ['dashboardOverview', 'productionMonitoring', 'warehouselogistics', 'inspectionManagement'].indexOf(this.currentRoute) > -1 && !this.isScadaFullscreen;
      },
      showRouteChipBar: function () {
        return this.layoutConfig.tagsView !== false && !this.isScadaFullscreen && !this.isWorkshopShell;
      },
      routeTags: function () {
        return this.visitedTags.length ? this.visitedTags : [this.routeMeta];
      }
    },
    created: function () {
      var allMenus = getAllSystemMenus(this.shellData.systems || {});
      this.menuMap = flattenMenus(allMenus, {});
      this.routeMap = buildRouteMap(allMenus, {});
      this.routeSystemMap = getSystemRouteOwnership(this.shellData.systems || {});
      Object.keys(this.routeMap).forEach(function (key) {
        this.routeMap[key].route = key;
      }, this);
      if (!window.location.hash) {
        window.location.hash = '#/dashboard';
      }
      this.syncRoute();
      window.addEventListener('hashchange', this.syncRoute);
    },
    beforeDestroy: function () {
      window.removeEventListener('hashchange', this.syncRoute);
    },
    methods: {
      syncRoute: function () {
        this.currentHash = window.location.hash || '#/dashboard';
        this.currentRouteHash = normalizeHashRoute(this.currentHash);
        if (!this.routeMap[this.currentRouteHash]) {
          window.location.hash = '#/dashboard';
          this.currentHash = '#/dashboard';
          this.currentRouteHash = '#/dashboard';
        }
        this.activeSystemKey = this.routeSystemMap[this.currentRouteHash] || 'traceSystem';
        this.currentRoute = (this.routeMap[this.currentRouteHash] || this.routeMap['#/dashboard']).key;
        this.openMenuIndexes = findMenuAncestors(this.currentMenus, this.activeMenu, []) || [];
        this.pushVisitedTag();
      },
      pushVisitedTag: function () {
        var route = this.routeMeta.route;
        var existsIndex = this.visitedTags.findIndex(function (item) {
          return item.route === route;
        });
        if (existsIndex > -1) {
          this.visitedTags.splice(existsIndex, 1);
        }
        this.visitedTags.push({
          route: this.routeMeta.route,
          title: this.routeMeta.title
        });
        if (this.visitedTags.length > 6) {
          this.visitedTags = this.visitedTags.slice(this.visitedTags.length - 6);
        }
      },
      toggleSidebar: function () {
        this.collapsed = !this.collapsed;
        setTimeout(function () {
          window.dispatchEvent(new Event('resize'));
        }, 280);
      },
      toggleLayoutDrawer: function () {
        this.layoutDrawerOpen = !this.layoutDrawerOpen;
        setTimeout(function () {
          window.dispatchEvent(new Event('resize'));
        }, 280);
      },
      openRouteTag: function (route) {
        if (route) {
          window.location.hash = route;
        }
      },
      handleMenuSelect: function (index) {
        var target = this.menuMap[index];
        if (target && target.route) {
          window.location.hash = target.route;
          return;
        }
      },
      switchSystem: function (systemKey) {
        var target = (this.shellData.systems || {})[systemKey];
        if (!target || !target.defaultRoute) {
          this.$message.warning('当前静态演示未接入该系统入口');
          return;
        }
        window.location.hash = target.defaultRoute;
      },
      handleCommand: function (command) {
        var tips = {
          refresh: '已刷新当前静态演示视图',
          fullscreen: '静态演示页未接入全屏控制',
          profile: '当前为静态演示项目，未实现个人中心',
          logout: '当前项目无登录态，已停留在当前页面'
        };
        this.$message({
          type: command === 'logout' ? 'warning' : 'success',
          message: tips[command] || '操作已完成'
        });
        if (command === 'refresh') {
          window.dispatchEvent(new Event('resize'));
        }
      }
    },
    template: `
      <div>
        <scada-dashboard-page v-if="isScadaFullscreen"></scada-dashboard-page>
        <div v-else class="dashboard-app" :class="{ 'is-collapsed': collapsed, 'is-workshop-shell': isWorkshopShell }">
          <aside class="app-sidebar">
            <div v-show="layoutConfig.sidebarLogo !== false" class="sidebar-brand">
              <img src="assets/images/logo.png" alt="logo">
              <div class="sidebar-brand__text">{{ currentBrandName }}</div>
            </div>
            <div class="sidebar-menu-wrap">
              <el-menu
                class="sidebar-menu"
                :default-active="activeMenu"
                :default-openeds="openMenuIndexes"
                :collapse="collapsed"
                :collapse-transition="false"
                :unique-opened="false"
                background-color="transparent"
                text-color="#d8e2ef"
                active-text-color="#ffffff"
                @select="handleMenuSelect">
                <menu-tree-item v-for="item in currentMenus" :key="item.index" :item="item"></menu-tree-item>
              </el-menu>
            </div>
          </aside>

          <div class="app-main-shell">
            <header class="topbar" :class="{ 'is-fixed': layoutConfig.fixedHeader, 'topbar--workshop': isWorkshopShell }">
              <template v-if="isWorkshopShell">
                <div class="topbar-left topbar-left--workshop">
                  <button type="button" class="topbar-toggle topbar-toggle--workshop" @click="toggleSidebar">
                    <i :class="collapsed ? 'el-icon-s-unfold' : 'el-icon-s-fold'"></i>
                  </button>
                  <div class="topbar-route">
                    <div class="topbar-route__title">{{ routeMeta.title }}</div>
                    <div class="topbar-route__breadcrumb">{{ routeMeta.breadcrumb }}</div>
                  </div>
                </div>

                <div class="topbar-right topbar-right--workshop">
                  <button type="button" class="topbar-icon-btn topbar-icon-btn--workshop topbar-icon-btn--badge" @click="handleCommand('profile')">
                    <i class="el-icon-bell"></i>
                    <span class="topbar-icon-btn__badge">{{ noticeCount }}</span>
                  </button>
                  <button type="button" class="topbar-icon-btn topbar-icon-btn--workshop" @click="handleCommand('refresh')">
                    <i class="el-icon-refresh"></i>
                  </button>
                  <button type="button" class="topbar-icon-btn topbar-icon-btn--workshop" @click="handleCommand('fullscreen')">
                    <i class="el-icon-full-screen"></i>
                  </button>
                  <el-dropdown trigger="click" @command="handleCommand">
                    <div class="user-chip user-chip--workshop">
                      <span class="user-chip__avatar">系</span>
                      <span class="user-chip__info">
                        <div class="user-chip__name">{{ shellData.userName }}</div>
                        <div class="user-chip__role">{{ shellData.userRole }}</div>
                      </span>
                      <i class="el-icon-arrow-down el-icon--right"></i>
                    </div>
                    <el-dropdown-menu slot="dropdown">
                      <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                      <el-dropdown-item command="refresh">刷新视图</el-dropdown-item>
                      <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
                    </el-dropdown-menu>
                  </el-dropdown>
                </div>
              </template>

              <template v-else>
                <div class="topbar-left">
                  <button type="button" class="topbar-toggle" @click="toggleSidebar">
                    <i :class="collapsed ? 'el-icon-s-unfold' : 'el-icon-s-fold'"></i>
                  </button>
                  <nav class="system-nav">
                    <a href="javascript:;" class="system-nav__item" :class="{ 'is-active': activeSystemKey === 'basicInfo' }" @click.prevent="switchSystem('basicInfo')">系统基础信息</a>
                    <a href="javascript:;" class="system-nav__item" :class="{ 'is-active': activeSystemKey === 'traceSystem' }" @click.prevent="switchSystem('traceSystem')">产品追溯系统</a>
                    <a href="javascript:;" class="system-nav__item" :class="{ 'is-active': activeSystemKey === 'codeLibrary' }" @click.prevent="switchSystem('codeLibrary')">码库管理</a>
                  </nav>
                </div>

                <div class="topbar-right topbar-tools">
                  <button type="button" class="topbar-icon-btn" @click="handleCommand('fullscreen')">
                    <i class="el-icon-full-screen"></i>
                  </button>
                  <button type="button" class="topbar-icon-btn topbar-icon-btn--text" @click="handleCommand('refresh')">Tt</button>
                  <el-dropdown trigger="click" @command="handleCommand">
                    <div class="user-chip user-chip--ts">
                      <span class="user-chip__avatar">⌁</span>
                      <span class="user-chip__info">
                        <div class="user-chip__name">{{ shellData.userName }}</div>
                      </span>
                      <i class="el-icon-arrow-down el-icon--right"></i>
                    </div>
                    <el-dropdown-menu slot="dropdown">
                      <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                      <el-dropdown-item command="refresh">刷新视图</el-dropdown-item>
                      <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
                    </el-dropdown-menu>
                  </el-dropdown>
                </div>
              </template>
            </header>

            <div v-if="showRouteChipBar" class="route-chip-bar">
              <div class="route-chip-list">
                <button
                  v-for="tag in routeTags"
                  :key="tag.route"
                  type="button"
                  class="route-chip"
                  :class="{ 'is-active': tag.route === routeMeta.route }"
                  @click="openRouteTag(tag.route)">
                  <span class="route-chip__dot"></span>
                  <span>{{ tag.title }}</span>
                  <span class="route-chip__close">×</span>
                </button>
              </div>
            </div>

            <main class="page-content" :class="{ 'has-layout-drawer': showLayoutDrawer && layoutDrawerOpen, 'page-content--workshop': isWorkshopShell }">
              <dashboard-page v-if="currentRoute === 'dashboard'"></dashboard-page>
              <dashboard-overview-page v-else-if="currentRoute === 'dashboardOverview'"></dashboard-overview-page>
              <production-monitoring-page v-else-if="currentRoute === 'productionMonitoring'"></production-monitoring-page>
              <scada-dashboard-page v-else-if="currentRoute === 'scada-dashboard'"></scada-dashboard-page>
              <warehouse-logistics-page v-else-if="currentRoute === 'warehouselogistics'"></warehouse-logistics-page>
              <inspection-management-page v-else-if="currentRoute === 'inspectionManagement'"></inspection-management-page>
              <freight-page v-else-if="currentRoute === 'freight'"></freight-page>
              <dragpage-editor-page v-else-if="currentRoute === 'dragpage'"></dragpage-editor-page>
              <plant-list-page v-else-if="currentRoute === 'plant-list'"></plant-list-page>
              <workshop-list-page v-else-if="currentRoute === 'workshop-list'"></workshop-list-page>
              <workline-list-page v-else-if="currentRoute === 'workline-list'"></workline-list-page>
              <class-list-page v-else-if="currentRoute === 'class-list'"></class-list-page>
              <order-plus-page v-else-if="currentRoute === 'order-plus'"></order-plus-page>
              <module-page v-else :route-meta="routeMeta"></module-page>
            </main>

            <div v-if="showLayoutDrawer" class="layout-drawer" :class="{ 'is-open': layoutDrawerOpen }">
              <button type="button" class="layout-drawer__handle" @click="toggleLayoutDrawer">
                <i class="el-icon-setting"></i>
              </button>
              <div class="layout-drawer__panel">
                <div class="layout-drawer__title">系统布局配置</div>
                <div class="layout-drawer__option">
                  <span>开启 Tags-View</span>
                  <el-switch v-model="layoutConfig.tagsView"></el-switch>
                </div>
                <div class="layout-drawer__option">
                  <span>固定 Header</span>
                  <el-switch v-model="layoutConfig.fixedHeader"></el-switch>
                </div>
                <div class="layout-drawer__option">
                  <span>侧边栏 Logo</span>
                  <el-switch v-model="layoutConfig.sidebarLogo"></el-switch>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
  });
})();

