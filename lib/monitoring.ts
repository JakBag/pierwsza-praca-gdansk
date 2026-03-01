type SecurityEvent = {
  status: 401 | 429 | 500;
  route: string;
  ip: string;
  tag: string;
  detail?: string;
};

const WINDOW_MS = 10 * 60 * 1000;
const ALERT_COOLDOWN_MS = 5 * 60 * 1000;

const eventStore = new Map<string, number[]>();
const lastAlertAt = new Map<string, number>();

function record(key: string, now: number) {
  const recent = (eventStore.get(key) ?? []).filter(ts => now - ts < WINDOW_MS);
  recent.push(now);
  eventStore.set(key, recent);
  return recent.length;
}

function shouldAlert(key: string, now: number, threshold: number) {
  const count = record(key, now);
  if (count < threshold) return { fire: false, count };

  const last = lastAlertAt.get(key) ?? 0;
  if (now - last < ALERT_COOLDOWN_MS) return { fire: false, count };

  lastAlertAt.set(key, now);
  return { fire: true, count };
}

export function logSecurityEvent(evt: SecurityEvent) {
  const now = Date.now();
  console.warn(
    `[SECURITY] status=${evt.status} tag=${evt.tag} route=${evt.route} ip=${evt.ip} detail=${evt.detail ?? "-"}`
  );

  const key = `status:${evt.status}:${evt.tag}`;
  const threshold = evt.tag === "admin_auth_fail" ? 8 : evt.status === 500 ? 20 : 25;
  const alert = shouldAlert(key, now, threshold);

  if (alert.fire) {
    console.error(
      `[ALERT] spike_detected status=${evt.status} tag=${evt.tag} count_10m=${alert.count} route=${evt.route}`
    );
  }
}
