import {
  Award,
  Bell,
  Building2,
  CheckCircle2,
  Database,
  Headphones,
  HeartPulse,
  Info,
  Lock,
  LogOut,
  PawPrint,
  Pencil,
  Phone,
  Shield,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import React, { useState } from 'react';
import { FARMER_PROFILE, TRANSLATIONS } from '../data/mockData';
import { LanguageCode } from '../types';

interface Screen8ProfileProps {
  farmerName?: string;
  farmName?: string;
  location?: string;
  herdStrength?: string;
  currentLang: LanguageCode;
  onSelectLang?: (lang: LanguageCode) => void;
  onLogout: () => void;
  onShowSnackbar: (msg: string) => void;
  onOpenSetup?: () => void;
}

export const Screen8Profile: React.FC<Screen8ProfileProps> = ({
  farmerName = FARMER_PROFILE.name || 'Murugan Natarajan',
  farmName = FARMER_PROFILE.farmName || 'Velan Dairy & Cattle Farm',
  location = FARMER_PROFILE.location || 'Salem, Tamil Nadu',
  herdStrength = `${FARMER_PROFILE.totalCattle || 24}`,
  currentLang,
  onLogout,
  onShowSnackbar,
  onOpenSetup,
}) => {
  const t = TRANSLATIONS[currentLang];

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleNotificationToggle = () => {
    const next = !notificationsEnabled;
    setNotificationsEnabled(next);
    onShowSnackbar(next ? 'Phone alerts turned on' : 'Phone alerts turned off');
  };

  return (
    <div id="screen-8-profile" className="space-y-4 pb-24">
      {/* 1. MURUGAN NATARAJAN PROFILE CARD */}
      <section
        id="profile-section-1-farmer"
        className="rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-[#024a3a] via-[#024032] to-[#013327] border border-emerald-700/60 shadow-md text-white"
      >
        <div className="flex items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
            {/* Farmer Avatar */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#095343]/80 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-inner">
              <span className="text-3xl sm:text-4xl leading-none select-none" role="img" aria-label={farmerName}>
                👨‍🌾
              </span>
            </div>

            {/* Farmer Info */}
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-display font-extrabold text-white tracking-tight leading-tight truncate">
                {farmerName}
              </h1>
              <p className="text-xs sm:text-sm font-medium text-emerald-100/90 mt-0.5 tracking-wide">
                +91 94432 87610
              </p>
              <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-normal mt-1">
                <Building2 className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                <span className="truncate">{farmName}</span>
              </div>
            </div>
          </div>

          {/* Edit Profile Button */}
          <button
            id="edit-profile-btn"
            type="button"
            onClick={onOpenSetup}
            aria-label="Edit Profile"
            className="w-10 h-10 rounded-2xl bg-[#085040]/90 hover:bg-[#0c5d4b] border border-emerald-500/30 flex items-center justify-center text-emerald-100 hover:text-white transition-all shrink-0 cursor-pointer shadow-xs"
          >
            <Pencil className="w-4 h-4" />
          </button>
        </div>

        {/* Divider */}
        <div className="h-px bg-emerald-700/50 my-3.5 sm:my-4" />

        {/* Bottom Metadata */}
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="text-emerald-200/95 font-medium font-sans">
            Reg ID: <span className="font-mono">NDDB-TN-SLM-8492</span>
          </span>
          <span className="font-bold font-display text-white tracking-tight">
            {herdStrength} Cows Herd
          </span>
        </div>
      </section>

      {/* 2. FARM DETAILS */}
      <section id="profile-section-2-farm" className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <PawPrint className="w-4 h-4 text-emerald-800" />
            <h2 className="text-sm font-bold text-slate-900">
              {farmName}
            </h2>
          </div>
          <span className="text-xs font-mono font-semibold text-slate-500">
            {FARMER_PROFILE.dairyId}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-[10px] text-slate-500 font-semibold uppercase block">{t.totalCattle || 'Total Cows'}</span>
            <span className="text-base font-extrabold text-slate-900">
              {herdStrength} {t.cowsCount || 'Cows'}
            </span>
            <span className="text-[10px] text-slate-500 font-normal block mt-0.5">
              {Math.round((parseInt(herdStrength) || 24) * 0.75)} {t.milkingLabel || 'In Milk'} · {(parseInt(herdStrength) || 24) - Math.round((parseInt(herdStrength) || 24) * 0.75)} {t.restingLabel || 'Resting'}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-[10px] text-slate-500 font-semibold uppercase block">{t.bulkTankMilkCells || 'Bulk Tank Milk Cells'}</span>
            <span className="text-base font-extrabold text-slate-900 font-mono">
              {FARMER_PROFILE.bulkTankScc}k
            </span>
            <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
              {FARMER_PROFILE.milkQualityGrade}
            </span>
          </div>
        </div>

        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 text-xs font-normal">
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Milking Shed:</span>
            <span className="font-semibold text-slate-800">DeLaval 2×6 Shed</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Smart Collar Tags:</span>
            <span className="font-semibold text-emerald-800">{FARMER_PROFILE.totalCattle} / {FARMER_PROFILE.totalCattle} Working</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Local Animal Hospital:</span>
            <span className="font-semibold text-slate-800">Karnal Sector 14 Mobile Polyclinic</span>
          </div>
        </div>
      </section>

      {/* 3. APP SETTINGS */}
      <section id="profile-section-3-settings" className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
        <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
          {t.appSettingsTitle || 'App Settings'}
        </h2>

        {/* Push Alert Notifications */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-800 block">{t.phoneAlerts || 'Phone Alerts'}</span>
              <span className="text-[11px] text-slate-500 font-normal">Alerts for sick cows and weather heat</span>
            </div>
          </div>
          <button
            id="toggle-notifications"
            type="button"
            onClick={handleNotificationToggle}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
              notificationsEnabled ? 'bg-emerald-800' : 'bg-slate-300'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform shadow-xs ${
                notificationsEnabled ? 'right-0.5' : 'left-0.5'
              }`}
            />
          </button>
        </div>

        {/* Offline Sync Status */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-800 block">{t.offlineSync || 'Works Without Internet'}</span>
              <span className="text-[11px] text-emerald-800 font-medium">
                Saved on phone · All cows ready
              </span>
            </div>
          </div>
          <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
            Ready
          </span>
        </div>
      </section>

      {/* 4. ABOUT AAROGYA – Enhanced Premium AgriTech Section */}
      <section
        id="profile-section-4-about"
        className="rounded-3xl border border-slate-200/90 bg-white shadow-sm overflow-hidden"
      >
        {/* Cinematic Brand Header Banner */}
        <div className="relative p-5 sm:p-6 bg-gradient-to-br from-[#023e31] via-[#034d3d] to-[#012d23] text-white overflow-hidden">
          {/* Subtle Ambient Glows */}
          <div className="absolute -top-12 -right-12 w-44 h-44 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-teal-500/15 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              {/* Premium Glass Emblem */}
              <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600/40 to-teal-400/20 backdrop-blur-md border border-emerald-400/40 flex items-center justify-center shadow-lg shrink-0">
                <ShieldCheck className="w-8 h-8 text-emerald-200 drop-shadow-sm" />
                <Sparkles className="w-3.5 h-3.5 text-amber-300 absolute -top-1 -right-1 animate-pulse" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-display font-extrabold tracking-tight text-white">
                    AAROGYA
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/25 border border-emerald-400/30 text-emerald-200 text-[10px] font-mono font-bold tracking-wide">
                    PRO v2.4.1
                  </span>
                </div>
                <p className="text-xs text-emerald-100/90 font-medium mt-0.5">
                  Bovine Health & Mastitis Guard Platform
                </p>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-emerald-300/90 font-mono">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Build 8204-Native · Dairy AI Active</span>
                </div>
              </div>
            </div>

            {/* Accreditation Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-white text-xs font-semibold self-start sm:self-center shadow-xs">
              <Award className="w-4 h-4 text-amber-300 shrink-0" />
              <span className="text-[11px] sm:text-xs">NDRI & DAHD Certified</span>
            </div>
          </div>
        </div>

        {/* Core Pillars / Mission Grid */}
        <div className="p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Pillar 1 */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase tracking-wider">
                  EARLY DETECTION
                </span>
                <HeartPulse className="w-4 h-4 text-emerald-700" />
              </div>
              <div className="text-xs font-bold text-slate-900 leading-snug">
                7–14 Days Early Mastitis Warning
              </div>
              <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                Flags subclinical udder changes before irreversible milk yield loss.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-100 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold text-amber-800 uppercase tracking-wider">
                  TELEMETRY
                </span>
                <ShieldCheck className="w-4 h-4 text-amber-700" />
              </div>
              <div className="text-xs font-bold text-slate-900 leading-snug">
                Milk Temp & SCC Monitoring
              </div>
              <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                In-line 38.0–38.8°C milk temperature tracking and teat conductivity.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-100 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold text-teal-800 uppercase tracking-wider">
                  VET NETWORK
                </span>
                <CheckCircle2 className="w-4 h-4 text-teal-700" />
              </div>
              <div className="text-xs font-bold text-slate-900 leading-snug">
                Mobile Van Dispatch
              </div>
              <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                Direct SMS & GIS coordination with local veterinary polyclinics.
              </p>
            </div>
          </div>

          {/* Easy-to-Understand Description, Certified Standards & Kisan Helpline */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3.5">
            {/* Header: Partnership & Trust Badges */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200/70">
              <div className="flex items-center gap-1.5">
                <span className="text-base" role="img" aria-label="India flag / National emblem">🏛️</span>
                <span className="text-xs font-bold text-slate-800">
                  Government & Scientific Dairy Partnership
                </span>
              </div>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/70 border border-emerald-300 px-2 py-0.5 rounded-full">
                Simple Farmer Guide
              </span>
            </div>

            {/* Official Mandate Statement */}
            <div className="p-3 bg-white rounded-xl border border-slate-200/90 text-xs text-slate-700 leading-relaxed space-y-1 shadow-2xs">
              <p className="font-semibold text-slate-900">
                AAROGYA is co-developed in partnership with the{' '}
                <strong className="text-emerald-950 font-bold underline decoration-emerald-500/40">
                  National Dairy Research Institute (NDRI, Karnal)
                </strong>{' '}
                and the{' '}
                <strong className="text-emerald-950 font-bold underline decoration-emerald-500/40">
                  Department of Animal Husbandry & Dairying
                </strong>.
              </p>
              <p className="text-[11px] text-slate-600">
                Engineered to safeguard smallholder and commercial dairy herds against bovine mastitis, elevate raw milk hygiene, and secure farm profitability.
              </p>
            </div>

            {/* 3 Plain-Language Benefits: Why This Matters to You */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                What this means for your cows & daily earnings:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                {/* 1. Mastitis Protection */}
                <div className="p-2.5 bg-emerald-50/70 rounded-xl border border-emerald-100 flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-950">
                    <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Early Mastitis Guard</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                    Warns you days before the udder swells so cows recover fast without milk loss.
                  </p>
                </div>

                {/* 2. Raw Milk Hygiene */}
                <div className="p-2.5 bg-sky-50/70 rounded-xl border border-sky-100 flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-sky-950">
                    <CheckCircle2 className="w-4 h-4 text-sky-700 shrink-0" />
                    <span>Clean Milk & Best Rate</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                    Keeps milk cell count (SCC) low so your milk passes dairy tests at premium price.
                  </p>
                </div>

                {/* 3. Farm Profitability */}
                <div className="p-2.5 bg-amber-50/70 rounded-xl border border-amber-100 flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-amber-950">
                    <Award className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>Protected Farm Income</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                    Stops sudden milk drop and heavy vet treatment costs for small and big herds.
                  </p>
                </div>
              </div>
            </div>

            {/* Encrypted Telemetry & ISO/IDF Standard Explanation */}
            <div className="p-3 bg-white rounded-xl border border-slate-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs shadow-2xs">
              <div className="flex items-start sm:items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-xs flex items-center gap-1">
                    <span>Encrypted Farmer Telemetry</span>
                    <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                      Private
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-normal">
                    Certified to <strong>ISO/IDF 13366 Standard</strong> for accurate milk somatic cell counting. Your cattle records stay 100% private to your farm.
                  </p>
                </div>
              </div>
            </div>

            {/* Kisan Helpline: 1800-180-1551 (Direct Tap-to-Call) */}
            <div className="p-3 bg-gradient-to-r from-emerald-800 to-teal-900 rounded-xl text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center shrink-0">
                  <Headphones className="w-5 h-5 text-emerald-200" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white tracking-wide">
                      Kisan Helpline (Toll-Free)
                    </span>
                    <span className="text-[9px] font-semibold bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 px-1.5 py-0.2 rounded">
                      Govt Support
                    </span>
                  </div>
                  <span className="text-sm font-mono font-extrabold text-amber-300 tracking-wider block">
                    1800-180-1551
                  </span>
                  <span className="text-[10px] text-emerald-100/90 block">
                    Free veterinary & cattle health advice available across India
                  </span>
                </div>
              </div>

              <a
                href="tel:18001801551"
                onClick={() => onShowSnackbar('Calling Kisan Toll-Free Helpline: 1800-180-1551')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-emerald-50 active:scale-98 text-emerald-950 font-bold text-xs shadow-xs transition-all cursor-pointer self-stretch sm:self-auto shrink-0"
                title="Call Kisan Helpline Toll-Free"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-700" />
                <span>Call 1800-180-1551</span>
              </a>
            </div>
          </div>

          {/* Logout / Switch Account Button */}
          <button
            id="btn-logout"
            type="button"
            onClick={onLogout}
            className="w-full py-3.5 px-4 bg-rose-50 hover:bg-rose-100 active:scale-99 text-rose-800 border border-rose-200/90 text-xs font-bold rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
          >
            <LogOut className="w-4 h-4 text-rose-600" />
            <span>{t.logout || 'Log Out / Change Account'}</span>
          </button>
        </div>
      </section>
    </div>
  );
};
