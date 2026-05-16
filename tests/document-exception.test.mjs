import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const appSource = readFileSync(resolve(rootDir, 'assets/js/app.js'), 'utf8');
const dashboardSource = readFileSync(resolve(rootDir, 'assets/data/mock-dashboard.js'), 'utf8');

test('dashboard data exposes the document exception route', () => {
  assert.match(dashboardSource, /index:\s*'documentexceptionhandling'/);
  assert.match(dashboardSource, /route:\s*'#\/documentexceptionhandling'/);
  assert.match(dashboardSource, /breadcrumb:\s*'首页 \/ 渠道物流 \/ 经销商物流 \/ 经销商签收 \/ 单据异常处理'/);
});

test('app menu and router render the dedicated document exception page', () => {
  assert.match(appSource, /leaf\('documentexceptionhandling',\s*'单据异常处理'/);
  assert.match(appSource, /Vue\.component\('document-exception-page'/);
  assert.match(appSource, /currentRoute === 'documentexceptionhandling'/);
  assert.match(appSource, /<document-exception-page/);
});

test('document exception page contains status adjustment and release rules', () => {
  assert.match(appSource, /adjustStatusOptions:\s*\['进行中',\s*'未开始'\]/);
  assert.match(appSource, /row\.orderStatus === '已完成'/);
  assert.match(appSource, /row\.orderStatus !== '已完成' && code\.associationStatus === '已关联'/);
  assert.match(appSource, /code\.associationStatus = '已解除'/);
});
