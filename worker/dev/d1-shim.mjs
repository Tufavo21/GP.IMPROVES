// Simula la API de D1 (prepare/bind/run/first/all/exec) sobre `node:sqlite` (Node ≥ 22.5).
// Solo para desarrollo y tests locales sin `wrangler`. En producción lo reemplaza D1 real.
import { DatabaseSync } from 'node:sqlite';

export function createD1(path = ':memory:') {
  const db = new DatabaseSync(path);
  const stmt = (sql, params = []) => ({
    bind: (...p) => stmt(sql, p),
    async run() { const r = db.prepare(sql).run(...params); return { success: true, meta: { changes: Number(r.changes) } }; },
    async first() { return db.prepare(sql).get(...params) ?? null; },
    async all() { return { success: true, results: db.prepare(sql).all(...params) }; },
  });
  return {
    prepare: (sql) => stmt(sql),
    async exec(sql) { db.exec(sql); return { count: 1 }; },
    raw: db, // acceso directo para los tests
  };
}
