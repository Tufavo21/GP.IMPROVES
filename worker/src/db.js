// Acceso a D1. Solo consultas con parámetros enlazados (nada de concatenar SQL).

export async function insertLead(db, lead) {
  await db
    .prepare(
      `INSERT INTO leads (id, created_at, lang, name, email, phone, reform_type, finishes, area_m2, message,
                          consent_at, status, status_at, is_demo)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, 'new', ?12, ?13)`,
    )
    .bind(lead.id, lead.created_at, lead.lang, lead.name, lead.email, lead.phone, lead.reform_type, lead.finishes,
      lead.area_m2, lead.message, lead.consent_at, lead.created_at, lead.is_demo ? 1 : 0)
    .run();
}

export const getLead = (db, id) => db.prepare('SELECT * FROM leads WHERE id = ?1').bind(id).first();

export async function setStatus(db, id, status, nowIso, extra = {}) {
  const col = status === 'reminded1' ? ', reminded1_at = ?4' : status === 'reminded2' ? ', reminded2_at = ?4' : '';
  const stmt = db.prepare(`UPDATE leads SET status = ?2, status_at = ?3${col} WHERE id = ?1`);
  await (col ? stmt.bind(id, status, nowIso, extra.at || nowIso) : stmt.bind(id, status, nowIso)).run();
}

// Reserva: pasa a `booked` todo lead activo de ese email (no toca los dados de baja).
export async function markBookedByEmail(db, email, nowIso) {
  const r = await db
    .prepare(`UPDATE leads SET status = 'booked', status_at = ?2
              WHERE email = ?1 AND status IN ('new', 'reminded1', 'reminded2')`)
    .bind(email.toLowerCase(), nowIso)
    .run();
  return r?.meta?.changes ?? 0;
}

// Recordatorio 1: a partir de 24 h y, como mucho, hasta 3 días (si falla el envío no se manda tarde).
// Recordatorio 2: a partir de 3 días, hasta 7, y al menos 20 h después del primero.
export async function dueForReminder(db, stage, now, limit = 50) {
  const h = 3600 * 1000;
  const iso = (ms) => new Date(now.getTime() - ms).toISOString();
  if (stage === 1) {
    const r = await db
      .prepare(`SELECT * FROM leads WHERE status = 'new' AND created_at <= ?1 AND created_at > ?2
                ORDER BY created_at LIMIT ?3`)
      .bind(iso(24 * h), iso(72 * h), limit)
      .all();
    return r.results || [];
  }
  const r = await db
    .prepare(`SELECT * FROM leads WHERE status = 'reminded1' AND created_at <= ?1 AND created_at > ?2
              AND reminded1_at <= ?3 ORDER BY created_at LIMIT ?4`)
    .bind(iso(72 * h), iso(7 * 24 * h), iso(20 * h), limit)
    .all();
  return r.results || [];
}

// Límite por IP con ventana fija. Devuelve el contador tras sumar esta petición.
export async function hitRateLimit(db, key, bucket) {
  const row = await db
    .prepare(`INSERT INTO rate_limits (key, bucket, count) VALUES (?1, ?2, 1)
              ON CONFLICT (key, bucket) DO UPDATE SET count = count + 1 RETURNING count`)
    .bind(key, bucket)
    .first();
  return row?.count ?? 1;
}
export const purgeRateLimits = (db, minBucket) =>
  db.prepare('DELETE FROM rate_limits WHERE bucket < ?1').bind(minBucket).run();
