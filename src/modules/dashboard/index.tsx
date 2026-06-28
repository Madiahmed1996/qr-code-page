import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface DashboardSummary {
  employees: number;
  objects: number;
  assignments: number;
  timesheetEntries: number;
  duplicates: number;
}

/**
 * Основной дашборд. Загружает агрегированные данные из API и
 * визуализирует их в виде столбчатого графика. Дополнительные
 * показатели можно добавить аналогичным образом.
 */
const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  useEffect(() => {
    fetch('/api/dashboard')
      .then((res) => res.json())
      .then((data: DashboardSummary) => setSummary(data))
      .catch((err) => console.error(err));
  }, []);
  // Сформировать данные для Recharts
  const chartData = summary
    ? [
        { name: 'Сотрудники', value: summary.employees },
        { name: 'Объекты', value: summary.objects },
        { name: 'Назначения', value: summary.assignments },
        { name: 'Записи табеля', value: summary.timesheetEntries },
        { name: 'Дубли', value: summary.duplicates },
      ]
    : [];
  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
        Дашборд
      </h1>
      {summary ? (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" name="Количество" fill="#2563eb" />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <p>Загрузка...</p>
      )}
    </div>
  );
};

export default Dashboard;
