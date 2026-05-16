import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const appSource = readFileSync(resolve(rootDir, 'assets/js/app.js'), 'utf8');

test('message center menu exposes the send failure records route', () => {
  assert.match(appSource, /message-center-management['"],\s*['"]消息中心管理['"]/);
  assert.match(appSource, /leaf\('message-send-failures',\s*'发送失败记录',\s*'首页 \/ 消息中心管理 \/ 发送失败记录'\)/);
  assert.match(appSource, /route:\s*'#\/message-send-failures'/);
});

test('send failure records schema includes required filters, columns, and actions', () => {
  assert.match(appSource, /ensureSchema\('#\/message-send-failures'/);
  assert.match(appSource, /failureReason[\s\S]*options:\s*\['手机号错误',\s*'网络异常',\s*'用户拒收'\]/);
  assert.match(appSource, /key:\s*'sendTime'[\s\S]*label:\s*'发送时间'/);
  assert.match(appSource, /key:\s*'receiverUser'[\s\S]*label:\s*'接收用户'/);
  assert.match(appSource, /key:\s*'messageType'[\s\S]*label:\s*'消息类型'/);
  assert.match(appSource, /key:\s*'failureReason'[\s\S]*label:\s*'失败原因'/);
  assert.match(appSource, /key:\s*'messageContent'[\s\S]*label:\s*'消息内容'/);
  assert.match(appSource, /key:\s*'resendMessage'[\s\S]*label:\s*'重新发送'/);
});

test('send failure records seed data covers all failure reasons', () => {
  assert.match(appSource, /failureReason:\s*'手机号错误'/);
  assert.match(appSource, /failureReason:\s*'网络异常'/);
  assert.match(appSource, /failureReason:\s*'用户拒收'/);
});

test('resend action updates local resend status and timestamp', () => {
  assert.match(appSource, /resendFailedMessage:\s*function\s*\(row\)/);
  assert.match(appSource, /action\.key === 'resendMessage'/);
  assert.match(appSource, /target\.resendStatus = '已重发'/);
  assert.match(appSource, /target\.lastResendTime = formatDateTime\(\)/);
  assert.match(appSource, /已重新发送失败消息（静态模拟）/);
});
