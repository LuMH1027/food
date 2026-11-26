import {
  MEALS, TASTES, AVOIDS, SCENES, DEFAULT_PREFS,
  dateKey, yesterdayKey, recommend, reasonsFor,
  buildWeekPlan, buildOrderNote, explainFunnel, matchPercent
} from './engine.js';
import { parseLunchRequest } from './request.js';
import { detectProxy, getSavedKey, saveKey, recommendWithDeepSeek, testDeepSeekConnection } from './ai.js';

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
  return {
    tastes: Array.isArray(data?.tastes) ? data.tastes.filter(t => TASTES.includes(t)) : [...DEFAULT_PREFS.tastes],
    avoids: Array.isArray(data?.avoids) ? [...new Set(data.avoids.filter(a => typeof a === 'string' && a.trim() && a.length <= 12))].slice(0, 30) : [...DEFAULT_PREFS.avoids],
    budget: Number.isFinite(data?.budget) ? Math.min(50, Math.max(15, data.budget)) : 35,
    light: typeof data?.light === 'boolean' ? data.light : true,
    staple: typeof data?.staple === 'boolean' ? data.staple : true,
    blockedMains: Array.isArray(data?.blockedMains) ? [...new Set(data.blockedMains.filter(m => MEALS.some(x => x.main === m)))].slice(0, 15) : [],
    favoriteIds: Array.isArray(data?.favoriteIds) ? [...new Set(data.favoriteIds.filter(id => MEALS.some(x => x.id === id)))].slice(0, 20) : []
  };
}

let prefs = normalizePrefs(readStorage('lunch-prefs-v1', DEFAULT_PREFS));
const savedHistory = readStorage('lunch-history-v1', []);
let history = Array.isArray(savedHistory) ? savedHistory.filter(h => h && /^\d{4}-\d{2}-\d{2}$/.test(h.date) && MEALS.some(m => m.id === h.mealId && m.main === h.main)).slice(0, 60) : [];
let weekLocked = readStorage('lunch-week-locked-v1', {});
if (!weekLocked || typeof weekLocked !== 'object') weekLocked = {};

let pool = [];
let selectedId = null;
let seen = new Set();
let skipTodayIds = new Set();
let activeScene = null;
let activeMaxEta = null;
let weekOffset = 0;
let aiOverride = null; // { mealId, reason, orderNote }
let aiState = { proxy: false, model: 'deepseek-flash', busy: false };
let lastDate = dateKey();
let toastTimer;

