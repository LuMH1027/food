export const TASTES = ['清淡', '家常', '香辣', '酸甜', '浓郁'];
export const AVOIDS = ['香菜', '辣椒', '花生', '鸡蛋', '牛奶', '海鲜', '牛肉'];
export const SCENES = [
  { id: 'focus', label: '下午开会不犯困', icon: '⚡', prompt: '下午要开会不想犯困，少油清爽一点，有杂粮或清淡主食' },
  { id: 'fast', label: '赶工 25 分钟送到', icon: '⏱', prompt: '赶工时间紧，希望25分钟内送到，好下饭不折腾' },
  { id: 'save', label: '月底省钱吃饱', icon: '¥', prompt: '月底预算紧，优先20元左右、分量足、有主食的午餐' },
  { id: 'warm', label: '想喝口热汤', icon: '♨', prompt: '今天想喝真正带汤的热食，优先汤面、鸡汤面或炖汤，清淡暖胃' }
];

// 模拟外卖菜单：包含履约时效、餐食特征与已知食材标签（非真实商家，不作过敏安全承诺）。
export const MEALS = [
  { id: 'chicken-grain', main: '香煎鸡腿', name: '香煎鸡腿杂粮饭', subtitle: '去皮鸡腿配杂粮饭与时蔬，下午不易犯困。', shop: '一碗日常 · 轻食厨房', price: 28, eta: 24, kcal: 540, protein: '高蛋白', scenes: ['focus', 'fast'], tastes: ['清淡', '家常'], ingredients: ['鸡肉', '西兰花', '胡萝卜', '玉米', '糙米', '大米', '酱油'], staple: '杂粮饭', cooking: '少油煎制', light: true, fried: false, image: 'hero-bowl', emoji: '🥗' },
  { id: 'tomato-beef', main: '番茄炖牛腩', name: '番茄牛腩配米饭', subtitle: '慢炖番茄酸甜开胃，配热米饭踏实解馋。', shop: '好好吃饭 · 家常菜', price: 32, eta: 30, kcal: 620, protein: '牛肉蛋白', scenes: ['warm'], tastes: ['酸甜', '家常', '浓郁'], ingredients: ['牛肉', '番茄', '土豆', '洋葱', '大米', '酱油'], staple: '米饭', cooking: '炖煮', light: true, fried: false, image: 'rice', emoji: '🍅' },
  { id: 'shrimp-egg', main: '虾仁滑蛋', name: '虾仁滑蛋时蔬饭', subtitle: '滑蛋鲜虾搭清炒时蔬，出餐快且轻负担。', shop: '饭有引力 · 小碗食堂', price: 29, eta: 22, kcal: 510, protein: '高蛋白', scenes: ['focus', 'fast'], tastes: ['清淡', '家常'], ingredients: ['海鲜', '虾', '鸡蛋', '青菜', '大米', '酱油'], staple: '米饭', cooking: '少油滑炒', light: true, fried: false, image: 'rice', emoji: '🍤' },
  { id: 'mushroom-tofu', main: '菌菇烧豆腐', name: '菌菇豆腐杂粮碗', subtitle: '香菇口蘑配嫩豆腐和杂粮饭，清淡饱腹。', shop: '植得 · 蔬食小馆', price: 24, eta: 23, kcal: 470, protein: '植物蛋白', scenes: ['focus', 'save', 'fast'], tastes: ['清淡', '家常'], ingredients: ['豆腐', '香菇', '口蘑', '西兰花', '糙米', '大米', '酱油'], staple: '杂粮饭', cooking: '炖煮', light: true, fried: false, image: 'vegetables', emoji: '🍄' },
  { id: 'pepper-pork', main: '小炒肉', name: '农家小炒肉盖饭', subtitle: '现炒鲜椒瘦肉，够味下饭。', shop: '湘里有味 · 现炒', price: 26, eta: 26, kcal: 680, protein: '猪肉蛋白', scenes: [], tastes: ['香辣', '浓郁'], ingredients: ['猪肉', '辣椒', '蒜', '大米', '酱油'], staple: '米饭', cooking: '爆炒', light: false, fried: false, image: 'rice', emoji: '🌶️' },
  { id: 'steamed-fish', main: '清蒸鲈鱼', name: '清蒸鲈鱼小份套餐', subtitle: '一人份蒸鱼配清炒青菜与米饭，少油无负担。', shop: '蒸有味 · 蒸菜馆', price: 35, eta: 28, kcal: 490, protein: '高蛋白', scenes: ['focus', 'warm'], tastes: ['清淡', '家常'], ingredients: ['海鲜', '鱼', '葱', '姜', '青菜', '大米', '酱油'], staple: '米饭', cooking: '清蒸', light: true, fried: false, image: 'vegetables', emoji: '🐟' },
  { id: 'kungpao', main: '宫保鸡丁', name: '宫保鸡丁盖饭', subtitle: '鸡丁花生酸甜微辣，经典工位快餐。', shop: '好好吃饭 · 家常菜', price: 25, eta: 24, kcal: 650, protein: '鸡肉蛋白', scenes: ['fast'], tastes: ['香辣', '酸甜', '家常'], ingredients: ['鸡肉', '花生', '辣椒', '黄瓜', '大米', '酱油'], staple: '米饭', cooking: '炒制', light: false, fried: false, image: 'rice', emoji: '🥜' },
  { id: 'pumpkin-chicken', main: '南瓜蒸鸡', name: '南瓜蒸鸡杂粮饭', subtitle: '清蒸嫩鸡配贝贝南瓜和杂粮饭，稳血糖不犯困。', shop: '蒸有味 · 蒸菜馆', price: 27, eta: 25, kcal: 520, protein: '高蛋白', scenes: ['focus', 'fast'], tastes: ['清淡', '家常'], ingredients: ['鸡肉', '南瓜', '香菇', '糙米', '大米', '酱油'], staple: '杂粮饭', cooking: '清蒸', light: true, fried: false, image: 'hero-bowl', emoji: '🎃' },
  { id: 'sweet-pork', main: '糖醋里脊', name: '糖醋里脊饭', subtitle: '酸甜酥脆口感，适合偶尔放纵解馋。', shop: '好好吃饭 · 家常菜', price: 26, eta: 27, kcal: 740, protein: '猪肉蛋白', scenes: [], tastes: ['酸甜', '浓郁'], ingredients: ['猪肉', '鸡蛋', '面粉', '番茄', '大米'], staple: '米饭', cooking: '油炸', light: false, fried: true, image: 'rice', emoji: '🍖' },
  { id: 'beef-noodle', main: '清汤牛肉', name: '清汤牛肉面', subtitle: '热汤手作面配牛肉和青菜，汤鲜不腻。', shop: '面面俱到 · 手作面', price: 24, eta: 22, kcal: 560, protein: '牛肉蛋白', scenes: ['warm', 'save', 'fast'], tastes: ['清淡', '家常'], ingredients: ['牛肉', '面粉', '香菜', '葱', '青菜', '酱油'], staple: '面条', cooking: '炖煮', light: true, fried: false, image: 'noodles', emoji: '🍜' },
  { id: 'egg-tomato', main: '番茄炒蛋', name: '番茄炒蛋双蔬饭', subtitle: '家常番茄炒蛋搭两份时蔬，性价比高。', shop: '饭有引力 · 小碗食堂', price: 19, eta: 20, kcal: 500, protein: '蛋类蛋白', scenes: ['save', 'fast'], tastes: ['家常', '酸甜'], ingredients: ['番茄', '鸡蛋', '青菜', '胡萝卜', '大米'], staple: '米饭', cooking: '少油炒制', light: true, fried: false, image: 'rice', emoji: '🍳' },
  { id: 'chicken-salad', main: '香煎鸡腿', name: '香煎鸡腿蔬菜沙拉', subtitle: '多一份生蔬与鸡腿肉，轻食无主食。', shop: '一碗日常 · 轻食厨房', price: 26, eta: 21, kcal: 390, protein: '高蛋白', scenes: ['focus', 'fast'], tastes: ['清淡'], ingredients: ['鸡肉', '生菜', '番茄', '玉米', '牛奶'], staple: null, cooking: '少油煎制', light: true, fried: false, image: 'hero-bowl', emoji: '🥬' },
  { id: 'mapo-tofu', main: '麻婆豆腐', name: '麻婆豆腐盖饭', subtitle: '麻辣鲜香的豆腐盖饭，出餐快且实惠。', shop: '湘里有味 · 现炒', price: 21, eta: 21, kcal: 610, protein: '植物蛋白', scenes: ['save', 'fast'], tastes: ['香辣', '浓郁'], ingredients: ['豆腐', '猪肉', '辣椒', '花椒', '大米', '酱油'], staple: '米饭', cooking: '烧制', light: false, fried: false, image: 'rice', emoji: '🍲' },
  { id: 'potato-pork', main: '土豆炖瘦肉', name: '土豆瘦肉焖饭', subtitle: '软糯土豆与瘦肉同焖，一碗热乎踏实。', shop: '一碗日常 · 轻食厨房', price: 23, eta: 23, kcal: 560, protein: '猪肉蛋白', scenes: ['save', 'fast'], tastes: ['家常', '清淡'], ingredients: ['猪肉', '土豆', '胡萝卜', '大米', '酱油'], staple: '米饭', cooking: '焖煮', light: true, fried: false, image: 'rice', emoji: '🥔' },
  { id: 'curry-chicken', main: '咖喱鸡', name: '椰香咖喱鸡饭', subtitle: '温和浓郁的咖喱鸡配米饭，香气足不辣口。', shop: '饭有引力 · 小碗食堂', price: 30, eta: 25, kcal: 660, protein: '鸡肉蛋白', scenes: ['fast'], tastes: ['浓郁'], ingredients: ['鸡肉', '牛奶', '土豆', '胡萝卜', '大米', '咖喱'], staple: '米饭', cooking: '炖煮', light: false, fried: false, image: 'rice', emoji: '🍛' },
  { id: 'greens-noodle', main: '鲜虾汤面', name: '鲜虾鸡蛋汤面', subtitle: '清汤热面搭鲜虾、鸡蛋和时蔬，清爽暖胃。', shop: '面面俱到 · 手作面', price: 22, eta: 22, kcal: 490, protein: '高蛋白', scenes: ['warm', 'fast', 'focus'], tastes: ['清淡', '家常'], ingredients: ['海鲜', '虾', '鸡蛋', '荷兰豆', '面粉', '葱', '酱油'], staple: '面条', cooking: '水煮', light: true, fried: false, image: 'noodles', emoji: '🍜' },
  { id: 'chili-steamed-chicken', main: '剁椒蒸鸡', name: '剁椒嫩鸡杂粮饭', subtitle: '清蒸去皮鸡胸配微辣剁椒与杂粮饭，解馋不油腻。', shop: '蒸有味 · 蒸菜馆', price: 27, eta: 24, kcal: 510, protein: '高蛋白', scenes: ['focus', 'fast'], tastes: ['香辣', '家常'], ingredients: ['鸡肉', '辣椒', '蒜', '西兰花', '糙米', '大米', '酱油'], staple: '杂粮饭', cooking: '清蒸', light: true, fried: false, image: 'hero-bowl', emoji: '🌶️' },
  { id: 'sour-fish-soup', main: '金汤鱼片', name: '金汤酸菜鱼片饭', subtitle: '微酸开胃无刺鱼片配米饭，热汤暖身不油腻。', shop: '蒸有味 · 蒸菜馆', price: 31, eta: 26, kcal: 530, protein: '高蛋白', scenes: ['warm'], tastes: ['酸甜', '香辣', '浓郁'], ingredients: ['海鲜', '鱼', '酸菜', '辣椒', '青菜', '大米'], staple: '米饭', cooking: '炖煮', light: true, fried: false, image: 'vegetables', emoji: '🐟' },
  { id: 'teriyaki-quinoa', main: '照烧鸡排', name: '照烧鸡排藜麦饭', subtitle: '少油慢煎鸡排配藜麦米饭和烤时蔬，饱腹耐饿。', shop: '一碗日常 · 轻食厨房', price: 31, eta: 25, kcal: 560, protein: '高蛋白', scenes: ['focus', 'fast'], tastes: ['酸甜', '浓郁', '家常'], ingredients: ['鸡肉', '西兰花', '胡萝卜', '藜麦', '大米', '酱油'], staple: '杂粮饭', cooking: '少油煎制', light: true, fried: false, image: 'hero-bowl', emoji: '🍗' },
  { id: 'chicken-mushroom-noodle', main: '菌菇鸡汤', name: '松茸菌菇鸡汤面', subtitle: '慢炖清鸡汤配嫩鸡丝与时蔬，温和暖胃无负担。', shop: '面面俱到 · 手作面', price: 26, eta: 23, kcal: 520, protein: '高蛋白', scenes: ['warm', 'focus', 'fast'], tastes: ['清淡', '家常', '浓郁'], ingredients: ['鸡肉', '香菇', '青菜', '面粉', '姜', '葱'], staple: '面条', cooking: '炖煮', light: true, fried: false, image: 'noodles', emoji: '🍜' }
];

