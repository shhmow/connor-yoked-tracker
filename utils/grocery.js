
// utils/grocery.js
const CATEGORY_MAP = [
  { name: 'Produce', patterns: ['onion', 'lettuce', 'tomato', 'broccoli'] },
  { name: 'Meat', patterns: ['beef', 'chicken', 'salmon'] },
  { name: 'Grains', patterns: ['rice', 'flour', 'oats', 'bread'] },
  { name: 'Dairy', patterns: ['milk', 'butter'] },
  { name: 'Sauces/Condiments', patterns: ['franks red hot', 'honey'] },
  { name: 'Other', patterns: [] },
];

export function getWeekRange(date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay();
  const start = new Date(d);
  start.setDate(d.getDate() - day); // Sunday
  const end = new Date(start);
  end.setDate(start.getDate() + 6); // Saturday
  return { start, end };
}

export function dayKey(y, m, d) { return `${y}-${m+1}-${d}`; }

export function buildGroceryList(selectedDate, mealsByDay, opts = { groupByCategory: false }) {
  const { start, end } = getWeekRange(selectedDate);
  const items = [];
  for (let dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
    const key = dayKey(dt.getFullYear(), dt.getMonth(), dt.getDate());
    const meals = mealsByDay[key];
    if (!meals) continue;
    ['Breakfast','Lunch','Dinner'].forEach(cat => {
      const ingredients = meals?.[`ingredients_${cat}`];
      if (Array.isArray(ingredients)) {
        ingredients.forEach((ing) => {
          if (ing && typeof ing === 'string') items.push(ing.trim().toLowerCase());
        });
      }
    });
  }
  const unique = Array.from(new Set(items)).sort();
  if (!opts.groupByCategory) return unique;

  const groups = {}; CATEGORY_MAP.forEach(c => groups[c.name] = []);
  unique.forEach((ing) => {
    const found = CATEGORY_MAP.find(c => c.patterns.some(p => ing.includes(p)));
    if (found) groups[found.name].push(ing); else groups['Other'].push(ing);
  });
  Object.keys(groups).forEach(k => { if (groups[k].length === 0) delete groups[k]; });
  return groups;
}