function toast(message) {
  $('#toast').textContent = message;
  $('#toast').classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 3200);
}
function showDialog(id) { $(id).showModal(); }
function motionBehavior() { return matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'; }

function hasAiReady() {
  return aiState.proxy || Boolean(getSavedKey());
}

function updateAiStatus() {
  const ready = hasAiReady();
  $('#ai-dot').classList.toggle('on', ready);
  $('#ai-status-text').textContent = aiState.proxy ? 'DeepSeek 已连' : getSavedKey() ? 'DeepSeek 已配' : '接入 DeepSeek';
  const badge = $('#engine-mode-badge');
  if (badge) {
    badge.textContent = ready ? 'DeepSeek AI + 规则兜底' : '本地语义规则引擎';
    badge.classList.toggle('ai-live', ready);
  }
  $('#ai-mode-desc').textContent = aiState.proxy
    ? `已通过安全代理连接 DeepSeek（${aiState.model}），无需在浏览器填写 Key。`
    : '填入你的 DeepSeek Key（仅存本地浏览器）即可启用 deepseek-flash 场景理解与理由生成。未配置时本地语义规则无缝可用。';
  $('#ai-key-input').value = getSavedKey();
}

function setActiveNav(id) {
  for (const el of document.querySelectorAll('.nav-link')) {
    const active = el.id === id;
    el.classList.toggle('active', active);
    if (active) el.setAttribute('aria-current', 'page');
    else el.removeAttribute('aria-current');
  }
}

function renderScenes() {
  $('#scene-chips').innerHTML = SCENES.map(s => `<button type="button" class="scene-chip ${activeScene === s.id ? 'active' : ''}" data-scene="${s.id}" aria-pressed="${activeScene === s.id}"><span aria-hidden="true">${s.icon || ''}</span>${escape(s.label)}</button>`).join('');
}

function renderPrefs() {
  $('#taste-chips').innerHTML = TASTES.map(t => `<button type="button" class="chip ${prefs.tastes.includes(t) ? 'selected' : ''}" data-taste="${t}" aria-pressed="${prefs.tastes.includes(t)}">${t}</button>`).join('');
  $('#avoid-chips').innerHTML = [...new Set([...AVOIDS, ...prefs.avoids])].map(a => `<button type="button" class="chip ${prefs.avoids.includes(a) ? 'selected' : ''}" data-avoid="${escape(a)}" aria-pressed="${prefs.avoids.includes(a)}">${escape(a)}</button>`).join('');
  $('#budget').value = prefs.budget;
  $('#budget-value').textContent = prefs.budget;
  $('#budget').style.setProperty('--range-percent', `${(prefs.budget - 15) / 35 * 100}%`);
  $('#prefs-summary').textContent = `${prefs.tastes.length ? prefs.tastes.join(' / ') : '口味不限'} · ¥${prefs.budget}以内${prefs.avoids.length ? ` · ${prefs.avoids.length}项忌口` : ''}`;
  for (const key of ['light', 'staple']) {
    $(`#${key}-toggle`).classList.toggle('on', prefs[key]);
    $(`#${key}-toggle`).setAttribute('aria-checked', prefs[key]);
  }
  const blocked = prefs.blockedMains || [];
  $('#blocked-field').classList.toggle('hidden', blocked.length === 0);
  $('#blocked-chips').innerHTML = blocked.map(m => `<button type="button" class="chip" data-unblock="${escape(m)}">↺ ${escape(m)}</button>`).join('');
}

function renderFunnel() {
  const f = explainFunnel(prefs, history, new Date(), { skipIds: [...skipTodayIds], maxEta: activeMaxEta });
  const steps = [
    `<span class="funnel-step">菜单库 ${f.total} 道</span>`
  ];
  if (prefs.avoids.length) {
    steps.push(`<span class="funnel-step ${f.avoidRemoved ? 'active' : ''}">忌口过滤 ${f.avoidRemoved ? `-${f.avoidRemoved}` : '0'}</span>`);
  }
  if (prefs.light || prefs.staple) {
    const label = [prefs.light ? '少油' : '', prefs.staple ? '有主食' : ''].filter(Boolean).join('/');
    steps.push(`<span class="funnel-step ${f.healthRemoved ? 'active' : ''}">${label} ${f.healthRemoved ? `-${f.healthRemoved}` : '0'}</span>`);
  }
  if (f.yesterdayMain || (prefs.blockedMains && prefs.blockedMains.length)) {
    const label = f.yesterdayMain ? `避开昨日(${escape(f.yesterdayMain)})` : '已屏蔽主菜';
    steps.push(`<span class="funnel-step ${f.dedupRemoved ? 'active' : ''}">${label} ${f.dedupRemoved ? `-${f.dedupRemoved}` : '0'}</span>`);
  }
  steps.push(`<span class="funnel-step ${f.budgetRemoved ? 'active' : ''}">≤¥${prefs.budget}${activeMaxEta ? `·≤${activeMaxEta}分` : ''} ${f.budgetRemoved ? `-${f.budgetRemoved}` : '0'}</span>`);
  steps.push(`<span class="funnel-step ${f.remaining ? 'result' : 'warn'}">可选 ${f.remaining} 道</span>`);

  $('#funnel-bar').innerHTML = steps.join('<span class="funnel-arrow" aria-hidden="true">→</span>');
}

function tagsFor(m) {
  return [m.cooking, m.staple || '无主食', `约 ${m.eta} 分钟`, `${m.kcal} kcal`, m.protein].map(t => `<span>${escape(t)}</span>`).join('');
}

function renderRecommendations() {
  renderFunnel();
  const meal = pool.find(m => m.id === selectedId);
  $('#match-label').textContent = pool.length ? `${pool.length} 份可选` : '先照顾好你的偏好';
  if (!meal) {
    $('.alternatives-heading').classList.add('hidden');
    $('#alternatives').classList.add('hidden');
    $('#recommendation-content').innerHTML = `<div class="empty-state"><div class="empty-icon">🥣</div><h3>这一轮，还没找到合适的。</h3><p>当前 ${MEALS.length} 份模拟餐食中，没有同时满足所有条件的选择。可以提高预算，或放宽临时筛选。</p><p class="empty-detail">硬约束保护：忌口与昨天的主菜严格避开，不会自动放宽。</p><div class="empty-actions"><button class="primary-button btn btn--primary" id="raise-budget">预算调到 ¥50</button>${(skipTodayIds.size || activeMaxEta) ? '<button class="refresh-button btn btn--secondary" id="clear-temp-filters">放宽时效/跳过</button>' : ''}</div><button class="text-btn" id="edit-preferences">回到偏好设置 ↗</button></div>`;
    $('#alternatives').innerHTML = '';
    return;
  }

  const baseReasons = reasonsFor(meal, prefs, history);
  const aiReason = aiOverride && aiOverride.mealId === meal.id && aiOverride.reason ? aiOverride.reason : '';
  const pct = matchPercent(meal, prefs, { sceneId: activeScene });
  const today = history.find(h => h.date === dateKey());
  const isFav = (prefs.favoriteIds || []).includes(meal.id);
  const fallback = prefs.tastes.length && !meal.tastes.some(t => prefs.tastes.includes(t))
    ? `<p class="taste-fallback">暂无「${prefs.tastes.map(escape).join('、')}」口味，已优先展示严格符合忌口、预算与健康约束的餐食。</p>`
    : '';

  const reasonItems = [
    ...(aiReason ? [`<li class="reason-ai">DeepSeek 推荐：${escape(aiReason)}</li>`] : []),
    ...baseReasons.map(r => `<li>${escape(r)}</li>`)
  ];
  if (!reasonItems.length) {
    reasonItems.push(`<li>${escape(meal.subtitle)}</li>`);
  }

  const badgeText = aiReason
    ? `✦ AI 优选 · 契合度 ${pct}%`
    : `★ 今日首选 · 契合度 ${pct}%`;

  $('#recommendation-content').innerHTML = `${fallback}<article class="meal-card"><div class="meal-visual"><img src="./assets/${meal.image}.jpg" alt="餐食氛围示意图，非对应菜品实拍" width="900" height="600" fetchpriority="high"><span class="meal-badge-top">${badgeText}</span><span class="illustration-label">餐食示意</span></div><div class="meal-body"><div class="meal-title-row"><div><h3>${escape(meal.name)}</h3><p class="shop">${escape(meal.shop)} · 预计 ${meal.eta} 分钟送达</p></div><div class="price"><small>¥</small>${meal.price}<span>模拟到手价</span></div></div><div class="meal-tags">${tagsFor(meal)}</div><div class="reason-box"><ul class="reason-list">${reasonItems.join('')}</ul></div><div class="card-actions"><button class="primary-button btn btn--primary choose-button" data-choose="${meal.id}">${today?.mealId === meal.id ? '✓ 今天已选这份' : today ? '今天改吃这份' : '就吃这份，开饭'} <span>↗</span></button><button class="refresh-button btn btn--secondary" id="refresh-btn" ${pool.length < 2 ? 'disabled' : ''}><span>↻</span> 换一道</button></div><div class="card-meta-actions"><button class="meta-link ${isFav ? 'is-fav' : ''}" data-fav="${meal.id}" aria-pressed="${isFav}">${isFav ? '★ 已收藏常吃' : '☆ 收藏常吃'}</button><button class="meta-link" data-block="${escape(meal.main)}">以后不推${escape(meal.main)}</button><button class="meta-link" data-detail="${meal.id}">全部食材详情 ↗</button></div></div></article>`;

  const otherMains = pool.filter(m => m.id !== meal.id && m.main !== meal.main);
  const alternatives = otherMains.filter((m, index, list) => list.findIndex(x => x.main === m.main) === index).slice(0, 2);
  $('#alternatives').innerHTML = alternatives.map(m => `<button class="alternative" data-select="${m.id}" aria-label="改看${escape(m.name)}"><span class="alternative-image-frame"><img class="alternative-img" src="./assets/thumbnails/${m.image}.jpg" alt="餐食示意图" width="88" height="88" loading="lazy"></span><div class="alternative-body"><h4>${escape(m.name)}</h4><small>${m.cooking} · 约 ${m.eta} 分钟 · ${m.kcal} kcal</small><span class="alternative-price">¥${m.price}</span><span class="alternative-arrow">↗</span></div></button>`).join('');
  $('.alternatives-heading h3').textContent = alternatives.length === 1 ? '另一个备选' : '换个选择';
  $('.alternatives-heading').classList.toggle('hidden', alternatives.length === 0);
  $('#alternatives').classList.toggle('hidden', alternatives.length === 0);
}

function renderWeekPlan() {
  const plan = buildWeekPlan(prefs, history, weekLocked, new Date(), weekOffset);
  const validMeals = plan.filter(d => d.meal);
  const total = validMeals.reduce((sum, d) => sum + d.meal.price, 0);
  const todayDayIdx = new Date().getDay() - 1; // 0=Mon..4=Fri
  $('#week-budget').textContent = validMeals.length
    ? `连续 5 天主菜不重样 · 预计共 ¥${total}（均价 ¥${Math.round(total / validMeals.length)}/餐）`
    : '当前偏好下暂无可排菜单';
  $('#week-grid').innerHTML = plan.map(item => {
    const isToday = item.dayIndex === todayDayIdx;
    if (!item.meal) {
      return `<article class="week-card empty"><strong>${item.day}</strong><p>暂无符合条件餐食</p></article>`;
    }
    return `<article class="week-card ${isToday ? 'is-today' : ''}"><div class="week-card-top"><span class="week-day">${item.day}${isToday ? '<span class="week-today-dot">今天</span>' : ''}</span><div class="week-card-actions"><button type="button" class="week-mini-btn ${item.locked ? 'locked' : ''}" data-week-lock="${item.dayIndex}" data-meal-id="${item.meal.id}" aria-pressed="${item.locked}">${item.locked ? '🔒 已锁' : '锁定'}</button><button type="button" class="week-mini-btn" data-week-swap="${item.dayIndex}" data-meal-id="${item.meal.id}">换</button></div></div><button type="button" class="week-pick" data-select="${item.meal.id}"><h3>${escape(item.meal.name)}</h3><p>¥${item.meal.price} · ${item.meal.cooking} · ${item.meal.staple || '无主食'}</p></button></article>`;
  }).join('');
}

function generate({ rotate = false, notify = false, preferredId = null } = {}) {
  pool = recommend(prefs, history, new Date(), { skipIds: [...skipTodayIds], sceneId: activeScene, maxEta: activeMaxEta });
  if (preferredId && pool.some(m => m.id === preferredId)) {
    seen = new Set([preferredId]);
    selectedId = preferredId;
  } else if (!rotate) {
    seen = new Set();
    selectedId = pool[0]?.id || null;
  } else {
    seen.add(selectedId);
    let next = pool.find(m => !seen.has(m.id) && m.main !== pool.find(x => x.id === selectedId)?.main);
    if (!next) { seen = new Set([selectedId]); next = pool.find(m => !seen.has(m.id)); }
    selectedId = next?.id || pool[0]?.id || null;
  }
  renderRecommendations();
  renderWeekPlan();
  updateMemory();
  if (notify) toast(pool.length ? `已更新，找到 ${pool.length} 份可选午饭` : '暂时没有符合条件的餐食，试试调高预算');
}

function savePrefs() {
  const focused = document.activeElement;
  const focusKey = focused?.dataset.taste ? ['taste', focused.dataset.taste] : focused?.dataset.avoid ? ['avoid', focused.dataset.avoid] : null;
  writeStorage('lunch-prefs-v1', prefs);
  renderPrefs();
  generate();
  if (focusKey) [...document.querySelectorAll('[data-' + focusKey[0] + ']')].find(b => b.dataset[focusKey[0]] === focusKey[1])?.focus({ preventScroll: true });
}

function updateMemory() {
  const previous = history.find(h => h.date === yesterdayKey());
  $('#memory-description').textContent = previous ? `昨天吃了「${previous.main}」，今天已自动从候选中排除（含跨套餐同主菜）。` : '补记昨天主菜，今天自动避开不重样。';
  $('#yesterday-btn').innerHTML = `${previous ? '修改昨天' : '补记昨天'} <span>↗</span>`;
}

function renderHistory() {
  $('#history-count').textContent = history.length;
  $('#journal-count').textContent = `${history.length} 条记录`;
  $('#clear-history').classList.toggle('hidden', history.length === 0);
  if (!history.length) {
    $('#history-list').innerHTML = '<div class="history-empty"><span>♧</span> 选好今天的午饭，这里会记住，明天自动帮你换主菜。</div>';
    return;
  }
  $('#history-list').innerHTML = `<div class="history-items">${[...history].sort((a, b) => b.date.localeCompare(a.date)).map(h => { const m = MEALS.find(x => x.id === h.mealId); return `<article class="history-item"><div class="journal-emoji"><img src="./assets/thumbnails/${m.image}.jpg" alt="" width="56" height="56" loading="lazy"></div><div><time datetime="${h.date}">${h.date === dateKey() ? '今天' : h.date === yesterdayKey() ? '昨天' : h.date} · 午饭</time><h3>${escape(m.name)}</h3><p>¥${m.price} · ${m.cooking} · 主菜：${escape(m.main)}</p></div><button class="history-delete" data-delete="${h.date}" aria-label="删除${h.date}的午餐记录">×</button></article>`; }).join('')}</div>`;
}

function saveMeal(meal, date) {
  history = [{ date, mealId: meal.id, main: meal.main }, ...history.filter(h => h.date !== date)].slice(0, 60);
  writeStorage('lunch-history-v1', history);
  renderHistory();
  updateMemory();
}

function choose(id) {
  const meal = recommend(prefs, history, new Date(), { skipIds: [...skipTodayIds], sceneId: activeScene, maxEta: activeMaxEta }).find(m => m.id === id)
    || recommend(prefs, history).find(m => m.id === id);
  if (!meal) { generate(); toast('用餐条件已更新，请重新选择'); return; }
  saveMeal(meal, dateKey());
  selectedId = id;
  renderRecommendations();
  renderWeekPlan();
  $('#confirm-description').textContent = `${meal.name} · ¥${meal.price} · 预计 ${meal.eta} 分钟送达`;
  const note = aiOverride?.mealId === meal.id && aiOverride?.orderNote
    ? `${meal.name}（${meal.shop} · ¥${meal.price}）｜外卖备注：${aiOverride.orderNote}`
    : buildOrderNote(meal, prefs);
  $('#order-note-text').textContent = note;
  if ($('#detail-dialog').open) $('#detail-dialog').close();
  showDialog('#confirm-dialog');
}

function showDetail(id) {
  const meal = MEALS.find(m => m.id === id);
  if (!meal) return;
  $('#detail-content').innerHTML = `<img class="detail-hero" src="./assets/${meal.image}.jpg" alt="餐图仅为示意"><h2>${escape(meal.name)}</h2><p class="shop">${escape(meal.shop)} · 模拟商家 · 约 ${meal.eta} 分钟送达</p><p class="dialog-subtitle">${escape(meal.subtitle)}</p><div class="detail-price">¥${meal.price} <span class="detail-note">模拟到手价，参考热量约 ${meal.kcal} kcal</span></div><div class="meal-tags">${tagsFor(meal)}</div><div class="detail-section"><h3>模拟菜单中的全部已知食材</h3><p>${meal.ingredients.map(escape).join('、')}</p><p class="detail-note">食材按菜单标签精确匹配，如有食物过敏请向商家核实。餐图不代表对应菜品实拍。</p></div><button class="primary-button btn btn--primary" data-choose="${meal.id}">就吃这份 ↗</button>`;
  showDialog('#detail-dialog');
}

async function handleSentenceRequest(rawText) {
  const text = String(rawText || '').trim();
  const statusEl = $('#request-status');
  const submitBtn = $('#request-submit');
  if (!text) {
    statusEl.textContent = '写下口味、场景或忌口，例如：下午开会不犯困，不要香菜，30元以内。';
    statusEl.classList.add('is-error');
    $('#lunch-request').setAttribute('aria-invalid', 'true');
    $('#lunch-request').focus();
    return;
  }

  if (hasAiReady()) {
    aiState.busy = true;
    submitBtn.disabled = true;
    submitBtn.textContent = '思考中…';
    statusEl.classList.remove('is-error');
    statusEl.textContent = 'DeepSeek 正在结合你的忌口与昨日记录筛选…';
    try {
      const aiPlan = await recommendWithDeepSeek(text, prefs, history, {
        useProxy: aiState.proxy,
        apiKey: getSavedKey()
      });
      prefs = aiPlan.prefs;
      activeScene = aiPlan.sceneId;
      activeMaxEta = aiPlan.maxEta;
      aiOverride = aiPlan.pickId ? { mealId: aiPlan.pickId, reason: aiPlan.reason, orderNote: aiPlan.orderNote } : null;
      writeStorage('lunch-prefs-v1', prefs);
      renderPrefs();
      renderScenes();
      generate({ preferredId: aiPlan.pickId });
      statusEl.textContent = `DeepSeek 已解析：${aiPlan.recognized.length ? aiPlan.recognized.join(' · ') : (aiPlan.reason || '已按当前偏好重排')}`;
      $('#lunch-request').setAttribute('aria-invalid', 'false');
      $('.recommendations').scrollIntoView({ behavior: motionBehavior(), block: 'nearest' });
      return;
    } catch (error) {
      toast(`DeepSeek 暂时不可用，已切换本地规则（${error.message}）`);
    } finally {
      aiState.busy = false;
      submitBtn.disabled = false;
      submitBtn.innerHTML = '帮我选 <span aria-hidden="true">↗</span>';
    }
  }

  // 本地语义规则兜底
  const result = parseLunchRequest(text, prefs);
  statusEl.textContent = result.error || `本地语义解析：${result.recognized.join(' · ')}`;
  statusEl.classList.toggle('is-error', Boolean(result.error));
  $('#lunch-request').setAttribute('aria-invalid', String(Boolean(result.error)));
  if (result.error) { $('#lunch-request').focus(); return; }
  aiOverride = null;
  prefs = result.prefs;
  activeScene = result.sceneId || null;
  activeMaxEta = result.maxEta || null;
  renderScenes();
  savePrefs();
  $('.recommendations').scrollIntoView({ behavior: motionBehavior(), block: 'nearest' });
}

$('#request-form').addEventListener('submit', event => {
  event.preventDefault();
  handleSentenceRequest($('#lunch-request').value);
});

$('#demo-xiaoa-btn').addEventListener('click', () => {
  prefs = {
    ...structuredClone(DEFAULT_PREFS),
    tastes: ['清淡', '家常'],
    avoids: ['香菜'],
    budget: 32,
    light: true,
    staple: true
  };
  const yesterdayMeal = MEALS.find(m => m.id === 'tomato-beef') || MEALS[1];
  saveMeal(yesterdayMeal, yesterdayKey());
  writeStorage('lunch-prefs-v1', prefs);
  renderPrefs();
  const prompt = '下午要开会不想犯困，少油清爽一点，不要香菜，32元以内';
  $('#lunch-request').value = prompt;
  toast('已代入小A场景：昨日吃了番茄炖牛腩，今天自动避开');
  handleSentenceRequest(prompt);
});

document.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.scene) {
    const scene = SCENES.find(s => s.id === button.dataset.scene);
    if (!scene) return;
    activeScene = activeScene === scene.id ? null : scene.id;
    activeMaxEta = activeScene === 'fast' ? 25 : null;
    if (activeScene === 'save' && prefs.budget > 24) { prefs.budget = 24; writeStorage('lunch-prefs-v1', prefs); renderPrefs(); }
    renderScenes();
    if (activeScene) {
      $('#lunch-request').value = scene.prompt;
      if (hasAiReady()) { handleSentenceRequest(scene.prompt); return; }
      $('#request-status').classList.remove('is-error');
      $('#request-status').textContent = `已切至场景「${scene.label}」${activeMaxEta ? `（≤${activeMaxEta}分钟）` : ''}`;
    } else {
      $('#request-status').textContent = '';
    }
    generate({ notify: true });
  }
  if (button.hasAttribute('data-taste')) {
    const t = button.dataset.taste;
    prefs.tastes = prefs.tastes.includes(t) ? prefs.tastes.filter(x => x !== t) : [...prefs.tastes, t];
    savePrefs();
  }
  if (button.hasAttribute('data-avoid')) {
    const a = button.dataset.avoid;
    prefs.avoids = prefs.avoids.includes(a) ? prefs.avoids.filter(x => x !== a) : [...prefs.avoids, a];
    savePrefs();
  }
  if (button.dataset.unblock) {
    prefs.blockedMains = (prefs.blockedMains || []).filter(m => m !== button.dataset.unblock);
    savePrefs();
    toast(`已恢复推荐「${button.dataset.unblock}」`);
  }
  if (button.dataset.block) {
    const main = button.dataset.block;
    prefs.blockedMains = [...new Set([...(prefs.blockedMains || []), main])];
    savePrefs();
    toast(`以后不再推荐「${main}」，可在左侧偏好中恢复`);
  }
  if (button.dataset.fav) {
    const id = button.dataset.fav;
    const list = prefs.favoriteIds || [];
    const exists = list.includes(id);
    prefs.favoriteIds = exists ? list.filter(x => x !== id) : [...list, id];
    writeStorage('lunch-prefs-v1', prefs);
    renderRecommendations();
    toast(exists ? '已取消收藏' : '已收藏，后续推荐会优先加权');
  }
  if (button.dataset.select) {
    seen.add(selectedId);
    selectedId = button.dataset.select;
    renderRecommendations();
    $('.recommendations').scrollIntoView({ behavior: motionBehavior(), block: 'nearest' });
    toast('已切换到这份餐食');
  }
  if (button.dataset.weekLock !== undefined) {
    const idx = button.dataset.weekLock;
    if (weekLocked[idx]) delete weekLocked[idx];
    else weekLocked[idx] = button.dataset.mealId;
    writeStorage('lunch-week-locked-v1', weekLocked);
    renderWeekPlan();
  }
  if (button.dataset.weekSwap !== undefined) {
    const idx = Number(button.dataset.weekSwap);
    const currentMealId = button.dataset.mealId;
    const candidates = recommend(prefs, history);
    const curPos = candidates.findIndex(m => m.id === currentMealId);
    const next = candidates[(curPos + 1) % candidates.length];
    if (next) {
      weekLocked[idx] = next.id;
      writeStorage('lunch-week-locked-v1', weekLocked);
      renderWeekPlan();
    }
  }
  if (button.dataset.detail) showDetail(button.dataset.detail);
  if (button.dataset.choose) choose(button.dataset.choose);
  if (button.dataset.delete) {
    history = history.filter(h => h.date !== button.dataset.delete);
    writeStorage('lunch-history-v1', history);
    renderHistory();
    generate();
    toast('这条记录已删除');
  }
  if (button.hasAttribute('data-close')) button.closest('dialog').close();
  if (button.id === 'refresh-btn') generate({ rotate: true });
  if (button.id === 'raise-budget') { prefs.budget = 50; savePrefs(); toast('预算已调到 ¥50'); }
  if (button.id === 'clear-temp-filters') { skipTodayIds.clear(); activeMaxEta = null; activeScene = null; renderScenes(); generate(); toast('已恢复全部可选餐食'); }
  if (button.id === 'edit-preferences') openPreferences();
});

