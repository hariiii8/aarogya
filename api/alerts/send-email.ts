import nodemailer from 'nodemailer';
import { readJsonBody, sendJson } from '../_shared';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });
  try {
    const { toEmail, subject, message } = readJsonBody(req);
    if (!toEmail || !message) return sendJson(res, 400, { error: 'toEmail and message required' });
    const user = process.env.EMAIL_USER; const pass = process.env.EMAIL_PASS;
    if (!user || !pass) return sendJson(res, 200, { success: true, mode: 'dev-simulated' });
    const t = nodemailer.createTransport({ service: 'gmail', auth: { user, pass } });
    const info: any = await t.sendMail({ from: `AAROGYA Alerts <${process.env.ALERT_FROM || user}>`, to: String(toEmail), subject: subject || 'AAROGYA Herd Alert', text: String(message) });
    return sendJson(res, 200, { success: true, mode: 'smtp', messageId: info?.messageId || null });
  } catch (err: any) {
    return sendJson(res, 500, { success: false, error: err?.message || 'Failed to send email' });
  }
}
