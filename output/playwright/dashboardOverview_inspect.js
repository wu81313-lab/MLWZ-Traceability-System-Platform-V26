async (page) => {
  const result = await page.evaluate(() => {
    const findByText = (selector, text) => {
      const nodes = [...document.querySelectorAll(selector)];
      return nodes.find((node) => (node.textContent || '').replace(/\s+/g, ' ').includes(text));
    };
    const rectOf = (node) => {
      if (!node) return null;
      const r = node.getBoundingClientRect();
      return { x: +r.x.toFixed(1), y: +r.y.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) };
    };
    const bodyRect = { w: window.innerWidth, h: window.innerHeight };
    const kpiTitles = ['今日产量','今日发货量','年度累计扫码量','今日用户扫码量','今日用户预警数','年度累计用户预警数'];
    const chartTitles = ['近30天每日产量和发货量趋势','用户扫码分布热力图-年','用户异地扫码分布热力图-年','稽查窜货预警热力图-年','当日工厂生产进度统计','当日工厂发货进度统计'];
    const menuNodes = [...document.querySelectorAll('aside *, .sidebar-container *, .el-menu *, nav *, .el-aside *')];
    const menuTexts = menuNodes.map(n => (n.textContent || '').trim()).filter(Boolean).filter((v, i, arr) => arr.indexOf(v) === i).slice(0, 60);
    return {
      viewport: bodyRect,
      sidebar: rectOf(document.querySelector('aside') || document.querySelector('.sidebar-container') || document.querySelector('.el-aside')),
      header: rectOf(document.querySelector('header') || document.querySelector('.el-header')),
      routeChip: rectOf(findByText('*', '总览首页')),
      kpis: kpiTitles.map(t => ({ title: t, rect: rectOf(findByText('*', t)) })),
      charts: chartTitles.map(t => ({ title: t, rect: rectOf(findByText('*', t)) })),
      settingsButton: rectOf(document.querySelector('.el-icon-setting')?.closest('*')),
      menuTexts
    };
  });
  console.log(JSON.stringify(result, null, 2));
}
