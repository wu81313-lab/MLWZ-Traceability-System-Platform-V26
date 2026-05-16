import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const appSource = readFileSync(resolve(rootDir, 'assets/js/app.js'), 'utf8');

test('message center management exposes success records as a child module', () => {
  assert.match(appSource, /group\('message-center-management',\s*'消息中心管理'/);
  assert.match(appSource, /leaf\('message-success-records',\s*'发送成功记录',\s*'首页 \/ 消息中心管理 \/ 发送成功记录'\)/);
});

test('message success records schema supports required filters and export label', () => {
  assert.match(appSource, /ensureSchema\('#\/message-success-records'/);
  assert.match(appSource, /title:\s*'发送成功记录'/);
  assert.match(appSource, /key:\s*'receiverKeyword',\s*label:\s*'接收用户'/);
  assert.match(appSource, /searchKeys:\s*\['receiverUser',\s*'receiverAccount'\]/);
  assert.match(appSource, /key:\s*'sendTime',\s*label:\s*'发送时间',\s*type:\s*'daterange'/);
  assert.match(appSource, /key:\s*'messageType',\s*label:\s*'消息类型',\s*type:\s*'select',\s*options:\s*\['签收提醒',\s*'稽查任务',\s*'返利通知'\]/);
  assert.match(appSource, /key:\s*'export',\s*label:\s*'导出发送日志'/);
});

test('message success records schema covers fields, channels, and success-rate basis', () => {
  ['sendNo', 'sendTime', 'receiverUser', 'receiverAccount', 'messageType', 'messageContent', 'sendChannel', 'sendResult'].forEach((key) => {
    assert.match(appSource, new RegExp(`key:\\s*'${key}'`));
  });

  assert.match(appSource, /messageType:\s*'签收提醒'/);
  assert.match(appSource, /messageType:\s*'稽查任务'/);
  assert.match(appSource, /messageType:\s*'返利通知'/);
  assert.match(appSource, /sendChannel:\s*'短信'/);
  assert.match(appSource, /sendChannel:\s*'系统内信'/);
  assert.match(appSource, /sendResult:\s*'成功'/);

  assert.match(appSource, /label:\s*'签收提醒成功率',\s*value:\s*'98\.4%',\s*desc:\s*'成功 126 \/ 尝试 128'/);
  assert.match(appSource, /label:\s*'稽查任务成功率',\s*value:\s*'96\.7%',\s*desc:\s*'成功 87 \/ 尝试 90'/);
  assert.match(appSource, /label:\s*'返利通知成功率',\s*value:\s*'99\.2%',\s*desc:\s*'成功 121 \/ 尝试 122'/);
});
