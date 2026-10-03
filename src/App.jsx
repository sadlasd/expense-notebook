import { useEffect, useState } from 'react';
import ExpenseForm from './ExpenseForm';
import useSummaryTool from './useSummaryTool';
import { CATEGORIES, createExpense, money, sampleExpenses, today, validDate } from './expenses';

const STORAGE_KEY = 'wallet-expenses-v1';

function readNotebook() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      if (!Array.isArray(data.items) || typeof data.demo !== 'boolean' || !data.items.every((item) =>
        item && typeof item.id === 'string' && typeof item.title === 'string' && Number.isSafeInteger(item.amount) && item.amount > 0 &&
        validDate(item.date) && CATEGORIES.some((category) => category.id === item.category))) throw new Error('Invalid saved data');
      return data;
    }
  } catch { /* Если хранилище недоступно, показываем пример. */ }
  return { items: sampleExpenses(), demo: true };
}

export default function App() {
  const [notebook, setNotebook] = useState(readNotebook);
  const [month, setMonth] = useState(() => today().slice(0, 7));
  const [category, setCategory] = useState('all');
  const [undo, setUndo] = useState(null);
  const [notice, setNotice] = useState('');
  const [storageError, setStorageError] = useState(false);
  const monthItems = notebook.items.filter((item) => item.date.startsWith(month));
  const visibleItems = monthItems.filter((item) => category === 'all' || item.category === category)
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  const total = monthItems.reduce((sum, item) => sum + item.amount, 0);
  const groups = CATEGORIES.map((category) => ({ ...category, amount: monthItems.filter((item) => item.category === category.id).reduce((sum, item) => sum + item.amount, 0) }));
  const largest = [...monthItems].sort((a, b) => b.amount - a.amount)[0];

  useSummaryTool({ month, totalKopecks: total, count: monthItems.length, demo: notebook.demo,
    categories: groups.map((group) => ({ name: group.name, totalKopecks: group.amount })) });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notebook));
      setStorageError(false);
    } catch { setStorageError(true); }
  }, [notebook]);

  function addExpense(input) {
    const expense = createExpense(input);
    setUndo(notebook);
    setNotebook((current) => ({ demo: false, items: [...(current.demo ? [] : current.items), expense] }));
    setMonth(expense.date.slice(0, 7));
    setCategory('all');
    setNotice(`Добавлено: ${expense.title}.`);
  }

  function removeExpense(id) {
    setUndo(notebook);
    setNotebook((current) => ({ ...current, items: current.items.filter((item) => item.id !== id) }));
    setNotice('Расход удалён. Можно отменить это действие.');
  }

  function startEmpty() {
    setUndo(notebook);
    setNotebook({ items: [], demo: false });
    setNotice('Список готов для твоих расходов.');
  }

  function restore() {
    if (!undo) return;
    setNotebook(undo);
    setUndo(null);
    setNotice('Последнее изменение отменено.');
  }

  return <div className="app">
    <header className="header">
      <a href="#main" className="brand"><img src="/favicon.svg" alt="" width="34" height="34" />Кошелёк</a>
      <span>Мои расходы</span>
    </header>
    <main id="main">
      <div className="heading">
        <div><h1>Куда уходят деньги</h1><p>Покупки и небольшие траты в одном месте.</p></div>
        <label className="month-label" htmlFor="month">Месяц<input id="month" type="month" value={month} onChange={(event) => { if (event.target.value) setMonth(event.target.value); }} required /></label>
      </div>
      {notebook.demo && <div className="demo-note"><p><strong>Это пример расходов.</strong> Первая добавленная покупка заменит пример твоими записями.</p><button onClick={startEmpty} type="button">Начать пустой список</button></div>}
      <section className="summary" aria-label="Итоги месяца">
        <div className="summary-total"><span>Потрачено за месяц</span><strong>{money(total)}</strong><small>Все категории</small></div>
        <div><span>Покупок</span><strong>{monthItems.length}</strong><small>За выбранный месяц</small></div>
        <div><span>Самая большая трата</span><strong>{largest ? money(largest.amount) : '—'}</strong><small>{largest?.title || 'Пока нет расходов'}</small></div>
      </section>
      <div className="workspace">
        <div className="records">
          <section className="list-panel" aria-labelledby="list-title">
            <div className="section-heading"><h2 id="list-title">История расходов</h2><span className="muted">Записей: {visibleItems.length}</span></div>
            <label className="filter-label" htmlFor="category-filter">Категория<select id="category-filter" value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="all">Все категории</option>{CATEGORIES.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select></label>
            {visibleItems.length === 0 ? <div className="empty"><h3>Здесь пока пусто</h3><p>{category === 'all' ? 'Добавь первую покупку за этот месяц.' : 'В этой категории нет расходов за выбранный месяц.'}</p></div> :
              <ul className="expense-list">{visibleItems.map((item) => {
                const group = CATEGORIES.find((category) => category.id === item.category);
                return <li key={item.id}>
                  <span className="category-mark" style={{ color: group.color }} aria-hidden="true">{group.mark}</span>
                  <div className="expense-details"><strong>{item.title}</strong><span>{group.name} · {new Date(`${item.date}T12:00:00`).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}</span></div>
                  <span className="expense-amount">{money(item.amount)}</span>
                  <button className="delete" type="button" onClick={() => removeExpense(item.id)} aria-label={`Удалить: ${item.title}`} title="Удалить расход">×</button>
                </li>;
              })}</ul>}
          </section>
          <section className="categories-panel" aria-labelledby="categories-title">
            <h2 id="categories-title">По категориям</h2>
            <p className="muted">Все расходы за выбранный месяц.</p>
            {total === 0 ? <p className="no-chart">Распределение появится после первой покупки.</p> : <ul className="category-totals">{groups.filter((group) => group.amount > 0).map((group) => <li key={group.id}>
              <div><span>{group.name}</span><strong>{money(group.amount)}</strong></div>
              <progress value={group.amount} max={total} style={{ accentColor: group.color, color: group.color }} aria-label={`${group.name}: ${Math.round(group.amount / total * 100)}%`} />
            </li>)}</ul>}
          </section>
        </div>
        <ExpenseForm onAdd={addExpense} />
      </div>
      <div className="notice" role="status"><span>{notice}</span>{undo && <button onClick={restore} type="button">Отменить последнее действие</button>}</div>
      {storageError && <p className="error" role="alert">Браузер не разрешил сохранить записи. Они доступны только до закрытия страницы.</p>}
    </main>
    <footer>Кошелёк · простой учёт повседневных расходов</footer>
  </div>;
}
