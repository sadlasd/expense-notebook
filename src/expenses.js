export const CATEGORIES = [
  { id: 'food', name: 'Еда', color: '#16704d', mark: 'Е' },
  { id: 'transport', name: 'Транспорт', color: '#28659c', mark: 'Т' },
  { id: 'home', name: 'Дом', color: '#96620b', mark: 'Д' },
  { id: 'fun', name: 'Отдых', color: '#8554a0', mark: 'О' },
  { id: 'other', name: 'Другое', color: '#677280', mark: '…' },
];

export function today() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// Суммы храним в копейках, чтобы 0.1 + 0.2 не ломало итог.
export function parseAmount(value) {
  const text = String(value).trim().replace(',', '.');
  if (!/^\d{1,7}(\.\d{1,2})?$/.test(text)) throw new Error('Введи сумму от 0,01 до 9 999 999,99 ₽.');
  const [rubles, kopecks = ''] = text.split('.');
  const result = Number(rubles) * 100 + Number(kopecks.padEnd(2, '0'));
  if (result <= 0) throw new Error('Сумма должна быть больше нуля.');
  return result;
}

export function money(kopecks) {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 2 }).format(kopecks / 100);
}

export function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00`);
  return !Number.isNaN(date.getTime()) && `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` === value;
}

export function createExpense(input) {
  const title = typeof input?.title === 'string' ? input.title.trim() : '';
  if (!title || title.length > 80) throw new Error('Добавь название покупки: до 80 символов.');
  if (!validDate(input.date)) throw new Error('Выбери корректную дату.');
  if (!CATEGORIES.some((category) => category.id === input.category)) throw new Error('Выбери категорию из списка.');
  return { id: crypto.randomUUID(), title, amount: parseAmount(input.amount), category: input.category, date: input.date };
}

export function sampleExpenses() {
  const month = today().slice(0, 7);
  return [
    { id: 'sample-1', title: 'Продукты на неделю', amount: 186050, category: 'food', date: `${month}-01` },
    { id: 'sample-2', title: 'Проездной', amount: 95000, category: 'transport', date: `${month}-02` },
    { id: 'sample-3', title: 'Кофе по дороге', amount: 21000, category: 'food', date: `${month}-02` },
    { id: 'sample-4', title: 'Билет в кино', amount: 45000, category: 'fun', date: `${month}-03` },
    { id: 'sample-5', title: 'Лампочка для стола', amount: 32000, category: 'home', date: `${month}-03` },
  ];
}