$('#budget').addEventListener('input', e => { prefs.budget = Number(e.target.value); savePrefs(); });
for (const key of ['light', 'staple']) $(`#${key}-toggle`).addEventListener('click', () => { prefs[key] = !prefs[key]; savePrefs(); });
$('#custom-form').addEventListener('submit', e => {
  e.preventDefault();
  const input = $('#custom-avoid');
  const value = input.value.trim();
  if (!value) { toast('先输入想避开的食材'); return; }
  if (prefs.avoids.includes(value)) { toast('这项忌口已经记住了'); return; }
  if (prefs.avoids.length >= 30) { toast('最多记录 30 项忌口'); return; }
  prefs.avoids.push(value);
  input.value = '';
  savePrefs();
  toast(MEALS.some(m => m.ingredients.includes(value)) ? `已避开含${value}的菜品` : `已记住「${value}」；模拟菜单暂无同名标签`);
});

$('#reset-prefs').addEventListener('click', () => {
  prefs = structuredClone(DEFAULT_PREFS);
  activeScene = null;
  activeMaxEta = null;
  aiOverride = null;
  skipTodayIds.clear();
  $('#lunch-request').value = '';
  $('#request-status').textContent = '';
  renderScenes();
  savePrefs();
  toast('偏好已恢复默认');
});

