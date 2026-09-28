import nodemailer from 'nodemailer';
import { CARRIER_GATEWAYS, normalizePhone, readJsonBody, sendJson } from '../_shared';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });
  try {
    const b = readJsonBody(req);
    const digits = normalizePhone(b.to || b.phone);
    const gw = (b.gateway && String(b.gateway).trim()) || CARRIER_GATEWAYS[String(b.carrier || '').toLowerCase().trim()] || '';
    const text = b.message || `[URGENT SMS] Cow ${b.cowId || 'C-024'} ${b.cowName || 'Lakshmi'} - ${b.disease || 'Subclinical Mastitis'}. Vet: ${b.vetName || 'Dr. Rajesh Sharma'}. Keep milk separate. - AAROGYA`;
    if (!digits && !b.toEmail) return sendJson(res, 400, { error: 'Provide to/phone or toEmail' });
    if (digits && digits.length < 10) return sendJson(res, 400, { error: 'Invalid phone number' });
    const user = process.env.EMAIL_USER; const pass = process.env.EMAIL_PASS;
    const fromAddr = process.env.ALERT_FROM || user || 'aarogya@localhost';
    if (!user || !pass) return sendJson(res, 200, { success: true, mode: 'dev-simulated', to: digits || b.toEmail, gateway: gw || null });
    let recipient: string; let via: string;
    if (digits && gw) { const gp = digits.length === 10 ? `91${digits}` : digits; recipient = `${gp}@${gw}`; via = `sms-gateway:${gw}`; }
    else if (b.toEmail) { recipient = String(b.toEmail); via = 'email-fallback'; }
    else { recipient = String(user); via = 'email-fallback(no-gateway)'; }
    const t = nodemailer.createTransport({ service: 'gmail', auth: { user, pass } });
    const info: any = await t.sendMail({ from: `AAROGYA Alerts <${fromAddr}>`, to: recipient, subject: b.subject || `AAROGYA Alert -> +91 ${digits}`.trim(), text: text.slice(0, 918) });
    return sendJson(res, 200, { success: true, mode: 'smtp', via, to: digits ? `+91 ${digits.slice(-10)}` : recipient, recipient, messageId: info?.messageId || null });
  } catch (err: any) {
    return sendJson(res, 500, { success: false, error: err?.message || 'Failed to send SMS' });
  }
}
