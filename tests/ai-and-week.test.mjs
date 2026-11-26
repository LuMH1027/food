import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_PREFS, MEALS, buildWeekPlan, buildOrderNote, recommend, explainFunnel, matchPercent } from '../engine.js';
import { sanitizeAiPlan } from '../ai.js';
import chatHandler from '../api/ai/chat.js';

const today = new Date(2026, 10, 26, 12);

test('AI 返回结果经过硬约束清洗：不会丢失原有忌口，也不接受超范围预算', () => {
  const out = sanitizeAiPlan({
    tastes: ['清淡', '不存在的口味'],
    avoids: ['鸡蛋'],
    budget: 99,
    light: true,
    scene: 'focus',
    maxEta: 25,
    recommendedId: 'sweet-pork',
    reason: '清淡少油，下午不易犯困。',
    orderNote: '不要香菜和鸡蛋，少油'
  }, DEFAULT_PREFS, [], today);

  assert.deepEqual(out.prefs.tastes, ['清淡']);
  assert.ok(out.prefs.avoids.includes('香菜'));
  assert.ok(out.prefs.avoids.includes('鸡蛋'));
  assert.equal(out.prefs.budget, 35);
  assert.notEqual(out.pickId, 'sweet-pork');
  assert.ok(out.pickId);
});

test('不再推荐的主菜会被严格排除', () => {
  const list = recommend({ ...DEFAULT_PREFS, blockedMains: ['香煎鸡腿'] }, [], today);
  assert.ok(list.length > 0);
  assert.ok(!list.some(m => m.main === '香煎鸡腿'));
});

test('工作日一周计划尽量连续两天主菜不重样，并尊重锁定', () => {
  const plan = buildWeekPlan(DEFAULT_PREFS, [], { 0: 'chicken-grain' }, today);
  assert.equal(plan.length, 5);
  assert.equal(plan[0].meal.id, 'chicken-grain');
  assert.equal(plan[0].locked, true);
  for (let i = 1; i < plan.length; i++) {
    assert.notEqual(plan[i].meal.main, plan[i - 1].meal.main);
  }
});

test('外卖备注包含忌口、少油和主食说明', () => {
  const meal = recommend(DEFAULT_PREFS, [], today)[0];
  const note = buildOrderNote(meal, DEFAULT_PREFS);
  assert.ok(note.includes('不要香菜'));
  assert.ok(note.includes('少油少盐'));
  assert.ok(note.includes(meal.name));
});

test('决策漏斗准确统计各硬约束过滤数量且与推荐结果一致', () => {
  const hist = [{ date: '2026-11-25', main: '香煎鸡腿', mealId: 'chicken-grain' }];
  const f = explainFunnel(DEFAULT_PREFS, hist, today);
  const recs = recommend(DEFAULT_PREFS, hist, today);
  assert.equal(f.total, MEALS.length);
  assert.equal(f.remaining, recs.length);
  assert.equal(f.yesterdayMain, '香煎鸡腿');
  assert.equal(f.total - f.avoidRemoved - f.healthRemoved - f.dedupRemoved - f.budgetRemoved, f.remaining);
  assert.ok(matchPercent(recs[0], DEFAULT_PREFS) >= 72 && matchPercent(recs[0], DEFAULT_PREFS) <= 99);
});

test('一周计划重排 offset 不改变锁定状态，且正确轮换未锁定菜品', () => {
  const p1 = buildWeekPlan(DEFAULT_PREFS, [], { 0: 'chicken-grain' }, today, 0);
  const p2 = buildWeekPlan(DEFAULT_PREFS, [], { 0: 'chicken-grain' }, today, 2);
  assert.equal(p2[0].meal.id, 'chicken-grain');
  assert.equal(p2[0].locked, true);
  assert.equal(p2[1].locked, false);
  assert.notEqual(p1[1].meal.id, p2[1].meal.id);
});

test('Serverless AI 代理模块可正常加载', () => {
  assert.equal(typeof chatHandler, 'function');
});
