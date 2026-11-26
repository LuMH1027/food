import { MEALS, TASTES, AVOIDS, DEFAULT_PREFS, dateKey, yesterdayKey, recommend, reasonsFor } from './engine.js';
import { parseLunchRequest } from './request.js';
const $ = selector => document.querySelector(selector);
const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
let storageAvailable = true;
function readStorage(key, fallback) {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : structuredClone(fallback); }
  catch { storageAvailable = false; return structuredClone(fallback); }
}
function writeStorage(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch { storageAvailable = false; }
  $('#saved-note').textContent = storageAvailable ? '' : '浏览器无法保存数据，本次体验仍可继续';
  $('#saved-note').classList.toggle('storage-warning', !storageAvailable);
}
function normalizePrefs(data) {
  return { tastes: Array.isArray(data?.tastes) ? data.tastes.filter(t => TASTES.includes(t)) : [...DEFAULT_PREFS.tastes], avoids: Array.isArray(data?.avoids) ? [...new Set(data.avoids.filter(a => typeof a === 'string' && a.trim() && a.length <= 12))].slice(0, 30) : [...DEFAULT_PREFS.avoids], budget: Number.isFinite(data?.budget) ? Math.min(50, Math.max(15, data.budget)) : 35, light: typeof data?.light === 'boolean' ? data.light : true, staple: typeof data?.staple === 'boolean' ? data.staple : true };
}
let prefs = normalizePrefs(readStorage('lunch-prefs-v1', DEFAULT_PREFS));
const savedHistory = readStorage('lunch-history-v1', []);
let history = Array.isArray(savedHistory) ? savedHistory.filter(h => h && /^\d{4}-\d{2}-\d{2}$/.test(h.date) && MEALS.some(m => m.id === h.mealId && m.main === h.main)).slice(0, 60) : [];
let pool = [], selectedId, seen = new Set(), lastDate = dateKey(), toastTimer;
function toast(message) { $('#toast').textContent = message; $('#toast').classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 3200); }
function showDialog(id) { $(id).showModal(); }
function renderPrefs() {
  $('#taste-chips').innerHTML = TASTES.map(t => `<button type="button" class="chip ${prefs.tastes.includes(t) ? 'selected' : ''}" data-taste="${t}" aria-pressed="${prefs.tastes.includes(t)}">${t}</button>`).join('');
  $('#avoid-chips').innerHTML = [...new Set([...AVOIDS, ...prefs.avoids])].map(a => `<button type="button" class="chip ${prefs.avoids.includes(a) ? 'selected' : ''}" data-avoid="${escape(a)}" aria-pressed="${prefs.avoids.includes(a)}">${escape(a)}</button>`).join('');
  $('#budget').value = prefs.budget;
  $('#budget-value').textContent = prefs.budget;
  $('#budget').style.setProperty('--range-percent', `${(prefs.budget - 15) / 35 * 100}%`);
  $('#prefs-summary').textContent = `${prefs.tastes.length ? prefs.tastes.join(' / ') : '口味不限'} · ¥${prefs.budget}以内${prefs.avoids.length ? ` · ${prefs.avoids.length}项忌口` : ''}`;
  for (const key of ['light', 'staple']) { $(`#${key}-toggle`).classList.toggle('on', prefs[key]); $(`#${key}-toggle`).setAttribute('aria-checked', prefs[key]); }
}
function tagsFor(m) { return [m.cooking, m.staple || '无主食'].map(t => `<span>${escape(t)}</span>`).join(''); }
function renderRecommendations() {
  const meal = pool.find(m => m.id === selectedId);
  $('#match-label').textContent = pool.length ? `${pool.length} 份可选` : '先照顾好你的偏好';
  $('.alternatives-heading').classList.toggle('hidden', pool.length <= 1);
  $('#alternatives').classList.toggle('hidden', pool.length <= 1);
  if (!meal) {
    $('#recommendation-content').innerHTML = `<div class="empty-state"><div class="empty-icon">🥣</div><h3>这一轮，还没找到合适的。</h3><p>当前 ${MEALS.length} 份模拟餐食中，没有同时满足所有条件的选择。可以提高预算，或调整口味之外的用餐偏好。</p><p class="empty-detail">忌口和昨天的主菜仍严格避开，不会自动放宽。</p><button class="primary-button" id="raise-budget">预算调到 ¥50，再找找</button><button class="text-btn" id="edit-preferences">回到偏好设置 ↗</button></div>`;
    $('#alternatives').innerHTML = ''; return;
  }
  const reasons = reasonsFor(meal, prefs, history).filter(r => !r.includes('少油不炸') && !r.includes('午饭吃踏实'));
  const today = history.find(h => h.date === dateKey());
  const fallback = prefs.tastes.length && !meal.tastes.some(t => prefs.tastes.includes(t)) ? `<p class="taste-fallback">暂无「${prefs.tastes.map(escape).join('、')}」口味，先看看符合预算与忌口的选择。</p>` : '';
  $('#recommendation-content').innerHTML = `${fallback}<article class="meal-card"><div class="meal-visual"><img src="./assets/${meal.image}.jpg" alt="餐食氛围示意图，非对应菜品实拍" width="900" height="600" fetchpriority="high"><span class="illustration-label">餐食示意</span></div><div class="meal-body"><div class="meal-title-row"><div><h3>${escape(meal.name)}</h3></div><div class="price"><small>¥</small>${meal.price}<span>模拟价</span></div></div><div class="meal-tags">${tagsFor(meal)}</div><div class="reason-box"><ul class="reason-list">${reasons.map(r => `<li>${escape(r)}</li>`).join('')}</ul></div><div class="card-actions"><button class="primary-button btn btn--primary choose-button" data-choose="${meal.id}">${today?.mealId === meal.id ? '✓ 今天已选这份' : today ? '今天改吃这份' : '就吃这份'} <span>↗</span></button><button class="refresh-button btn btn--secondary" id="refresh-btn" ${pool.length < 2 ? 'disabled' : ''}><span>↻</span> 换一道</button></div><button class="details-link" data-detail="${meal.id}">食材详情 ↗</button></div></article>`;
  const otherMains = pool.filter(m => m.id !== meal.id && m.main !== meal.main);
  const alternatives = otherMains.filter((m, index, list) => list.findIndex(x => x.main === m.main) === index).slice(0, 2);
  $('#alternatives').innerHTML = alternatives.map(m => `<button class="alternative" data-select="${m.id}" aria-label="改看${escape(m.name)}"><span class="alternative-image-frame"><img class="alternative-img" src="./assets/thumbnails/${m.image}.jpg" alt="餐食示意图" width="88" height="88" loading="lazy"></span><div class="alternative-body"><h4>${escape(m.name)}</h4><small>${m.cooking} · ${m.staple || '无主食'}</small><span class="alternative-price">¥${m.price}</span><span class="alternative-arrow">↗</span></div></button>`).join('');
  $('.alternatives-heading h3').textContent = alternatives.length === 1 ? '另一个选择' : '换个选择';
  $('.alternatives-heading').classList.toggle('hidden', alternatives.length === 0);
  $('#alternatives').classList.toggle('hidden', alternatives.length === 0);
}
function generate({ rotate = false, notify = false } = {}) {
  pool = recommend(prefs, history);
  if (!rotate) { seen = new Set(); selectedId = pool[0]?.id; }
  else {
    seen.add(selectedId);
    // 先轮换尚未出现过的主菜；这一轮结束后再从头选择。
    let next = pool.find(m => !seen.has(m.id) && m.main !== pool.find(x => x.id === selectedId)?.main);
    if (!next) { seen = new Set([selectedId]); next = pool.find(m => !seen.has(m.id)); }
    selectedId = next?.id || pool[0]?.id;
  }
  renderRecommendations(); updateMemory();
  if (notify) toast(pool.length ? `选好了，找到 ${pool.length} 份符合偏好的午饭` : '暂时没有符合所有条件的餐食，试试调整预算');
}
function savePrefs() {
  const focused = document.activeElement;
  const focusKey = focused?.dataset.taste ? ['taste', focused.dataset.taste] : focused?.dataset.avoid ? ['avoid', focused.dataset.avoid] : null;
  writeStorage('lunch-prefs-v1', prefs); renderPrefs(); generate();
  if (focusKey) [...document.querySelectorAll('[data-' + focusKey[0] + ']')].find(b => b.dataset[focusKey[0]] === focusKey[1])?.focus({ preventScroll: true });
}
$('#request-form').addEventListener('submit', event => {
  event.preventDefault();
  const result = parseLunchRequest($('#lunch-request').value, prefs);
  $('#request-status').textContent = result.error || result.recognized.join(' · ');
  $('#request-status').classList.toggle('is-error', Boolean(result.error));
  $('#lunch-request').setAttribute('aria-invalid', String(Boolean(result.error)));
  if (result.error) { $('#lunch-request').focus(); return; }
  prefs = result.prefs; savePrefs();
  $('.recommendations').scrollIntoView({ behavior: motionBehavior(), block: 'nearest' });
});
function updateMemory() {
  const previous = history.find(h => h.date === yesterdayKey());
  $('#memory-description').textContent = previous ? `昨天吃了${previous.main}，今天已帮你避开。` : '补记主菜，明天不重样。';
  $('#yesterday-btn').innerHTML = `${previous ? '修改昨天' : '补记昨天'} <span>↗</span>`;
}
function renderHistory() {
  $('#history-count').textContent = history.length;
  $('#journal-count').textContent = `${history.length} 条记录`;
  $('#clear-history').classList.toggle('hidden', history.length === 0);
  if (!history.length) { $('#history-list').innerHTML = '<div class="history-empty"><span>♧</span> 选好今天的午饭，这里会记住。</div>'; return; }
  $('#history-list').innerHTML = `<div class="history-items">${[...history].sort((a, b) => b.date.localeCompare(a.date)).map(h => { const m = MEALS.find(m => m.id === h.mealId); return `<article class="history-item"><div class="journal-emoji"><img src="./assets/thumbnails/${m.image}.jpg" alt="" width="56" height="56" loading="lazy"></div><div><time datetime="${h.date}">${h.date === dateKey() ? '今天' : h.date === yesterdayKey() ? '昨天' : h.date} · 午饭</time><h3>${escape(m.name)}</h3><p>¥${m.price} · ${m.cooking}</p></div><button class="history-delete" data-delete="${h.date}" aria-label="删除${h.date}的午餐记录">×</button></article>`; }).join('')}</div>`;
}
function saveMeal(meal, date) {
  history = [{ date, mealId: meal.id, main: meal.main }, ...history.filter(h => h.date !== date)].slice(0, 60);
  writeStorage('lunch-history-v1', history); renderHistory(); updateMemory();
}
function choose(id) {
  // 确认时重新验证日期与偏好，避免跨午夜或旧弹窗绕过约束。
  const meal = recommend(prefs, history).find(m => m.id === id);
  if (!meal) { generate(); toast('用餐条件已更新，请重新选择'); return; }
  saveMeal(meal, dateKey()); selectedId = id; renderRecommendations();
  $('#confirm-description').textContent = `${meal.name} · ¥${meal.price}`;
  if ($('#detail-dialog').open) $('#detail-dialog').close();
  showDialog('#confirm-dialog');
}
function showDetail(id) {
  const meal = MEALS.find(m => m.id === id); if (!meal) return;
  $('#detail-content').innerHTML = `<img class="detail-hero" src="./assets/${meal.image}.jpg" alt="餐图仅为示意"><h2>${escape(meal.name)}</h2><p class="shop">${escape(meal.shop)} · 模拟商家</p><p class="dialog-subtitle">${escape(meal.subtitle)}</p><div class="detail-price">¥${meal.price} <span class="detail-note">模拟到手价，已含配送费</span></div><div class="meal-tags">${tagsFor(meal)}</div><div class="detail-section"><h3>模拟菜单中的全部已知食材</h3><p>${meal.ingredients.map(escape).join('、')}</p><p class="detail-note">食材按菜单标签精确匹配，未覆盖未知配料与交叉接触风险。如有食物过敏，请向商家核实。餐图不代表对应菜品实拍。</p></div><button class="primary-button" data-choose="${meal.id}">就吃这个，记下今天的午饭 ↗</button>`;
  showDialog('#detail-dialog');
}
document.addEventListener('click', event => {
  const button = event.target.closest('button'); if (!button) return;
  if (button.hasAttribute('data-taste')) { const t = button.dataset.taste; prefs.tastes = prefs.tastes.includes(t) ? prefs.tastes.filter(x => x !== t) : [...prefs.tastes, t]; savePrefs(); }
  if (button.hasAttribute('data-avoid')) { const a = button.dataset.avoid; prefs.avoids = prefs.avoids.includes(a) ? prefs.avoids.filter(x => x !== a) : [...prefs.avoids, a]; savePrefs(); }
  if (button.dataset.select) { seen.add(selectedId); selectedId = button.dataset.select; renderRecommendations(); toast('已换成这份，看看合不合口味'); }
  if (button.dataset.detail) showDetail(button.dataset.detail);
  if (button.dataset.choose) choose(button.dataset.choose);
  if (button.dataset.delete) { history = history.filter(h => h.date !== button.dataset.delete); writeStorage('lunch-history-v1', history); renderHistory(); generate(); toast('这条午餐记录已删除'); }
  if (button.hasAttribute('data-close')) button.closest('dialog').close();
  if (button.id === 'refresh-btn') generate({ rotate: true });
  if (button.id === 'raise-budget') { prefs.budget = 50; savePrefs(); toast('预算已调到 ¥50，忌口条件保持不变'); }
  if (button.id === 'edit-preferences') openPreferences();
});
$('#budget').addEventListener('input', e => { prefs.budget = Number(e.target.value); savePrefs(); });
for (const key of ['light', 'staple']) $(`#${key}-toggle`).addEventListener('click', () => { prefs[key] = !prefs[key]; savePrefs(); });
$('#custom-form').addEventListener('submit', e => {
  e.preventDefault(); const input = $('#custom-avoid'); const value = input.value.trim();
  if (!value) { toast('先输入想避开的食材'); return; }
  if (prefs.avoids.includes(value)) { toast('这项忌口已经记住了'); return; }
  if (prefs.avoids.length >= 30) { toast('最多记录 30 项忌口，请先取消部分选项'); return; }
  prefs.avoids.push(value); input.value = ''; savePrefs();
  toast(MEALS.some(m => m.ingredients.includes(value)) ? `已避开含${value}的菜品` : `已记住「${value}」；当前模拟菜单无同名食材标签`);
});
$('#reset-prefs').addEventListener('click', () => { prefs = structuredClone(DEFAULT_PREFS); savePrefs(); toast('偏好已恢复默认，午餐记录仍保留'); });
$('#generate-btn').addEventListener('click', () => {
  generate({ notify: true });
  if ($('#preferences-dialog').open) $('#preferences-dialog').close();
  if (compactLayout.matches) $('.recommendations').scrollIntoView({ behavior: motionBehavior(), block: 'start' });
});
$('#yesterday-btn').addEventListener('click', () => {
  const previous = history.find(h => h.date === yesterdayKey());
  const mains = MEALS.filter((m, i, all) => all.findIndex(x => x.main === m.main) === i);
  $('#yesterday-select').innerHTML = mains.map(m => `<option value="${m.id}">${escape(m.main)}</option>`).join('');
  if (previous) { const equivalent = mains.find(m => m.main === previous.main); $('#yesterday-select').value = equivalent.id; }
  showDialog('#yesterday-dialog');
});
$('#save-yesterday').addEventListener('click', () => { const meal = MEALS.find(m => m.id === $('#yesterday-select').value); if (!meal) return; saveMeal(meal, yesterdayKey()); $('#yesterday-dialog').close(); generate(); toast(`昨天的${meal.main}已记下，今天换点别的`); });
$('#confirm-done').addEventListener('click', () => $('#confirm-dialog').close());
$('#nav-history').addEventListener('click', () => { $('#history-section').scrollIntoView({ behavior: motionBehavior() }); $('#history-section').focus({ preventScroll: true }); });
$('#nav-lunch').addEventListener('click', () => window.scrollTo({ top: 0, behavior: motionBehavior() }));
$('#clear-history').addEventListener('click', () => { if (!window.confirm('清空所有午餐记录？清空后将无法根据昨天的记录避开重复主菜。')) return; history = []; writeStorage('lunch-history-v1', history); renderHistory(); generate(); toast('午餐记录已清空'); });
for (const id of ['#about-btn', '#footer-about']) $(id).addEventListener('click', () => showDialog('#about-dialog'));
for (const dialog of document.querySelectorAll('dialog')) dialog.addEventListener('click', e => { if (e.target === dialog) { const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close(); } });
function updateDate() {
  $('#date-label').textContent = new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' });
  if (lastDate !== dateKey()) { lastDate = dateKey(); generate(); renderHistory(); }
}
document.addEventListener('visibilitychange', () => { if (!document.hidden) updateDate(); });
window.addEventListener('storage', event => { if (event.key === 'lunch-prefs-v1' || event.key === 'lunch-history-v1' || event.key === null) { prefs = normalizePrefs(readStorage('lunch-prefs-v1', DEFAULT_PREFS)); const incoming = readStorage('lunch-history-v1', []); history = Array.isArray(incoming) ? incoming.filter(h => h && /^\d{4}-\d{2}-\d{2}$/.test(h.date) && MEALS.some(m => m.id === h.mealId && m.main === h.main)).slice(0, 60) : []; renderPrefs(); renderHistory(); generate(); } });
const compactLayout = matchMedia('(max-width: 899px)');
const preferencesPanel = $('.preferences');
const preferencesHome = preferencesPanel.parentElement;
const preferencesDialog = $('#preferences-dialog');
function motionBehavior() { return matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'; }
function syncPreferencesLayout() {
  if (compactLayout.matches) {
    if (preferencesPanel.parentElement !== preferencesDialog) preferencesDialog.append(preferencesPanel);
  } else {
    if (preferencesDialog.open) preferencesDialog.close();
    preferencesHome.prepend(preferencesPanel);
  }
}
function openPreferences() {
  if (compactLayout.matches) { if (!preferencesDialog.open) preferencesDialog.showModal(); }
  else { preferencesPanel.scrollIntoView({ behavior: motionBehavior(), block: 'start' }); $('#taste-chips button').focus({ preventScroll: true }); }
}
compactLayout.addEventListener('change', syncPreferencesLayout);
$('#open-prefs').addEventListener('click', openPreferences);
$('#close-prefs').addEventListener('click', () => preferencesDialog.close());
syncPreferencesLayout();
updateDate(); renderPrefs(); renderHistory(); generate();
if (!storageAvailable) writeStorage('lunch-prefs-v1', prefs);
for (const button of document.querySelectorAll('dialog .primary-button')) button.classList.add('btn', 'btn--primary');