export const DEFAULT_PREFS = {
  tastes: ['家常', '清淡'],
  avoids: ['香菜'],
  budget: 35,
  light: true,
  staple: true,
  blockedMains: [],
  favoriteIds: []
};

export function dateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function yesterdayKey(date = new Date()) {
  const d = new Date(date); d.setDate(d.getDate() - 1); return dateKey(d);
}

export function recommend(prefs, history = [], date = new Date(), options = {}) {
  const previous = history.find(h => h.date === yesterdayKey(date));
  const blocked = new Set(prefs.blockedMains || []);
  const skipToday = new Set(options.skipIds || []);
  const maxEta = options.maxEta || null;
  const sceneId = options.sceneId || null;
  const favs = new Set(prefs.favoriteIds || []);
  const recentMains = new Set(history.slice(0, 3).map(h => h.main));

  const candidates = MEALS.filter(m => m.price <= prefs.budget
    && !m.ingredients.some(i => prefs.avoids.includes(i))
    && (!prefs.light || (m.light && !m.fried))
    && (!prefs.staple || m.staple)
    && (!previous || m.main !== previous.main)
    && !blocked.has(m.main)
    && !skipToday.has(m.id)
    && (!maxEta || m.eta <= maxEta));

  const filtered = applySceneFilter(candidates, sceneId);

  return filtered
    .map(m => {
      const tasteScore = prefs.tastes.filter(t => m.tastes.includes(t)).length * 10;
      const sceneScore = sceneId && m.scenes.includes(sceneId) ? 8 : 0;
      const saveScore = sceneId === 'save' ? Math.max(0, 30 - m.price) * 2 + (m.kcal >= 500 ? 5 : 0) : 0;
      const warmScore = sceneId === 'warm'
        ? (m.staple === '面条' ? 18 : /汤/.test(m.name + m.main) ? 14 : m.cooking === '炖煮' ? 10 : 0)
        : 0;
      const favScore = favs.has(m.id) ? 4 : 0;
      const varietyBonus = recentMains.has(m.main) ? -3 : 2;
      const score = tasteScore + sceneScore + saveScore + warmScore + favScore + varietyBonus + (m.light ? 3 : 0) + (m.staple ? 2 : 0);
      return { ...m, score };
    })
    .sort((a, b) => (sceneId === 'save' ? a.price - b.price || b.kcal - a.kcal : 0) || b.score - a.score || a.eta - b.eta || a.price - b.price);
}

