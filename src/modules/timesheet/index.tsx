import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";

interface TimesheetCell {
  present: boolean;
  hours: number;
  overtime: number;
  status: string;
}

const TimesheetPage: React.FC = () => {
  const today = new Date();
  const [month, setMonth] = useState<number>(today.getMonth());
  const [year, setYear] = useState<number>(today.getFullYear());
  const [employees, setEmployees] = useState<Array<{ id: number; name: string; team?: string }>>([]);
  const [objects, setObjects] = useState<Array<{ id: number; name: string }>>([]);
  const [objectFilter, setObjectFilter] = useState<number | ''>('');
  const [teamFilter, setTeamFilter] = useState<string>('');
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const [sheet, setSheet] = useState<{ [empId: number]: { [day: number]: TimesheetCell } }>({});

  const togglePresent = (empId: number, day: number) => {
    setSheet((prev) => {
      const current = prev[empId]?.[day];
      const newPresent = !current?.present;
      const updated = {
        ...prev,
        [empId]: {
          ...prev[empId],
          [day]: {
            present: newPresent,
            hours: newPresent ? 8 : 0,
            overtime: 0,
            status: newPresent ? 'present' : 'absent',
          },
        },
      };
      const date = new Date(year, month, day).toISOString().split('T')[0];
      fetch('/api/timesheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employee_id: empId, date, hours: newPresent ? 8 : 0, overtime: 0, status: newPresent ? 'present' : 'absent' }),
      });
      return updated;
    });
  };

  useEffect(() => {
    fetch('/api/objects')
      .then((res) => res.json())
      .then((objs) => setObjects(objs))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch('/api/employees')
      .then((res) => res.json())
      .then((empList) => {
        setEmployees(empList);
        return Promise.all([
          empList,
          fetch(`/api/timesheet?month=${month + 1}&year=${year}` + (objectFilter ? `&object_id=${objectFilter}` : '') + (teamFilter ? `&team=${encodeURIComponent(teamFilter)}` : '')).then((res) => res.json()),
        ]);
      })
      .then(([empList, entries]) => {
        const newSheet: { [empId: number]: { [day: number]: TimesheetCell } } = {};
        empList.forEach((emp: any) => {
          newSheet[emp.id] = {};
          for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = new Date(year, month, d).toISOString().split('T')[0];
            const entry = entries.find((e: any) => e.employee_id === emp.id && e.date === dateStr);
            newSheet[emp.id][d] = {
              present: entry ? entry.hours > 0 : false,
              hours: entry ? entry.hours : 0,
              overtime: entry ? entry.overtime : 0,
              status: entry?.status || '',
            };
          }
        });
        setSheet(newSheet);
      })
      .catch((err) => console.error(err));
  }, [month, year, objectFilter, teamFilter]);

  const markAllPresent = () => {
    const newSheet: { [empId: number]: { [day: number]: TimesheetCell } } = {};
    employees.forEach((emp) => {
      newSheet[emp.id] = {};
      for (let d = 1; d <= daysInMonth; d++) {
        newSheet[emp.id][d] = { present: true, hours: 8, overtime: 0, status: 'present' };
        const date = new Date(year, month, d).toISOString().split('T')[0];
        fetch('/api/timesheet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ employee_id: emp.id, date, hours: 8, overtime: 0, status: 'present', object_id: objectFilter || null }),
        });
      }
    });
    setSheet(newSheet);
  };

  const exportToExcel = async () => {
    try {
      const res = await fetch('/api/export?type=timesheet');
      const json = await res.json();
      const empMap: { [id: number]: string } = {};
      employees.forEach((emp) => (empMap[emp.id] = emp.name));
      const exportRows = json.map((row: any) => ({
        Employee: empMap[row.employee_id] || row.employee_id,
        Date: row.date,
        Hours: row.hours,
        Overtime: row.overtime,
        Status: row.status,
        ObjectId: row.object_id,
      }));
      const worksheet = XLSX.utils.json_to_sheet(exportRows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Timesheet');
      XLSX.writeFile(workbook, 'timesheet.xlsx');
    } catch (err) {
      console.error('Ошибка экспорта', err);
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>Табель</h1>
      <div style={{ marginBottom: '1rem', display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <label>
            Месяц:
            <select value={month} onChange={(e) => setMonth(Number(e.target.value))} style={{ marginLeft: '0.5rem' }}>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={i}>{new Date(0, i).toLocaleString('ru-RU', { month: 'long' })}</option>
              ))}
            </select>
          </label>
        </div>
        <div>
          <label>
            Год:
            <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} style={{ marginLeft: '0.5rem', width: '6rem' }} />
          </label>
        </div>
        <div>
          <label>
            Объект:
            <select value={objectFilter} onChange={(e) => setObjectFilter(e.target.value === '' ? '' : Number(e.target.value))} style={{ marginLeft: '0.5rem' }}>
              <option value="">Все</option>
              {objects.map((obj) => (
                <option key={obj.id} value={obj.id}>{obj.name}</option>
              ))}
            </select>
          </label>
        </div>
        <div>
          <label>
            Бригада:
            <select value={teamFilter} onChange={(e) => setTeamFilter(e.target.value)} style={{ marginLeft: '0.5rem' }}>
              <option value="">Все</option>
              {Array.from(new Set(employees.map((e) => e.team || '')))
                .filter((t) => t)
                .map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
            </select>
          </label>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button onClick={markAllPresent} style={{ backgroundColor: '#16a34a', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px' }}>Отметить всех присутствующими</button>
          <button onClick={exportToExcel} style={{ backgroundColor: '#2563eb', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px' }}>Экспорт табеля</button>
        </div>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '0.75rem' }}>
          <thead>
            <tr>
              <th style={{ position: 'sticky', left: 0, backgroundColor: '#f1f5f9', borderBottom: '1px solid #e5e7eb', padding: '0.5rem' }}>Сотрудник</th>
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
                <th key={day} style={{ borderBottom: '1px solid #e5e7eb', padding: '0.25rem', minWidth: '2rem', textAlign: 'center' }}>{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id}>
                <td style={{ position: 'sticky', left: 0, backgroundColor: '#f8fafc', borderBottom: '1px solid #f1f5f9', padding: '0.5rem', whiteSpace: 'nowrap' }}>{emp.name}</td>
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                  const cell = sheet[emp.id]?.[day];
                  return (
                    <td key={day} onClick={() => togglePresent(emp.id, day)} style={{ borderBottom: '1px solid #f3f4f6', padding: '0.25rem', textAlign: 'center', cursor: 'pointer', backgroundColor: cell?.present ? '#dcfce7' : '#f9fafb' }}>
                      {cell?.present ? cell.hours : '-'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>Нажмите на ячейку, чтобы отметить присутствие. Зелёная ячейка обозначает присутствие (8 часов), серым — отсутствие.</p>
    </div>
  );
};

export default TimesheetPage;
