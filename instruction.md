PROJECT: Automated Payroll & Attendance (Electron + React + Vite + Tailwind + SQLite)

ROLE: You are a senior full-stack engineer. Deliver production-ready code with zero fluff.
Stack is FIXED:
- Frontend: React + Vite, Tailwind CSS, React Router.
- Desktop shell: Electron (contextIsolation ON), preload IPC only.
- DB: SQLite stored under app.getPath('userData').
- Auth: username/password (bcrypt), JWT in memory for renderer, role-based routing: ADMIN_HR and EMPLOYEE.
- Timezone: Asia/Manila. Use date-fns-tz for conversions.

QUALITY BARS:
- Write modular code, small files, clear names.
- No external ORMs. Use sqlite3 or better-sqlite3 with prepared statements.
- IPC: expose minimal, whitelisted methods in preload; NO remote module.
- Security: never expose file system or raw DB to renderer; parameterize SQL.
- UI: premium admin look with Tailwind. Colors: primary #1E3A8A, accent #06B6D4, neutral slate. Rounded-2xl, shadows-md+, 12/14px grid spacing.

FEATURE SCOPE (MVP):
1) Auth
   - Login screen → verify against SQLite users table (admin/admin123 exists).
   - Store JWT in memory; protect routes; redirect by role.
2) Employees (ADMIN_HR)
   - CRUD: employee_code, name, email, department, employment_type('Hourly'|'Daily'|'Monthly'), base_rate(NUMERIC), hire_date, status('Active'|'Inactive').
   - Table view w/ search + sort + pagination. Form w/ validation.
3) Attendance
   - Fields: employee_id(FK), work_date, time_in, time_out, break_minutes(default 0), status('Present'|'Absent'|'Leave'), notes.
   - On save: compute hours_worked, regular_hours(<=8), overtime_hours, daily_pay (Hourly: rate*hours; Daily: rate; Monthly: 0).
4) Payroll
   - Period picker: (1–15) and (16–EOM) + custom.
   - Per-employee totals: reg hrs, OT hrs, gross pay.
   - Export CSV.
5) UX polish
   - Left sidebar: Employees, Attendance, Payroll.
   - Topbar: app name + user menu (logout). Tables show 2-decimals for hours; currency format for pay.

DELIVERABLE STYLE:
- Provide COMPLETE files (paths + code). If touching many files, output a “changeset” with each file content.
- Include SQL migrations for any new tables.
- Include API routes & preload bindings when adding features.
- Testing: give a short manual test plan after each feature.

DON’TS:
- Don’t suggest different stacks.
- Don’t leave TODO holes; ship working code.
- Don’t use any network services.

When blocked, propose one working alternative and continue. 
```


### 1) `docs/PRD.md`

```md
# PRD — Automated Payroll & Attendance

## Roles
- ADMIN_HR: manages employees, attendance, payroll.
- EMPLOYEE: views profile, submits time, views their attendance.

## Core Flows
1) Login → role-based redirect.
2) Admin → Employees CRUD.
3) Admin/Employee → log attendance; auto-calc hours & pay on save.
4) Admin → Payroll summary per period; export CSV.

## Non-goals (MVP)
- Biometric device integration
- Cloud sync
- Taxes/benefits engine
```

### 2) `docs/DB_SCHEMA.sql`

```sql
-- Users (app login)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT CHECK(role IN ('ADMIN_HR','EMPLOYEE')) NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Employees (HR master)
CREATE TABLE IF NOT EXISTS employees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  department TEXT,
  employment_type TEXT CHECK(employment_type IN ('Hourly','Daily','Monthly')) NOT NULL,
  base_rate REAL NOT NULL DEFAULT 0,
  hire_date TEXT,
  status TEXT CHECK(status IN ('Active','Inactive')) NOT NULL DEFAULT 'Active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT
);

-- Attendance
CREATE TABLE IF NOT EXISTS attendance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  work_date TEXT NOT NULL,
  time_in TEXT,
  time_out TEXT,
  break_minutes INTEGER NOT NULL DEFAULT 0,
  status TEXT CHECK(status IN ('Present','Absent','Leave')) NOT NULL DEFAULT 'Present',
  notes TEXT,
  hours_worked REAL DEFAULT 0,
  regular_hours REAL DEFAULT 0,
  overtime_hours REAL DEFAULT 0,
  daily_pay REAL DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT
);

-- Payroll runs (summary by period)
CREATE TABLE IF NOT EXISTS payroll_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  period_start TEXT NOT NULL,
  period_end TEXT NOT NULL,
  status TEXT CHECK(status IN ('Open','Closed')) NOT NULL DEFAULT 'Open',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  closed_at TEXT
);
```

### 3) `docs/API_SPEC.md`

```md
# API Spec (renderer -> preload IPC -> main)

