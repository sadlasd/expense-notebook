import { useEffect, useRef } from 'react';

// Необязательный доступ к итогам из чата в браузерах с поддержкой WebMCP.
export default function useSummaryTool(summary) {
  const current = useRef(summary);
  useEffect(() => { current.current = summary; }, [summary]);

  useEffect(() => {
    const context = document.modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    try {
      Promise.resolve(context.registerTool({
        name: 'get_wallet_summary',
        title: 'Итоги расходов за выбранный месяц',
        description: 'Читает итоги, показанные на странице: месяц, сумму и распределение по категориям. Не изменяет записи.',
        inputSchema: { type: 'object', properties: {}, additionalProperties: false },
        annotations: { readOnlyHint: true, untrustedContentHint: false },
        execute(input) {
          if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).length) {
            throw new Error('Это действие принимает только пустой объект.');
          }
          return current.current;
        },
      }, { signal: lifecycle.signal })).catch(() => {});
    } catch { /* Обычный интерфейс работает независимо от интеграции. */ }
    return () => lifecycle.abort();
  }, []);
}
