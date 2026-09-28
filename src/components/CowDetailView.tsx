import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Check,
  CheckCircle2,
  CheckSquare,
  ChevronRight,
  Clock,
  Compass,
  Droplets,
  FileText,
  Info,
  MapPin,
  Phone,
  Plus,
  Send,
  ShieldAlert,
  Sparkles,
  Square,
  Thermometer,
  TrendingDown,
  TrendingUp,
  X,
  Zap,
} from 'lucide-react';
import React, { useState } from 'react';
import { getCowHealthDetails } from '../data/cowHealthData';
import { TRANSLATIONS } from '../data/mockData';
import { Cow, FarmerActionItem, LanguageCode, RiskLevel, UdderQuarterStatus } from '../types';
import { RiskBadge } from './RiskBadge';
import { buildMastitisMessage, sendSmsAlert } from '../utils/alerts';

interface CowDetailViewProps {
  cow: Cow;
  currentLang?: LanguageCode;
  onBack: () => void;
  onCallVet: () => void;
  onLocateCowInBarn?: (stallNum: number) => void;
  onOpenAskAi?: (prompt?: string) => void;
  onShowSnackbar?: (msg: string) => void;
  isModal?: boolean;
}

type TabType = 'smart_card' | 'ai_risk' | 'treatments' | 'log';

interface CowLogEntry {
  id: string;
  type: string;
  note: string;
  timestamp: string;
  author: string;
}