export function reasonsFor(meal, prefs, history, date = new Date(), options = {}) {
  const sceneId = options.sceneId || null;
  const matches = meal.tastes.filter(t => prefs.tastes.includes(t));
  const reasons = [];
  if (sceneId === 'save') reasons.push(`¥${meal.price} 性价比高，约 ${meal.kcal} 千卡管饱`);
  if (sceneId === 'warm') reasons.push(`${meal.cooking}带汤热食，暖胃好入口`);
  if (matches.length) reasons.push(`合你口味：${matches.join('、')}`);
  if (prefs.avoids.length) reasons.push(`已排除含${prefs.avoids.join('、')}的菜品`);
  if (prefs.light) reasons.push(`${meal.cooking}，少油不炸`);
  if (meal.staple) reasons.push(`有${meal.staple}，午饭吃踏实`);
  if (history.some(h => h.date === yesterdayKey(date))) reasons.push('和昨天的主菜不重样');
  return reasons;
}

function isWarmMeal(m) {
  return m.scenes.includes('warm') && (m.staple === '面条' || /汤|炖/.test(m.name + m.main + m.subtitle));
}

function applySceneFilter(candidates, sceneId) {
  if (sceneId === 'warm' && candidates.some(isWarmMeal)) {
    return candidates.filter(isWarmMeal);
  }
  if (sceneId === 'save' && candidates.some(m => m.price <= 24 && m.staple !== '面条')) {
    return candidates.filter(m => m.price <= 24);
  }
  return candidates;
}

