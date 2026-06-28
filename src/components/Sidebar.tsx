import React from "react";
import { NavLink } from "react-router-dom";

// Определяем пункты меню. Это массив объектов, чтобы легче управлять
// порядком и подписью меню. Каждый пункт содержит путь и заголовок.
const menuItems = [
  { path: "/", label: "Дашборд" },
  { path: "/import", label: "Импорт Excel" },
  { path: "/duplicates", label: "Дубли" },
  { path: "/timesheet", label: "Табель" },
  { path: "/employees", label: "Сотрудники" },
  { path: "/objects", label: "Объекты" },
  { path: "/assignments", label: "Распределение" },
  { path: "/command-center", label: "Командный центр" },
  { path: "/export", label: "Экспорт" },
  { path: "/settings", label: "Настройки" }
];

/**
 * Компонент бокового меню. Использует NavLink для навигации между
 * различными экранами приложения. Активный пункт подсвечивается
 * жирным шрифтом. При необходимости можно заменить на MUI Drawer.
 */
const Sidebar: React.FC = () => {
  return (
    <aside
      style={{
        width: "200px",
        backgroundColor: "#ffffff",
        borderRight: "1px solid #e5e7eb",
        padding: "1rem",
        boxSizing: "border-box",
      }}
    >
      <h2 style={{ marginBottom: "1rem", fontSize: "1.25rem", fontWeight: 600 }}>
        Madi Manager
      </h2>
      <nav>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {menuItems.map((item) => (
            <li key={item.path} style={{ marginBottom: "0.5rem" }}>
              <NavLink
                to={item.path}
                style={({ isActive }) => ({
                  textDecoration: "none",
                  color: isActive ? "#2563eb" : "#374151",
                  fontWeight: isActive ? 600 : 400,
                })}
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
