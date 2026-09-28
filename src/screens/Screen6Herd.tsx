import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bot,
  Calendar,
  Check,
  CheckCircle2,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  Clock,
  Download,
  Droplets,
  Eye,
  Flame,
  Gauge,
  Info,
  Layers,
  MapPin,
  PawPrint,
  Radio,
  RotateCcw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  SunMedium,
  Thermometer,
  TrendingDown,
  TrendingUp,
  Wheat,
  Wind
} from 'lucide-react';
import React, { useState } from 'react';
import pastureHeroImg from '../assets/images/best_panoramic_cows_header.jpg';
import { RiskBadge } from '../components/RiskBadge';
import {
  BARN_STALLS,
  COWS_DATA,
  FARMER_PROFILE,
  RISK_DISTRIBUTION,
  TRANSLATIONS
} from '../data/mockData';
import { Cow, FarmSetupData, HerdSubSection, LanguageCode } from '../types';

interface Screen6HerdProps {
  initialSubSection?: HerdSubSection;
  highlightStall?: number | null;
  currentLang: LanguageCode;
  onOpenCowDiagnostic: (cowId: string) => void;
  onOpenAskAi: (initialPrompt?: string) => void;
  onShowSnackbar: (msg: string) => void;
  herdList?: Cow[];
  farmSetup?: FarmSetupData;
}

