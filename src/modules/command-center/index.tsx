import React from "react";

interface CardProps {
  title: string;
  value: string | number;
  description?: string;
}

const Card: React.FC<CardProps> = ({ title, value, description }) => (
  <div
    style={{
      backgroundColor: "#ffffff",
      padding: "1rem",
      borderRadius: "8px",
      boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
      flex: 1,
      minWidth: "180px",
    }}
  >
    <h3 style={{ margin: 0, fontSize: "1rem", color: "#6b7280" }}>{title}</h3>
    <p style={{ margin: "0.25rem 0", fontSize: "1.75rem", fontWeight: 700 }}>{value}</p>
    {description && (
      <p style={{ margin: 0, fontSize: "0.75rem", color: "#6b7280" }}>{description}</p>
    )}
  </div>
);

/**
 * Командный центр: главный экран управления, где отображаются
 * сводки по проектам, объектам, людям и задачам. Здесь приведены
 * показатели, блокеры, последние импорты и предупреждения.
 */
const CommandCenterPage: React.FC = () => {
  const [data, setData] = React.useState({
    objects: 0,
    ready: 0,
    blockers: 0,
    overload: 0,
    recentImports: 0,
    recentDuplicates: 0,
    warnings: 0,
  });
  React.useEffect(() => {
    fetch('/api/command-summary')
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error(err));
  }, []);
  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
        Командный центр
      </h1>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
        <Card title="Всего объектов" value={data.objects} />
        <Card title="Готовы" value={data.ready} />
        <Card title="Блокеры" value={data.blockers} />
        <Card title="Переработка" value={data.overload} />
        <Card title="Последние импорты" value={data.recentImports} />
        <Card title="Новые дубли" value={data.recentDuplicates} />
        <Card title="Предупреждения" value={data.warnings} />
      </div>
      <p>Здесь можно добавить дополнительные виджеты, списки задач и диаграммы.</p>
    </div>
  );
};

export default CommandCenterPage;
