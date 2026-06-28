-- SQL-скрипт для инициализации базы данных приложения

-- Таблица шаблонов (например, для хранения настроек импорта)
CREATE TABLE IF NOT EXISTS Templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT
);

-- Таблица проектов
CREATE TABLE IF NOT EXISTS Projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Таблица иерархии сущностей (узлы)
CREATE TABLE IF NOT EXISTS EntityNodes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  parent_id INTEGER,
  FOREIGN KEY(project_id) REFERENCES Projects(id) ON DELETE CASCADE,
  FOREIGN KEY(parent_id) REFERENCES EntityNodes(id) ON DELETE CASCADE
);

-- Таблица метрик
CREATE TABLE IF NOT EXISTS MetricsData (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_id INTEGER NOT NULL,
  metric_key TEXT NOT NULL,
  metric_value REAL,
  recorded_at TEXT DEFAULT CURRENT_TIMESTAMP,
  object_id INTEGER,
  row_hash TEXT,
  meta TEXT,
  FOREIGN KEY(entity_id) REFERENCES EntityNodes(id) ON DELETE CASCADE,
  FOREIGN KEY(object_id) REFERENCES WorkObjects(id) ON DELETE SET NULL
);

-- Таблица импортов
CREATE TABLE IF NOT EXISTS ImportBatches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  file_name TEXT,
  imported_at TEXT DEFAULT CURRENT_TIMESTAMP,
  row_count INTEGER,
  new_count INTEGER,
  duplicate_count INTEGER,
  error_count INTEGER
);

-- Таблица журнала дублей
CREATE TABLE IF NOT EXISTS DuplicateLog (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  import_batch_id INTEGER NOT NULL,
  entity_type TEXT NOT NULL,
  existing_id INTEGER,
  action TEXT NOT NULL,
  row_hash TEXT NOT NULL,
  new_data TEXT,
  existing_data TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(project_id) REFERENCES Projects(id) ON DELETE CASCADE,
  FOREIGN KEY(import_batch_id) REFERENCES ImportBatches(id) ON DELETE CASCADE
  -- Note: existing_id is intentionally not constrained with a foreign key because it may refer to different tables based on entity_type
);

-- Таблица сотрудников
CREATE TABLE IF NOT EXISTS Employees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  department TEXT,
  position TEXT,
  team TEXT,
  phone TEXT,
  active INTEGER DEFAULT 1
);

-- Таблица объектов
CREATE TABLE IF NOT EXISTS WorkObjects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  address TEXT,
  type TEXT,
  status TEXT,
  project TEXT,
  responsible TEXT,
  comment TEXT
);

-- Таблица назначений сотрудников на объекты
CREATE TABLE IF NOT EXISTS WorkAssignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  object_id INTEGER NOT NULL,
  start_date TEXT,
  end_date TEXT,
  FOREIGN KEY(employee_id) REFERENCES Employees(id) ON DELETE CASCADE,
  FOREIGN KEY(object_id) REFERENCES WorkObjects(id) ON DELETE CASCADE
);

-- Таблица табеля рабочего времени
CREATE TABLE IF NOT EXISTS Timesheet (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  hours REAL DEFAULT 0,
  overtime REAL DEFAULT 0,
  status TEXT,
  object_id INTEGER,
  row_hash TEXT,
  meta TEXT,
  FOREIGN KEY(employee_id) REFERENCES Employees(id) ON DELETE CASCADE,
  FOREIGN KEY(object_id) REFERENCES WorkObjects(id) ON DELETE SET NULL
);

-- Таблица настроек приложения
CREATE TABLE IF NOT EXISTS AppSettings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL UNIQUE,
  value TEXT
);
