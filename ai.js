import { TASTES, recommend, yesterdayKey } from './engine.js';

const KEY_STORAGE = 'lunch-deepseek-key-v1';
const MODEL = 'deepseek-flash';
const BASE_URL = 'https://api.deepseek.com';

export function getSavedKey() {
  try { return localStorage.getItem(KEY_STORAGE) || ''; } catch { return ''; }
}

export function saveKey(key) {
  try {
    const clean = String(key || '').trim();
    if (clean) localStorage.setItem(KEY_STORAGE, clean);
    else localStorage.removeItem(KEY_STORAGE);
  } catch {}
}

export async function detectProxy() {
  try {
    const r = await fetch('./api/ai/status');
    if (!r.ok) return { available: false };
    const data = await r.json();
    return { available: Boolean(data.available), model: data.model || MODEL };
  } catch {
    return { available: false };
  }
}

async function callDeepSeek(messages, { useProxy = false, apiKey = '' } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12_000);
  try {
    let response;
    if (useProxy) {
      response = await fetch('./api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
        signal: controller.signal
      });
    } else {
      if (!apiKey) throw new Error('未配置 DeepSeek Key');
      response = await fetch(`${BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: MODEL,
          messages,
          thinking: { type: 'disabled' },
          response_format: { type: 'json_object' },
          temperature: 0.2,
          max_tokens: 450
        }),
        signal: controller.signal
      });
    }
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || err.error || `请求失败 (${response.status})`);
    }
    const data = await response.json();
    const raw = data?.choices?.[0]?.message?.content || '';
    return JSON.parse(raw);
  } finally {
    clearTimeout(timer);
  }
}

export function sanitizeAiPlan(raw, current, history, date = new Date()) {
  const obj = raw && typeof raw === 'object' ? raw : {};
  const next = structuredClone(current);
  const recognized = [];

  if (Array.isArray(obj.tastes)) {
    const valid = obj.tastes.filter(t => TASTES.includes(t));
    if (valid.length) {
      next.tastes = [...new Set(valid)];
      recognized.push(next.tastes.join(' / '));
    }
  }

  if (Array.isArray(obj.avoids)) {
    const added = [...new Set(obj.avoids.filter(v => typeof v === 'string' && v.trim()).map(v => v.trim().slice(0, 12)))];
    if (added.length) {
      next.avoids = [...new Set([...next.avoids, ...added])].slice(0, 30);
      recognized.push(`避开${added.join('、')}`);
    }
  }

  if (Number.isInteger(obj.budget) && obj.budget >= 15 && obj.budget <= 50) {
    next.budget = obj.budget;
    recognized.push(`¥${obj.budget}以内`);
  }

  if (typeof obj.light === 'boolean' && obj.light !== current.light) {
    next.light = obj.light;
    if (obj.light) recognized.push('少油不炸');
  }

  if (typeof obj.staple === 'boolean' && obj.staple !== current.staple) {
    next.staple = obj.staple;
    if (obj.staple) recognized.push('包含主食');
  }

  const sceneId = ['focus', 'fast', 'save', 'warm'].includes(obj.scene) ? obj.scene : null;
  const maxEta = Number.isInteger(obj.maxEta) && obj.maxEta >= 20 && obj.maxEta <= 40 ? obj.maxEta : null;
  if (maxEta) recognized.push(`${maxEta}分钟内送到`);

  const pool = recommend(next, history, date, { sceneId, maxEta });
  const pickId = typeof obj.recommendedId === 'string' && pool.some(m => m.id === obj.recommendedId)
    ? obj.recommendedId
    : pool[0]?.id || null;

  const reason = typeof obj.reason === 'string' && obj.reason.trim()
    ? obj.reason.trim().slice(0, 48)
    : '';

  const orderNote = typeof obj.orderNote === 'string' && obj.orderNote.trim()
    ? obj.orderNote.trim().slice(0, 40)
    : '';

  return { prefs: next, recognized, sceneId, maxEta, pickId, reason, orderNote };
}

export async function recommendWithDeepSeek(userText, current, history, options = {}) {
  const candidates = recommend(current, history, options.date);
  const menuSummary = candidates.slice(0, 12).map(m => ({
    id: m.id, name: m.name, main: m.main, price: m.price, eta: m.eta,
    tastes: m.tastes, staple: m.staple, cooking: m.cooking, ingredients: m.ingredients
  }));

  const system = `你是办公室午餐点单助手，必须严格遵守忌口与预算，只返回合法 JSON。字段：
tastes: 从["清淡","家常","香辣","酸甜","浓郁"]选，未提及传[]；
avoids: 新提到的忌口食材数组（如香菜、辣椒、花生、鸡蛋、牛奶、海鲜、牛肉），未提及传[]；
budget: 15-50整数或null；
light: 布尔值或null（如提到少油、清淡不犯困传true）；
staple: 布尔值或null（如提到要有主食传true，不要主食传false）；
scene: "focus"|"fast"|"save"|"warm"|null；
maxEta: 如提到配送时限传20-40整数，否则null；
recommendedId: 优先从候选菜单选最合适的id（没有合适的传null）；
reason: 一句简洁自然的推荐理由，不超过36字，不编造营养或医疗结论；
orderNote: 一句可直接贴给外卖商家的短备注，不超过24字。`;

  const user = JSON.stringify({
    request: String(userText || '').trim().slice(0, 200),
    currentPrefs: { tastes: current.tastes, avoids: current.avoids, budget: current.budget, light: current.light, staple: current.staple },
    yesterdayMain: history.find(h => h.date === yesterdayKey(options.date))?.main || null,
    candidates: menuSummary
  });

  const raw = await callDeepSeek(
    [{ role: 'system', content: system }, { role: 'user', content: user }],
    options
  );
  return sanitizeAiPlan(raw, current, history, options.date);
}

export async function testDeepSeekConnection({ useProxy = false, apiKey = '' } = {}) {
  const data = await callDeepSeek(
    [{ role: 'system', content: '只返回 JSON: {"ok": true}' }, { role: 'user', content: 'ping' }],
    { useProxy, apiKey }
  );
  return Boolean(data && data.ok !== false);
}
