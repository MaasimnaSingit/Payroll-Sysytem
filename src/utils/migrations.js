// Migration runner - no-op for API-based system
const FLAG = 'migrated_api_v1';

export async function runMigrations() {
  try {
    if (localStorage.getItem(FLAG) === 'true') return;
    // No migrations needed for API-based system
    localStorage.setItem(FLAG, 'true');
    console.log('✅ Migrations completed (API-based system)');
  } catch (e) {
    console.error('[migrations] failed:', e);
  }
}

export async function recomputeAllAttendance() {
  // No-op for API-based system
  console.log('✅ Attendance recomputation skipped (API-based system)');
}