export function explainFunnel(prefs, history = [], date = new Date(), options = {}) {
  const previous = history.find(h => h.date === yesterdayKey(date));
  const blocked = new Set(prefs.blockedMains || []);
  const skipToday = new Set(options.skipIds || []);
  const maxEta = options.maxEta || null;
  const sceneId = options.sceneId || null;

  const list = MEALS;
  const total = list.length;

  const afterAvoid = list.filter(m => !m.ingredients.some(i => prefs.avoids.includes(i)));
  const avoidRemoved = total - afterAvoid.length;

  const afterHealth = afterAvoid.filter(m => (!prefs.light || (m.light && !m.fried)) && (!prefs.staple || m.staple));
  const healthRemoved = afterAvoid.length - afterHealth.length;

  const afterDedup = afterHealth.filter(m => (!previous || m.main !== previous.main) && !blocked.has(m.main) && !skipToday.has(m.id));
  const dedupRemoved = afterHealth.length - afterDedup.length;

  const afterBudget = afterDedup.filter(m => m.price <= prefs.budget && (!maxEta || m.eta <= maxEta));
  const budgetRemoved = afterDedup.length - afterBudget.length;
  const afterScene = applySceneFilter(afterBudget, sceneId);
  const sceneRemoved = afterBudget.length - afterScene.length;

  return {
    total,
    avoidRemoved,
    healthRemoved,
    dedupRemoved,
    budgetRemoved,
    sceneRemoved,
    remaining: afterScene.length,
    yesterdayMain: previous?.main || null
  };
}