export const Screen6Herd: React.FC<Screen6HerdProps> = ({
  initialSubSection = 'recommendations',
  highlightStall = null,
  currentLang,
  onOpenCowDiagnostic,
  onOpenAskAi,
  onShowSnackbar,
  herdList,
  farmSetup,
}) => {
  const t = TRANSLATIONS[currentLang];
  const activeHerdCows = herdList && herdList.length > 0 ? herdList : COWS_DATA;

  const [activeSub, setActiveSub] = useState<HerdSubSection>(
    initialSubSection === 'regional' || initialSubSection === 'scc' || initialSubSection === 'analytics'
      ? 'health_analytics'
      : (initialSubSection || 'health_analytics')
  );
  const [selectedStall, setSelectedStall] = useState<number | null>(highlightStall || 4);

  // Health & Analytics state (Matches head's reference images)
  const [selectedTimeRange, setSelectedTimeRange] = useState<'today' | '7days' | '30days' | 'lactation'>('7days');
  const [selectedTrajectoryDayIndex, setSelectedTrajectoryDayIndex] = useState<number>(6); // Default to Today
  const [showDivertedComparison, setShowDivertedComparison] = useState<boolean>(true);
  const [safeguards, setSafeguards] = useState<{
    divert_c024: boolean;
    milking_order: boolean;
    iodine_dip: boolean;
  }>({
    divert_c024: false, // Default completely unticked so after tick only it marks
    milking_order: false,
    iodine_dip: false,
  });

  const toggleSafeguard = (key: 'divert_c024' | 'milking_order' | 'iodine_dip') => {
    setSafeguards((prev) => {
      const nextVal = !prev[key];
      const updated = { ...prev, [key]: nextVal };
      if (nextVal) {
        onShowSnackbar('Safeguard protocol marked complete');
      } else {
        onShowSnackbar('Safeguard protocol unmarked');
      }
      return updated;
    });
  };

  const completedSafeguardsCount = Object.values(safeguards).filter(Boolean).length;

  // Recommendations State - default to completely unticked so if farmer puts tick only it marks
  const [selectedCowId, setSelectedCowId] = useState<string>(() => (activeHerdCows[0]?.id || 'C-011'));
  const [isCowPickerOpen, setIsCowPickerOpen] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<'milking' | 'nutrition' | 'biosecurity' | 'veterinary'>('milking');
  const [completedTaskIds, setCompletedTaskIds] = useState<Record<string, boolean>>({});

  // Subsections with Health & Analytics, Recommendations, Farm Map (Numbers tab removed per user request)
  const subSections: { id: HerdSubSection; label: string; icon: any }[] = [
    { id: 'health_analytics', label: t.healthAnalyticsTab || 'Health & Analytics', icon: Activity },
    { id: 'recommendations', label: (t as any).recommendationsTab || 'Recommendations', icon: CheckCircle2 },
    { id: 'farm_map', label: t.farmMapTab || 'Farm Map', icon: Layers },
  ];

  const currentStallData = BARN_STALLS.find((s) => s.stallNum === selectedStall);
  const selectedCow = activeHerdCows.find((c) => c.id === selectedCowId) || activeHerdCows[0];

  const toggleTask = (taskId: string) => {
    setCompletedTaskIds((prev) => {
      const nextVal = !prev[taskId];
      const updated = { ...prev, [taskId]: nextVal };
      if (nextVal) {
        onShowSnackbar('Task marked completed for ' + selectedCow.name);
      }
      return updated;
    });
  };

  const handleResetTasks = () => {
    setCompletedTaskIds({});
    onShowSnackbar('Action checklist cleared for ' + selectedCow.name);
  };

  const categories = [
    {
      id: 'milking' as const,
      label: 'Milking...',
      fullTitle: 'Milking Hygiene Protocol',
      icon: Droplets,
      badgeColor: 'text-sky-700',
      activeBorder: 'border-sky-500 shadow-xs ring-1 ring-sky-400/30',
      activeBg: 'bg-sky-50 text-sky-950 font-bold',
      inactiveBg: 'bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-slate-200/80',
      iconBg: 'bg-sky-100 text-sky-700',
      tasks: [
        {
          id: 'm1',
          text: 'Milk the affected cow separately and last.',
        },
        {
          id: 'm2',
          text: 'Clean the udder before and after milking.',
        },
        {
          id: 'm3',
          text: 'Use a separate clean towel for each cow.',
        },
        {
          id: 'm4',
          text: 'Keep milk from affected cows separate.',
        },
      ],
    },
    {
      id: 'nutrition' as const,
      label: 'Nutrition &...',
      fullTitle: 'Nutrition & Udder Immunity Protocol',
      icon: Wheat,
      badgeColor: 'text-amber-700',
      activeBorder: 'border-amber-500 shadow-xs ring-1 ring-amber-400/30',
      activeBg: 'bg-amber-50 text-amber-950 font-bold',
      inactiveBg: 'bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-slate-200/80',
      iconBg: 'bg-amber-100 text-amber-700',
      tasks: [
        {
          id: 'n1',
          text: 'Give balanced feed regularly.',
        },
        {
          id: 'n2',
          text: 'Provide fresh, clean drinking water.',
        },
        {
          id: 'n3',
          text: 'Maintain proper mineral and vitamin intake.',
        },
        {
          id: 'n4',
          text: 'Monitor reduced feeding or rumination.',
        },
      ],
    },
    {
      id: 'biosecurity' as const,
      label: 'Biosecurity...',
      fullTitle: 'Barn Disinfection & Biosecurity Protocol',
      icon: ShieldCheck,
      badgeColor: 'text-emerald-700',
      activeBorder: 'border-emerald-500 shadow-xs ring-1 ring-emerald-400/30',
      activeBg: 'bg-emerald-50 text-emerald-950 font-bold',
      inactiveBg: 'bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-slate-200/80',
      iconBg: 'bg-emerald-100 text-emerald-700',
      tasks: [
        {
          id: 'b1',
          text: 'Keep cow bedding clean and dry.',
        },
        {
          id: 'b2',
          text: 'Keep sick cows in a separate stall.',
        },
        {
          id: 'b3',
          text: 'Check milking machine pressure regularly.',
        },
        {
          id: 'b4',
          text: 'Wash and disinfect milking tools after use.',
        },
      ],
    },
    {
      id: 'veterinary' as const,
      label: 'Veterinary...',
      fullTitle: 'Clinical Veterinary Care Protocol',
      icon: Stethoscope,
      badgeColor: 'text-rose-700',
      activeBorder: 'border-rose-500 shadow-xs ring-1 ring-rose-400/30',
      activeBg: 'bg-rose-50 text-rose-950 font-bold',
      inactiveBg: 'bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-slate-200/80',
      iconBg: 'bg-rose-100 text-rose-700',
      tasks: [
        {
          id: 'v1',
          text: 'Check all four teats before milking.',
        },
        {
          id: 'v2',
          text: 'Call the doctor if the udder feels hot or hard.',
        },
        {
          id: 'v3',
          text: 'Record daily milk yield and health notes.',
        },
        {
          id: 'v4',
          text: 'Give medicines only as advised by the doctor.',
        },
      ],
    },
  ];

  const currentCategoryData = categories.find((c) => c.id === activeCategory) || categories[0];
  const totalTasks = currentCategoryData.tasks.length;
  const completedInCurrent = currentCategoryData.tasks.filter((t) => completedTaskIds[t.id]).length;

  return (
    <div id="screen-6-herd" className="space-y-3.5 pb-24">
      {/* 3 Section Tab Selector (Numbers tab removed per user request) */}
      <div className="bg-white p-1 rounded-2xl border border-slate-200 shadow-2xs grid grid-cols-3 gap-1">
        {subSections.map((sub) => {
          const Icon = sub.icon;
          const isActive = activeSub === sub.id;
          return (
            <button
              key={sub.id}
              id={`herd-subtab-${sub.id}`}
              type="button"
              onClick={() => setActiveSub(sub.id)}
              className={`py-2 px-1 text-xs font-semibold rounded-xl transition-all flex flex-col items-center gap-1 cursor-pointer font-sans ${
                isActive
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="leading-none text-[11px] truncate tracking-tight">{sub.label}</span>
            </button>
          );
        })}
      </div>

      {/* 0. NEW HEADING: HERD HEALTH & ANALYTICS (Matches Head's Reference Images) */}
      {activeSub === 'health_analytics' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Top Header with Back button & IoT Live Badge */}
          <div className="flex items-center justify-between pb-0.5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveSub('recommendations')}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Go to Recommendations"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-lg sm:text-xl font-display font-extrabold text-slate-900 tracking-tight leading-tight">
                  Herd Health &amp; Analytics
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {FARMER_PROFILE.farmName || 'Velan Dairy & Cattle Farm'} • {FARMER_PROFILE.totalCattle || 24} Cattle
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 bg-[#C6F6D5] text-[#22543D] text-xs font-bold px-3 py-1 rounded-full border border-emerald-300 shadow-2xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
              <span>IoT Live</span>
            </div>
          </div>

          {/* Time Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none">
            {[
              { id: 'today', label: 'Today', icon: null },
              { id: '7days', label: '7 Days', icon: Calendar },
              { id: '30days', label: '30 Days', icon: null },
              { id: 'lactation', label: 'This Lactation', icon: null },
            ].map((pill) => {
              const Icon = pill.icon;
              const isSelected = selectedTimeRange === pill.id;
              return (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setSelectedTimeRange(pill.id as any)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'bg-emerald-50/70 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  <span>{pill.label}</span>
                </button>
              );
            })}
          </div>

          {/* Panoramic Hero Card */}
          <div className="relative rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm min-h-[150px] sm:min-h-[175px] flex items-end p-4 sm:p-5">
            <img
              src={pastureHeroImg}
              alt="Pasture Morning Telemetry"
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/25" />

            <div className="relative z-10 w-full flex items-end justify-between gap-3">
              <div>
                <span className="text-xs text-white/90 font-medium tracking-wide block">
                  Morning Session Telemetry
                </span>
                <h3 className="text-xl sm:text-2xl font-display font-extrabold text-white leading-tight mt-0.5">
                  Shift A Completed • Tank Chilled
                </h3>
              </div>
              <div className="bg-white/95 backdrop-blur-xs text-slate-900 px-3.5 py-1.5 rounded-2xl shadow-sm text-center shrink-0 border border-white/50">
                <span className="text-sm sm:text-base font-extrabold font-mono text-emerald-800 block leading-tight">
                  3.8°C
                </span>
                <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider">
                  Target
                </span>
              </div>
            </div>
          </div>

          {/* Tank Yield & Payout Guard Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-display font-extrabold text-slate-900 tracking-tight">
                Tank Yield &amp; Payout Guard
              </h3>
              <span className="text-xs text-slate-500 font-medium">Updated 18m ago</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Total Bulk Yield */}
              <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600">Total Bulk Yield</span>
                  <Droplets className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 tracking-tight">
                    {selectedTimeRange === 'today' ? '380' : '842'}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">L</span>
                </div>
                <div className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 text-[11px] font-bold px-2 py-0.5 rounded-full border border-rose-200">
                  <TrendingDown className="w-3 h-3 text-rose-600" />
                  <span>-38 L vs 7d avg</span>
                </div>
              </div>

              {/* Herd Avg SCC */}
              <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600">Herd Avg SCC</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 tracking-tight">
                    185k
                  </span>
                  <span className="text-xs text-slate-500 font-medium">cells/mL</span>
                </div>
                <div className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                  <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                  <span>Grade A Milk</span>
                </div>
              </div>
            </div>

            {/* ₹2,450 / day at risk Alert Banner */}
            <div
              onClick={() => onOpenCowDiagnostic('C-024')}
              className="bg-rose-50 hover:bg-rose-100/90 border border-rose-200 rounded-2xl p-3.5 flex items-center justify-between cursor-pointer transition-colors shadow-2xs group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold text-lg shadow-xs shrink-0">
                  ₹
                </div>
                <div>
                  <div className="text-base font-display font-extrabold text-rose-950 leading-tight">
                    ₹2,450 / day at risk
                  </div>
                  <p className="text-xs text-rose-800 font-medium">
                    From 3 cows with subclinical mastitis spike
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-rose-600 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Bulk SCC Trajectory Card */}
          {(() => {
            // Trajectory datasets for each time range
            const trajectoryDataByRange: Record<string, Array<{
              day: string;
              date: string;
              scc: number;
              quarantinedScc: number;
              status: string;
              bonus: string;
              risk: 'low' | 'moderate' | 'high';
              note: string;
            }>> = {
              '7days': [
                {
                  day: 'Mon',
                  date: '16 Sep',
                  scc: 122,
                  quarantinedScc: 122,
                  status: 'Grade A Certified',
                  bonus: '+₹3.50/L Bonus',
                  risk: 'low',
                  note: 'Healthy levels across all 8 stalls. Somatic cell count is well below threshold.',
                },
                {
                  day: 'Tue',
                  date: '17 Sep',
                  scc: 128,
                  quarantinedScc: 125,
                  status: 'Grade A Certified',
                  bonus: '+₹3.50/L Bonus',
                  risk: 'low',
                  note: 'Clean pre-milking routine maintained; bulk milk vat temperature stable at 3.8°C.',
                },
                {
                  day: 'Wed',
                  date: '18 Sep',
                  scc: 139,
                  quarantinedScc: 126,
                  status: 'Grade A Certified',
                  bonus: '+₹3.50/L Bonus',
                  risk: 'low',
                  note: 'Mild conductivity fluctuation flagged in Stall 4 (Lakshmi). Bulk tank safe.',
                },
                {
                  day: 'Thu',
                  date: '19 Sep',
                  scc: 156,
                  quarantinedScc: 125,
                  status: 'Elevated Watch',
                  bonus: '+₹3.50/L Bonus',
                  risk: 'moderate',
                  note: 'Subclinical mastitis began in Lakshmi LR quarter. Early warning threshold crossed.',
                },
                {
                  day: 'Fri',
                  date: '20 Sep',
                  scc: 172,
                  quarantinedScc: 127,
                  status: 'Warning Alert',
                  bonus: '+₹1.50/L Bonus',
                  risk: 'moderate',
                  note: 'Bulk SCC rising steadily. Milk quality bonus rate reduced from ₹3.50 to ₹1.50/L.',
                },
                {
                  day: 'Sat',
                  date: '21 Sep',
                  scc: 186,
                  quarantinedScc: 128,
                  status: 'High Alert',
                  bonus: 'Bonus at Risk',
                  risk: 'high',
                  note: 'Only 14,000 cells/mL headroom remains before crossing the 200,000 penalty limit.',
                },
                {
                  day: 'Today',
                  date: '22 Sep',
                  scc: 194,
                  quarantinedScc: 128,
                  status: 'Critical Warning',
                  bonus: 'Penalty Imminent',
                  risk: 'high',
                  note: 'At 194k cells/mL! Isolating Lakshmi (C-024) restores the bulk tank to 128,000 cells/mL.',
                },
              ],
              'today': [
                {
                  day: '05:30',
                  date: 'Shift A',
                  scc: 132,
                  quarantinedScc: 126,
                  status: 'Grade A Certified',
                  bonus: '+₹3.50/L Bonus',
                  risk: 'low',
                  note: 'Early morning milking session across stalls 1–8. Initial conductivity normal.',
                },
                {
                  day: '09:00',
                  date: 'Mid-Morning',
                  scc: 148,
                  quarantinedScc: 126,
                  status: 'Grade A Certified',
                  bonus: '+₹3.50/L Bonus',
                  risk: 'low',
                  note: 'Tank chilling to 3.8°C. Minor conductivity spike noted in Stall 4.',
                },
                {
                  day: '13:00',
                  date: 'Afternoon',
                  scc: 168,
                  quarantinedScc: 127,
                  status: 'Warning Alert',
                  bonus: '+₹1.50/L Bonus',
                  risk: 'moderate',
                  note: 'Midday sample analysis shows elevated somatic cells from Lakshmi LR quarter.',
                },
                {
                  day: '17:00',
                  date: 'Shift B',
                  scc: 188,
                  quarantinedScc: 128,
                  status: 'High Alert',
                  bonus: 'Bonus at Risk',
                  risk: 'high',
                  note: 'Evening milking session starts. Bulk vat SCC entering high alert zone.',
                },
                {
                  day: 'Now',
                  date: 'Live Tank',
                  scc: 194,
                  quarantinedScc: 128,
                  status: 'Critical Warning',
                  bonus: 'Penalty Imminent',
                  risk: 'high',
                  note: 'Current vat SCC is 194k cells/mL. Divert Stall 4 milk to restore Grade A quality.',
                },
              ],
              '30days': [
                {
                  day: 'Wk 1',
                  date: '1–7 Sep',
                  scc: 118,
                  quarantinedScc: 118,
                  status: 'Grade A Certified',
                  bonus: '+₹3.50/L Bonus',
                  risk: 'low',
                  note: 'Optimal herd lactation cycle with strict parlour sanitation protocols.',
                },
                {
                  day: 'Wk 2',
                  date: '8–14 Sep',
                  scc: 126,
                  quarantinedScc: 124,
                  status: 'Grade A Certified',
                  bonus: '+₹3.50/L Bonus',
                  risk: 'low',
                  note: 'Consistent Grade A premium qualification; milk co-op payout maximized.',
                },
                {
                  day: 'Wk 3',
                  date: '15–21 Sep',
                  scc: 165,
                  quarantinedScc: 126,
                  status: 'Warning Alert',
                  bonus: '+₹1.50/L Bonus',
                  risk: 'moderate',
                  note: 'Somatic cell escalation began mid-month due to subclinical mastitis in 2 cows.',
                },
                {
                  day: 'Wk 4',
                  date: 'Current',
                  scc: 194,
                  quarantinedScc: 128,
                  status: 'Critical Warning',
                  bonus: 'Penalty Imminent',
                  risk: 'high',
                  note: 'Current week trajectory nearing penalty threshold. Immediate diversion recommended.',
                },
              ],
              'lactation': [
                {
                  day: 'M 1',
                  date: 'Apr',
                  scc: 112,
                  quarantinedScc: 112,
                  status: 'Grade A Certified',
                  bonus: '+₹3.50/L Bonus',
                  risk: 'low',
                  note: 'Early lactation peak flush; excellent herd-level udder resilience.',
                },
                {
                  day: 'M 2',
                  date: 'May',
                  scc: 119,
                  quarantinedScc: 118,
                  status: 'Grade A Certified',
                  bonus: '+₹3.50/L Bonus',
                  risk: 'low',
                  note: 'Consistent high-tier milk composition with normal conductivity.',
                },
                {
                  day: 'M 3',
                  date: 'Jun',
                  scc: 128,
                  quarantinedScc: 122,
                  status: 'Grade A Certified',
                  bonus: '+₹3.50/L Bonus',
                  risk: 'low',
                  note: 'Stable somatic cell counts across all production sheds.',
                },
                {
                  day: 'M 4',
                  date: 'Jul',
                  scc: 136,
                  quarantinedScc: 125,
                  status: 'Grade A Certified',
                  bonus: '+₹3.50/L Bonus',
                  risk: 'low',
                  note: 'Slight seasonal humidity elevation managed with extra bedding sanitation.',
                },
                {
                  day: 'M 5',
                  date: 'Aug',
                  scc: 158,
                  quarantinedScc: 126,
                  status: 'Elevated Watch',
                  bonus: '+₹2.50/L Bonus',
                  risk: 'moderate',
                  note: 'Late summer THI heat stress caused moderate cell count elevation.',
                },
                {
                  day: 'M 6',
                  date: 'Sep (Now)',
                  scc: 194,
                  quarantinedScc: 128,
                  status: 'Critical Warning',
                  bonus: 'Penalty Imminent',
                  risk: 'high',
                  note: 'Active flare in Stall 4 (Lakshmi). Isolating restores 128k normal levels.',
                },
              ],
            };

            const currentTrajectory = trajectoryDataByRange[selectedTimeRange] || trajectoryDataByRange['7days'];
            const safeIndex = Math.min(selectedTrajectoryDayIndex, currentTrajectory.length - 1);
            const activeDay = currentTrajectory[safeIndex] || currentTrajectory[0];

            // 560x215 Projection Geometry:
            // Plot margins: Left = 44, Right = 524 (width = 480), Top = 26, Bottom = 180 (height = 154)
            // SCC Scale: Max = 225k, Min = 75k (Range = 150k)
            const getY = (sccVal: number) => {
              const clamped = Math.max(75, Math.min(225, sccVal));
              return 26 + ((225 - clamped) / 150) * 154;
            };

            const totalPts = currentTrajectory.length;
            const actualPts = currentTrajectory.map((d, i) => ({
              x: 44 + i * (480 / Math.max(1, totalPts - 1)),
              y: getY(d.scc),
            }));

            const quarantinedPts = currentTrajectory.map((d, i) => ({
              x: 44 + i * (480 / Math.max(1, totalPts - 1)),
              y: getY(d.quarantinedScc),
            }));

            // Smooth cubic bezier spline algorithm with balanced tension
            const buildCurvedPath = (pts: { x: number; y: number }[]) => {
              if (pts.length === 0) return '';
              if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
              let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
              for (let i = 0; i < pts.length - 1; i++) {
                const p0 = pts[Math.max(i - 1, 0)];
                const p1 = pts[i];
                const p2 = pts[i + 1];
                const p3 = pts[Math.min(i + 2, pts.length - 1)];

                const tension = 6.0;
                const cp1x = p1.x + (p2.x - p0.x) / tension;
                const cp1y = p1.y + (p2.y - p0.y) / tension;
                const cp2x = p2.x - (p3.x - p1.x) / tension;
                const cp2y = p2.y - (p3.y - p1.y) / tension;

                d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
              }
              return d;
            };

            const actualPath = buildCurvedPath(actualPts);
            const lastActual = actualPts[actualPts.length - 1];
            const firstActual = actualPts[0];
            const actualArea = `${actualPath} L ${lastActual.x.toFixed(1)} 180 L ${firstActual.x.toFixed(1)} 180 Z`;

            const quarantinedPath = buildCurvedPath(quarantinedPts);
            const lastQ = quarantinedPts[quarantinedPts.length - 1];
            const firstQ = quarantinedPts[0];
            const quarantinedArea = `${quarantinedPath} L ${lastQ.x.toFixed(1)} 180 L ${firstQ.x.toFixed(1)} 180 Z`;

            const activePt = actualPts[safeIndex];
            const activeQPt = quarantinedPts[safeIndex];
            const activeIsHigh = activeDay.scc >= 180;
            const activeIsMod = activeDay.scc >= 150 && activeDay.scc < 180;
            const activeColor = activeIsHigh ? '#e11d48' : activeIsMod ? '#f59e0b' : '#10b981';

            // Tooltip positioning math (keeps it smoothly within viewBox boundaries)
            const tooltipWidth = 118;
            const tooltipHeight = 46;
            let tooltipX = activePt.x - tooltipWidth / 2;
            if (tooltipX < 14) tooltipX = 14;
            if (tooltipX + tooltipWidth > 546) tooltipX = 546 - tooltipWidth;
            const tooltipY = Math.max(12, Math.min(activePt.y - tooltipHeight - 12, 130));

            return (
              <div className="bg-gradient-to-b from-white via-slate-50/50 to-slate-50/90 rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-4 relative overflow-hidden">
                {/* Ambient Soft Luminous Glows */}
                <div className="pointer-events-none absolute -top-16 -right-16 w-56 h-56 bg-rose-500/5 rounded-full blur-3xl" />
                <div className="pointer-events-none absolute -bottom-16 -left-16 w-56 h-56 bg-emerald-500/5 rounded-full blur-3xl" />

                {/* Header with Title, Sensor Status & Quarantine Simulation Toggle */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 shrink-0">
                      <Activity className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base sm:text-lg font-display font-extrabold text-slate-900 leading-tight tracking-tight">
                          Bulk SCC Trajectory
                        </h4>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-[10px] font-bold text-emerald-800 shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Live In-Vat Sensor
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {selectedTimeRange === 'today'
                          ? "Today's shift-by-shift somatic cell telemetry"
                          : selectedTimeRange === '30days'
                          ? '30-day milk quality progression across herds'
                          : selectedTimeRange === 'lactation'
                          ? '6-month lactation somatic cell baseline profile'
                          : 'In-line somatic cell count tracking across bulk milk vat'}
                      </p>
                    </div>
                  </div>

                  {/* Quarantine Simulation Toggle Button */}
                  <button
                    type="button"
                    onClick={() => setShowDivertedComparison(!showDivertedComparison)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 border shadow-2xs cursor-pointer select-none ${
                      showDivertedComparison
                        ? 'bg-emerald-50/90 text-emerald-950 border-emerald-300 ring-2 ring-emerald-400/20'
                        : 'bg-white text-slate-600 border-slate-200/90 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span
                      className={`w-7 h-4 rounded-full transition-colors flex items-center p-0.5 ${
                        showDivertedComparison ? 'bg-emerald-600' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`w-3 h-3 rounded-full bg-white shadow-xs transition-transform transform ${
                          showDivertedComparison ? 'translate-x-3' : 'translate-x-0'
                        }`}
                      />
                    </span>
                    <span className="tracking-tight">Quarantine Simulation (C-024)</span>
                  </button>
                </div>

                {/* 3 Key Metrics Cards */}
                <div className="grid grid-cols-3 gap-2.5 pt-0.5 relative z-10">
                  {/* Metric 1: Current SCC */}
                  <div className="bg-white/90 backdrop-blur-xs p-3 sm:p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-colors">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                      Current Bulk SCC
                    </span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-lg sm:text-xl font-display font-extrabold text-rose-600 font-mono tracking-tight">
                        194k
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">cells/mL</span>
                    </div>
                    <span className="text-[10px] font-bold text-rose-600 flex items-center gap-1 mt-0.5">
                      <TrendingUp className="w-3 h-3 shrink-0" />
                      <span>+38% elevated</span>
                    </span>
                  </div>

                  {/* Metric 2: Quality Cap */}
                  <div className="bg-white/90 backdrop-blur-xs p-3 sm:p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-colors">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                      Quality Cap
                    </span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-lg sm:text-xl font-display font-extrabold text-amber-700 font-mono tracking-tight">
                        200k
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">limit</span>
                    </div>
                    <span className="text-[10px] font-bold text-amber-700 flex items-center gap-1 mt-0.5">
                      <AlertTriangle className="w-3 h-3 shrink-0" />
                      <span>+6k buffer left</span>
                    </span>
                  </div>

                  {/* Metric 3: With Isolation */}
                  <div className="bg-emerald-50/40 backdrop-blur-xs p-3 sm:p-3.5 rounded-2xl border border-emerald-200/80 shadow-2xs hover:border-emerald-300 transition-colors">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                      With Isolation
                    </span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-lg sm:text-xl font-display font-extrabold text-emerald-700 font-mono tracking-tight">
                        128k
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-600/80">cells/mL</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1 mt-0.5">
                      <ShieldCheck className="w-3 h-3 shrink-0" />
                      <span>+₹3.50/L bonus safe</span>
                    </span>
                  </div>
                </div>

                {/* The Chart Canvas Card */}
                <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 shadow-xs relative z-10">
                  {/* Legend Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs pb-3 border-b border-slate-100/90 px-1">
                    <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="w-3.5 h-1 bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 rounded-full" />
                        <span className="font-bold text-slate-700 text-[11px]">Actual Bulk Tank</span>
                      </div>
                      {showDivertedComparison && (
                        <div className="flex items-center gap-2">
                          <span className="w-3.5 h-0.5 border-t-2 border-dashed border-emerald-600" />
                          <span className="font-bold text-emerald-800 text-[11px]">
                            C-024 Quarantined (Safe)
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-rose-700 font-bold text-[11px]">
                      <span className="w-2 h-2 rounded-full bg-rose-600" />
                      <span>Penalty Line: 200,000 cells/mL</span>
                    </div>
                  </div>

                  {/* SVG Graph Canvas */}
                  <div className="w-full relative pt-2">
                    <svg
                      viewBox="0 0 560 215"
                      className="w-full h-auto overflow-visible select-none"
                      preserveAspectRatio="xMidYMid meet"
                    >
                      <defs>
                        {/* Actual Area Gradient */}
                        <linearGradient id="actualAreaGradientV2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.22" />
                          <stop offset="35%" stopColor="#f59e0b" stopOpacity="0.12" />
                          <stop offset="70%" stopColor="#10b981" stopOpacity="0.04" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0.00" />
                        </linearGradient>

                        {/* Quarantined Area Gradient */}
                        <linearGradient id="quarantinedAreaGradientV2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.18" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0.01" />
                        </linearGradient>

                        {/* Stroke Gradient */}
                        <linearGradient id="sccStrokeGradientV2" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="30%" stopColor="#10b981" />
                          <stop offset="55%" stopColor="#f59e0b" />
                          <stop offset="80%" stopColor="#ea580c" />
                          <stop offset="100%" stopColor="#e11d48" />
                        </linearGradient>

                        {/* Penalty Zone Gradient */}
                        <linearGradient id="penaltyZoneGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.08" />
                          <stop offset="100%" stopColor="#ef4444" stopOpacity="0.02" />
                        </linearGradient>

                        {/* Grade A Bonus Zone Gradient */}
                        <linearGradient id="bonusZoneGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.04" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0.01" />
                        </linearGradient>

                        {/* Vertical Guide Cursor Gradient */}
                        <linearGradient id="cursorBeamGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.1" />
                          <stop offset="50%" stopColor="#64748b" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.1" />
                        </linearGradient>

                        {/* Subtle Drop Shadow for Curves */}
                        <filter id="curveSoftGlow" x="-5%" y="-10%" width="110%" height="130%">
                          <feDropShadow dx="0" dy="2.5" stdDeviation="3" floodColor="#f43f5e" floodOpacity="0.22" />
                        </filter>

                        {/* Tooltip Card Filter */}
                        <filter id="tooltipShadow" x="-20%" y="-20%" width="140%" height="140%">
                          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#090d16" floodOpacity="0.30" />
                        </filter>
                      </defs>

                      {/* --- Background Threshold Zones --- */}
                      {/* Penalty Band (>200k, Y: 18 to 51.7) */}
                      <rect x="44" y="18" width="480" height="34" rx="6" fill="url(#penaltyZoneGrad)" />
                      <text x="50" y="32" fill="#be123c" fontSize="8" fontWeight="800" letterSpacing="0.04em">
                        PENALTY ZONE (&gt; 200,000 CELLS/ML)
                      </text>

                      {/* Grade A Bonus Zone (<150k, Y: 103 to 180) */}
                      <rect x="44" y="103" width="480" height="77" rx="6" fill="url(#bonusZoneGrad)" />
                      <text x="50" y="117" fill="#047857" fontSize="8" fontWeight="800" letterSpacing="0.03em">
                        GRADE A BONUS THRESHOLD (&lt; 150,000 CELLS/ML)
                      </text>

                      {/* --- Horizontal Y-Axis Gridlines & Labels --- */}
                      {/* 220k Line */}
                      <line x1="44" y1="31" x2="524" y2="31" stroke="#f1f5f9" strokeWidth="1" />
                      <text x="38" y="34" fill="#94a3b8" fontSize="8.5" fontWeight="600" textAnchor="end" fontFamily="monospace">
                        220k
                      </text>

                      {/* 200k Penalty Limit Line (Y = 51.7) */}
                      <line
                        x1="44"
                        y1="51.7"
                        x2="524"
                        y2="51.7"
                        stroke="#dc2626"
                        strokeWidth="1.8"
                        strokeDasharray="4 3.5"
                      />
                      <text x="38" y="55" fill="#dc2626" fontSize="9" fontWeight="800" textAnchor="end" fontFamily="monospace">
                        200k
                      </text>
                      {/* 200k Tag badge on the right margin */}
                      <g transform="translate(438, 41)">
                        <rect width="82" height="18" rx="9" fill="#dc2626" />
                        <text x="41" y="12.5" fill="#ffffff" fontSize="8" fontWeight="800" textAnchor="middle">
                          200k Penalty Cap
                        </text>
                      </g>

                      {/* 150k Bonus Line (Y = 103) */}
                      <line
                        x1="44"
                        y1="103"
                        x2="524"
                        y2="103"
                        stroke="#10b981"
                        strokeWidth="1.2"
                        strokeDasharray="3 3"
                        opacity="0.8"
                      />
                      <text x="38" y="106" fill="#059669" fontSize="8.5" fontWeight="700" textAnchor="end" fontFamily="monospace">
                        150k
                      </text>

                      {/* 100k Line (Y = 154) */}
                      <line
                        x1="44"
                        y1="154"
                        x2="524"
                        y2="154"
                        stroke="#e2e8f0"
                        strokeWidth="1"
                        strokeDasharray="2 2"
                      />
                      <text x="38" y="157" fill="#94a3b8" fontSize="8.5" fontWeight="600" textAnchor="end" fontFamily="monospace">
                        100k
                      </text>

                      {/* Baseline Axis Line at Y = 180 */}
                      <line x1="44" y1="180" x2="524" y2="180" stroke="#cbd5e1" strokeWidth="1" />

                      {/* --- Vertical Dotted Node Guides --- */}
                      {actualPts.map((pt, i) => (
                        <line
                          key={`v-guide-${i}`}
                          x1={pt.x}
                          y1="24"
                          x2={pt.x}
                          y2="180"
                          stroke={safeIndex === i ? '#94a3b8' : '#f1f5f9'}
                          strokeWidth={safeIndex === i ? '1.5' : '1'}
                          strokeDasharray={safeIndex === i ? '3 3' : '2 3'}
                          opacity={safeIndex === i ? '0.9' : '0.6'}
                        />
                      ))}

                      {/* --- Quarantined Comparison Scenario Area & Curve --- */}
                      {showDivertedComparison && (
                        <g>
                          <path d={quarantinedArea} fill="url(#quarantinedAreaGradientV2)" />
                          <path
                            d={quarantinedPath}
                            fill="none"
                            stroke="#059669"
                            strokeWidth="2.2"
                            strokeDasharray="5 3.5"
                            strokeLinecap="round"
                          />
                          {/* Points on Quarantined curve */}
                          {quarantinedPts.map((pt, i) => (
                            <circle
                              key={`q-pt-${i}`}
                              cx={pt.x}
                              cy={pt.y}
                              r="3.5"
                              fill="#059669"
                              stroke="#ffffff"
                              strokeWidth="1.5"
                            />
                          ))}
                        </g>
                      )}

                      {/* --- Actual Bulk Tank Area & Trajectory Curve --- */}
                      <path d={actualArea} fill="url(#actualAreaGradientV2)" />
                      <path
                        d={actualPath}
                        fill="none"
                        stroke="url(#sccStrokeGradientV2)"
                        strokeWidth="3.2"
                        strokeLinecap="round"
                        filter="url(#curveSoftGlow)"
                      />

                      {/* --- Delta Bracket / Callout between Actual and Quarantined on Active Point --- */}
                      {showDivertedComparison && activeDay.scc !== activeDay.quarantinedScc && (
                        <g>
                          <line
                            x1={activePt.x}
                            y1={activePt.y + 4}
                            x2={activePt.x}
                            y2={activeQPt.y - 4}
                            stroke="#059669"
                            strokeWidth="1.5"
                            strokeDasharray="2 2"
                          />
                          <g transform={`translate(${activePt.x + 8}, ${(activePt.y + activeQPt.y) / 2 - 8})`}>
                            <rect width="66" height="16" rx="8" fill="#047857" />
                            <text x="33" y="11" fill="#ffffff" fontSize="7.5" fontWeight="800" textAnchor="middle">
                              ▼ -{activeDay.scc - activeDay.quarantinedScc}k saved
                            </text>
                          </g>
                        </g>
                      )}

                      {/* --- Selected Day Vertical Indicator Beam --- */}
                      <line
                        x1={activePt.x}
                        y1="20"
                        x2={activePt.x}
                        y2="180"
                        stroke="url(#cursorBeamGrad)"
                        strokeWidth="2"
                        strokeDasharray="4 3"
                      />

                      {/* --- Interactive Data Nodes --- */}
                      {actualPts.map((pt, i) => {
                        const item = currentTrajectory[i];
                        const isSelected = safeIndex === i;
                        const isDanger = item.scc >= 180;
                        const isWarning = item.scc >= 150 && item.scc < 180;
                        const pointColor = isDanger ? '#e11d48' : isWarning ? '#f59e0b' : '#10b981';

                        return (
                          <g
                            key={`actual-pt-${i}`}
                            className="cursor-pointer transition-transform"
                            onClick={() => setSelectedTrajectoryDayIndex(i)}
                          >
                            {/* Expanded Touch Hit Target */}
                            <circle cx={pt.x} cy={pt.y} r="22" fill="transparent" />

                            {/* Active Pulse Animation Ring */}
                            {isSelected && (
                              <circle
                                cx={pt.x}
                                cy={pt.y}
                                r="13"
                                fill={pointColor}
                                opacity="0.3"
                                className="animate-ping"
                              />
                            )}

                            {/* Outer Node Halo */}
                            <circle
                              cx={pt.x}
                              cy={pt.y}
                              r={isSelected ? '7' : '4.5'}
                              fill={pointColor}
                              stroke="#ffffff"
                              strokeWidth={isSelected ? '2.5' : '1.8'}
                            />

                            {/* Center Inner Dot for Active Node */}
                            {isSelected && (
                              <circle cx={pt.x} cy={pt.y} r="2.2" fill="#ffffff" />
                            )}
                          </g>
                        );
                      })}

                      {/* --- Dynamic Floating Tooltip Card in SVG --- */}
                      <g
                        transform={`translate(${tooltipX}, ${tooltipY})`}
                        filter="url(#tooltipShadow)"
                        className="pointer-events-none transition-all duration-200"
                      >
                        <rect
                          width={tooltipWidth}
                          height={tooltipHeight}
                          rx="10"
                          fill="#0f172a"
                          stroke="#334155"
                          strokeWidth="1"
                        />
                        {/* Header: Day & Date */}
                        <text
                          x="10"
                          y="15"
                          fill="#94a3b8"
                          fontSize="8.5"
                          fontWeight="700"
                          letterSpacing="0.02em"
                        >
                          {activeDay.day} · {activeDay.date}
                        </text>

                        {/* Value: SCC Count */}
                        <text
                          x="10"
                          y="29"
                          fill="#ffffff"
                          fontSize="11.5"
                          fontWeight="800"
                          fontFamily="monospace"
                        >
                          {activeDay.scc}k cells/mL
                        </text>

                        {/* Status / Bonus indicator */}
                        <text
                          x="10"
                          y="40"
                          fill={activeColor}
                          fontSize="8"
                          fontWeight="700"
                        >
                          {activeDay.bonus}
                        </text>
                      </g>
                    </svg>
                  </div>

                  {/* Interactive Scrubber / Day Selector Strip */}
                  <div className={`grid gap-1 pt-3 border-t border-slate-100 ${
                    totalPts === 7 ? 'grid-cols-7' : totalPts === 5 ? 'grid-cols-5' : totalPts === 6 ? 'grid-cols-6' : 'grid-cols-4'
                  }`}>
                    {currentTrajectory.map((d, idx) => {
                      const isSelected = safeIndex === idx;
                      const isDanger = d.scc >= 180;
                      const isWarning = d.scc >= 150 && d.scc < 180;
                      return (
                        <button
                          key={`${d.day}-${idx}`}
                          type="button"
                          onClick={() => setSelectedTrajectoryDayIndex(idx)}
                          className={`py-2 px-1 rounded-xl text-center transition-all flex flex-col items-center justify-center cursor-pointer select-none ${
                            isSelected
                              ? 'bg-slate-900 text-white shadow-sm ring-2 ring-slate-900/20'
                              : 'bg-slate-50/90 hover:bg-slate-100 text-slate-600'
                          }`}
                        >
                          <span
                            className={`text-[10px] sm:text-xs font-extrabold block tracking-tight ${
                              isSelected ? 'text-white' : 'text-slate-800'
                            }`}
                          >
                            {d.day}
                          </span>
                          <span
                            className={`text-[9px] block font-mono ${
                              isSelected ? 'text-slate-300 font-bold' : 'text-slate-400'
                            }`}
                          >
                            {d.scc}k
                          </span>
                          <span
                            className={`w-1.5 h-1.5 rounded-full mt-1 ${
                              isDanger
                                ? 'bg-rose-500'
                                : isWarning
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Day Inspector Telemetry Details Card */}
                <div
                  className={`p-4 rounded-2xl border transition-all ${
                    activeDay.scc >= 180
                      ? 'bg-rose-50/40 border-rose-200'
                      : activeDay.scc >= 150
                      ? 'bg-amber-50/40 border-amber-200'
                      : 'bg-emerald-50/30 border-emerald-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          {activeDay.day === 'Today' || activeDay.day === 'Now'
                            ? `${activeDay.day} (${activeDay.date})`
                            : `${activeDay.day}, ${activeDay.date}`}
                        </span>
                        <span
                          className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-2xs ${
                            activeDay.scc >= 180
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : activeDay.scc >= 150
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {activeDay.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed font-normal">
                        {activeDay.note}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-base sm:text-lg font-display font-extrabold text-slate-900 font-mono block leading-tight">
                        {activeDay.scc},000
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 block">cells/mL</span>
                    </div>
                  </div>

                  {/* Progress vs Quality Cap Meter */}
                  <div className="mt-3 pt-2.5 border-t border-slate-200/60">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 mb-1">
                      <span>Proximity to 200k Penalty Limit</span>
                      <span
                        className={
                          activeDay.scc >= 180
                            ? 'text-rose-700 font-extrabold'
                            : 'text-emerald-700 font-extrabold'
                        }
                      >
                        {Math.round((activeDay.scc / 200) * 100)}% of Limit
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-200/80 rounded-full overflow-hidden flex">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          activeDay.scc >= 180
                            ? 'bg-gradient-to-r from-amber-500 to-rose-600'
                            : activeDay.scc >= 150
                            ? 'bg-gradient-to-r from-emerald-500 to-amber-500'
                            : 'bg-emerald-600'
                        }`}
                        style={{ width: `${Math.min(100, (activeDay.scc / 200) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Action Link for Today's Safeguard */}
                  {(activeDay.day === 'Today' || activeDay.day === 'Now') && (
                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                      <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Isolating Lakshmi (C-024) secures +₹3.50/L bonus</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (!safeguards.divert_c024) {
                            toggleSafeguard('divert_c024');
                          } else {
                            onShowSnackbar('Lakshmi milk isolation safeguard is active');
                          }
                        }}
                        className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                          safeguards.divert_c024
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-900 text-white hover:bg-slate-800 shadow-xs'
                        }`}
                      >
                        {safeguards.divert_c024 ? '✓ Isolation Active' : 'Activate Isolation'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* 4 Telemetry Metrics Grid (2x2) */}
          <div className="grid grid-cols-2 gap-3">
            {/* 1. Avg Conductivity */}
            <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">Avg Conductivity</span>
                <div className="w-6 h-6 rounded-full border border-emerald-600/30 flex items-center justify-center text-emerald-700">
                  <Activity className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-display font-extrabold text-slate-900 block leading-tight">
                  5.1 <span className="text-xs font-normal text-slate-500">mS/cm</span>
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  4.8–5.2 Normal Range
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full" style={{ width: '58%' }} />
              </div>
            </div>

            {/* 2. Barn THI Index */}
            <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">Barn THI Index</span>
                <Thermometer className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <span className="text-2xl font-display font-extrabold text-slate-900 block leading-tight">
                  72 <span className="text-xs font-normal text-slate-500">THI</span>
                </span>
                <span className="text-[11px] text-amber-700 font-medium">
                  Mild Heat Stress
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '72%' }} />
              </div>
            </div>

            {/* 3. Line Vacuum */}
            <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">Line Vacuum</span>
                <Gauge className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <span className="text-2xl font-display font-extrabold text-slate-900 block leading-tight">
                  48 <span className="text-xs font-normal text-slate-500">kPa</span>
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  Pulsation Balanced
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full" style={{ width: '65%' }} />
              </div>
            </div>

            {/* 4. Parlour Hygiene */}
            <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">Parlour Hygiene</span>
                <Sparkles className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <span className="text-2xl font-display font-extrabold text-slate-900 block leading-tight">
                  94%
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  Sanitized 05:30 AM
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full" style={{ width: '94%' }} />
              </div>
            </div>
          </div>

          {/* Shift Protocol Safeguards Checklist */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <CheckCheck className="w-4 h-4 text-emerald-700" />
                </div>
                <h4 className="text-sm sm:text-base font-display font-extrabold text-slate-900">
                  Shift Protocol Safeguards
                </h4>
              </div>
              <span className="text-xs text-slate-600 font-medium">
                {completedSafeguardsCount} of 3 Done
              </span>
            </div>

            <div className="space-y-2.5">
              {/* Item 1: Milk Isolation & Quarantine */}
              <div
                id="safeguard-divert-c024"
                onClick={() => toggleSafeguard('divert_c024')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                  safeguards.divert_c024
                    ? 'bg-emerald-50/80 border-emerald-300 shadow-2xs'
                    : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/60 shadow-2xs'
                }`}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSafeguard('divert_c024');
                  }}
                  className={`w-5 h-5 rounded-lg mt-0.5 shrink-0 flex items-center justify-center transition-all cursor-pointer ${
                    safeguards.divert_c024
                      ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-500/20'
                      : 'border-2 border-slate-300 hover:border-emerald-500 bg-white'
                  }`}
                  aria-label="Toggle milk isolation safeguard"
                >
                  {safeguards.divert_c024 && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </button>
                <div className="flex-1">
                  <span className={`text-xs sm:text-sm font-bold block leading-snug ${safeguards.divert_c024 ? 'text-emerald-950 font-semibold' : 'text-slate-900'}`}>
                    Divert milk from Lakshmi (C-024, Stall 4) into separate isolation can
                  </span>
                  <span className="text-[11px] text-slate-500 font-normal block mt-0.5">
                    Quarantine Left-Rear high-SCC milk (450k cells/mL) to protect bulk tank Grade A payout
                  </span>
                </div>
              </div>

              {/* Item 2: Milking Order Protocol */}
              <div
                id="safeguard-milking-order"
                onClick={() => toggleSafeguard('milking_order')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                  safeguards.milking_order
                    ? 'bg-emerald-50/80 border-emerald-300 shadow-2xs'
                    : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/60 shadow-2xs'
                }`}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSafeguard('milking_order');
                  }}
                  className={`w-5 h-5 rounded-lg mt-0.5 shrink-0 flex items-center justify-center transition-all cursor-pointer ${
                    safeguards.milking_order
                      ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-500/20'
                      : 'border-2 border-slate-300 hover:border-emerald-500 bg-white'
                  }`}
                  aria-label="Toggle milking order safeguard"
                >
                  {safeguards.milking_order && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </button>
                <div className="flex-1">
                  <span className={`text-xs sm:text-sm font-bold block leading-snug ${safeguards.milking_order ? 'text-emerald-950 font-semibold' : 'text-slate-900'}`}>
                    Enforce milking order: Milk healthy cows first, Lakshmi (C-024) strictly last
                  </span>
                  <span className="text-[11px] text-slate-500 font-normal block mt-0.5">
                    Prevents contagious mastitis pathogens from spreading across milking equipment &amp; stalls
                  </span>
                </div>
              </div>

              {/* Item 3: Post-Milking Teat Antiseptic Barrier Dip */}
              <div
                id="safeguard-iodine-dip"
                onClick={() => toggleSafeguard('iodine_dip')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                  safeguards.iodine_dip
                    ? 'bg-emerald-50/80 border-emerald-300 shadow-2xs'
                    : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/60 shadow-2xs'
                }`}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSafeguard('iodine_dip');
                  }}
                  className={`w-5 h-5 rounded-lg mt-0.5 shrink-0 flex items-center justify-center transition-all cursor-pointer ${
                    safeguards.iodine_dip
                      ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-500/20'
                      : 'border-2 border-slate-300 hover:border-emerald-500 bg-white'
                  }`}
                  aria-label="Toggle iodine dip safeguard"
                >
                  {safeguards.iodine_dip && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </button>
                <div className="flex-1">
                  <span className={`text-xs sm:text-sm font-bold block leading-snug ${safeguards.iodine_dip ? 'text-emerald-950 font-semibold' : 'text-slate-900'}`}>
                    Apply post-milking 1% iodine barrier dip on all cattle (Stalls 1–8)
                  </span>
                  <span className="text-[11px] text-slate-500 font-normal block mt-0.5">
                    Disinfects teats and seals open sphincter canals for 30 mins to block environmental bacteria
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Download Dairy Co-op & Vet Report Button */}
          <button
            type="button"
            onClick={() => onShowSnackbar(`Downloaded Dairy Co-op & Vet Report (PDF) for ${FARMER_PROFILE.farmName}`)}
            className="w-full bg-emerald-800 hover:bg-emerald-900 text-white rounded-2xl py-3 px-4 flex items-center justify-center gap-2 font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
          >
            <div className="w-5 h-5 rounded border border-white/40 flex items-center justify-center text-[10px] font-black uppercase">
              PDF
            </div>
            <span>Download Dairy Co-op &amp; Vet Report</span>
          </button>
        </div>
      )}

      {/* FARM MAP (GIS: top-down barn layout, stall blocks, cow risk pins) */}
      {activeSub === 'farm_map' && (
        <div className="space-y-3.5 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-display font-extrabold text-slate-900 flex items-center gap-1.5 tracking-tight">
                  <Layers className="w-4 h-4 text-emerald-800" />
                  <span>Saraswati Barn Layout</span>
                </h2>
                <p className="text-xs text-slate-500 font-normal">
                  Tap any stall to see cow details
                </p>
              </div>
              <span className="text-[10px] font-bold text-slate-600 font-mono bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                Shed A (Stalls 1–8)
              </span>
            </div>

            {/* Barn Legend */}
            <div className="flex items-center justify-between text-xs px-1 text-slate-600 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                <span className="font-sans">Healthy</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#677054]" />
                <span className="font-sans">Watch</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                <span className="font-sans font-bold text-rose-800">Sick (Stall 4)</span>
              </span>
            </div>

            {/* Top-Down Barn Stall Grid */}
            <div className="p-3 bg-slate-100/80 rounded-2xl border border-slate-200">
              <div className="text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider text-center font-display">
                Milking & Feeding Alley
              </div>

              {/* 8 Stalls represented across 2 rows */}
              <div className="grid grid-cols-4 gap-2">
                {BARN_STALLS.map((s) => {
                  const isHighlighted = s.stallNum === selectedStall;
                  const liveCow = activeHerdCows.find((c) => c.id === s.cowId || c.stall === s.stallNum);
                  const liveRisk = liveCow?.riskLevel ?? s.risk;
                  const liveScc = liveCow?.scc;
                  const liveTemp = liveCow?.temperature;
                  const isHighRisk = !!liveCow && (Number(liveScc) > 400 || liveRisk === 'High');
                  const isModerateRisk =
                    !!liveCow &&
                    !isHighRisk &&
                    (liveRisk === 'Moderate' ||
                      liveRisk === 'Watch' ||
                      (Number(liveScc) >= 200 && Number(liveScc) <= 400));

                  return (
                    <button
                      key={s.stallNum}
                      id={`stall-gis-button-${s.stallNum}`}
                      type="button"
                      onClick={() => {
                        setSelectedStall(s.stallNum);
                        if (liveCow) onOpenCowDiagnostic(liveCow.id);
                      }}
                      title={liveCow ? `${liveCow.name} (${liveCow.id}) — SCC ${liveScc}k, ${liveTemp}C. Tap to open diagnostics.` : `${s.cowName} (${s.cowId})`}
                      className={`relative rounded-xl flex flex-col items-center justify-center gap-0.5 p-1.5 text-[10px] font-mono font-bold transition-all border cursor-pointer min-h-[86px] ${
                        isHighRisk
                          ? 'bg-rose-100 border-rose-400 text-rose-950 shadow-xs animate-pulse'
                          : isModerateRisk
                          ? 'bg-[#EAEBE4] border-[#B8BEA9] text-[#3D4233]'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-400'
                      } ${
                        isHighlighted
                          ? 'ring-3 ring-emerald-600 scale-105 z-10 shadow-md'
                          : ''
                      }`}
                    >
                      <span>S-{s.stallNum}</span>
                      <span
                        className={`w-2 h-2 rounded-full mt-0.5 ${
                          isHighRisk
                            ? 'bg-rose-600 animate-ping'
                            : isModerateRisk
                            ? 'bg-[#677054]'
                            : 'bg-emerald-600'
                        }`}
                      />
                      <span className="text-[9px] font-sans font-extrabold text-slate-800 truncate max-w-full">
                        {liveCow ? liveCow.name : s.cowName}
                      </span>
                      {liveCow && (
                        <span className={`text-[9px] font-mono font-semibold ${isHighRisk ? 'text-rose-700' : 'text-slate-500'}`}>
                          {liveScc}k · {liveTemp}°C
                        </span>
                      )}
                      {isHighRisk && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-600 rounded-full ring-1 ring-white" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Stall Inspector Card */}
            {currentStallData && (() => {
              const matchingCow = activeHerdCows.find((c) => c.id === currentStallData.cowId);
              const stallCowRfid = matchingCow?.rfid || `982 0004 1289 10${currentStallData.stallNum.toString().padStart(2, '0')}`;
              return (
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-display font-extrabold text-slate-900 tracking-tight">
                        Stall {currentStallData.stallNum} ({currentStallData.shed})
                      </span>
                      <RiskBadge risk={currentStallData.risk} size="sm" showPercentage={false} />
                    </div>
                    <span className="text-xs text-slate-600 block mt-0.5 font-normal">
                      Cow: <span className="font-semibold text-slate-900">{currentStallData.cowName}</span> <span className="font-mono text-[11px] text-slate-500">({currentStallData.cowId})</span>
                      <span className="font-mono text-[10px] text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 ml-1.5 inline-block">
                        RFID: {stallCowRfid}
                      </span>
                    </span>
                  </div>

                  <button
                    id="inspect-cow-from-stall-button"
                    type="button"
                    onClick={() => onOpenCowDiagnostic(currentStallData.cowId)}
                    className="py-1.5 px-3 bg-emerald-800 text-white text-xs font-semibold rounded-xl hover:bg-emerald-900 shadow-xs flex items-center gap-1 cursor-pointer font-sans shrink-0"
                  >
                    <span>View Cow</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* 1. RECOMMENDATIONS (Farmer-Friendly Action Plan & Checklist) */}
      {(activeSub === 'recommendations' || activeSub === 'regional') && (
        <div className="space-y-3.5 animate-in fade-in duration-150">
          {/* Main White Action Plan Container */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
            {/* Header: Eyebrow + Cow Selector + Title */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold tracking-wider text-emerald-700 uppercase flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>FARMER ACTION CHECKLIST</span>
                </span>

                {/* Cow Selector Dropdown */}
                <div className="relative">
                  <button
                    id="recommendations-cow-selector-button"
                    type="button"
                    onClick={() => setIsCowPickerOpen(!isCowPickerOpen)}
                    className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-full text-xs font-semibold text-slate-700 transition-all cursor-pointer shadow-2xs"
                  >
                    <span className="text-slate-500 text-[11px] font-normal">For:</span>
                    <span className="font-bold text-slate-900">{selectedCow.name}</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isCowPickerOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isCowPickerOpen && (
                    <div className="absolute right-0 top-full mt-1.5 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 z-30 space-y-1">
                      <div className="px-2.5 py-1 text-[10px] font-mono uppercase text-slate-400 tracking-wider">
                        Select Dairy Cow
                      </div>
                      {activeHerdCows.map((cow) => (
                        <button
                          key={cow.id}
                          id={`select-rec-cow-${cow.id}`}
                          type="button"
                          onClick={() => {
                            setSelectedCowId(cow.id);
                            setIsCowPickerOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-all text-left cursor-pointer ${
                            selectedCowId === cow.id
                              ? 'bg-emerald-50 text-emerald-900 border border-emerald-300 font-bold'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-900">{cow.name}</span>
                            <span className="text-[10px] text-slate-500 font-sans">
                              Stall {cow.stall} · {cow.breed}
                            </span>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              cow.riskLevel === 'High'
                                ? 'bg-rose-100 text-rose-800'
                                : cow.riskLevel === 'Moderate' || cow.riskLevel === 'Watch'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {cow.riskLevel}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Title & Reset */}
              <div className="pt-0.5 flex items-center justify-between">
                <h2 className="text-xl font-display font-extrabold text-slate-900 tracking-tight">
                  Farmer-Friendly Action Plan
                </h2>
                <button
                  type="button"
                  onClick={handleResetTasks}
                  title="Clear all ticks"
                  className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors px-2 py-0.5 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3 text-slate-400" />
                  <span>Reset Ticks</span>
                </button>
              </div>
            </div>

            {/* 4 Category Tabs (Milking..., Nutrition &..., Biosecurity..., Veterinary...) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    id={`rec-category-tab-${cat.id}`}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={`p-2.5 rounded-2xl flex items-center gap-2 transition-all cursor-pointer border text-left ${
                      isActive
                        ? `${cat.activeBg} ${cat.activeBorder}`
                        : `${cat.inactiveBg}`
                    }`}
                  >
                    <span className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${cat.iconBg}`}>
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className="text-xs font-bold tracking-tight truncate leading-snug">
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Protocol Card with Checklist Items */}
            <div className="bg-slate-50/75 rounded-2xl p-4 sm:p-5 border border-slate-200/90 space-y-3.5">
              {/* Protocol Header */}
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                <div className="flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center ${currentCategoryData.iconBg}`}>
                    {React.createElement(currentCategoryData.icon, { className: 'w-3.5 h-3.5' })}
                  </span>
                  <h3 className="text-sm font-display font-bold text-slate-900 tracking-tight">
                    {currentCategoryData.fullTitle}
                  </h3>
                </div>

                {/* Progress Pill */}
                <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-white text-slate-700 border border-slate-200 shadow-2xs">
                  <strong className={completedInCurrent === totalTasks && totalTasks > 0 ? 'text-emerald-700' : 'text-sky-700'}>
                    {completedInCurrent}
                  </strong>{' '}
                  / {totalTasks} Done
                </span>
              </div>

              {/* Tasks List: If farmer put tick ONLY then it marks */}
              <div className="space-y-2.5">
                {currentCategoryData.tasks.map((task, idx) => {
                  const isDone = !!completedTaskIds[task.id];
                  return (
                    <div
                      key={task.id}
                      id={`rec-task-${task.id}`}
                      onClick={() => toggleTask(task.id)}
                      className={`flex items-start gap-3 p-3.5 rounded-xl transition-all cursor-pointer border ${
                        isDone
                          ? 'bg-sky-50/50 border-sky-200 text-slate-600'
                          : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/50 text-slate-800 shadow-2xs'
                      }`}
                    >
                      {/* Interactive Circle Checkbox */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTask(task.id);
                        }}
                        className={`w-5 h-5 rounded-full mt-0.5 shrink-0 flex items-center justify-center transition-all ${
                          isDone
                            ? 'bg-sky-600 text-white shadow-xs ring-2 ring-sky-500/20'
                            : 'border-2 border-slate-300 hover:border-sky-500 bg-white'
                        }`}
                        aria-label={`Mark task ${idx + 1} complete`}
                      >
                        {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>

                      <div className="flex-1 text-xs sm:text-sm leading-relaxed font-normal select-none">
                        <span className={isDone ? 'text-sky-950 font-semibold' : 'text-slate-800'}>
                          {task.text}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Milk Withholding Period Warning Box */}
            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex items-start gap-3.5 shadow-2xs">
              <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5 flex-1">
                <h4 className="text-sm font-display font-extrabold text-amber-950 tracking-tight">
                  Do Not Sell Milk for 4 Days
                </h4>
                <p className="text-xs text-amber-900/90 font-normal leading-relaxed">
                  Do not sell or mix milk for 4 days after medicine injection. The dairy will reject milk with medicine residue.
                </p>
              </div>
            </div>

            {/* Actions for Selected Cow */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                id="rec-ask-ai-button"
                type="button"
                onClick={() =>
                  onOpenAskAi(
                    `How should I implement the ${currentCategoryData.fullTitle} for my cow ${selectedCow.name} (Stall ${selectedCow.stall}, ${selectedCow.breed})?`
                  )
                }
                className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200/80 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-200 cursor-pointer transition-all shadow-2xs"
              >
                <Bot className="w-3.5 h-3.5 text-emerald-700" />
                <span>Ask AI Assistant</span>
              </button>

              <button
                id="rec-view-cow-button"
                type="button"
                onClick={() => onOpenCowDiagnostic(selectedCow.id)}
                className="py-2.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-all"
              >
                <span>View {selectedCow.name}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
