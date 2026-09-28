import { GoogleGenAI } from '@google/genai';
import { generateFallbackVeterinaryResponse } from '../_fallback';
import { findCowInMessage, readJsonBody, sendJson, SYSTEM_INSTRUCTION } from '../_shared';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });
  const body = readJsonBody(req);
  try {
    const { message, history, cowContext, herdList } = body;
    if (!message || typeof message !== 'string') return sendJson(res, 400, { error: 'Message is required' });
    // Resolve the cow the user is actually asking about:
    // 1. name/ID mentioned in message + herdList, else 2. focused cowContext
    let resolvedCow: any = cowContext || null;
    if (Array.isArray(herdList) && herdList.length > 0) {
      const idx = findCowInMessage(message, herdList);
      if (idx >= 0) resolvedCow = { ...(cowContext || {}), ...herdList[idx] };
    }
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return sendJson(res, 200, { reply: generateFallbackVeterinaryResponse(message, resolvedCow, herdList), source: 'offline-knowledge-base' });
    const ai = new GoogleGenAI({ apiKey, httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } });
    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];
    if (Array.isArray(herdList) && herdList.length > 0) {
      const roster = herdList.slice(0, 24).map((c: any) => `${c.name || '?'} (${c.id || '?'}) SCC ${c.scc ?? '?'}k temp ${c.temperature ?? '?'}C ${c.riskLevel || ''} stall ${c.stall ?? '?'}`).join(' | ');
      contents.push({ role: 'user', parts: [{ text: `[HERD ROSTER: ${roster}]. The user may ask about ANY cow by name or ID — always answer about the cow they named, using its roster telemetry. The focused cow is only a default when no cow is named.]` }] });
      contents.push({ role: 'model', parts: [{ text: 'Understood. I will answer about whichever cow the user names, using roster telemetry.' }] });
    }
    const rc = resolvedCow || {};
    contents.push({ role: 'user', parts: [{ text: `[FOCUSED COW TELEMETRY: ${rc.name || 'Lakshmi'} (${rc.id || 'C-024'}), Stall ${rc.stall || 4}, SCC ${rc.scc || 450}k, Milk Temp ${rc.temperature || 40.1}C, Risk ${rc.riskLevel || 'High'} (${rc.riskPercentage || 82}%), Quarter ${rc.affectedQuarter || 'Left-rear'}, Yield ${rc.milkYield ?? '?'}L, Rumination ${rc.ruminationMinutes ?? '?'}min, Vet ${rc.vetName || 'Dr. Rajesh Sharma'} (${rc.vetPhone || '+91 98960 11982'})]` }] });
    contents.push({ role: 'model', parts: [{ text: `Understood. Focused telemetry for ${rc.name || 'cow'} loaded.` }] });
    if (Array.isArray(history)) {
      for (const item of history.slice(-6)) {
        if (item && item.text) contents.push({ role: item.sender === 'user' ? 'user' : 'model', parts: [{ text: item.text }] });
      }
    }
    contents.push({ role: 'user', parts: [{ text: message }] });
    const response = await ai.models.generateContent({ model: 'gemini-3.8-flash', contents, config: { systemInstruction: SYSTEM_INSTRUCTION, temperature: 0.7 } });
    return sendJson(res, 200, { reply: response.text || generateFallbackVeterinaryResponse(message, resolvedCow, herdList), source: 'gemini-3.8-flash', resolvedCow: resolvedCow ? { id: resolvedCow.id, name: resolvedCow.name } : null });
  } catch (err: any) {
    return sendJson(res, 200, { reply: generateFallbackVeterinaryResponse(body?.message || '', body?.cowContext, body?.herdList), source: 'offline-knowledge-base', error: err?.message });
  }
}
