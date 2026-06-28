import React, { useEffect, useState } from "react";
import type { DuplicateLogEntry } from "../../types";

/**
 * Страница для просмотра дублей, найденных во время импорта. Загружает
 * записи из таблицы DuplicateLog и отображает их в таблице.
 */
const DuplicatesPage: React.FC = () => {
  const [log, setLog] = useState<DuplicateLogEntry[]>([]);
  useEffect(() => {
    fetch('/api/duplicates')
      .then((res) => res.json())
      .then((data: DuplicateLogEntry[]) => setLog(data))
      .catch((err) => console.error(err));
  }, []);
  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>Дубли</h1>
      {log.length === 0 ? (
        <p>Дубликаты пока не найдены.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr>
                <th style={{ borderBottom: '1px solid #e5e7eb', padding: '0.5rem' }}>ID</th>
                <th style={{ borderBottom: '1px solid #e5e7eb', padding: '0.5rem' }}>Проект</th>
                <th style={{ borderBottom: '1px solid #e5e7eb', padding: '0.5rem' }}>Batch</th>
                <th style={{ borderBottom: '1px solid #e5e7eb', padding: '0.5rem' }}>Тип</th>
                <th style={{ borderBottom: '1px solid #e5e7eb', padding: '0.5rem' }}>Old ID</th>
                <th style={{ borderBottom: '1px solid #e5e7eb', padding: '0.5rem' }}>Действие</th>
                <th style={{ borderBottom: '1px solid #e5e7eb', padding: '0.5rem' }}>Hash</th>
                <th style={{ borderBottom: '1px solid #e5e7eb', padding: '0.5rem' }}>Дата</th>
              </tr>
            </thead>
            <tbody>
              {log.map((entry) => (
                <tr key={entry.id}>
                  <td style={{ borderBottom: '1px solid #f3f4f6', padding: '0.5rem' }}>{entry.id}</td>
                  <td style={{ borderBottom: '1px solid #f3f4f6', padding: '0.5rem' }}>{entry.project_id}</td>
                  <td style={{ borderBottom: '1px solid #f3f4f6', padding: '0.5rem' }}>{entry.import_batch_id}</td>
                  <td style={{ borderBottom: '1px solid #f3f4f6', padding: '0.5rem' }}>{entry.entity_type}</td>
                  <td style={{ borderBottom: '1px solid #f3f4f6', padding: '0.5rem' }}>{entry.existing_id ?? '-'}</td>
                  <td style={{ borderBottom: '1px solid #f3f4f6', padding: '0.5rem' }}>{entry.action}</td>
                  <td style={{ borderBottom: '1px solid #f3f4f6', padding: '0.5rem' }}>{entry.row_hash}</td>
                  <td style={{ borderBottom: '1px solid #f3f4f6', padding: '0.5rem' }}>{new Date(entry.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DuplicatesPage;
