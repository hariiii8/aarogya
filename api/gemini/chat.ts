import { GoogleGenAI } from '@google/genai';
import { generateFallbackVeterinaryResponse } from '../_fallback';
import { SYSTEM_INSTRUCTION, readJsonBody, sendJson } from '../_shared';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });
  try {
    const { message, history, cowContext } = readJsonBody(req);
    if (!message || typeof message !== 'string') return sendJson(res, 400, { error: 'Message is required' });
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return sendJson(res, 200, { reply: generateFallbackVeterinaryResponse(message, cowContext), source: 'offline-knowledge-base' });
    const ai = new GoogleGenAI({ apiKey, httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } });
    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];
    if (cowContext) {
      contents.push({ role: 'user', parts: [{ text: `[TELEMETRY: Cow ${cowContext.name || 'Lakshmi'} (${cowContext.id || 'C-024'}), Stall ${cowContext.stall || 4}, SCC ${cowContext.scc || 450}k, Milk Temp ${cowContext.temperature || 40.1}C, Risk ${cowContext.riskLevel || 'High'} (${cowContext.riskPercentage || 82}%), Quarter ${cowContext.affectedQuarter || 'Left-rear'}, Vet ${cowContext.vetName || 'Dr. Rajesh Sharma'} (${cowContext.vetPhone || '+91 98960 11982'})]` }] });
      contents.push({ role: 'model', parts: [{ text: `Understood. Telemetry for ${cowContext.name || 'cow'} loaded.` }] });
    }
    if (Array.isArray(history)) {
      for (const item of history.slice(-6)) {
        if (item && item.text) contents.push({ role: item.sender === 'user' ? 'user' : 'model', parts: [{ text: item.text }] });
      }
    }
    contents.push({ role: 'user', parts: [{ text: message }] });
    const response = await ai.models.generateContent({ model: 'gemini-3.8-flash', contents, config: { systemInstruction: SYSTEM_INSTRUCTION, temperature: 0.7 } });
    return sendJson(res, 200, { reply: response.text || generateFallbackVeterinaryResponse(message, cowContext), source: 'gemini-3.8-flash' });
  } catch (err: any) {
    return sendJson(res, 200, { reply: generateFallbackVeterinaryResponse(readJsonBody(req)?.message || '', readJsonBody(req)?.cowContext), source: 'offline-knowledge-base', error: err?.message });
  }
}