$('#generate-btn').addEventListener('click', () => {
  generate({ notify: true });
  if ($('#preferences-dialog').open) $('#preferences-dialog').close();
  if (compactLayout.matches) $('.recommendations').scrollIntoView({ behavior: motionBehavior(), block: 'start' });
});

$('#refresh-week').addEventListener('click', () => {
  weekOffset += 1;
  renderWeekPlan();
  toast('已重排未锁定的工作日菜单');
});

$('#copy-order-note').addEventListener('click', async () => {
  const text = $('#order-note-text').textContent;
  try {
    await navigator.clipboard.writeText(text);
    toast('外卖备注已复制');
  } catch {
    toast('请手动长按复制备注');
  }
});

$('#ai-config-btn').addEventListener('click', () => {
  updateAiStatus();
  $('#ai-test-status').textContent = '';
  showDialog('#ai-dialog');
});

$('#ai-key-form').addEventListener('submit', async event => {
  event.preventDefault();
  const key = $('#ai-key-input').value.trim();
  const status = $('#ai-test-status');
  if (!key && !aiState.proxy) {
    status.textContent = '请输入 DeepSeek API Key';
    status.classList.add('is-error');
    return;
  }
  if (key) saveKey(key);
  status.classList.remove('is-error');
  status.textContent = '正在测试 deepseek-flash 连通性…';
  try {
    const ok = await testDeepSeekConnection({ useProxy: !key && aiState.proxy, apiKey: key || getSavedKey() });
    status.textContent = ok ? '连通成功，已启用 deepseek-flash。' : '连通异常，请检查 Key。';
    updateAiStatus();
  } catch (err) {
    status.textContent = `测试失败：${err.message}`;
    status.classList.add('is-error');
  }
});

