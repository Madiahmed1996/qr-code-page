import React, { useState, useEffect } from "react";

interface Employee {
  id: number;
  name: string;
}

interface WorkObject {
  id: number;
  name: string;
}

/**
 * Экран для распределения сотрудников по объектам. Можно выбрать нескольких
 * сотрудников и назначить их на выбранный объект. В реальном приложении
 * будет использоваться drag-and-drop и история назначений.
 */
const AssignmentsPage: React.FC = () => {
  // Список сотрудников и объектов загружается через API
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [objects, setObjects] = useState<WorkObject[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [assignments, setAssignments] = useState<{ [empId: number]: number | null }>({});

  // Загрузка сотрудников и объектов при монтировании
  useEffect(() => {
    fetch('/api/employees')
      .then((res) => res.json())
      .then((data: Employee[]) => setEmployees(data));
    fetch('/api/objects')
      .then((res) => res.json())
      .then((data: WorkObject[]) => setObjects(data));
    // Загрузить существующие назначения
    fetch('/api/assignments')
      .then((res) => res.json())
      .then((data: Array<{ id: number; employee_id: number; object_id: number | null }>) => {
        const map: { [empId: number]: number | null } = {};
        data.forEach((a) => {
          map[a.employee_id] = a.object_id;
        });
        setAssignments(map);
      });
  }, []);

  const toggleSelect = (id: number) => {
    setSelectedEmployees((prev: number[]) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const assignToObject = (objectId: number) => {
    // Для каждого выбранного сотрудника отправляем запрос на назначение
    selectedEmployees.forEach((empId) => {
      fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employee_id: empId, object_id: objectId, start_date: null, end_date: null }),
      });
    });
    // Обновляем локальное состояние
    setAssignments((prev) => {
      const updated: { [empId: number]: number | null } = { ...prev };
      selectedEmployees.forEach((empId) => {
        updated[empId] = objectId;
      });
      return updated;
    });
    setSelectedEmployees([]);
  };

  const removeFromObject = (empId: number) => {
    // Снимаем назначение: object_id=null
    fetch('/api/assignments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employee_id: empId, object_id: null, start_date: null, end_date: null }),
    });
    setAssignments((prev) => ({ ...prev, [empId]: null }));
  };

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem" }}>
        Распределение людей
      </h1>
      <div style={{ display: "flex", gap: "2rem" }}>
        {/* список сотрудников */}
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Сотрудники</h2>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {employees.map((emp) => (
              <li
                key={emp.id}
                onClick={() => toggleSelect(emp.id)}
                style={{
                  padding: "0.5rem",
                  marginBottom: "0.25rem",
                  border: "1px solid #e5e7eb",
                  borderRadius: "4px",
                  cursor: "pointer",
                  backgroundColor: selectedEmployees.includes(emp.id)
                    ? "#e0e7ff"
                    : "#ffffff",
                }}
              >
                {emp.name}{" "}{assignments[emp.id] && (
                  <span style={{ color: "#6b7280", fontSize: "0.75rem" }}>
                    (на {objects.find((o) => o.id === assignments[emp.id])?.name})
                  </span>
                )}
                {assignments[emp.id] && (
                  <button
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.stopPropagation();
                      removeFromObject(emp.id);
                    }}
                    style={{ marginLeft: "0.5rem", fontSize: "0.75rem" }}
                  >
                    ×
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
        {/* список объектов */}
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Объекты</h2>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {objects.map((obj) => (
              <li key={obj.id} style={{ marginBottom: "0.5rem" }}>
                <button
                  onClick={() => assignToObject(obj.id)}
                  disabled={selectedEmployees.length === 0}
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    borderRadius: "4px",
                    border: "1px solid #e5e7eb",
                    backgroundColor: selectedEmployees.length === 0 ? "#f3f4f6" : "#f5f5f5",
                    cursor: selectedEmployees.length === 0 ? "default" : "pointer",
                  }}
                >
                  Назначить на {obj.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div style={{ marginTop: "1rem" }}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Текущие назначения</h2>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {employees
            .filter((e) => assignments[e.id])
            .map((e) => (
              <li key={e.id} style={{ padding: "0.25rem 0" }}>
                {e.name} — {objects.find((o) => o.id === assignments[e.id])?.name}
                <button
                  onClick={() => removeFromObject(e.id)}
                  style={{ marginLeft: "0.5rem", fontSize: "0.75rem" }}
                >
                  Удалить
                </button>
              </li>
            ))}
          {Object.keys(assignments).filter((id) => assignments[Number(id)]).length === 0 && (
            <li style={{ color: "#6b7280" }}>Нет назначений</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default AssignmentsPage;
