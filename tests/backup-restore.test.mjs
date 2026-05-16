import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const appSource = readFileSync(resolve(rootDir, 'assets/js/app.js'), 'utf8');
const appStyles = readFileSync(resolve(rootDir, 'assets/css/app.css'), 'utf8');

test('system management exposes the backup restore route', () => {
  assert.match(appSource, /leaf\('backuprestore',\s*'备份还原'/);
  assert.match(appSource, /currentRoute === 'backuprestore'/);
  assert.match(appSource, /<backup-restore-page/);
});

test('backup restore page includes the required backup and restore controls', () => {
  assert.match(appSource, /Vue\.component\('backup-restore-page'/);
  assert.match(appSource, /每日/);
  assert.match(appSource, /每周/);
  assert.match(appSource, /立即备份/);
  assert.match(appSource, /确认还原/);
  assert.match(appSource, /核心数据校验/);
  assert.match(appSource, /一物一码核心数据/);
});

test('backup restore page defines dedicated styling hooks', () => {
  assert.match(appStyles, /\.backup-restore-page/);
  assert.match(appStyles, /\.backup-plan-card/);
  assert.match(appStyles, /\.backup-core-scope/);
});
