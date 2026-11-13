// Cron diaria: recordatorio a las 24 h y a los 3 días si no hay reserva. Máximo 2 por solicitud.
// Como la cron es diaria, «24 h» significa «en la primera ejecución a partir de 24 h».
import { getConfig, mailConfigProblems } from './config.js';
import { makeUnsubToken } from './crypto.js';
import { dueForReminder, purgeRateLimits, setStatus } from './db.js';
import { deliver } from './mail.js';
import { reminder } from './templates.js';
import { unsubscribeUrl } from './lead.js';

export async function runReminders(env, now = new Date(), log = console) {
  const cfg = getConfig(env);
  const summary = { stage1: 0, stage2: 0, skipped: 0 };
  if (!env.DB || !env.APP_SECRET) { log.error(JSON.stringify({ event: 'cron.config_missing' })); return summary; }

  const problems = mailConfigProblems(env, cfg);
  if (problems.length) {
    log.error(JSON.stringify({ event: 'cron.mail_config_missing', missing: problems })); // no se envía nada a medias
    return summary;
  }
  const base = cfg.publicBaseUrl || 'http://localhost:8787';

  for (const stage of [1, 2]) {
    const leads = await dueForReminder(env.DB, stage, now);
    for (const lead of leads) {
      const unsubUrl = unsubscribeUrl(base, await makeUnsubToken(env.APP_SECRET, lead.id));
      const res = await deliver(env, cfg, reminder({ n: stage, lead, cfg, unsubUrl }), log);
      // `logged` (demo) cuenta como enviado para poder ver el flujo completo; `failed`/`skipped` se reintentan mañana.
      if (res.status === 'sent' || res.status === 'logged') {
        await setStatus(env.DB, lead.id, stage === 1 ? 'reminded1' : 'reminded2', now.toISOString(), { at: now.toISOString() });
        summary[`stage${stage}`] += 1;
      } else summary.skipped += 1;
    }
  }
  await purgeRateLimits(env.DB, Math.floor((now.getTime() - 48 * 3600_000) / (cfg.rateWindowMin * 60_000)));
  log.log(JSON.stringify({ event: 'cron.done', ...summary }));
  return summary;
}
