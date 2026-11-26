export const TASTES = ['清淡', '家常', '香辣', '酸甜', '浓郁'];
export const AVOIDS = ['香菜', '辣椒', '花生', '鸡蛋', '牛奶', '海鲜', '牛肉'];
// 模拟菜单：食材包括酱汁与配料；不掌握的信息不作过敏安全承诺。
export const MEALS = [
  { id: 'chicken-grain', main: '香煎鸡腿', name: '香煎鸡腿杂粮饭', subtitle: '外焦里嫩的鸡腿，搭一碗踏实的杂粮饭。', shop: '一碗日常 · 轻食厨房', price: 28, tastes: ['清淡', '家常'], ingredients: ['鸡肉', '西兰花', '胡萝卜', '玉米', '糙米', '大米', '酱油'], staple: '杂粮饭', cooking: '少油煎制', light: true, fried: false, image: 'hero-bowl', color: 'sage', emoji: '🥗' },
  { id: 'tomato-beef', main: '番茄炖牛腩', name: '番茄牛腩配米饭', subtitle: '慢炖的番茄酸甜开胃，汤汁也很下饭。', shop: '好好吃饭 · 家常菜', price: 32, tastes: ['酸甜', '家常', '浓郁'], ingredients: ['牛肉', '番茄', '土豆', '洋葱', '大米', '酱油'], staple: '米饭', cooking: '炖煮', light: true, fried: false, image: 'rice', color: 'peach', emoji: '🍅' },
  { id: 'shrimp-egg', main: '虾仁滑蛋', name: '虾仁滑蛋时蔬饭', subtitle: '软嫩滑蛋和鲜虾，再加一份清爽时蔬。', shop: '饭有引力 · 小碗食堂', price: 29, tastes: ['清淡', '家常'], ingredients: ['海鲜', '虾', '鸡蛋', '青菜', '大米', '酱油'], staple: '米饭', cooking: '少油滑炒', light: true, fried: false, image: 'rice', color: 'butter', emoji: '🍤' },
  { id: 'mushroom-tofu', main: '菌菇烧豆腐', name: '菌菇豆腐杂粮碗', subtitle: '菌菇的鲜与豆腐的软，素食也吃得满足。', shop: '植得 · 蔬食小馆', price: 24, tastes: ['清淡', '家常'], ingredients: ['豆腐', '香菇', '口蘑', '西兰花', '糙米', '大米', '酱油'], staple: '杂粮饭', cooking: '炖煮', light: true, fried: false, image: 'vegetables', color: 'sage', emoji: '🍄' },
  { id: 'pepper-pork', main: '小炒肉', name: '农家小炒肉盖饭', subtitle: '辣椒与肉香碰在一起，适合想吃点辣的日子。', shop: '湘里有味 · 现炒', price: 26, tastes: ['香辣', '浓郁'], ingredients: ['猪肉', '辣椒', '蒜', '大米', '酱油'], staple: '米饭', cooking: '爆炒', light: false, fried: false, image: 'rice', color: 'peach', emoji: '🌶️' },
  { id: 'steamed-fish', main: '清蒸鲈鱼', name: '清蒸鲈鱼小份套餐', subtitle: '一人份蒸鱼、清炒青菜，配热乎米饭。', shop: '蒸有味 · 蒸菜馆', price: 35, tastes: ['清淡', '家常'], ingredients: ['海鲜', '鱼', '葱', '姜', '青菜', '大米', '酱油'], staple: '米饭', cooking: '清蒸', light: true, fried: false, image: 'vegetables', color: 'sage', emoji: '🐟' },
  { id: 'kungpao', main: '宫保鸡丁', name: '宫保鸡丁盖饭', subtitle: '鸡丁、花生与酸甜微辣的酱汁。', shop: '好好吃饭 · 家常菜', price: 25, tastes: ['香辣', '酸甜', '家常'], ingredients: ['鸡肉', '花生', '辣椒', '黄瓜', '大米', '酱油'], staple: '米饭', cooking: '炒制', light: false, fried: false, image: 'rice', color: 'butter', emoji: '🥜' },
  { id: 'pumpkin-chicken', main: '南瓜蒸鸡', name: '南瓜蒸鸡杂粮饭', subtitle: '南瓜自带的清甜，配鲜嫩蒸鸡刚刚好。', shop: '蒸有味 · 蒸菜馆', price: 27, tastes: ['清淡', '家常'], ingredients: ['鸡肉', '南瓜', '香菇', '糙米', '大米', '酱油'], staple: '杂粮饭', cooking: '清蒸', light: true, fried: false, image: 'hero-bowl', color: 'butter', emoji: '🎃' },
  { id: 'sweet-pork', main: '糖醋里脊', name: '糖醋里脊饭', subtitle: '酸甜酥脆的经典口味。', shop: '好好吃饭 · 家常菜', price: 26, tastes: ['酸甜', '浓郁'], ingredients: ['猪肉', '鸡蛋', '面粉', '番茄', '大米'], staple: '米饭', cooking: '油炸', light: false, fried: true, image: 'rice', color: 'peach', emoji: '🍖' },
  { id: 'beef-noodle', main: '清汤牛肉', name: '清汤牛肉面', subtitle: '一碗热汤面，工作日也能慢慢吃。', shop: '面面俱到 · 手作面', price: 24, tastes: ['清淡', '家常'], ingredients: ['牛肉', '面粉', '香菜', '葱', '青菜', '酱油'], staple: '面条', cooking: '炖煮', light: true, fried: false, image: 'vegetables', color: 'sage', emoji: '🍜' },
  { id: 'egg-tomato', main: '番茄炒蛋', name: '番茄炒蛋双蔬饭', subtitle: '熟悉的番茄炒蛋，搭配两份当季蔬菜。', shop: '饭有引力 · 小碗食堂', price: 19, tastes: ['家常', '酸甜'], ingredients: ['番茄', '鸡蛋', '青菜', '胡萝卜', '大米'], staple: '米饭', cooking: '少油炒制', light: true, fried: false, image: 'rice', color: 'peach', emoji: '🍳' },
  { id: 'chicken-salad', main: '香煎鸡腿', name: '香煎鸡腿蔬菜沙拉', subtitle: '多一份蔬菜，今天吃得清爽一点。', shop: '一碗日常 · 轻食厨房', price: 26, tastes: ['清淡'], ingredients: ['鸡肉', '生菜', '番茄', '玉米', '牛奶'], staple: null, cooking: '少油煎制', light: true, fried: false, image: 'hero-bowl', color: 'sage', emoji: '🥬' },
  { id: 'mapo-tofu', main: '麻婆豆腐', name: '麻婆豆腐盖饭', subtitle: '麻辣鲜香，豆腐也能成为午饭主角。', shop: '湘里有味 · 现炒', price: 21, tastes: ['香辣', '浓郁'], ingredients: ['豆腐', '猪肉', '辣椒', '花椒', '大米', '酱油'], staple: '米饭', cooking: '烧制', light: false, fried: false, image: 'rice', color: 'peach', emoji: '🍲' },
  { id: 'potato-pork', main: '土豆炖瘦肉', name: '土豆瘦肉焖饭', subtitle: '软糯土豆和瘦肉，平实又满足的一碗。', shop: '一碗日常 · 轻食厨房', price: 23, tastes: ['家常', '清淡'], ingredients: ['猪肉', '土豆', '胡萝卜', '大米', '酱油'], staple: '米饭', cooking: '焖煮', light: true, fried: false, image: 'rice', color: 'butter', emoji: '🥔' },
  { id: 'curry-chicken', main: '咖喱鸡', name: '椰香咖喱鸡饭', subtitle: '温和浓郁的咖喱，配一份软糯米饭。', shop: '饭有引力 · 小碗食堂', price: 30, tastes: ['浓郁'], ingredients: ['鸡肉', '牛奶', '土豆', '胡萝卜', '大米', '咖喱'], staple: '米饭', cooking: '炖煮', light: false, fried: false, image: 'rice', color: 'butter', emoji: '🍛' },
  { id: 'greens-noodle', main: '香菇青菜', name: '香菇青菜汤面', subtitle: '热汤、鲜菇和青菜，简单也很舒服。', shop: '面面俱到 · 手作面', price: 18, tastes: ['清淡', '家常'], ingredients: ['香菇', '青菜', '面粉', '葱', '酱油'], staple: '面条', cooking: '水煮', light: true, fried: false, image: 'vegetables', color: 'sage', emoji: '🥬' }
];
export const DEFAULT_PREFS = { tastes: ['家常', '清淡'], avoids: ['香菜'], budget: 35, light: true, staple: true };
export function dateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function yesterdayKey(date = new Date()) {
  const d = new Date(date); d.setDate(d.getDate() - 1); return dateKey(d);
}
export function recommend(prefs, history = [], date = new Date()) {
  const previous = history.find(h => h.date === yesterdayKey(date));
  return MEALS.filter(m => m.price <= prefs.budget
    && !m.ingredients.some(i => prefs.avoids.includes(i))
    && (!prefs.light || (m.light && !m.fried))
    && (!prefs.staple || m.staple)
    && (!previous || m.main !== previous.main))
    .map(m => ({ ...m, score: prefs.tastes.filter(t => m.tastes.includes(t)).length * 10 + (m.light ? 3 : 0) + (m.staple ? 2 : 0) }))
    .sort((a, b) => b.score - a.score || a.price - b.price);
}
export function reasonsFor(meal, prefs, history, date = new Date()) {
  const matches = meal.tastes.filter(t => prefs.tastes.includes(t));
  const reasons = [];
  if (matches.length) reasons.push(`合你口味：${matches.join('、')}`);
  if (prefs.avoids.length) reasons.push(`已排除含${prefs.avoids.join('、')}的菜品`);
  if (prefs.light) reasons.push(`${meal.cooking}，少油不炸`);
  if (meal.staple) reasons.push(`有${meal.staple}，午饭吃踏实`);
  if (history.some(h => h.date === yesterdayKey(date))) reasons.push('和昨天的主菜不重样');
  return reasons;
}
