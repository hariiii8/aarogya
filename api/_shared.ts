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
