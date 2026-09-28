export function generateFallbackVeterinaryResponse(message: string, cowContext?: any): string {
  const query = (message || '').toLowerCase();
  const cowName = cowContext?.name || 'Lakshmi';
  const cowId = cowContext?.id || 'C-024';
  const vetName = cowContext?.vetName || 'Dr. Rajesh Sharma';
  const vetPhone = cowContext?.vetPhone || '+91 98960 11982';
  const milkTemp = cowContext?.temperature || 40.1;
  const scc = cowContext?.scc || 450;
  const quarter = cowContext?.affectedQuarter || 'Left-rear quarter';
  if (query.includes('temp')) return `Milk Temp guide: normal 38.0-38.8C baseline 38.5C. ${cowName} at ${milkTemp}C (>39.5C = mastitis). Inspect ${quarter}, strip onto CMT paddle, cool compress, isolate milk.`;
  if (query.includes('scc') || query.includes('somatic') || query.includes('cell')) return `SCC guide: <200k healthy, 200-400k subclinical 10-15% yield loss, >400k clinical. ${cowName}: ${scc}k. Isolate, disinfect clusters, call ${vetName}.`;
  if (query.includes(cowName.toLowerCase()) || query.includes('why') || query.includes('risk')) return `Summary ${cowName} (${cowId}) Stall ${cowContext?.stall || 4}: 82% high risk, milk temp ${milkTemp}C, SCC ${scc}k, ${quarter} hot, rumination down 130m. Vet ${vetName} ${vetPhone}.`;
  if (query.includes('dip') || query.includes('clean') || query.includes('hygiene')) return `Teat dip: 0.5-1% iodine + 10% glycerin right after milking, 75% teat coverage. Sphincter open 30-45 min.`;
  if (query.includes('vet') || query.includes('doctor') || query.includes('call')) return `Vet: ${vetName} ${vetPhone}. Van TN-07-BV-4091 Salem ~35 min. Keep cow calm, no antibiotics without prescription, separate milk.`;
  if (query.includes('conductivity') || query.includes('ms/cm')) return `Conductivity normal 4.5-5.5 mS/cm, >6.5 mastitis warning (Na+/Cl- leak).`;
  return `Namaste! AAROGYA monitoring ${cowName} (${cowId}) Stall ${cowContext?.stall || 4}. Watch milk temp >39.5C, SCC >200k, teat dip all cows. Vet ${vetName} (${vetPhone}). How can I help?`;
}
