import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const appSource = readFileSync(resolve(rootDir, 'assets/js/app.js'), 'utf8');

function getMessageSettingsComponentSource() {
  const start = appSource.indexOf("Vue.component('message-settings-page'");
  assert.notEqual(start, -1, 'message settings component should be registered');

  const nextComponent = appSource.indexOf("\n  Vue.component('placeholder-page'", start + 1);
  assert.notEqual(nextComponent, -1, 'message settings component block should be bounded');
  return appSource.slice(start, nextComponent);
}

test('message center menu exposes the message settings route', () => {
  assert.match(appSource, /group\('message-center-management',\s*'消息中心管理'/);
  assert.match(appSource, /leaf\('messagesettings',\s*'消息设置',\s*'首页 \/ 消息中心管理 \/ 消息设置'\)/);
});

test('router renders the dedicated message settings page', () => {
  assert.match(appSource, /Vue\.component\('message-settings-page'/);
  assert.match(appSource, /currentRoute === 'messagesettings'/);
  assert.match(appSource, /<message-settings-page/);
});

test('message settings filter toolbar wires search and reset actions', () => {
  const componentSource = getMessageSettingsComponentSource();

  assert.match(componentSource, /handleSearch:\s*function\s*\(\)/);
  assert.match(componentSource, /@keyup\.enter\.native="handleSearch"/);
  assert.match(componentSource, /@click="handleSearch">搜索/);
  assert.match(componentSource, /@click="resetFilters">重置/);
});

test('message settings include the required static business rules', () => {
  assert.match(appSource, /messageType:\s*'窜货提醒'[\s\S]*?channels:\s*\['短信',\s*'系统内信'\]/);
  assert.match(appSource, /messageType:\s*'日常通知'[\s\S]*?channels:\s*\['系统内信'\]/);
  assert.match(appSource, /messageType:\s*'经销商签收异常'[\s\S]*?10 分钟/);
  assert.match(appSource, /messageType:\s*'稽查任务'[\s\S]*?receiverRoles:\s*\['稽查人员'\]/);
  assert.match(appSource, /messageType:\s*'出库通知'[\s\S]*?receiverRoles:\s*\['经销商'\]/);
});
