// Optional browser regression: npm install --no-save playwright, then node tests/browser.mjs.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const origin = process.env.DEMO_URL || 'http://localhost:5173';
const failures = [];
try {
  const context = await browser.newContext();
  const page = await context.newPage();
  page.on('pageerror', e => failures.push(e.message));
  for (const [width, height] of [[1440,900],[1024,768],[820,1180],[768,1024],[390,844],[320,740]]) {
    await page.setViewportSize({ width, height });
    await page.goto(origin);
    await page.locator('.meal-card').waitFor();
    const metrics = await page.evaluate(() => ({
      viewport: innerWidth,
      content: document.documentElement.scrollWidth,
      imageLoaded: [...document.querySelectorAll('.meal-card img')].every(i => i.complete && i.naturalWidth > 0),
      mobileButtonVisible: document.querySelector('#open-prefs').getBoundingClientRect().height > 0,
      panelInDialog: document.querySelector('#preferences-dialog').contains(document.querySelector('.preferences')),
      shortTargets: [...document.querySelectorAll('button.primary-button, button.refresh-button, button.chip, button.switch, button.mobile-preferences')].filter(b => { const r = b.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.height < 43; }).map(b => b.id || b.textContent.trim())
    }));
    assert.ok(metrics.content <= metrics.viewport, `${width}px: horizontal overflow`);
    assert.ok(metrics.imageLoaded, `${width}px: image failed`);
    assert.equal(metrics.mobileButtonVisible, width < 900);
    assert.equal(metrics.panelInDialog, width < 900);
    assert.deepEqual(metrics.shortTargets, [], `${width}px: targets smaller than 44px`);
    console.log(`PASS ${width}×${height}: layout, images, preference placement, tap targets`);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(origin);
  await page.locator('#week-grid .week-card').first().waitFor();
  assert.equal(await page.locator('#week-grid .week-card').count(), 5);
  await page.locator('#lunch-request').fill('清淡点，不要鸡蛋，30元以内');
  await page.locator('#request-submit').click();
  await page.waitForFunction(() => !document.querySelector('#request-submit').disabled && (document.querySelector('#request-status').textContent.includes('DeepSeek 已解析') || document.querySelector('#request-status').textContent.includes('本地规则：')));
  assert.equal(await page.locator('#lunch-request').getAttribute('aria-invalid'), 'false');
  assert.match(await page.locator('#prefs-summary').innerText(), /¥30/);
  await page.locator('#open-prefs').click();
  await page.locator('#preferences-dialog[open]').waitFor();
  await page.locator('[data-taste="香辣"]').click();
  assert.equal(await page.locator('[data-taste="香辣"]').getAttribute('aria-pressed'), 'true');
  assert.equal(await page.evaluate(() => document.activeElement.dataset.taste), '香辣');
  await page.locator('#custom-avoid').fill('香菇');
  await page.locator('#custom-form button').click();
  assert.equal(await page.locator('[data-avoid="香菇"]').getAttribute('aria-pressed'), 'true');
  await page.locator('#budget').focus();
  await page.keyboard.press('Home');
  assert.equal(await page.locator('#budget-value').innerText(), '15');
  await page.locator('#generate-btn').click();
  assert.equal(await page.locator('#preferences-dialog').getAttribute('open'), null);
  await page.locator('.empty-state').waitFor();
  await page.locator('#raise-budget').click();
  await page.locator('.meal-card').waitFor();
  assert.match(await page.locator('#prefs-summary').innerText(), /¥50/);
  await page.locator('#yesterday-btn').click();
  await page.locator('#yesterday-select').selectOption('chicken-grain');
  await page.locator('#save-yesterday').click();
  assert.match(await page.locator('#memory-description').innerText(), /香煎鸡腿/);
  const chosen = await page.locator('.meal-title-row h3').innerText();
  await page.locator('.choose-button').click();
  await page.locator('#confirm-dialog[open]').waitFor();
  assert.match(await page.locator('#confirm-description').innerText(), new RegExp(chosen));
  await page.locator('#confirm-done').click();
  await page.reload();
  assert.equal(await page.locator('.history-item').count(), 2);
  assert.match(await page.locator('#history-list').innerText(), new RegExp(chosen));
  assert.match(await page.locator('#prefs-summary').innerText(), /¥50/);
  await page.locator('#open-prefs').click();
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#preferences-dialog').getAttribute('open'), null);
  assert.equal(await page.evaluate(() => document.activeElement.id), 'open-prefs');
  await page.locator('#open-prefs').click();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForFunction(() => document.querySelector('.workspace > .preferences'));
  assert.equal(await page.locator('#preferences-dialog').getAttribute('open'), null);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForFunction(() => document.querySelector('#preferences-dialog > .preferences'));
  assert.equal(await page.locator('#preferences-dialog').getAttribute('open'), null);
  assert.deepEqual(failures, [], 'browser runtime errors');
  console.log('PASS sentence input, ambiguous exclusion rejection, mobile settings, keyboard focus, custom exclusions, empty state, history, reload, Escape, live resize');
  await context.close();
} finally { await browser.close(); }
