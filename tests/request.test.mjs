import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_PREFS } from '../engine.js';
import { parseLunchRequest } from '../request.js';
const original = () => structuredClone(DEFAULT_PREFS);
test('一句话更新口味、忌口和预算，同时保留原有忌口', () => {
  const before = original();
  const result = parseLunchRequest('清淡点，不要牛肉和鸡蛋，30元以内', before);
  assert.equal(result.error, null);
  assert.deepEqual(result.prefs.tastes, ['清淡']);
  assert.deepEqual(result.prefs.avoids, ['香菜','牛肉','鸡蛋']);
  assert.equal(result.prefs.budget, 30);
  assert.deepEqual(before, DEFAULT_PREFS);
});
test('不吃辣不会反向识别成喜欢香辣', () => {
  const result = parseLunchRequest('不吃辣，预算25', original());
  assert.equal(result.error, null);
  assert.ok(result.prefs.avoids.includes('辣椒'));
  assert.deepEqual(result.prefs.tastes, DEFAULT_PREFS.tastes);
});
test('海鲜、鸡蛋等常见同义表达映射为菜单标签', () => {
  const result = parseLunchRequest('不吃鱼和蛋', original());
  assert.deepEqual(result.prefs.avoids, ['香菜','海鲜','鸡蛋']);
});
test('无法识别的忌口不会被忽略，也不会部分更新其他偏好', () => {
  const result = parseLunchRequest('清淡点，不要坚果，25元', original());
  assert.ok(result.error.includes('没识别出忌口'));
  assert.deepEqual(result.prefs, original());
});
test('不自动扩大预算范围；无效金额不部分更新', () => {
  for (const amount of [10, 60, 25.5]) {
    const result = parseLunchRequest(`不吃牛肉，预算${amount}`, original());
    assert.ok(result.error);
    assert.deepEqual(result.prefs, original());
  }
});
test('更改口味不会自动放宽少油、主食或忌口', () => {
  const result = parseLunchRequest('想吃辣一点', original());
  assert.deepEqual(result.prefs.tastes, ['香辣']);
  assert.equal(result.prefs.light, true);
  assert.equal(result.prefs.staple, true);
  assert.deepEqual(result.prefs.avoids, ['香菜']);
});
test('不吃油炸按烹饪要求处理，保留原有食材忌口', () => {
  const result = parseLunchRequest('不吃油炸，带主食', { ...original(), light:false, staple:false });
  assert.equal(result.error, null);
  assert.equal(result.prefs.light, true);
  assert.equal(result.prefs.staple, true);
  assert.deepEqual(result.prefs.avoids, ['香菜']);
});
test('空白和未知请求会提示，不伪造理解结果', () => {
  for (const text of ['', '今天吃黄焖鸡']) {
    const result = parseLunchRequest(text, original());
    assert.ok(result.error);
    assert.deepEqual(result.prefs, original());
  }
});
