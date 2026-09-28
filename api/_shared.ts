export const SYSTEM_INSTRUCTION = `You are AAROGYA Bovine AI, veterinary assistant for dairy farmers. Milk temp normal 38.0-38.8C baseline 38.5C, >39.5C = mastitis. SCC <200k healthy, 200-400k subclinical, >400k clinical. Conductivity 4.5-5.5 normal, >6.5 warning. Friendly bullets. Reply in Hindi/Punjabi/Tamil if asked.`;

export const CARRIER_GATEWAYS: Record<string, string> = {
  'jio': 'jsmstxt.in',
  'airtel': 'airtelmail.com',
  'vi': 'viphone.in',
  'bsnl': 'bsnl.in',
  'att': 'txt.att.net',
  'tmobile': 'tmomail.net',
  'verizon': 'vtext.com',
  'sprint': 'messaging.sprintpcs.com',
};

export function findCowInMessage(message: string, herd: Array<{ id?: string; name?: string }>): number {
  const q = (message || '').toLowerCase();
  if (!q.trim() || !Array.isArray(herd)) return -1;
  // Match by ID first (C-018, C024...), then by name
  const idHit = herd.findIndex((c) => {
    const id = String(c?.id || '').toLowerCase();
    if (!id) return false;
    const compact = id.replace(/[^a-z0-9]/g, '');
    return q.includes(id) || (compact.length >= 4 && q.includes(compact));
  });
  if (idHit >= 0) return idHit;
  // Name match: longest names first so "Meera" doesn't shadow etc.
  const sorted = herd
    .map((c, i) => ({ c, i }))
    .filter((e) => e.c?.name && e.c.name.trim().length >= 3)
    .sort((a, b) => b.c.name!.length - a.c.name!.length);
  for (const e of sorted) {
    const n = e.c.name!.toLowerCase().trim();
    if (q.includes(n)) return e.i;
  }
  return -1;
}

export function normalizePhone(raw: any): string {
  return String(raw || '').replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');
}


export function readJsonBody(req: any): any {
  if (req.body && typeof req.body === 'object') return req.body;
  try { return JSON.parse(req.body || '{}'); } catch { return {}; }
}

export function sendJson(res: any, status: number, data: any): void {
  res.status(status).setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(data));
}