Auth
- ipc.invoke('auth:login', { username, password }) -> { token, role }
- ipc.invoke('auth:logout')

Employees (ADMIN_HR)
- ipc.invoke('emp:list', { q, page, pageSize })
- ipc.invoke('emp:get', { id })
- ipc.invoke('emp:create', payload)
- ipc.invoke('emp:update', { id, ...payload })
- ipc.invoke('emp:delete', { id })

Attendance
- ipc.invoke('att:list', { from, to, employeeId, page, pageSize })
- ipc.invoke('att:create', payload)  // server computes hours/pay
- ipc.invoke('att:update', { id, ...payload }) // recompute
- ipc.invoke('att:delete', { id })

Payroll
- ipc.invoke('payroll:summary', { start, end }) -> [{ employee, regHours, otHours, gross }]
- ipc.invoke('payroll:exportCsv', { start, end }) -> filePath
```

### 4) `docs/AUTH_FLOW.md`

```md
# Auth Flow
- Login form posts to ipc 'auth:login'.
- On success save token+role in memory (React context).
- Protect routes: 
  - /admin/* -> ADMIN_HR
  - /me/* -> EMPLOYEE
- Logout clears context; return to /login.
Password hashing: bcrypt in main process; never expose raw hashes to renderer.
```

### 5) `docs/UX_STYLE.md`

```md
# UX / Style
Colors: primary #1E3A8A, accent #06B6D4, surface slate-900.
Tailwind tokens: rounded-2xl, shadow-lg, spacing base=4.
Table formatting: hours (2 decimals), currency in PHP (₱).
Layouts:
- Sidebar (Employees, Attendance, Payroll)
- Topbar with app title + user menu
```

### 6) `prompts/CURSOR_BACKEND_PROMPT.md`

```md
You are generating the backend logic for the existing Electron app.

TASK:
1) Apply DB_SCHEMA.sql (create tables if missing) in electron/main.js bootstrap.
2) Implement IPC handlers (main process) matching API_SPEC.md.
3) Put all SQL in a new folder: electron/db/*.js
   - db.js (open DB, helpers)
   - employees.js (CRUD with prepared statements)
   - attendance.js (CRUD + computeHoursPay)
   - payroll.js (summary queries)
4) Preload: expose whitelist bridges for all channels in API_SPEC.md.

HOURS/PAY CALC:
- totalMin = max((time_out - time_in) - break_minutes*60, 0)
- hoursWorked = round2(totalMin/60)
- regularHours = min(hoursWorked, 8)
- overtimeHours = round2(max(hoursWorked - 8, 0))
- Daily pay:
   - Hourly: base_rate * hoursWorked
   - Daily: base_rate
   - Monthly: 0

SECURITY:
- parameterize SQL, validate inputs, never expose DB handle to renderer.

DELIVERABLE:
- Provide a changeset: paths + full file content.
- Finish with a short manual test plan (npm run dev; create employee; add attendance; verify calc).
```

### 7) `prompts/CURSOR_FRONTEND_PROMPT.md`

```md
Generate React pages and components with premium Tailwind UI.

ROUTES:
- /login
- /admin (redirect to /admin/employees)
- /admin/employees (table + create/edit drawer)
- /admin/attendance (table + create/edit drawer)
- /admin/payroll (period picker 1–15 / 16–EOM / custom; summary table; Export CSV)

REQUIREMENTS:
- Data grids with search, sort, pagination (client-side first).
- Forms with react-hook-form + zod validation.
- Use IPC bridges defined in API_SPEC.md via a minimal client in src/lib/ipc.ts.
- Show toast notifications.
- Format currency and hours (2 decimals). Use date-fns.

DELIVERABLE:
- Full file contents (paths).
- Include a lightweight design system: Button, Card, Input, Select, Table.
- End with a checklist QA (what to click to see data flow).
```

### 8) `.env.example`

```env
# Electron/Vite
VITE_APP_NAME="Automated Payroll & Attendance"
TZ="Asia/Manila"
```

### 9) `docs/NEXT_TASKS.md`

```md
# Next Tasks (in order)
1) Backend: implement IPC + DB layer per CURSOR_BACKEND_PROMPT.md
2) Frontend: build /login + auth context and route guard
3) Frontend: /admin/employees CRUD
4) Frontend: /admin/attendance CRUD (auto-calc happens server-side on create/update)
5) Frontend: /admin/payroll summary + CSV
6) Polish: table formats, sidebar/topbar, dark theme, packaging
```