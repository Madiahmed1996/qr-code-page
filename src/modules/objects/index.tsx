import React, { useState, useEffect } from "react";

interface WorkObject {
  id: number;
  name: string;
  address: string;
  type: string;
  status: string;
  project: string;
  responsible: string;
  comment: string;
}

/**
 * Управление объектами. Позволяет добавлять и редактировать объекты.
 */
const ObjectsPage: React.FC = () => {
  // Храним список объектов, загруженных с сервера
  const [objects, setObjects] = useState<WorkObject[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Omit<WorkObject, "id">>({
    name: "",
    address: "",
    type: "",
    status: "Активен",
    project: "",
    responsible: "",
    comment: "",
  });

  // Открываем модальную форму для добавления
  const openForm = () => {
    setShowForm(true);
    setFormData({ name: "", address: "", type: "", status: "Активен", project: "", responsible: "", comment: "" });
  };

  // Сохраняем новый объект через API и перезагружаем список
  const addObject = () => {
    fetch('/api/objects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then(() => {
        loadObjects();
        setShowForm(false);
      });
  };

  // Загружаем объекты с сервера
  const loadObjects = () => {
    fetch('/api/objects')
      .then((res) => res.json())
      .then((data: WorkObject[]) => setObjects(data));
  };

  // Загружаем объекты один раз при монтировании
  useEffect(() => {
    loadObjects();
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem" }}>
        Объекты
      </h1>
      <button
        onClick={openForm}
        style={{ backgroundColor: "#2563eb", color: "white", padding: "0.5rem 1rem", borderRadius: "4px", border: "none", marginBottom: "1rem" }}
      >
        Добавить объект
      </button>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid #e5e7eb", padding: "0.5rem" }}>Название</th>
              <th style={{ borderBottom: "1px solid #e5e7eb", padding: "0.5rem" }}>Адрес</th>
              <th style={{ borderBottom: "1px solid #e5e7eb", padding: "0.5rem" }}>Тип</th>
              <th style={{ borderBottom: "1px solid #e5e7eb", padding: "0.5rem" }}>Статус</th>
              <th style={{ borderBottom: "1px solid #e5e7eb", padding: "0.5rem" }}>Проект</th>
              <th style={{ borderBottom: "1px solid #e5e7eb", padding: "0.5rem" }}>Ответственный</th>
              <th style={{ borderBottom: "1px solid #e5e7eb", padding: "0.5rem" }}>Комментарий</th>
            </tr>
          </thead>
          <tbody>
            {objects.map((obj) => (
              <tr key={obj.id}>
                <td style={{ borderBottom: "1px solid #f9fafb", padding: "0.5rem" }}>{obj.name}</td>
                <td style={{ borderBottom: "1px solid #f9fafb", padding: "0.5rem" }}>{obj.address}</td>
                <td style={{ borderBottom: "1px solid #f9fafb", padding: "0.5rem" }}>{obj.type}</td>
                <td style={{ borderBottom: "1px solid #f9fafb", padding: "0.5rem" }}>{obj.status}</td>
                <td style={{ borderBottom: "1px solid #f9fafb", padding: "0.5rem" }}>{obj.project}</td>
                <td style={{ borderBottom: "1px solid #f9fafb", padding: "0.5rem" }}>{obj.responsible}</td>
                <td style={{ borderBottom: "1px solid #f9fafb", padding: "0.5rem" }}>{obj.comment}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
          <div style={{ backgroundColor: "white", padding: "1rem", borderRadius: "8px", width: "400px" }}>
            <h2 style={{ marginBottom: "1rem", fontSize: "1.25rem" }}>Новый объект</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <input
                type="text"
                placeholder="Название"
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
              />
              <input
                type="text"
                placeholder="Адрес"
                value={formData.address}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, address: e.target.value })}
              />
              <input
                type="text"
                placeholder="Тип"
                value={formData.type}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, type: e.target.value })}
              />
              <input
                type="text"
                placeholder="Статус"
                value={formData.status}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, status: e.target.value })}
              />
              <input
                type="text"
                placeholder="Проект"
                value={formData.project}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, project: e.target.value })}
              />
              <input
                type="text"
                placeholder="Ответственный"
                value={formData.responsible}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, responsible: e.target.value })}
              />
              <textarea
                placeholder="Комментарий"
                value={formData.comment}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, comment: e.target.value })}
                rows={3}
              ></textarea>
            </div>
            <div style={{ marginTop: "1rem", display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
              <button onClick={() => setShowForm(false)} style={{ padding: "0.5rem 1rem", border: "none", borderRadius: "4px" }}>Отмена</button>
              <button onClick={addObject} style={{ backgroundColor: "#2563eb", color: "white", padding: "0.5rem 1rem", border: "none", borderRadius: "4px" }}>Сохранить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ObjectsPage;