$('#clear-ai-key').addEventListener('click', () => {
  saveKey('');
  $('#ai-key-input').value = '';
  $('#ai-test-status').textContent = '已清除本地 Key。';
  updateAiStatus();
});

$('#yesterday-btn').addEventListener('click', () => {
  const previous = history.find(h => h.date === yesterdayKey());
  const mains = MEALS.filter((m, i, all) => all.findIndex(x => x.main === m.main) === i);
  $('#yesterday-select').innerHTML = mains.map(m => `<option value="${m.id}">${escape(m.main)}</option>`).join('');
  if (previous) { const equivalent = mains.find(m => m.main === previous.main); if (equivalent) $('#yesterday-select').value = equivalent.id; }
  showDialog('#yesterday-dialog');
});
$('#save-yesterday').addEventListener('click', () => { const meal = MEALS.find(m => m.id === $('#yesterday-select').value); if (!meal) return; saveMeal(meal, yesterdayKey()); $('#yesterday-dialog').close(); generate(); toast(`昨天的${meal.main}已记下，今天换点别的`); });
$('#confirm-done').addEventListener('click', () => $('#confirm-dialog').close());
$('#nav-history').addEventListener('click', () => { setActiveNav('nav-history'); $('#history-section').scrollIntoView({ behavior: motionBehavior() }); $('#history-section').focus({ preventScroll: true }); });
$('#nav-week').addEventListener('click', () => { setActiveNav('nav-week'); $('#week-section').scrollIntoView({ behavior: motionBehavior() }); $('#week-section').focus({ preventScroll: true }); });
$('#nav-lunch').addEventListener('click', () => { setActiveNav('nav-lunch'); window.scrollTo({ top: 0, behavior: motionBehavior() }); });
$('#clear-history').addEventListener('click', () => { if (!window.confirm('清空所有午餐记录？清空后将无法根据昨天的记录避开重复主菜。')) return; history = []; writeStorage('lunch-history-v1', history); renderHistory(); generate(); toast('午餐记录已清空'); });
for (const id of ['#about-btn', '#footer-about']) $(id).addEventListener('click', () => showDialog('#about-dialog'));
for (const dialog of document.querySelectorAll('dialog')) dialog.addEventListener('click', e => { if (e.target === dialog) { const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close(); } });

