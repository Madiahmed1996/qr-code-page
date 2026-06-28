// Simple Express server to provide a local API for persistent data storage.
// The server uses better-sqlite3 to interact with a SQLite database stored
// on the local filesystem. It exposes REST endpoints for employees,
// objects, assignments, timesheets and duplicate logs. More endpoints can
// be added as the application grows. This server is intended to be
// launched alongside the Vite development server using the `npm run dev`
// script.

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

// Ensure the data directory exists
const dataDir = path.join(__dirname, '..', 'data');
fs.mkdirSync(dataDir, { recursive: true });

// Path to the persistent SQLite file. This file will be created on first
// run and will persist data across application restarts.
const dbFile = path.join(dataDir, 'madi-manager.db');

// Load the SQL schema from the same schema used by the frontend. On
// startup, we will run the schema once to ensure all tables exist. If
// tables already exist, CREATE TABLE IF NOT EXISTS statements will
// leave them unchanged.
const schemaPath = path.join(__dirname, '..', 'src', 'db', 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

// Initialize the database connection. Setting `fileMustExist: false`
// allows creation of a new file if it does not exist.
const db = new Database(dbFile);
// Execute the schema. Since multiple CREATE TABLE statements are
// separated by semicolons, exec() can process the entire file at once.
db.exec(schema);

const app = express();
app.use(cors());
app.use(express.json());

// Helper function to handle errors from database operations. It wraps
// route handlers and returns HTTP 500 on exceptions.
function asyncHandler(fn) {
  return function wrapped(req, res, next) {
    try {
      return fn(req, res, next);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error', details: err.message });
    }
  };
}

// Employees API
// GET /api/employees – list all employees
app.get('/api/employees', asyncHandler((req, res) => {
  const stmt = db.prepare(
    'SELECT id, name, department, position, team, phone, active FROM Employees ORDER BY id'
  );
  const employees = stmt.all();
  res.json(employees);
}));

// POST /api/employees – add a new employee
app.post('/api/employees', asyncHandler((req, res) => {
  const { name, department, position, team, phone, active } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  const stmt = db.prepare(
    'INSERT INTO Employees (name, department, position, team, phone, active) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const info = stmt.run(
    name,
    department || '',
    position || '',
    team || '',
    phone || '',
    active ? 1 : 1
  );
  res.status(201).json({ id: info.lastInsertRowid });
}));

// PUT /api/employees/:id – update an existing employee
app.put('/api/employees/:id', asyncHandler((req, res) => {
  const id = parseInt(req.params.id, 10);
  const { name, department, position, team, phone, active } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  const stmt = db.prepare(
    'UPDATE Employees SET name = ?, department = ?, position = ?, team = ?, phone = ?, active = ? WHERE id = ?'
  );
  const result = stmt.run(
    name,
    department || '',
    position || '',
    team || '',
    phone || '',
    active ? 1 : 0,
    id
  );
  res.json({ changes: result.changes });
}));

// PATCH /api/employees/:id/toggle – toggle active status
app.patch('/api/employees/:id/toggle', asyncHandler((req, res) => {
  const id = parseInt(req.params.id, 10);
  const current = db.prepare('SELECT active FROM Employees WHERE id = ?').get(id);
  if (!current) return res.status(404).json({ error: 'Not found' });
  const newValue = current.active ? 0 : 1;
  const stmt = db.prepare('UPDATE Employees SET active = ? WHERE id = ?');
  stmt.run(newValue, id);
  res.json({ active: newValue });
}));

// Work Objects API
// GET /api/objects – list work objects
app.get('/api/objects', asyncHandler((req, res) => {
  const objects = db.prepare(
    'SELECT id, name, address, type, status, project, responsible, comment FROM WorkObjects ORDER BY id'
  ).all();
  res.json(objects);
}));

// POST /api/objects – add a new work object
app.post('/api/objects', asyncHandler((req, res) => {
  const { name, address, type, status, project, responsible, comment } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  const stmt = db.prepare(
    'INSERT INTO WorkObjects (name, address, type, status, project, responsible, comment) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );
  const info = stmt.run(
    name,
    address || '',
    type || '',
    status || '',
    project || '',
    responsible || '',
    comment || ''
  );
  res.status(201).json({ id: info.lastInsertRowid });
}));

// Work Assignments API
// GET /api/assignments – list all assignments
app.get('/api/assignments', asyncHandler((req, res) => {
  const assignments = db.prepare(
    'SELECT id, employee_id, object_id, start_date, end_date FROM WorkAssignments ORDER BY id'
  ).all();
  res.json(assignments);
}));

// POST /api/assignments – create a new assignment
app.post('/api/assignments', asyncHandler((req, res) => {
  const { employee_id, object_id, start_date, end_date } = req.body;
  if (!employee_id || !object_id) {
    return res.status(400).json({ error: 'employee_id and object_id are required' });
  }
  const stmt = db.prepare(
    'INSERT INTO WorkAssignments (employee_id, object_id, start_date, end_date) VALUES (?, ?, ?, ?)'
  );
  const info = stmt.run(employee_id, object_id, start_date || null, end_date || null);
  res.status(201).json({ id: info.lastInsertRowid });
}));

// Timesheet API
// GET /api/timesheet?month=6&year=2026 – list entries for a given month/year
app.get('/api/timesheet', asyncHandler((req, res) => {
  const { month, year, object_id, team } = req.query;
  if (!month || !year) {
    return res.status(400).json({ error: 'month and year are required' });
  }
  const m = String(month).padStart(2, '0');
  const y = String(year);
  let sql = 'SELECT * FROM Timesheet WHERE substr(date,1,4)=? AND substr(date,6,2)=?';
  const params = [y, m];
  if (object_id) {
    sql += ' AND object_id = ?';
    params.push(Number(object_id));
  }
  // team filter: join with Employees table to filter by team
  if (team) {
    sql =
      'SELECT t.* FROM Timesheet t JOIN Employees e ON t.employee_id = e.id WHERE substr(t.date,1,4)=? AND substr(t.date,6,2)=? AND e.team = ?';
    params.splice(2, 0, team);
  }
  const rows = db.prepare(sql).all(...params);
  res.json(rows);
}));

// POST /api/timesheet – upsert a timesheet entry
app.post('/api/timesheet', asyncHandler((req, res) => {
  const { employee_id, date, hours, overtime, status, object_id, row_hash, meta } = req.body;
  if (!employee_id || !date) {
    return res.status(400).json({ error: 'employee_id and date are required' });
  }
  // Check if entry exists
  const existing = db
    .prepare('SELECT id FROM Timesheet WHERE employee_id = ? AND date = ?')
    .get(employee_id, date);
  if (existing) {
    const stmt = db.prepare(
      'UPDATE Timesheet SET hours = ?, overtime = ?, status = ?, object_id = ?, row_hash = ?, meta = ? WHERE id = ?'
    );
    stmt.run(
      hours || 0,
      overtime || 0,
      status || null,
      object_id || null,
      row_hash || null,
      meta || null,
      existing.id
    );
    res.json({ id: existing.id, updated: true });
  } else {
    const stmt = db.prepare(
      'INSERT INTO Timesheet (employee_id, date, hours, overtime, status, object_id, row_hash, meta) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    const info = stmt.run(
      employee_id,
      date,
      hours || 0,
      overtime || 0,
      status || null,
      object_id || null,
      row_hash || null,
      meta || null
    );
    res.status(201).json({ id: info.lastInsertRowid, updated: false });
  }
}));

// Duplicate log API
// GET /api/duplicates – list duplicate log entries
app.get('/api/duplicates', asyncHandler((req, res) => {
  const rows = db.prepare('SELECT * FROM DuplicateLog ORDER BY created_at DESC').all();
  // Parse JSON fields
  const parsed = rows.map((row) => {
    return {
      ...row,
      new_data: row.new_data ? JSON.parse(row.new_data) : null,
      existing_data: row.existing_data ? JSON.parse(row.existing_data) : null,
    };
  });
  res.json(parsed);
}));

// Export API
// GET /api/export?type=employees|objects|timesheet|duplicates
// Returns JSON array of data for the requested type. The front‑end can convert
// these arrays to Excel using xlsx. In a future version, this endpoint can
// directly generate and stream Excel files.
app.get('/api/export', asyncHandler((req, res) => {
  const { type } = req.query;
  if (!type) return res.status(400).json({ error: 'type is required' });
  let rows = [];
  switch (type) {
    case 'employees':
      rows = db.prepare(
        'SELECT id, name, department, position, team, phone, active FROM Employees ORDER BY id'
      ).all();
      break;
    case 'objects':
      rows = db.prepare(
        'SELECT id, name, address, type, status, project, responsible, comment FROM WorkObjects ORDER BY id'
      ).all();
      break;
    case 'timesheet':
      rows = db.prepare(
        'SELECT id, employee_id, date, hours, overtime, status, object_id FROM Timesheet ORDER BY id'
      ).all();
      break;
    case 'duplicates':
      rows = db.prepare('SELECT * FROM DuplicateLog ORDER BY created_at DESC').all();
      rows = rows.map((row) => ({
        ...row,
        new_data: row.new_data ? JSON.parse(row.new_data) : null,
        existing_data: row.existing_data ? JSON.parse(row.existing_data) : null,
      }));
      break;
    default:
      return res.status(400).json({ error: 'Unknown export type' });
  }
  res.json(rows);
}));

// Dashboard summary API
// GET /api/dashboard – returns summary counts for dashboard cards
app.get('/api/dashboard', asyncHandler((req, res) => {
  const employees = db.prepare('SELECT COUNT(*) AS count FROM Employees').get().count;
  const objects = db.prepare('SELECT COUNT(*) AS count FROM WorkObjects').get().count;
  const assignments = db.prepare('SELECT COUNT(*) AS count FROM WorkAssignments').get().count;
  const timesheetEntries = db.prepare('SELECT COUNT(*) AS count FROM Timesheet').get().count;
  const duplicates = db.prepare('SELECT COUNT(*) AS count FROM DuplicateLog').get().count;
  res.json({ employees, objects, assignments, timesheetEntries, duplicates });
}));

// Command center summary
// GET /api/command-summary – returns high-level metrics for command centre
app.get('/api/command-summary', asyncHandler((req, res) => {
  const objects = db.prepare('SELECT COUNT(*) AS count FROM WorkObjects').get().count;
  const ready = db.prepare("SELECT COUNT(*) AS count FROM WorkObjects WHERE status = 'ready'").get().count;
  const blockers = db.prepare("SELECT COUNT(*) AS count FROM WorkObjects WHERE status = 'blocked'").get().count;
  // Overload: number of timesheet entries with overtime > 0 for current month
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = String(now.getFullYear());
  const overload = db.prepare(
    'SELECT COUNT(*) AS count FROM Timesheet WHERE overtime > 0 AND substr(date,1,4) = ? AND substr(date,6,2) = ?'
  ).get(year, month).count;
  const recentImports = db.prepare('SELECT COUNT(*) AS count FROM ImportBatches WHERE DATE(imported_at) >= DATE("now", "-7 days")').get().count;
  const recentDuplicates = db.prepare('SELECT COUNT(*) AS count FROM DuplicateLog WHERE DATE(created_at) >= DATE("now", "-7 days")').get().count;
  const warnings = blockers + overload + recentDuplicates;
  res.json({ objects, ready, blockers, overload, recentImports, recentDuplicates, warnings });
}));

// Import API
// POST /api/import – generic import endpoint to load data from Excel/CSV.
// Expects body { type: 'employees' | 'objects' | 'timesheet', rows: array }
// Returns summary { total, newCount, duplicateCount }
app.post('/api/import', asyncHandler((req, res) => {
  const { type, rows } = req.body;
  if (!type || !Array.isArray(rows)) {
    return res.status(400).json({ error: 'type and rows are required' });
  }
  let newCount = 0;
  let duplicateCount = 0;
  if (type === 'employees') {
    const insertStmt = db.prepare(
      'INSERT INTO Employees (name, department, position, team, phone, active) VALUES (?, ?, ?, ?, ?, ?)' 
    );
    const findStmt = db.prepare(
      'SELECT id FROM Employees WHERE name = ? AND phone = ? LIMIT 1'
    );
    rows.forEach((row) => {
      const name = row.name || row.ФИО || row.fio || row.FIO;
      const phone = row.phone || row.телефон || row.Телефон;
      if (!name) {
        return;
      }
      const existing = findStmt.get(name, phone || '');
      if (existing) {
        // Log duplicate
        const newData = row;
        const existingData = db
          .prepare(
            'SELECT id, name, department, position, team, phone, active FROM Employees WHERE id = ?'
          )
          .get(existing.id);
        // Insert into DuplicateLog
        db.prepare(
          'INSERT INTO DuplicateLog (project_id, import_batch_id, entity_type, existing_id, action, row_hash, new_data, existing_data) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        ).run(
          1, // project_id placeholder
          1, // import_batch_id placeholder
          'employees', // entity_type
          existing.id,
          'skip',
          '',
          JSON.stringify(newData),
          JSON.stringify(existingData)
        );
        duplicateCount++;
      } else {
        insertStmt.run(
          name,
          row.department || row.отдел || '',
          row.position || row.должность || '',
          row.team || row.бригада || '',
          phone || '',
          1
        );
        newCount++;
      }
    });
  } else if (type === 'objects') {
    const insertObj = db.prepare(
      'INSERT INTO WorkObjects (name, address, type, status, project, responsible, comment) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    rows.forEach((row) => {
      insertObj.run(
        row.name || row.Название || '',
        row.address || row.Адрес || '',
        row.type || row.Тип || '',
        row.status || row.Статус || '',
        row.project || row.Проект || '',
        row.responsible || row.Ответственный || '',
        row.comment || row.Комментарий || ''
      );
      newCount++;
    });
  } else if (type === 'timesheet') {
    // For timesheet import, expect rows with employee_id or name, date, hours, overtime, status
    const upsert = (entry) => {
      const existing = db
        .prepare('SELECT id FROM Timesheet WHERE employee_id = ? AND date = ?')
        .get(entry.employee_id, entry.date);
      if (existing) {
        db.prepare(
          'UPDATE Timesheet SET hours = ?, overtime = ?, status = ?, object_id = ?, row_hash = ?, meta = ? WHERE id = ?'
        ).run(
          entry.hours || 0,
          entry.overtime || 0,
          entry.status || null,
          entry.object_id || null,
          entry.row_hash || null,
          entry.meta || null,
          existing.id
        );
      } else {
        db.prepare(
          'INSERT INTO Timesheet (employee_id, date, hours, overtime, status, object_id, row_hash, meta) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        ).run(
          entry.employee_id,
          entry.date,
          entry.hours || 0,
          entry.overtime || 0,
          entry.status || null,
          entry.object_id || null,
          entry.row_hash || null,
          entry.meta || null
        );
      }
    };
    rows.forEach((row) => {
      // Resolve employee by name if id not provided
      let employeeId = row.employee_id;
      if (!employeeId && row.name) {
        const emp = db.prepare('SELECT id FROM Employees WHERE name = ?').get(row.name);
        if (emp) employeeId = emp.id;
      }
      if (!employeeId) {
        return;
      }
      const date = row.date || row.Date || row.Дата;
      if (!date) {
        return;
      }
      upsert({
        employee_id: employeeId,
        date,
        hours: row.hours || row.Hours || row.Часы || 0,
        overtime: row.overtime || row.Overtime || row.Переработка || 0,
        status: row.status || row.Status || row.Статус || null,
        object_id: row.object_id || row.ObjectId || null,
        row_hash: null,
        meta: null,
      });
      newCount++;
    });
  } else {
    return res.status(400).json({ error: 'Unknown import type' });
  }
  res.json({ total: rows.length, newCount, duplicateCount });
}));

// Simple health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

// Start the server
const PORT = process.env.API_PORT || 5174;
app.listen(PORT, () => {
  console.log(`API server listening on port ${PORT}`);
});
