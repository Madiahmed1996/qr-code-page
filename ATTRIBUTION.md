# Атрибуции и лицензии

Проект использует сторонние библиотеки и идеи из open‑source‑сообщества. Все зависимости выбраны с учётом совместимых лицензий (MIT или Apache‑2.0), что позволяет свободное использование в коммерческих и некоммерческих продуктах.

| Библиотека/репозиторий | Ссылка | Лицензия | Использование |
|---|---|---|---|
| **React** | https://github.com/facebook/react | MIT | Основной фреймворк для построения пользовательского интерфейса. |
| **React Router DOM** | https://github.com/remix-run/react-router | MIT | Клиентская маршрутизация между страницами. |
| **Material UI** (`@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled`) | https://github.com/mui/material-ui | MIT | Компоненты интерфейса (кнопки, таблицы, карточки). |
| **Recharts** | https://github.com/recharts/recharts | MIT | Построение графиков на дашборде. |
| **TanStack Table** | https://github.com/TanStack/table | MIT | Headless‑таблица для отображения и редактирования данных. |
| **SheetJS/xlsx** | https://github.com/SheetJS/sheetjs | Apache‑2.0 | Импорт и экспорт данных в Excel. |
| **Express** | https://github.com/expressjs/express | MIT | HTTP‑сервер для REST API. |
| **cors** | https://github.com/expressjs/cors | MIT | Middleware для настройки CORS. |
| **better‑sqlite3** | https://github.com/WiseLibs/better-sqlite3 | MIT【689636308851142†L0-L23】 | Работа с реальным SQLite‑файлом в Node. |
| **concurrently** | https://github.com/open-cli-tools/concurrently | MIT | Параллельный запуск Vite и backend в dev‑режиме. |
| **Vitest** | https://github.com/vitest-dev/vitest | MIT | Тестовый фреймворк для React. |
| **jsdom** | https://github.com/jsdom/jsdom | MIT | Эмуляция DOM в тестовой среде. |

Дополнительные примеры и плагины:

* **silvermine/tauri‑plugin‑sqlite** (MIT) – плагин Tauri для подключения SQLite с connection pooling и миграциями【11550961344158†L13-L27】. Рассматривался для desktop‑версии, но не используется на текущем этапе.
* **CosmicEon/Electron‑React‑Material‑SQLite** (MIT) – пример проекта на Electron с SQLite; изучали для возможной Electron‑сборки, код не включён.

Никакой код из сторонних репозиториев не был скопирован напрямую; в проекте используются только официальные пакеты, установленные через npm.
