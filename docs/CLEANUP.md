# Frontend Source Cleanup (safe)

This tool deletes files under a chosen `src` folder that are **not referenced** from `main.tsx`.

## 1) Commit a checkpoint
```bash
git add -A && git commit -m "checkpoint before cleanup"
```

## 2) Dry-run (review)

* If your app is in repo root at `src/`:

```bash
npm run clean:src:dry
```

* If your app is inside `web/` at `web/src`:

```bash
npm run clean:web:dry
```

## 3) Apply

```bash
npm run clean:src       # for root src
# or
npm run clean:web       # for web/src
```

A log of removed files is written to `cleanup-removed.txt`.

## 4) Smoke test

Start backend+frontend and verify login, employees, attendance, and payroll pages still work.

```

