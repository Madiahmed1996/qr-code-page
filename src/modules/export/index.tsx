import React, { useState } from 'react';

/**
 * Страница экспорта данных. Вместо уязвимой библиотеки xlsx
 * используется простая генерация CSV. Пользователь выбирает набор
 * данных, и файл загружается как .csv. При желании его можно
 * открыть в Excel или других таблицах.
 */
const ExportPage: React.FC = () => {
  const [type, setType] = useState<string>('employees');
  const handleExport = async () => {
    try {
      const res = await fetch(`/api/export?type=${type}`);
      if (!res.ok) throw new Error('Ошибка экспорта');
      const data = await res.json();
      let rows: any[] = [];
      if (type === 'employees') {
        rows = data.map((e: any) => ({
          ID: e.id,
          Name: e.name,
          Department: e.department,
          Position: e.position,
          Team: e.team,
          Phone: e.phone,
          Active: e.active ? 'Yes' : 'No',
        }));
      } else if (type === 'objects') {
        rows = data.map((o: any) => ({
          ID: o.id,
          Name: o.name,
          Address: o.address,
          Type: o.type,
          Status: o.status,
          Project: o.project,
          Responsible: o.responsible,
          Comment: o.comment,
        }));
      } else if (type === 'timesheet') {
        rows = data.map((t: any) => ({
          ID: t.id,
          EmployeeId: t.employee_id,
          Date: t.date,
          Hours: t.hours,
          Overtime: t.overtime,
          Status: t.status,
          ObjectId: t.object_id,
        }));
      } else if (type === 'duplicates') {
        rows = data.map((d: any) => ({
          ID: d.id,
          ProjectId: d.project_id,
          BatchId: d.import_batch_id,
          EntityType: d.entity_type,
          ExistingId: d.existing_id,
          Action: d.action,
          RowHash: d.row_hash,
          CreatedAt: d.created_at,
        }));
      }
      if (!rows.length) {
        alert('Нет данных для экспорта');
        return;
      }
      const headers = Object.keys(rows[0]);
      const csvLines: string[] = [];
      csvLines.push(headers.join(','));
      for (const row of rows) {
        const values = headers.map((h) => {
          const v = row[h] ?? '';
          const s = String(v).replace(/"/g, '""');
          return `"${s}"`;
        });
        csvLines.push(values.join(','));
      }
      const csvString = csvLines.join('\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${type}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Не удалось экспортировать данные');
    }
  };
  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
        Экспорт данных
      </h1>
      <div style={{ marginBottom: '1rem' }}>
        <label>
          Выберите набор данных:
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            style={{ marginLeft: '0.5rem' }}
          >
            <option value="employees">Сотрудники</option>
            <option value="objects">Объекты</option>
            <option value="timesheet">Табель</option>
            <option value="duplicates">Дубли</option>
          </select>
        </label>
      </div>
      <button
        onClick={handleExport}
        style={{ backgroundColor: '#2563eb', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px' }}
      >
        Экспортировать
      </button>
    </div>
  );
};

export default ExportPage;
