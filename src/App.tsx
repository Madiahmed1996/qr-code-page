import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./modules/dashboard";
import ImportPage from "./modules/import";
import DuplicatesPage from "./modules/duplicates";
import TimesheetPage from "./modules/timesheet";
import EmployeesPage from "./modules/employees";
import ObjectsPage from "./modules/objects";
import AssignmentsPage from "./modules/assignments";
import CommandCenterPage from "./modules/command-center";
import SettingsPage from "./modules/settings";
import ExportPage from "./modules/export";

// Основной компонент приложения. Разбивает интерфейс на боковое меню и
// контентную область. Навигация осуществляется через React Router.
const App: React.FC = () => {
  return (
    <div style={{ display: "flex", height: "100%" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "1rem", overflow: "auto" }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/import" element={<ImportPage />} />
          <Route path="/duplicates" element={<DuplicatesPage />} />
          <Route path="/timesheet" element={<TimesheetPage />} />
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/objects" element={<ObjectsPage />} />
          <Route path="/assignments" element={<AssignmentsPage />} />
          <Route path="/command-center" element={<CommandCenterPage />} />
          <Route path="/export" element={<ExportPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          {/* Перенаправляем неизвестные маршруты на дашборд */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
