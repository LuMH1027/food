import { MEALS, AVOIDS } from './engine.js';

// A deliberately bounded local parser, not an online model. Existing exclusions are never removed.
export function parseLunchRequest(text, current) {
  const source = text.trim().slice(0, 120);
  const prefs = structuredClone(current);
  const recognized = [];
  if (!source) return { prefs, recognized, error: '写下口味、忌口或预算，例如：清淡点，不要香菜，30元以内。' };
  const clauses = source.split(/[，,。；;！!\n]/).map(s => s.trim()).filter(Boolean);
  const aliases = { 辣: '辣椒', 蛋: '鸡蛋', 奶: '牛奶', 虾: '海鲜', 鱼: '海鲜' };
  const ingredients = [...new Set([...AVOIDS, ...MEALS.flatMap(m => m.ingredients), ...Object.keys(aliases)])].sort((a, b) => b.length - a.length);
  const avoids = [];
  const positiveClauses = [];
  for (const clause of clauses) {
    const negative = clause.match(/(?:不要|不吃|别放|不放|不加|不含|忌口|避开|不能吃|过敏|不想吃|不想要|别加)(.*)/);
    if (negative) {
      const list = negative[1].split(/(?:以及|还有|[、和及与])/).map(s => s.trim()).filter(Boolean);
      for (const item of list) {
        if (['油炸', '炸的'].includes(item)) { prefs.light = true; recognized.push('少油不炸'); continue; }
        // Refuse ambiguous scope rather than interpreting a partial exclusion as safe.
        const ingredient = ingredients.find(i => item === i || item === i + '了' || item === i + '哦');
        if (!ingredient) return { prefs: structuredClone(current), recognized: [], error: `没识别出忌口「${item || clause}」，请到偏好中手动添加。` };
        avoids.push(aliases[ingredient] || ingredient);
      }
      if (!list.length) return { prefs: structuredClone(current), recognized: [], error: '请写清要避开的食材，例如：不要香菜。' };
      positiveClauses.push(clause.slice(0, negative.index));
    } else positiveClauses.push(clause);
  }
  const positive = positiveClauses.join('，');
  const tastes = [
    ['清淡', /清淡|清爽|清口/], ['家常', /家常/], ['香辣', /香辣|吃辣|辣一点|辣点/],
    ['酸甜', /酸甜|糖醋/], ['浓郁', /浓郁|浓香/]
  ].filter(([, pattern]) => pattern.test(positive)).map(([taste]) => taste);
  if (tastes.length) { prefs.tastes = tastes; recognized.push(tastes.join(' / ')); }
  if (avoids.length) {
    prefs.avoids = [...new Set([...prefs.avoids, ...avoids])];
    if (prefs.avoids.length > 30) return { prefs: structuredClone(current), recognized: [], error: '忌口已达到 30 项，请在偏好中调整。' };
    recognized.push(`避开${[...new Set(avoids)].join('、')}`);
  }
  const budgetMatch = source.match(/(?:预算\s*|[¥￥]\s*)(\d+(?:\.\d+)?)/) || source.match(/(\d+(?:\.\d+)?)\s*(?:元|块)/);
  if (budgetMatch) {
    const budget = Number(budgetMatch[1]);
    if (budget < 15 || budget > 50 || !Number.isInteger(budget)) return { prefs: structuredClone(current), recognized: [], error: 'Demo 支持 15–50 元的整数预算，请调整后再试。' };
    prefs.budget = budget; recognized.push(`¥${budget}以内`);
  }
  if (/少油|不油炸|不吃油炸|不想吃油炸|不要油炸|不要炸的|不吃炸的/.test(source)) { prefs.light = true; if (!recognized.includes('少油不炸')) recognized.push('少油不炸'); }
  if (/要有主食|有主食|包含主食|带主食/.test(positive) && !/不要主食|不吃主食/.test(source)) { prefs.staple = true; recognized.push('包含主食'); }
  if (!recognized.length) return { prefs, recognized, error: '暂时没识别到偏好。试试：清淡点，不要香菜，30元以内。' };
  return { prefs, recognized, error: null };
}
