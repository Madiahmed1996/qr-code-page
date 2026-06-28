import React, { useState } from "react";

interface ParsedRow {
  [key: string]: any;
}

/**
 * Страница импорта данных. Теперь поддерживается только импорт CSV
 * для упрощения и устранения уязвимостей, связанных с библиотекой xlsx.
 * Пользователь выбирает тип данных (сотрудники, объекты, табель),
 * загружает CSV-файл, просматривает предварительные данные и
 * отправляет их на сервер. Обработка дублей и сопоставление
 * колонок не реализованы.
 */
const ImportPage: React.FC = () => {
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<{ total: number; newCount: number; duplicateCount: number } | null>(null);
  const [importType, setImportType] = useState<string>('employees');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const name = file.name.toLowerCase();
    if (name.endsWith('.csv')) {
      try {
        const text = await file.text();
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length === 0) {
          setError('Файл пуст');
          return;
        }
        const headers = lines[0].split(',').map((h) => h.trim());
        const data: ParsedRow[] = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',');
          const row: ParsedRow = {};
          headers.forEach((h, idx) => {
            row[h] = values[idx] ?? '';
          });
          data.push(row);
        }
        setRows(data);
        setColumns(headers);
        setError(null);
        setSummary(null);
      } catch (err) {
        setError('Ошибка чтения CSV: ' + (err instanceof Error ? err.message : String(err)));
      }
    } else {
      setError('Поддерживается только импорт CSV');
    }
  };

  const handleImport = async () => {
    try {
      const res = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: importType, rows }),
      });
      if (!res.ok) {
        const errMsg = await res.text();
        throw new Error(errMsg || 'Import failed');
      }
      const result = await res.json();
      setSummary(result);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Ошибка импорта: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>Импорт CSV</h1>
      <input type="file" accept=".csv" onChange={handleFileChange} />
      <div style={{ marginTop: '0.5rem' }}>
        <label>
          Тип данных:
          <select value={importType} onChange={(e) => setImportType(e.target.value)} style={{ marginLeft: '0.5rem' }}>
            <option value="employees">Сотрудники</option>
            <option value="objects">Объекты</option>
            <option value="timesheet">Табель</option>
          </select>
        </label>
      </div>
      {error && <p style={{ color: '#dc2626', marginTop: '0.5rem' }}>{error}</p>}
      {rows.length > 0 && (
        <>
          <div style={{ marginTop: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Предпросмотр данных ({rows.length} строк)</h2>
            <div style={{ overflowX: 'auto', maxHeight: '400px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr>
                    {columns.map((col) => (
                      <th key={col} style={{ borderBottom: '1px solid #e5e7eb', padding: '0.5rem', textAlign: 'left', backgroundColor: '#f1f5f9' }}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 20).map((row, idx) => (
                    <tr key={idx}>
                      {columns.map((col) => (
                        <td key={col} style={{ borderBottom: '1px solid #f3f4f6', padding: '0.5rem' }}>{row[col]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {rows.length > 20 && <p style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>Показаны первые 20 строк из {rows.length}</p>}
            </div>
          </div>
          <button onClick={handleImport} style={{ marginTop: '1rem', backgroundColor: '#16a34a', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Импортировать</button>
        </>
      )}
      {summary && (
        <div style={{ marginTop: '1rem' }}>
          <p>Всего строк: {summary.total}</p>
          <p>Новых: {summary.newCount}</p>
          <p>Дублей: {summary.duplicateCount}</p>
        </div>
      )}
    </div>
  );
};

export default ImportPage;
