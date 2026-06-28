import React, { useState, useEffect } from "react";

interface Employee {
  id: number;
  name: string;
  department: string;
  position: string;
  team: string;
  phone: string;
  active: boolean;
}

/**
 * Управление сотрудниками: просмотр списка, добавление и отключение.
 */
const EmployeesPage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Omit<Employee, "id">>({
    name: "",
    department: "",
    position: "",
    team: "",
    phone: "",
    active: true,
  });

  const openForm = () => {
    setShowForm(true);
    setFormData({ name: "", department: "", position: "", team: "", phone: "", active: true });
  };

  const addEmployee = () => {
    // отправляем данные на сервер и после ответа обновляем список
    fetch("/api/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then(() => {
        // перезагружаем список
        loadEmployees();
        setShowForm(false);
      });
  };

  const toggleActive = (id: number) => {
    fetch(`/api/employees/${id}/toggle`, { method: "PATCH" })
      .then((res) => res.json())
      .then(() => loadEmployees());
  };

  // Загрузка сотрудников из API
  const loadEmployees = () => {
    fetch("/api/employees")
      .then((res) => res.json())
      .then((data) => {
        setEmployees(data);
      });
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem" }}>
        Сотрудники
      </h1>
      <button
        onClick={openForm}
        style={{
          backgroundColor: "#2563eb",
          color: "white",
          padding: "0.5rem 1rem",
          borderRadius: "4px",
          border: "none",
          marginBottom: "1rem",
          cursor: "pointer",
        }}
      >
        Добавить сотрудника
      </button>
      <div style={{ overflowX: "auto" }}>
        <table
          style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}
        >
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid #e5e7eb", padding: "0.5rem" }}>ФИО</th>
              <th style={{ borderBottom: "1px solid #e5e7eb", padding: "0.5rem" }}>Отдел</th>
              <th style={{ borderBottom: "1px solid #e5e7eb", padding: "0.5rem" }}>Должность</th>
              <th style={{ borderBottom: "1px solid #e5e7eb", padding: "0.5rem" }}>Бригада</th>
              <th style={{ borderBottom: "1px solid #e5e7eb", padding: "0.5rem" }}>Телефон</th>
              <th style={{ borderBottom: "1px solid #e5e7eb", padding: "0.5rem" }}>Статус</th>
              <th style={{ borderBottom: "1px solid #e5e7eb", padding: "0.5rem" }}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id} style={{ backgroundColor: emp.active ? "white" : "#f3f4f6" }}>
                <td style={{ borderBottom: "1px solid #f9fafb", padding: "0.5rem" }}>{emp.name}</td>
                <td style={{ borderBottom: "1px solid #f9fafb", padding: "0.5rem" }}>{emp.department}</td>
                <td style={{ borderBottom: "1px solid #f9fafb", padding: "0.5rem" }}>{emp.position}</td>
                <td style={{ borderBottom: "1px solid #f9fafb", padding: "0.5rem" }}>{emp.team}</td>
                <td style={{ borderBottom: "1px solid #f9fafb", padding: "0.5rem" }}>{emp.phone}</td>
                <td style={{ borderBottom: "1px solid #f9fafb", padding: "0.5rem" }}>
                  {emp.active ? "Активен" : "Неактивен"}
                </td>
                <td style={{ borderBottom: "1px solid #f9fafb", padding: "0.5rem" }}>
                  <button
                    onClick={() => toggleActive(emp.id)}
                    style={{
                      backgroundColor: emp.active ? "#dc2626" : "#16a34a",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      padding: "0.25rem 0.5rem",
                      cursor: "pointer",
                    }}
                  >
                    {emp.active ? "Отключить" : "Включить"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Модальное окно для добавления сотрудника */}
      {showForm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "1rem",
              borderRadius: "8px",
              width: "300px",
            }}
          >
            <h2 style={{ marginBottom: "1rem", fontSize: "1.25rem" }}>Новый сотрудник</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <input
                type="text"
                placeholder="ФИО"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <input
                type="text"
                placeholder="Отдел"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
              <input
                type="text"
                placeholder="Должность"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              />
              <input
                type="text"
                placeholder="Бригада"
                value={formData.team}
                onChange={(e) => setFormData({ ...formData, team: e.target.value })}
              />
              <input
                type="text"
                placeholder="Телефон"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                />
                Активен
              </label>
            </div>
            <div style={{ marginTop: "1rem", display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
              <button
                onClick={() => setShowForm(false)}
                style={{ padding: "0.5rem 1rem", border: "none", borderRadius: "4px" }}
              >
                Отмена
              </button>
              <button
                onClick={addEmployee}
                style={{ backgroundColor: "#2563eb", color: "white", padding: "0.5rem 1rem", border: "none", borderRadius: "4px" }}
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeesPage;
