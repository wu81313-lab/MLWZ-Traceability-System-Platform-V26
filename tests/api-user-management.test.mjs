import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const appSource = readFileSync(resolve(rootDir, 'assets/js/app.js'), 'utf8');

function getApiUserSchemaSource() {
  const start = appSource.indexOf("ensureSchema('#/apiusermanagement'");
  assert.notEqual(start, -1, 'API用户管理 schema should be registered');

  const nextEnsure = appSource.indexOf('\n    ensureSchema(', start + 1);
  const returnSchemas = appSource.indexOf('\n\n    return schemas;', start);
  const end = nextEnsure === -1 ? returnSchemas : nextEnsure;
  assert.notEqual(end, -1, 'API用户管理 schema block should be bounded');

  return appSource.slice(start, end);
}

test('system management exposes the api user management route', () => {
  assert.match(
    appSource,
    /var systemManagementNode = group\('system-management',\s*'系统管理',\s*\[[\s\S]*leaf\('apiusermanagement',\s*'API用户管理',\s*'首页 \/ 系统管理 \/ API用户管理'\)[\s\S]*\],\s*'el-icon-setting'\)/
  );
});

test('api user management schema covers ERP CRM and WMS interfaces', () => {
  const schemaSource = getApiUserSchemaSource();

  assert.match(schemaSource, /title:\s*'API用户管理'/);
  assert.match(schemaSource, /tags:\s*\['产品追溯系统',\s*'系统管理',\s*'API用户管理'\]/);
  assert.match(schemaSource, /legacyBreadcrumb:\s*'首页 \/ 系统管理 \/ API用户管理'/);
  assert.match(schemaSource, /showSummaryCards:\s*true/);
  assert.match(schemaSource, /showSettingsButton:\s*false/);
  assert.match(schemaSource, /options:\s*\['ERP接口',\s*'CRM接口',\s*'WMS接口'\]/);
  assert.match(schemaSource, /interfaceType:\s*'ERP接口'[\s\S]*interfaceName:\s*'生产工单下发'/);
  assert.match(schemaSource, /interfaceType:\s*'ERP接口'[\s\S]*interfaceName:\s*'ERP库存回写'/);
  assert.match(schemaSource, /interfaceType:\s*'CRM接口'[\s\S]*interfaceName:\s*'客户资料同步'/);
  assert.match(schemaSource, /interfaceType:\s*'CRM接口'[\s\S]*interfaceName:\s*'CRM会员积分同步'/);
  assert.match(schemaSource, /interfaceType:\s*'WMS接口'[\s\S]*interfaceName:\s*'WMS入库通知'/);
  assert.match(schemaSource, /interfaceType:\s*'WMS接口'[\s\S]*interfaceName:\s*'WMS出库回传'/);
});

test('api user management is read-only and exposes masked credential details', () => {
  const schemaSource = getApiUserSchemaSource();

  assert.match(schemaSource, /toolbarButtons:\s*\[[\s\S]*key:\s*'reset'[\s\S]*key:\s*'search'[\s\S]*key:\s*'export'/);
  assert.doesNotMatch(schemaSource, /key:\s*'(create|edit|delete)'/);
  assert.match(schemaSource, /rowActions:\s*\[\{\s*key:\s*'detail',\s*label:\s*'详情'/);
  assert.match(schemaSource, /\{\s*key:\s*'maskedCredential',\s*label:\s*'脱敏凭证'\s*\}/);
  assert.match(schemaSource, /maskedCredential:\s*'erp_prod_\*\*\*\*A19F'/);
  assert.match(schemaSource, /maskedCredential:\s*'crm_member_\*\*\*\*C82D'/);
  assert.match(schemaSource, /maskedCredential:\s*'wms_out_\*\*\*\*F61B'/);
  assert.doesNotMatch(schemaSource, /(plainSecret|plainToken|password):/i);
});