export const CowDetailView: React.FC<CowDetailViewProps> = ({
  cow,
  currentLang = 'en',
  onBack,
  onCallVet,
  onLocateCowInBarn,
  onOpenAskAi,
  onShowSnackbar,
  isModal = false,
}) => {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  const health = getCowHealthDetails(cow);

  const [activeTab, setActiveTab] = useState<TabType>('smart_card');
  const [selectedQuarterCode, setSelectedQuarterCode] = useState<string>(
    health.quarters.find((q) => q.isAffected)?.code || 'LF'
  );
  const [treatmentActions, setTreatmentActions] = useState<FarmerActionItem[]>(health.treatments);
  const [logs, setLogs] = useState<CowLogEntry[]>([
    {
      id: 'log-1',
      type: 'Routine Telemetry',
      note: `Collar vitality at ${cow.activityPercentage}%, rumination recorded at ${cow.ruminationMinutes} min.`,
      timestamp: 'Today, 06:15 AM',
      author: 'AAROGYA AI Sentinel',
    },
    {
      id: 'log-2',
      type: 'Milking Observation',
      note: `Yield recorded ${cow.milkYield} L. SCC sensor flagged ${cow.scc},000 cells/mL.`,
      timestamp: 'Yesterday, 05:45 PM',
      author: 'Ramesh (Milker)',
    },
  ]);
  const [newLogNote, setNewLogNote] = useState('');
  const [newLogType, setNewLogType] = useState('Milking Observation');

  // One-tap header SMS alert state (wired to /api/alerts/send-sms)
  const [isSendingAlert, setIsSendingAlert] = useState(false);
  const [alertStatusMessage, setAlertStatusMessage] = useState<string | null>(null);

  // Toggle treatment checklist item
  const toggleAction = (id: string) => {
    setTreatmentActions((prev) =>
      prev.map((action) => {
        if (action.id === id) {
          const next = !action.completed;
          if (onShowSnackbar) {
            onShowSnackbar(next ? `Completed: ${action.title}` : `Marked incomplete: ${action.title}`);
          }
          return { ...action, completed: next };
        }
        return action;
      })
    );
  };

  // Add new observation log
  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogNote.trim()) return;

    const entry: CowLogEntry = {
      id: `log-${Date.now()}`,
      type: newLogType,
      note: newLogNote.trim(),
      timestamp: 'Just now',
      author: 'Farmer (Manual Log)',
    };

    setLogs([entry, ...logs]);
    setNewLogNote('');
    if (onShowSnackbar) {
      onShowSnackbar(`Logged observation for ${cow.name}`);
    }
  };

  // One-tap emergency SMS dispatcher for THIS cow (header button)
  const handleCowHeaderAlert = async () => {
    if (isSendingAlert) return;
    setIsSendingAlert(true);
    setAlertStatusMessage('Sending SMS...');
    try {
      const condition =
        cow.scc > 400
          ? `Clinical Mastitis Risk (SCC: ${cow.scc}k cells/mL)`
          : cow.riskLevel === 'Moderate'
            ? 'Subclinical Mastitis'
            : cow.riskLevel === 'High'
              ? `High Mastitis Risk (${cow.riskPercentage}%)`
              : 'Health Check Required';
      const res = await sendSmsAlert({
        to: '9443287610',
        carrier: 'jio',
        cowId: cow.id,
        cowName: cow.name,
        stall: cow.stall,
        scc: cow.scc,
        disease: condition,
        vetName: 'Dr. Rajesh Sharma',
        vetPhone: '+91 98960 11982',
        message: buildMastitisMessage({
          cowId: cow.id,
          cowName: cow.name,
          disease: condition,
          vetName: 'Dr. Rajesh Sharma',
          vetPhone: '+91 98960 11982',
          stall: cow.stall,
          scc: cow.scc,
        }),
      });
      if (res.success) {
        const tag = res.mode === 'dev-simulated' ? 'Simulated' : (res.via || 'SMTP');
        setAlertStatusMessage(`Alert Sent! (${tag}) ✓`);
        onShowSnackbar?.(
          res.mode === 'dev-simulated'
            ? `SMS simulated for ${cow.name} (${cow.id}) — set EMAIL_USER/EMAIL_PASS in .env for real delivery`
            : `SMS alert sent for ${cow.name} (${cow.id}) via ${res.via || 'gateway'} to ${res.to || '+91 9443287610'}`
        );
      } else {
        setAlertStatusMessage('Failed to send.');
        onShowSnackbar?.(`SMS failed for ${cow.name}: ${res.error || 'unknown error'}`);
      }
    } catch (err: any) {
      setAlertStatusMessage('Error triggering alert.');
      onShowSnackbar?.(`SMS failed for ${cow.name}: ${err?.message || 'network error'}`);
    } finally {
      setIsSendingAlert(false);
      setTimeout(() => setAlertStatusMessage(null), 4000);
    }
  };

  const isHigh = cow.riskLevel === 'High';
  const isModerate = cow.riskLevel === 'Moderate';
  const isLow = cow.riskLevel === 'Low';

  const selectedQuarter =
    health.quarters.find((q) => q.code === selectedQuarterCode) || health.quarters[0];

  // Helper for quarter label
  const getQuarterDisplayLabel = (code: string) => {
    switch (code) {
      case 'LF':
        return 'Left Fore';
      case 'RF':
        return 'Right Fore';
      case 'LR':
      case 'LH':
        return 'Left Hind';
      case 'RR':
      case 'RH':
        return 'Right Hind';
      default:
        return code;
    }
  };

  const lfQuarter = health.quarters.find((q) => q.code === 'LF') || health.quarters[0];
  const rfQuarter = health.quarters.find((q) => q.code === 'RF') || health.quarters[1];
  const lhQuarter = health.quarters.find((q) => q.code === 'LR') || health.quarters[2];
  const rhQuarter = health.quarters.find((q) => q.code === 'RR') || health.quarters[3];

  const maxConductivity = health.quarters.length > 0
    ? Math.max(...health.quarters.map((q) => q.conductivity))
    : (cow.riskLevel === 'High' ? 7.2 : 4.9);

  return (
    <div
      id={`cow-detail-${cow.id}`}
      className="w-full bg-white rounded-3xl shadow-sm border border-slate-200/90 overflow-hidden relative flex flex-col"
    >
      {/* ========================================================================= */}
      {/* 1. TOP HEADER (Dark Green Header as requested)                            */}
      {/* ========================================================================= */}
      <header
        id="cow-detail-dark-green-header"
        className="bg-[#0D3B2E] text-white p-4 sm:p-6 relative overflow-hidden shrink-0"
      >
        {/* Top bar with easy Back navigation for farmers */}
        <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-white/15">
          <button
            id="cow-detail-back-top-btn"
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 text-white text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-2xs backdrop-blur-sm"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-200" />
            <span>Back to My Cows</span>
          </button>

          {/* Close X button in the top right corner */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <button
                id={`cow-detail-send-alert-${cow.id}`}
                type="button"
                onClick={handleCowHeaderAlert}
                disabled={isSendingAlert}
                title={`Send emergency SMS alert for ${cow.name} (${cow.id})`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 active:scale-95 text-[#0D3B2E] text-xs sm:text-sm font-extrabold rounded-full shadow-2xs transition-all cursor-pointer disabled:opacity-60 disabled:cursor-wait"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSendingAlert ? 'Sending...' : 'Send Alert'}</span>
              </button>
              {alertStatusMessage && (
                <span className="text-[11px] text-amber-200 font-semibold animate-pulse whitespace-nowrap">
                  {alertStatusMessage}
                </span>
              )}
            </div>
            <button
              id="cow-detail-close-x-button"
              type="button"
              onClick={onBack}
              aria-label="Close detail view"
              className="p-1.5 rounded-full hover:bg-white/15 text-white/90 hover:text-white transition-colors cursor-pointer active:scale-95"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Cow Avatar in Teal Container */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#00695C] p-1.5 flex items-center justify-center shrink-0 shadow-sm">
            <img
              src={cow.photoUrl}
              alt={cow.name}
              className="w-full h-full rounded-xl object-cover"
            />
          </div>

          {/* Cow Identity Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 mb-1 flex-wrap">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-display font-bold text-white tracking-tight truncate">
                {cow.name}
              </h1>

              {/* Cow ID Badge */}
              <span className="text-xs sm:text-sm font-mono font-bold bg-[#004D40] text-emerald-100 px-3 py-0.5 rounded-full border border-emerald-700/50">
                {cow.id}
              </span>

              {/* RFID Tag Badge */}
              <span className="text-xs sm:text-sm font-mono font-bold bg-white/15 text-amber-200 px-2.5 sm:px-3 py-0.5 rounded-full border border-amber-300/40">
                RFID: {cow.rfid || `982-${cow.id.replace(/\D/g, '').padStart(3, '0')}`}
              </span>

              <RiskBadge
                risk={cow.riskLevel}
                percentage={cow.riskPercentage}
                size="sm"
              />
            </div>

            {/* Breed, Age & Lactation Subtitle */}
            <p className="text-xs sm:text-sm text-emerald-100/90 font-medium truncate">
              {cow.breed} • {health.age} • {health.lactationInfo} • Stall {cow.stall}
            </p>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. TABS BAR                                                               */}
      {/* Smart Card | AI Risk | Treatments | + + Log                               */}
      {/* ========================================================================= */}
      <nav
        id="cow-detail-tabs-bar"
        className="flex items-center justify-between border-b border-slate-200/80 bg-slate-50/90 px-3 sm:px-4 py-2 gap-2 shrink-0"
      >
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            id="tab-btn-smart-card"
            type="button"
            onClick={() => setActiveTab('smart_card')}
            className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'smart_card'
                ? 'bg-white text-emerald-950 font-bold border border-slate-200/80 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 font-semibold'
            }`}
          >
            Health Card
          </button>

          <button
            id="tab-btn-ai-risk"
            type="button"
            onClick={() => setActiveTab('ai_risk')}
            className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'ai_risk'
                ? 'bg-white text-emerald-950 font-bold border border-slate-200/80 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 font-semibold'
            }`}
          >
            Early Warning
          </button>

          <button
            id="tab-btn-treatments"
            type="button"
            onClick={() => setActiveTab('treatments')}
            className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'treatments'
                ? 'bg-white text-emerald-950 font-bold border border-slate-200/80 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 font-semibold'
            }`}
          >
            What to Do
          </button>
        </div>
      </nav>

      {/* ========================================================================= */}
      {/* 3. TAB CONTENT (Scrollable Area)                                          */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
        {/* ======================================================================= */}
        {/* TAB 1: SMART CARD                                                       */}
        {/* ======================================================================= */}
        {activeTab === 'smart_card' && (
          <div className="space-y-4">
            {/* 1. Health Card Risk Assessment: Why This Risk? */}
            {health.whyThisRisk.length > 0 && (
              <div
                id="cow-why-this-risk-box"
                className={`rounded-2xl p-4 border space-y-3 shadow-2xs ${
                  isHigh
                    ? 'bg-rose-50/70 border-rose-200'
                    : isModerate
                    ? 'bg-[#FEFCE8] border-[#FEF08A]'
                    : 'bg-emerald-50/60 border-emerald-200'
                }`}
              >
                {/* Question Header */}
                <div className="flex items-center justify-between pb-2 border-b border-black/5">
                  <div className="flex items-center gap-2">
                    <Sparkles
                      className={`w-4 h-4 shrink-0 ${
                        isHigh ? 'text-rose-600' : isModerate ? 'text-amber-600' : 'text-emerald-600'
                      }`}
                    />
                    <h3
                      className={`text-sm sm:text-base font-bold font-display ${
                        isHigh ? 'text-rose-950' : isModerate ? 'text-amber-950' : 'text-emerald-950'
                      }`}
                    >
                      {isHigh || isModerate ? 'Why this risk?' : 'Why is this cow healthy?'}
                    </h3>
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      isHigh
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : isModerate
                        ? 'bg-amber-100 text-amber-900 border border-amber-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {cow.riskLevel} Risk ({cow.riskPercentage}%)
                  </span>
                </div>

                {/* Reasons List */}
                <div className="space-y-2 pt-0.5">
                  {health.whyThisRisk.map((reason, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-800 leading-relaxed font-medium"
                    >
                      <span
                        className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                          isHigh ? 'bg-rose-500' : isModerate ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                      />
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. UDDER QUARTER STATUS */}
            <div id="cow-udder-quarter-status-section" className="space-y-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 font-sans">
                UDDER TEAT STATUS
              </h3>

              <div className="bg-white rounded-3xl p-3 sm:p-3.5 border border-slate-200/90 shadow-2xs">
                <div className="grid grid-cols-2 gap-2.5">
                  {/* Left Fore */}
                  <div className="rounded-2xl p-3 bg-white border border-slate-200/80 text-center">
                    <div className="text-xs text-slate-400 font-medium mb-0.5">Front Left Teat</div>
                    <div className="text-sm font-bold text-emerald-700">Healthy</div>
                  </div>

                  {/* Right Fore */}
                  <div className={`rounded-2xl p-3 text-center border ${
                    rfQuarter?.status === 'High'
                      ? 'bg-[#FEF2F2] border-[#FECACA]'
                      : rfQuarter?.status === 'Watch' || rfQuarter?.status === 'Moderate'
                      ? 'bg-amber-50 border-amber-200'
                      : 'bg-white border-slate-200/80'
                  }`}>
                    <div className="text-xs text-slate-500 font-medium mb-0.5">Front Right Teat</div>
                    <div
                      className={`text-sm font-bold ${
                        rfQuarter?.status === 'High'
                          ? 'text-rose-600'
                          : rfQuarter?.status === 'Watch' || rfQuarter?.status === 'Moderate'
                          ? 'text-amber-700'
                          : 'text-emerald-700'
                      }`}
                    >
                      {rfQuarter?.status === 'High'
                        ? 'High Mastitis Risk'
                        : rfQuarter?.status === 'Watch' || rfQuarter?.status === 'Moderate'
                        ? 'Watch Closely'
                        : 'Healthy'}
                    </div>
                  </div>

                  {/* Left Hind */}
                  <div className={`rounded-2xl p-3 text-center border ${
                    lhQuarter?.status === 'High'
                      ? 'bg-[#FEF2F2] border-[#FECACA]'
                      : lhQuarter?.status === 'Watch' || lhQuarter?.status === 'Moderate'
                      ? 'bg-amber-50 border-amber-200'
                      : 'bg-white border-slate-200/80'
                  }`}>
                    <div className="text-xs text-slate-500 font-medium mb-0.5">Back Left Teat</div>
                    <div
                      className={`text-sm font-bold ${
                        lhQuarter?.status === 'High'
                          ? 'text-rose-600'
                          : lhQuarter?.status === 'Watch' || lhQuarter?.status === 'Moderate'
                          ? 'text-amber-700'
                          : 'text-emerald-700'
                      }`}
                    >
                      {lhQuarter?.status === 'High'
                        ? 'High Mastitis Risk'
                        : lhQuarter?.status === 'Watch' || lhQuarter?.status === 'Moderate'
                        ? 'Watch Closely'
                        : 'Healthy'}
                    </div>
                  </div>

                  {/* Right Hind */}
                  <div
                    className={`rounded-2xl p-3 text-center border ${
                      rhQuarter?.status === 'High'
                        ? 'bg-[#FEF2F2] border-[#FECACA]'
                        : rhQuarter?.status === 'Watch' || rhQuarter?.status === 'Moderate'
                        ? 'bg-amber-50 border-amber-200'
                        : 'bg-white border-slate-200/80'
                    }`}
                  >
                    <div className="text-xs text-slate-500 font-medium mb-0.5">Back Right Teat</div>
                    <div
                      className={`text-sm font-bold ${
                        rhQuarter?.status === 'High'
                          ? 'text-rose-600'
                          : rhQuarter?.status === 'Watch' || rhQuarter?.status === 'Moderate'
                          ? 'text-amber-700'
                          : 'text-emerald-700'
                      }`}
                    >
                      {rhQuarter?.status === 'High'
                        ? 'High Mastitis Risk'
                        : rhQuarter?.status === 'Watch' || rhQuarter?.status === 'Moderate'
                        ? 'Watch Closely'
                        : 'Healthy'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. MILK CONDUCTIVITY */}
            <div id="cow-milk-conductivity-section" className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 font-sans flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-600" />
                  <span>MILK CONDUCTIVITY</span>
                </h3>
                <span className="text-[11px] font-semibold text-slate-500 font-mono">
                  4.5–5.5 mS/cm
                </span>
              </div>

              <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-2xs space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200/70 text-amber-700 flex items-center justify-center shrink-0">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 font-medium">Conductivity</div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xl font-black font-mono text-slate-900">
                          {maxConductivity.toFixed(1)}
                        </span>
                        <span className="text-xs font-bold text-slate-500">mS/cm</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                      maxConductivity >= 6.5
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : maxConductivity > 5.5
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}
                  >
                    {maxConductivity >= 6.5
                      ? 'Elevated (Ion Leakage)'
                      : maxConductivity > 5.5
                      ? 'Watch (Slight Elevation)'
                      : 'Normal'}
                  </span>
                </div>
              </div>
            </div>

            {/* 4. Telemetry Metrics (2x2 Grid) */}
            <div id="cow-telemetry-metrics-section" className="grid grid-cols-2 gap-2.5">
              {/* SSC (Somatic Cell Count) */}
              <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-200/90 shadow-2xs flex items-center gap-3">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#E1F5FE] text-[#0288D1] flex items-center justify-center shrink-0">
                  <Droplets className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] sm:text-xs text-slate-500 font-medium truncate">
                    SSC
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-base sm:text-lg font-black text-slate-900 font-sans tracking-tight">
                      {(cow.scc * 1000).toLocaleString()}
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium">cells</span>
                  </div>
                </div>
              </div>

              {/* Milk Temperature */}
              <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-200/90 shadow-2xs flex items-center gap-3">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#FFF3E0] text-[#E65100] flex items-center justify-center shrink-0">
                  <Thermometer className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] sm:text-xs text-slate-500 font-medium truncate">
                    Milk Temperature
                  </div>
                  <div className="flex items-baseline gap-1 flex-wrap">
                    <span className="text-base sm:text-lg font-black text-slate-900 font-sans tracking-tight">
                      {cow.temperature}°C
                    </span>
                    <span
                      className={`text-[11px] sm:text-xs font-semibold ${
                        cow.temperature > 39.5 ? 'text-amber-700' : 'text-emerald-700'
                      }`}
                    >
                      {cow.temperature > 39.5 ? 'High (Mastitis Alert)' : 'Normal (38.5°C)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rumination Time */}
              <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-200/90 shadow-2xs flex items-center gap-3">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#EDE7F6] text-[#5E35B1] flex items-center justify-center shrink-0">
                  <Activity className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] sm:text-xs text-slate-500 font-medium truncate">
                    Rumination
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-base sm:text-lg font-black text-slate-900 font-sans tracking-tight">
                      {cow.ruminationMinutes}
                    </span>
                    <span className="text-[10px] sm:text-xs font-medium text-slate-500">mins</span>
                  </div>
                </div>
              </div>

              {/* Daily Milk Yield */}
              <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-200/90 shadow-2xs flex items-center gap-3">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] sm:text-xs text-slate-500 font-medium truncate">
                    Today&apos;s Milk
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-base sm:text-lg font-black text-slate-900 font-sans tracking-tight">
                      {cow.milkYield}
                    </span>
                    <span className="text-[10px] sm:text-xs font-medium text-slate-500">Liters</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 7-Day SCC Progression Chart */}
            <div className="bg-slate-50 rounded-3xl p-4 sm:p-5 border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Past 7 Days Milk Cells
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Automatic sensor checks at every milking
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-slate-900">
                  Today: {cow.scc}k
                </span>
              </div>

              {/* Visual chart bar representation */}
              <div className="grid grid-cols-7 gap-2 pt-2 items-end h-28">
                {health.telemetry7Day.map((point, i) => {
                  const maxScc = Math.max(...health.telemetry7Day.map((p) => p.scc), 500);
                  const heightPercent = Math.min(100, Math.max(15, (point.scc / maxScc) * 100));
                  const isToday = i === health.telemetry7Day.length - 1;

                  return (
                    <div key={point.day} className="flex flex-col items-center gap-1.5 h-full justify-end">
                      <span className="text-[10px] font-mono font-bold text-slate-700">
                        {point.scc}k
                      </span>
                      <div className="w-full bg-slate-200 rounded-t-lg relative flex items-end h-20 overflow-hidden">
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full rounded-t-lg transition-all ${
                            point.scc > 400
                              ? 'bg-rose-500'
                              : point.scc > 200
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          } ${isToday ? 'ring-2 ring-slate-900' : ''}`}
                        />
                      </div>
                      <span className="text-[10px] font-medium text-slate-500 truncate max-w-full">
                        {point.day.replace('Day -', '-')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* TAB 2: AI RISK                                                          */}
        {/* Early Prediction Window & Ask AAROGYA AI Prompt                         */}
        {/* ======================================================================= */}
        {activeTab === 'ai_risk' && (
          <div className="space-y-5">
            <div className="bg-emerald-900 text-white rounded-3xl p-5 sm:p-6 shadow-sm relative overflow-hidden">
              <div className="relative z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-800/80 text-emerald-200 text-xs font-bold mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>AI Early Warning Helper</span>
                </div>
                <h3 className="text-lg sm:text-xl font-display font-extrabold text-white">
                  Mastitis Warning: Next 7 to 14 Days
                </h3>
                <p className="text-xs text-emerald-100/90 mt-1 leading-relaxed max-w-xl">
                  Checks milk flow, udder heat, and chewing changes days before lumps or bad milk appear.
                </p>
              </div>
            </div>

            {/* 4 Future Forecast Milestones for this cow */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Health Forecast for {cow.name} ({cow.id})
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {health.aiForecast.map((point) => (
                  <div
                    key={point.timeframe}
                    className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-sm transition-shadow space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{point.timeframe}</span>
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                          point.riskLevel === 'High'
                            ? 'bg-rose-100 text-rose-800'
                            : point.riskLevel === 'Moderate' || point.riskLevel === 'Watch'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {point.riskPercentage}% {point.riskLevel}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      {point.clinicalState}
                    </p>

                    <div className="pt-2 border-t border-slate-100 text-[11px] text-emerald-900 font-semibold flex items-start gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{point.recommendation}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ask AI & Locate Cow Shortcuts */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-slate-900">
                  Need doctor advice for {cow.name}?
                </p>
                <p className="text-[11px] text-slate-500">
                  Ask AI helper what care steps to take or when to call the doctor.
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {onLocateCowInBarn && (
                  <button
                    type="button"
                    onClick={() => onLocateCowInBarn(cow.stall)}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <Compass className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Find Stall {cow.stall}</span>
                  </button>
                )}

                {onOpenAskAi && (
                  <button
                    type="button"
                    onClick={() =>
                      onOpenAskAi(
                        `What is the best treatment protocol for ${cow.name} (${cow.id}, Stall ${cow.stall}) with ${cow.riskPercentage}% ${cow.riskLevel} risk and SCC of ${cow.scc}k?`
                      )
                    }
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Ask AI</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* TAB 3: TREATMENTS                                                       */}
        {/* Actionable Protocols & Farmer Checklist                                 */}
        {/* ======================================================================= */}
        {activeTab === 'treatments' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-display font-bold text-slate-900">
                  Care Steps to Take
                </h3>
                <p className="text-xs text-slate-500">
                  Simple care checklist for {cow.name} in Stall {cow.stall}
                </p>
              </div>

              <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                {treatmentActions.filter((a) => a.completed).length} / {treatmentActions.length} Done
              </span>
            </div>

            {/* Checklist Items */}
            <div className="space-y-2.5">
              {treatmentActions.map((action) => (
                <div
                  key={action.id}
                  onClick={() => toggleAction(action.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                    action.completed
                      ? 'bg-emerald-50/40 border-emerald-200 text-slate-500 opacity-80'
                      : 'bg-white border-slate-200 hover:border-emerald-300 shadow-2xs'
                  }`}
                >
                  <button
                    type="button"
                    className="mt-0.5 shrink-0 text-emerald-700 hover:text-emerald-900"
                  >
                    {action.completed ? (
                      <CheckSquare className="w-5 h-5 text-emerald-700" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-400" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4
                        className={`text-sm font-bold ${
                          action.completed
                            ? 'text-emerald-950 font-display'
                            : 'text-slate-900 font-display'
                        }`}
                      >
                        {action.title}
                      </h4>

                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md shrink-0 ${
                          action.priority === 'Immediate'
                            ? 'bg-rose-100 text-rose-800'
                            : action.priority === 'High'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {action.priority}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed font-normal">
                      {action.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Vet Dispatch Banner if High or Moderate */}
            {(isHigh || isModerate) && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Phone className="w-5 h-5 text-amber-700 shrink-0" />
                  <div>
                    <h5 className="text-xs font-bold text-amber-950">
                      Doctor Ready to Help
                    </h5>
                    <p className="text-[11px] text-amber-900/80">
                      Dr. Rajesh Sharma • Mobile Clinic Van
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onCallVet}
                  className="px-3.5 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
                >
                  Call Doctor
                </button>
              </div>
            )}
          </div>
        )}

        {/* ======================================================================= */}
        {/* TAB 4: + LOG                                                            */}
        {/* Quick Clinical & Milking Observations                                   */}
        {/* ======================================================================= */}
        {activeTab === 'log' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-display font-bold text-slate-900">
                Notes for {cow.name}
              </h3>
              <p className="text-xs text-slate-500">
                Write notes on milking, teat tests, or cow mood
              </p>
            </div>

            {/* Quick Log Form */}
            <form
              onSubmit={handleAddLog}
              className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3"
            >
              <div className="flex flex-wrap items-center gap-2">
                {['Milking Observation', 'Temperature Check', 'CMT Test', 'Vet Note'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setNewLogType(type)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      newLogType === type
                        ? 'bg-emerald-800 text-white font-bold'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <textarea
                value={newLogNote}
                onChange={(e) => setNewLogNote(e.target.value)}
                placeholder={`Write quick note about ${cow.name}...`}
                rows={2}
                className="w-full text-xs p-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 resize-none text-slate-900"
              />

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!newLogNote.trim()}
                  className="px-4 py-1.5 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Save Note
                </button>
              </div>
            </form>

            {/* Historical Entries */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Past Notes
              </h4>

              {logs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1 shadow-2xs"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                      {log.type}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {log.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-slate-800 font-medium pt-1">
                    {log.note}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    Logged by {log.author}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 4. BOTTOM ACTIONS (Matching image.jpeg)                                  */}
      {/* ========================================================================= */}
      <footer
        id="cow-detail-fixed-bottom-actions"
        className="shrink-0 bg-white border-t border-slate-200 px-4 py-3 z-30 flex items-center justify-between gap-3 shadow-xs"
      >
        <button
          id="cow-detail-call-vet-button"
          type="button"
          onClick={onCallVet}
          className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-3.5 rounded-2xl text-xs sm:text-sm font-semibold bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 shadow-2xs transition-all cursor-pointer active:scale-98"
        >
          <Phone className="w-4 h-4 text-emerald-700 shrink-0" />
          <span className="truncate">Call Doctor</span>
        </button>

        <button
          id="cow-detail-close-bottom-button"
          type="button"
          onClick={onBack}
          className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-6 rounded-2xl text-xs sm:text-sm font-bold bg-[#0D3B2E] hover:bg-[#08281f] text-white shadow-xs transition-all cursor-pointer active:scale-98"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Cows</span>
        </button>
      </footer>
    </div>
  );
};
