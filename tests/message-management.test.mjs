import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const appSource = readFileSync(resolve(rootDir, 'assets/js/app.js'), 'utf8');
const moduleSource = readFileSync(resolve(rootDir, 'assets/data/mock-modules.js'), 'utf8');

test('message center exposes the message management route and page', () => {
  assert.match(appSource, /group\('message-center-management',\s*'消息中心管理'/);
  assert.match(appSource, /leaf\('message-management',\s*'消息管理',\s*'首页 \/ 消息中心管理 \/ 消息管理'\)/);
  assert.match(appSource, /Vue\.component\('message-management-page'/);
  assert.match(appSource, /currentRoute === 'message-management'/);
  assert.match(appSource, /<message-management-page/);
});

test('message management mock data includes users roles messages rules and variables', () => {
  assert.match(moduleSource, /window\.messageManagementData\s*=/);
  assert.match(moduleSource, /users:\s*\[/);
  assert.match(moduleSource, /roles:\s*\[/);
  assert.match(moduleSource, /messages:\s*\[/);
  assert.match(moduleSource, /autoRules:\s*\[/);
  assert.match(moduleSource, /variables:\s*\[/);
  assert.match(moduleSource, /sendMode:\s*'手动发送'/);
  assert.match(moduleSource, /sendMode:\s*'自动发送'/);
  assert.match(moduleSource, /readStatus:\s*'未读'/);
  assert.match(moduleSource, /readStatus:\s*'已读'/);
});

test('message management implements variable rendering and unread reminder logic', () => {
  assert.match(appSource, /function renderMessageTemplate\(template,\s*context\)/);
  assert.match(appSource, /\{\{用户姓名\}\}/);
  assert.match(appSource, /\{\{部门\}\}/);
  assert.match(appSource, /function createMessageReceipts\(message,\s*users,\s*roles,\s*context\)/);
  assert.match(appSource, /function getMessageUnreadCount\(messages\)/);
  assert.match(appSource, /readStatus === '未读'/);
  assert.match(appSource, /handleUnreadNoticeClick/);
});
