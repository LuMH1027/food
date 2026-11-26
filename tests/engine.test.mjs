import test from 'node:test';
import assert from 'node:assert/strict';
import { MEALS, DEFAULT_PREFS, recommend, dateKey, yesterdayKey, reasonsFor } from '../engine.js';
const today = new Date(2026, 10, 26, 12);
const prefs = overrides => ({ ...structuredClone(DEFAULT_PREFS), ...overrides });
test('默认推荐少油、有主食，价格与忌口符合条件', () => {
  const result = recommend(prefs(), [], today);
  assert.ok(result.length > 2);
  for (const m of result) {
    assert.ok(m.price <= 35 && m.light && !m.fried && m.staple);
    assert.ok(!m.ingredients.includes('香菜'));
  }
});
test('忌口是硬约束，多项忌口包含在酱汁和配料中也会排除', () => {
  const avoids = ['鸡蛋', '海鲜', '花生', '牛奶', '辣椒', '酱油'];
  const result = recommend(prefs({ avoids, light: false, staple: false, budget: 50 }), [], today);
  for (const m of result) assert.ok(!m.ingredients.some(i => avoids.includes(i)));
});
test('昨天主菜跨套餐去重：鸡腿饭与鸡腿沙拉一起排除', () => {
  const history = [{ date: '2026-11-25', main: '香煎鸡腿', mealId: 'chicken-grain' }];
  const result = recommend(prefs({ staple: false }), history, today);
  assert.ok(result.length > 0);
  assert.ok(!result.some(m => m.main === '香煎鸡腿'));
});
test('前天和今天记录不当作昨天，不误排除', () => {
  const history = [{ date: '2026-11-24', main: '香煎鸡腿' }, { date: '2026-11-26', main: '鲜虾汤面' }];
  assert.ok(recommend(prefs(), history, today).some(m => m.main === '香煎鸡腿'));
  assert.ok(recommend(prefs(), history, today).some(m => m.main === '鲜虾汤面'));
});
test('预算不足时显示空结果，不能自动放宽忌口或预算', () => {
  assert.deepEqual(recommend(prefs({ budget: 15 }), [], today), []);
});
test('口味排序优先匹配，不用随机结果冒充个性化', () => {
  const result = recommend(prefs({ tastes: ['香辣'], light: false, avoids: [] }), [], today);
  assert.ok(result[0].tastes.includes('香辣'));
  assert.ok(result.every((m, i) => i === 0 || result[i - 1].score >= m.score));
});
test('开关控制主食及油炸菜，关闭后可探索更宽选择', () => {
  assert.ok(!recommend(prefs({ avoids: [], staple: true })).some(m => !m.staple));
  assert.ok(recommend(prefs({ avoids: [], staple: false })).some(m => !m.staple));
  assert.ok(!recommend(prefs({ light: true })).some(m => m.fried));
  assert.ok(recommend(prefs({ light: false })).some(m => m.fried));
});
test('跨月、跨年和闰年正确找昨天，日期使用本地日历', () => {
  assert.equal(yesterdayKey(new Date(2027, 0, 1)), '2026-12-31');
  assert.equal(yesterdayKey(new Date(2028, 2, 1)), '2028-02-29');
  assert.equal(dateKey(today), '2026-11-26');
});
test('理由基于实际偏好及历史，没有历史不宣称已避开昨天', () => {
  const meal = MEALS[0];
  assert.ok(!reasonsFor(meal, prefs(), [], today).some(r => r.includes('昨天')));
  assert.ok(reasonsFor(meal, prefs(), [{ date: '2026-11-25', main: '番茄炖牛腩' }], today).some(r => r.includes('昨天')));
});
test('所有菜单价格、主食、图片、标记完整，所有标记与说明一致', () => {
  assert.equal(new Set(MEALS.map(m => m.id)).size, MEALS.length);
  for (const m of MEALS) {
    assert.ok(m.price > 0 && m.main && m.ingredients.length > 0);
    assert.ok(!m.fried || !m.light);
    assert.ok(['rice', 'hero-bowl', 'vegetables', 'noodles'].includes(m.image));
    assert.ok(!m.ingredients.includes('虾') || m.ingredients.includes('海鲜'));
    assert.ok(!m.ingredients.includes('鱼') || m.ingredients.includes('海鲜'));
  }
});
