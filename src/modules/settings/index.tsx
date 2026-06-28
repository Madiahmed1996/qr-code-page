import React, { useState } from "react";

/**
 * Страница настроек приложения. Позволяет изменить параметры,
 * такие как тема, язык и другие. Сейчас реализована только
 * заглушка с примером переключателя темы.
 */
const SettingsPage: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem" }}>
        Настройки
      </h1>
      <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <input
          type="checkbox"
          checked={darkMode}
          onChange={(e) => setDarkMode(e.target.checked)}
        />
        Тёмная тема
      </label>
      <p style={{ marginTop: "1rem", fontSize: "0.875rem" }}>
        Дополнительные настройки будут реализованы позже.
      </p>
    </div>
  );
};

export default SettingsPage;