export function matchPercent(meal, prefs, options = {}) {
  const maxTaste = Math.max(1, Math.min(2, prefs.tastes.length || 1)) * 10;
  const tasteHit = prefs.tastes.length ? Math.min(2, prefs.tastes.filter(t => meal.tastes.includes(t)).length) * 10 : 10;
  const sceneBonus = options.sceneId ? (meal.scenes.includes(options.sceneId) ? 10 : 0) : 10;
  const ratio = (tasteHit / maxTaste) * 0.65 + (sceneBonus / 10) * 0.2 + (meal.light ? 0.1 : 0.05) + (meal.staple ? 0.05 : 0.05);
  return Math.min(99, Math.max(72, Math.round(70 + ratio * 29)));
}

export function buildWeekPlan(prefs, history = [], locked = {}, date = new Date(), offset = 0) {
  const days = ['周一', '周二', '周三', '周四', '周五'];
  const rawCandidates = recommend(prefs, history, date);
  const shift = rawCandidates.length > 1 ? ((offset % rawCandidates.length) + rawCandidates.length) % rawCandidates.length : 0;
  const candidates = shift ? [...rawCandidates.slice(shift), ...rawCandidates.slice(0, shift)] : rawCandidates;
  const plan = [];
  let prevMain = history.find(h => h.date === yesterdayKey(date))?.main || null;
  const usedIds = new Set();

  for (let i = 0; i < days.length; i++) {
    const lockedId = locked[i];
    const lockedMeal = lockedId ? rawCandidates.find(m => m.id === lockedId) : null;
    let pick = lockedMeal;
    if (!pick) {
      pick = candidates.find(m => !usedIds.has(m.id) && m.main !== prevMain)
        || candidates.find(m => m.main !== prevMain)
        || candidates[0]
        || null;
    }
    if (pick) {
      usedIds.add(pick.id);
      prevMain = pick.main;
    }
    plan.push({ dayIndex: i, day: days[i], meal: pick, locked: Boolean(lockedMeal) });
  }
  return plan;
}

export function buildOrderNote(meal, prefs) {
  const parts = [];
  if (prefs.avoids.length) parts.push(`不要${prefs.avoids.join('、')}`);
  if (prefs.light) parts.push('少油少盐');
  if (meal.staple) parts.push(`${meal.staple}正常份`);
  return `${meal.name}（${meal.shop} · ¥${meal.price}）｜外卖备注：${parts.length ? parts.join('，') : '按默认做法'}`;
}
