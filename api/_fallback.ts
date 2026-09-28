export function generateFallbackVeterinaryResponse(message: string, cowContext?: any, herdList?: Array<any>): string {
  const query = (message || '').toLowerCase();
  // If the user names a different cow, answer about THAT cow — not the focused one
  let cow = cowContext;
  if (Array.isArray(herdList) && herdList.length > 0) {
    const q = query;
    const byId = herdList.findIndex((c: any) => {
      const id = String(c?.id || '').toLowerCase();
      if (!id) return false;
      return q.includes(id) || q.includes(id.replace(/[^a-z0-9]/g, ''));
    });
    if (byId >= 0) {
      cow = { ...cowContext, ...herdList[byId] };
    } else {
      const sorted = [...herdList]
        .filter((c: any) => c?.name && String(c.name).trim().length >= 3)
        .sort((a: any, b: any) => String(b.name).length - String(a.name).length);
      for (const c of sorted) {
        if (q.includes(String(c.name).toLowerCase().trim())) { cow = { ...cowContext, ...c }; break; }
      }
    }
  }
  const cowName = cow?.name || 'Lakshmi';
  const cowId = cow?.id || 'C-024';
  const vetName = cow?.vetName || cowContext?.vetName || 'Dr. Rajesh Sharma';
  const vetPhone = cow?.vetPhone || cowContext?.vetPhone || '+91 98960 11982';
  const milkTemp = cow?.temperature || 40.1;
  const scc = cow?.scc || 450;
  const quarter = cow?.affectedQuarter || 'Left-rear quarter';
  const stall = cow?.stall || 4;
  const riskPct = cow?.riskPercentage || 82;
  const riskLvl = cow?.riskLevel || 'High';
  if (query.includes('temp')) return `Milk Temp guide: normal 38.0-38.8C baseline 38.5C. ${cowName} at ${milkTemp}C (>39.5C = mastitis). Inspect ${quarter}, strip onto CMT paddle, cool compress, isolate milk.`;
  if (query.includes('scc') || query.includes('somatic') || query.includes('cell')) return `SCC guide: <200k healthy, 200-400k subclinical 10-15% yield loss, >400k clinical. ${cowName}: ${scc}k. Isolate, disinfect clusters, call ${vetName}.`;
  if (query.includes(cowName.toLowerCase()) || query.includes('why') || query.includes('risk') || query.includes('how is') || query.includes('how')) return `Summary ${cowName} (${cowId}) Stall ${stall}: ${riskPct}% ${riskLvl} risk, milk temp ${milkTemp}C, SCC ${scc}k, quarter: ${quarter}. Vet ${vetName} ${vetPhone}.`;
  if (query.includes('dip') || query.includes('clean') || query.includes('hygiene')) return `Teat dip: 0.5-1% iodine + 10% glycerin right after milking, 75% teat coverage. Sphincter open 30-45 min.`;
  if (query.includes('vet') || query.includes('doctor') || query.includes('call')) return `Vet: ${vetName} ${vetPhone}. Van TN-07-BV-4091 Salem ~35 min. Keep cow calm, no antibiotics without prescription, separate milk.`;
  if (query.includes('conductivity') || query.includes('ms/cm')) return `Conductivity normal 4.5-5.5 mS/cm, >6.5 mastitis warning (Na+/Cl- leak).`;
  return `Namaste! AAROGYA monitoring ${cowName} (${cowId}) Stall ${stall}. Watch milk temp >39.5C, SCC >200k, teat dip all cows. Vet ${vetName} (${vetPhone}). How can I help?`;
}
