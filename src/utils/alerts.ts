export interface SmsAlertPayload {
  to?: string;
  phone?: string;
  carrier?: string;
  gateway?: string;
  message?: string;
  subject?: string;
  cowId?: string;
  cowName?: string;
  disease?: string;
  vetName?: string;
  vetPhone?: string;
  farmerName?: string;
  toEmail?: string;
  stall?: number | string;
  scc?: number;
}

export interface SmsAlertResult {
  success: boolean;
  mode?: string;
  via?: string;
  to?: string;
  recipient?: string;
  messageId?: string | null;
  error?: string;
}

const DEFAULT_FARMER_PHONE = '9443287610';
const DEFAULT_CARRIER = 'jio';
const DEFAULT_VET = 'Dr. Rajesh Sharma';

export function buildMastitisMessage(opts: {
  cowId?: string;
  cowName?: string;
  disease?: string;
  vetName?: string;
  vetPhone?: string;
  farmerName?: string;
  stall?: number | string;
  scc?: number;
}): string {
  const cowId = opts.cowId || 'C-024';
  const cowName = opts.cowName || 'Lakshmi';
  const disease = opts.disease || 'Subclinical Mastitis';
  const vet = opts.vetName || DEFAULT_VET;
  const sccBit = opts.scc ? ` SCC ${opts.scc}k cells/mL.` : '';
  const stallBit = opts.stall !== undefined ? ` Stall ${opts.stall}.` : '';
  return `[URGENT SMS] Cow ${cowId} ${cowName} is under treatment for ${disease} (${sccBit.trim()}${stallBit}) Vet: ${vet}${opts.vetPhone ? ` (${opts.vetPhone})` : ''}. Keep her milk separate. - AAROGYA (${opts.farmerName || 'Velan Dairy'})`;
}

/** POST /api/alerts/send-sms with safe defaults for AAROGYA herd. */
export async function sendSmsAlert(payload: SmsAlertPayload): Promise<SmsAlertResult> {
  const body = {
    to: payload.to || payload.phone || DEFAULT_FARMER_PHONE,
    carrier: payload.carrier || DEFAULT_CARRIER,
    gateway: payload.gateway,
    message: payload.message,
    subject: payload.subject,
    cowId: payload.cowId || 'C-024',
    cowName: payload.cowName || 'Lakshmi',
    disease: payload.disease || 'Subclinical Mastitis',
    vetName: payload.vetName || DEFAULT_VET,
    farmerName: payload.farmerName,
    toEmail: payload.toEmail,
  };
  const res = await fetch('/api/alerts/send-sms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `SMS request failed (${res.status})`);
  return data as SmsAlertResult;
}

/**
 * Auto-fire alerts for any cow with SCC > 400 (i.e. 400k cells/mL).
 * De-dupes per session via sessionStorage key `alerted_<id>_<scc>`.
 * Returns list of cows alerted in this call.
 */
export async function checkAndAlertHighScc(
  cows: Array<{ id: string; name: string; scc: number; stall?: number; shed?: string }>,
  opts?: { vetName?: string; vetPhone?: string; farmerName?: string; farmerPhone?: string; carrier?: string },
): Promise<string[]> {
  const alerted: string[] = [];
  const critical = (cows || []).filter((c) => Number(c.scc) > 400);
  for (const cow of critical) {
    const key = `alerted_${cow.id}_${cow.scc}`;
    try {
      if (sessionStorage.getItem(key)) continue;
    } catch { /* storage unavailable — proceed */ }
    try {
      await sendSmsAlert({
        to: opts?.farmerPhone || DEFAULT_FARMER_PHONE,
        carrier: opts?.carrier || DEFAULT_CARRIER,
        cowId: cow.id,
        cowName: cow.name,
        disease: `Clinical Mastitis Risk (SCC: ${cow.scc}k cells/mL)`,
        vetName: opts?.vetName || DEFAULT_VET,
        farmerName: opts?.farmerName,
        message: buildMastitisMessage({
          cowId: cow.id,
          cowName: cow.name,
          disease: `Clinical Mastitis Risk (SCC: ${cow.scc}k cells/mL)`,
          vetName: opts?.vetName,
          vetPhone: opts?.vetPhone,
          farmerName: opts?.farmerName,
          stall: cow.stall,
          scc: cow.scc,
        }),
      });
      try { sessionStorage.setItem(key, 'true'); } catch { /* ignore */ }
      alerted.push(cow.id);
      console.log(`Automated SMS alert dispatched for ${cow.name} (${cow.id})`);
    } catch (e) {
      console.warn(`Auto-alert failed for ${cow.id}:`, e);
    }
  }
  return alerted;
}
