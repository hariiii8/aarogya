import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import nodemailer from 'nodemailer';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

/**
 * Intelligent bovine veterinary knowledge engine fallback
 * Ensures 100% reliable chatbot responses even if API key is absent or offline
 */
function generateFallbackVeterinaryResponse(
  message: string,
  cowContext?: any,
  language?: string
): string {
  const query = (message || '').toLowerCase();
  const cowName = cowContext?.name || 'Lakshmi';
  const cowId = cowContext?.id || 'C-024';
  const vetName = cowContext?.vetName || 'Dr. Rajesh Sharma';
  const vetPhone = cowContext?.vetPhone || '+91 98960 11982';
  const milkTemp = cowContext?.temperature || 40.1;
  const scc = cowContext?.scc || 450;
  const affectedQuarter = cowContext?.affectedQuarter || 'Left-rear quarter';

  // 1. Milk Temperature queries
  if (query.includes('temperature') || query.includes('milk temp') || query.includes('temp') || query.includes('तापमान') || query.includes('வெப்பநிலை')) {
    return `🌡️ **Milk Temperature & Mastitis Indicator Guide**:
• **Normal Milk Temp**: 38.0°C – 38.8°C (healthy baseline is ~38.5°C during milking).
• **Elevated Milk Temp**: >39.5°C (like ${cowName}'s current ${milkTemp}°C reading).
• **Why it Rises**: Mastitis causes localized vasodilation and neutrophil rush in the infected udder quarter tissue. This releases inflammatory heat directly into the secreted milk before leaving the teat!
• **Immediate Action**:
  1. Inspect the warm quarter (${affectedQuarter}) for swelling, firmness, or redness.
  2. Strip milk onto a clean plate or California Mastitis Test (CMT) paddle.
  3. Apply cool water compress after milking and isolate milk from bulk tank.`;
  }

  // 2. Somatic Cell Count (SCC) queries
  if (query.includes('scc') || query.includes('somatic') || query.includes('cell count') || query.includes('cells')) {
    return `🧪 **Somatic Cell Count (SCC) Breakdown**:
• **< 200,000 cells/mL (Healthy)**: Normal shedding of epithelial cells; safe for human consumption and premium dairy rate.
• **200,000 – 400,000 cells/mL (Subclinical Mastitis)**: Early inflammatory response. No visible milk clots yet, but 10-15% milk yield loss is occurring.
• **> 400,000 cells/mL (Clinical Danger)**: Active infection (Current ${cowName}: ${scc}k cells/mL).
• **Action**: Move ${cowName} to the designated isolation stall, disinfect milking clusters with peracetic acid, and call ${vetName}.`;
  }

  // 3. Why is Lakshmi / Cow high risk queries
  if (query.includes(cowName.toLowerCase()) || query.includes(cowId.toLowerCase()) || query.includes('why') || query.includes('risk')) {
    return `🐄 **Clinical Summary for ${cowName} (${cowId})**:
• **Risk Level**: 82% High Mastitis Risk in Stall ${cowContext?.stall || 4}.
• **Milk Temperature**: Elevated at ${milkTemp}°C (normal 38.5°C).
• **Somatic Cells**: ${scc},000 cells/mL (dangerously elevated).
• **Affected Teat**: ${affectedQuarter} is hot, sensitive, and yielding 18.2 L (down from 27 L).
• **Rumination**: Down by 130 minutes (cow is lethargic and resting less).
• **Doctor Alert**: Mobile veterinary van dispatched. Contact ${vetName} at ${vetPhone}.`;
  }

  // 4. Teat dip and sanitation queries
  if (query.includes('dip') || query.includes('clean') || query.includes('hygiene') || query.includes('iodine') || query.includes('disinfect')) {
    return `🧴 **Post-Milking Teat Disinfection Protocol**:
• **Why Dip?** The teat canal sphincter muscle remains dilated for 30–45 minutes after milking. Dipping coats the teat with a protective antibacterial seal.
• **Recommended Solutions**: 0.5%–1.0% available iodine solution with 10% glycerin emollient, or 0.5% chlorhexidine.
• **Coverage**: Dip at least 75% of each teat length immediately after releasing the milking cluster.
• **Bedding Care**: Ensure dry straw or sand bedding in Stall ${cowContext?.stall || 4}; spray lime powder to keep floors dry.`;
  }

  // 5. Emergency Doctor / Van dispatch
  if (query.includes('vet') || query.includes('doctor') || query.includes('call') || query.includes('emergency') || query.includes('van')) {
    return `🚑 **Veterinary Support Contact**:
• **Assigned Doctor**: ${vetName} (Chief Bovine Officer).
• **Direct Phone**: ${vetPhone}.
• **Mobile Van**: Van TN-07-BV-4091 is in Salem rural sector (~35 minutes away).
• **Pre-Arrival Instructions**:
  - Keep cow calm and provide clean fresh water.
  - Do not administer antibiotics without veterinary prescription.
  - Separate milk from affected quarter.`;
  }

  // 6. Milk Conductivity queries
  if (query.includes('conductivity') || query.includes('ms/cm') || query.includes('ion')) {
    return `⚡ **Milk Electrical Conductivity Insights**:
• **Normal**: 4.5 – 5.5 mS/cm.
• **Mastitis Warning**: > 6.5 mS/cm.
• **Mechanism**: When mastitis bacteria damage the mammary epithelial junction, sodium (Na+) and chloride (Cl-) ions leak from blood into the milk, increasing electrical conductivity before physical clots appear!`;
  }

  // 7. General Bovine Veterinary Response
  return `Namaste! I am AAROGYA Bovine AI, your cattle health and mastitis guardian.
I am monitoring your dairy herd including ${cowName} (${cowId}) in Stall ${cowContext?.stall || 4}.

**Key recommendations right now**:
• Keep close observation on milk temperature (watch for >39.5°C during milking).
• Check SCC telemetry daily for spikes above 200,000 cells/mL.
• Apply post-milking barrier teat dip on all active cows.
• Assigned Doctor: ${vetName} (${vetPhone}).

What specific cattle health or milking question can I assist you with?`;
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Setup Gemini client if key is available
  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  if (apiKey) {
    try {
      ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    } catch (e) {
      console.warn('GoogleGenAI initialization warning:', e);
    }
  }

  // System instruction for Bovine Health & Mastitis Guard
  const SYSTEM_INSTRUCTION = `You are AAROGYA Bovine AI, an empathetic, highly knowledgeable veterinary intelligence assistant for dairy farmers in India and worldwide.
CRITICAL DOMAIN RULES:
1. MILK TEMPERATURE VS BODY TEMPERATURE:
   - In dairy mastitis monitoring, automated inline sensors measure MILK TEMPERATURE during milking.
   - Normal healthy milk temperature is 38.0°C to 38.8°C (baseline ~38.5°C).
   - Elevated milk temperature (>39.5°C, up to 40.2°C) is a primary physiological biomarker of localized udder inflammation and mastitis.
   - Never call it body temperature when discussing milking sensors or mastitis quarters; always explicitly refer to it as "Milk Temperature".
2. SOMATIC CELL COUNT (SCC):
   - <200,000 cells/mL: Healthy uninfected udder.
   - 200,000–400,000 cells/mL: Subclinical mastitis warning zone.
   - >400,000 cells/mL: Active clinical mastitis requiring isolation.
3. ELECTRICAL CONDUCTIVITY:
   - Baseline 4.5–5.5 mS/cm. Elevated >6.5 mS/cm indicates ion leakage from blood-milk barrier damage.
4. TONE & FORMAT:
   - Friendly, practical, empathetic to dairy farmers.
   - Use concise bullet points, bold key numbers, and actionable steps.
   - If asked in Hindi, Punjabi, or Tamil, provide answers in that language or English with respectful tone.`;

  // POST /api/gemini/chat
  app.post('/api/gemini/chat', async (req, res) => {
    try {
      const { message, history, cowContext, language } = req.body;
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Message is required' });
      }

      if (!ai) {
        const fallbackReply = generateFallbackVeterinaryResponse(message, cowContext, language);
        return res.json({ reply: fallbackReply, source: 'offline-knowledge-base' });
      }

      // Format contents with history
      const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

      if (cowContext) {
        contents.push({
          role: 'user',
          parts: [{
            text: `[CURRENT FARM TELEMETRY: Cow ${cowContext.name || 'Lakshmi'} (${cowContext.id || 'C-024'}), Stall: ${cowContext.stall || 4}, SCC: ${cowContext.scc || 450}k cells/mL, Milk Temperature: ${cowContext.temperature || 40.1}°C, Mastitis Risk: ${cowContext.riskLevel || 'High'} (${cowContext.riskPercentage || 82}%), Affected Quarter: ${cowContext.affectedQuarter || 'Left-rear'}, Assigned Vet: ${cowContext.vetName || 'Dr. Rajesh Sharma'} (${cowContext.vetPhone || '+91 98960 11982'})]`
          }]
        });
        contents.push({
          role: 'model',
          parts: [{
            text: `Understood. I have active telemetry for ${cowContext.name || 'the cow'}. How can I assist you with herd health today?`
          }]
        });
      }

      if (Array.isArray(history)) {
        for (const item of history.slice(-6)) {
          if (item && item.text) {
            contents.push({
              role: item.sender === 'user' ? 'user' : 'model',
              parts: [{ text: item.text }],
            });
          }
        }
      }

      contents.push({
        role: 'user',
        parts: [{ text: message }],
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
        },
      });

      const replyText = response.text || generateFallbackVeterinaryResponse(message, cowContext, language);
      return res.json({ reply: replyText, source: 'gemini-3.8-flash' });
    } catch (err: any) {
      console.error('Gemini chat API error:', err?.message || err);
      const fallbackReply = generateFallbackVeterinaryResponse(req.body?.message || '', req.body?.cowContext, req.body?.language);
      return res.json({ reply: fallbackReply, source: 'offline-knowledge-base', error: err?.message });
    }
  });

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', app: 'AAROGYA Bovine Health', timestamp: new Date().toISOString() });
  });

  // FREE SMS via Gmail + carrier email-to-SMS gateways (nodemailer)
  const CARRIER_GATEWAYS: Record<string, string> = {
    'jio': 'jsmstxt.in',
    'airtel': 'airtelmail.com',
    'vi': 'viphone.in',
    'bsnl': 'bsnl.in',
    'att': 'txt.att.net',
    'tmobile': 'tmomail.net',
    'verizon': 'vtext.com',
    'sprint': 'messaging.sprintpcs.com',
  };

  function normalizePhone(raw: any): string {
    return String(raw || '').replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');
  }

  function getSmtpTransporter() {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;
    if (!user || !pass) return null;
    return nodemailer.createTransport({ service: 'gmail', auth: { user, pass } });
  }

  // POST /api/alerts/send-sms { to|phone, carrier?, gateway?, message?, cowId?, cowName?, disease?, vetName?, farmerName?, toEmail?, subject? }
  app.post('/api/alerts/send-sms', async (req, res) => {
    try {
      const b = req.body || {};
      const digits = normalizePhone(b.to || b.phone);
      const gw = (b.gateway && String(b.gateway).trim()) || CARRIER_GATEWAYS[String(b.carrier || '').toLowerCase().trim()] || '';
      const text = b.message || `[URGENT SMS] Cow ${b.cowId || 'C-024'} ${b.cowName || 'Lakshmi'} - ${b.disease || 'Subclinical Mastitis'}. Vet: ${b.vetName || 'Dr. Rajesh Sharma'}. Keep milk separate. - AAROGYA`;
      if (!digits && !b.toEmail) return res.status(400).json({ error: 'Provide to/phone or toEmail' });
      if (digits && digits.length < 10) return res.status(400).json({ error: 'Invalid phone number' });
      const t = getSmtpTransporter();
      const fromAddr = process.env.ALERT_FROM || process.env.EMAIL_USER || 'aarogya@localhost';
      if (!t) {
        console.log('[SMS/dev-mode] simulating send to', digits, ':', text);
        return res.json({ success: true, mode: 'dev-simulated', to: digits || b.toEmail, gateway: gw || null, hint: 'Set EMAIL_USER + EMAIL_PASS in .env then restart' });
      }
      let recipient: string; let via: string;
      if (digits && gw) {
        const gp = digits.length === 10 ? `91${digits}` : digits;
        recipient = `${gp}@${gw}`; via = `sms-gateway:${gw}`;
      } else if (b.toEmail) { recipient = String(b.toEmail); via = 'email-fallback'; }
      else { recipient = String(process.env.EMAIL_USER); via = 'email-fallback(no-gateway)'; }
      const info: any = await t.sendMail({ from: `AAROGYA Alerts <${fromAddr}>`, to: recipient, subject: b.subject || `AAROGYA Alert -> +91 ${digits}`.trim(), text: text.slice(0, 918) });
      return res.json({ success: true, mode: 'smtp', via, to: digits ? `+91 ${digits.slice(-10)}` : recipient, recipient, messageId: info?.messageId || null });
    } catch (err: any) {
      console.error('send-sms error:', err?.message || err);
      return res.status(500).json({ success: false, error: err?.message || 'Failed to send SMS' });
    }
  });

  app.post('/api/alerts/send-email', async (req, res) => {
    try {
      const { toEmail, subject, message } = req.body || {};
      if (!toEmail || !message) return res.status(400).json({ error: 'toEmail and message required' });
      const t = getSmtpTransporter();
      if (!t) return res.json({ success: true, mode: 'dev-simulated' });
      const info: any = await t.sendMail({ from: `AAROGYA Alerts <${process.env.ALERT_FROM || process.env.EMAIL_USER}>`, to: String(toEmail), subject: subject || 'AAROGYA Herd Alert', text: String(message) });
      return res.json({ success: true, mode: 'smtp', messageId: info?.messageId || null });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message || 'Failed to send email' });
    }
  });

  // Mount Vite in dev mode
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
