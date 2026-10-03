import { useState } from 'react';
import { CATEGORIES, today } from './expenses';

export default function ExpenseForm({ onAdd }) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [date, setDate] = useState(today);
  const [error, setError] = useState('');

  function submit(event) {
    event.preventDefault();
    try {
      onAdd({ title, amount, category, date });
      setTitle('');
      setAmount('');
      setError('');
    } catch (error) {
      setError(error.message);
    }
  }

  return <section className="form-panel" aria-labelledby="add-title">
    <h2 id="add-title">Новый расход</h2>
    <p className="muted">Запиши покупку, пока не забыл.</p>
    <form onSubmit={submit}>
      <label htmlFor="expense-title">На что потратил</label>
      <input id="expense-title" value={title} onChange={(event) => setTitle(event.target.value)} maxLength="80" required placeholder="Например, продукты" />
      <label htmlFor="expense-amount">Сумма, ₽</label>
      <input id="expense-amount" value={amount} onChange={(event) => setAmount(event.target.value)} inputMode="decimal" required placeholder="0,00" aria-describedby={error ? 'form-error' : undefined} />
      <label htmlFor="expense-category">Категория</label>
      <select id="expense-category" value={category} onChange={(event) => setCategory(event.target.value)}>
        {CATEGORIES.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
      </select>
      <label htmlFor="expense-date">Дата</label>
      <input id="expense-date" type="date" value={date} onChange={(event) => setDate(event.target.value)} required />
      {error && <p id="form-error" className="error" role="alert">{error}</p>}
      <button className="primary" type="submit">Добавить расход</button>
    </form>
    <p className="local-note">Записи сохраняются только в этом браузере.</p>
  </section>;
}