function updateDate() {
  $('#date-label').textContent = new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' });
  if (lastDate !== dateKey()) { lastDate = dateKey(); generate(); renderHistory(); }
}
document.addEventListener('visibilitychange', () => { if (!document.hidden) updateDate(); });
window.addEventListener('storage', event => {
  if (event.key === 'lunch-prefs-v1' || event.key === 'lunch-history-v1' || event.key === null) {
    prefs = normalizePrefs(readStorage('lunch-prefs-v1', DEFAULT_PREFS));
    const incoming = readStorage('lunch-history-v1', []);
    history = Array.isArray(incoming) ? incoming.filter(h => h && /^\d{4}-\d{2}-\d{2}$/.test(h.date) && MEALS.some(m => m.id === h.mealId && m.main === h.main)).slice(0, 60) : [];
    renderPrefs(); renderHistory(); generate();
  }
});

const compactLayout = matchMedia('(max-width: 899px)');
const preferencesPanel = $('.preferences');
const preferencesHome = preferencesPanel.parentElement;
const preferencesDialog = $('#preferences-dialog');
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
updateDate();
renderScenes();
renderPrefs();
renderHistory();
generate();
if (!storageAvailable) writeStorage('lunch-prefs-v1', prefs);
for (const button of document.querySelectorAll('dialog .primary-button')) button.classList.add('btn', 'btn--primary');

detectProxy().then(info => {
  aiState.proxy = info.available;
  if (info.model) aiState.model = info.model;
  updateAiStatus();
});
