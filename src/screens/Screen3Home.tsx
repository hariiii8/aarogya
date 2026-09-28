import {
  Activity,
  AlertCircle,
  ArrowRight,
  Bell,
  Bot,
  Building2,
  Check,
  CheckCheck,
  CheckCircle2,
  ChevronRight,
  Clock,
  Droplet,
  Eye,
  MapPin,
  MessageSquare,
  Moon,
  PawPrint,
  Pencil,
  PhoneCall,
  Radio,
  Send,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Sun,
  Sunrise,
  Sunset,
  Thermometer,
  Wheat,
  Zap
} from 'lucide-react';
import React, { useState, useEffect, useMemo } from 'react';
import { RiskBadge } from '../components/RiskBadge';
import { buildMastitisMessage, checkAndAlertHighScc, sendSmsAlert } from '../utils/alerts';
import {
  COWS_DATA,
  DEFAULT_FARM_SETUP,
  FARMER_PROFILE,
  LAKSHMI_FARMER_ACTIONS,
  RISK_DISTRIBUTION,
  TRANSLATIONS
} from '../data/mockData';
import { Cow, FarmSetupData, FarmerActionItem, LanguageCode } from '../types';

import fixedDairyHeroImg from '../assets/images/aarogya_fixed_hero_1789898188125.jpg';

interface Screen3HomeProps {
  farmerName?: string;
  farmSetup?: FarmSetupData;
  currentLang: LanguageCode;
  onOpenCowDiagnostic: (cowId: string) => void;
  onOpenAskAi: (initialPrompt?: string) => void;
  onOpenNotifications: () => void;
  onCallVet: () => void;
  onShowSnackbar: (msg: string) => void;
  onOpenSmsAlert?: () => void;
  onOpenSetupWizard?: () => void;
}

export const Screen3Home: React.FC<Screen3HomeProps> = ({
  farmerName = FARMER_PROFILE.name || 'Murugan Natarajan',
  farmSetup,
  currentLang,
  onOpenCowDiagnostic,
  onOpenAskAi,
  onOpenNotifications,
  onCallVet,
  onShowSnackbar,
  onOpenSmsAlert,
  onOpenSetupWizard,
}) => {
  const t = TRANSLATIONS[currentLang];

  // Effective live setup data reflecting all changes made in Setup Wizard
  const activeFarmerName = farmSetup?.farmerName?.trim() || farmerName || 'Murugan Natarajan';
  const activeFarmName = farmSetup?.farmName?.trim() || FARMER_PROFILE.farmName || 'Velan Dairy & Cattle Farm';
  const activeLocation = farmSetup?.location?.trim() || FARMER_PROFILE.location || 'Salem, Tamil Nadu';
  const activePincode = farmSetup?.pincode?.trim() || FARMER_PROFILE.pincode || '636001';
  const activeHerdStrength = farmSetup?.herdStrength?.trim() || `${FARMER_PROFILE.totalCattle || 24}`;
  const activeFeeding = farmSetup?.feedingPractice || '🌿 Fresh Green Grass & Fodder (Daily Cut)';
  const activeHousing = farmSetup?.housingCondition || '🏡 Open Covered Shed (Sand / Soft Dirt Floor)';
  const activeMilkingProc = farmSetup?.milkingProcedure || 'pump';
  const activeMilkingSchedule = farmSetup?.milkingSchedule || '🌅 Morning 5:30 AM & 🌇 Evening 5:00 PM (Twice Daily)';
  const activeEnvironment = farmSetup?.environmentCondition || '✨ Clean & Washed Daily (Dung cleared twice a day)';
  const activeHerdList = farmSetup?.herdList && farmSetup.herdList.length > 0 ? farmSetup.herdList : COWS_DATA;
  const activeTreatment = farmSetup?.treatmentRecord || DEFAULT_FARM_SETUP.treatmentRecord;

  // Active focus cow under medical watch/treatment configured in Setup Step 3
  const focusCow: Cow = useMemo(() => {
    const found = activeHerdList.find(
      (c) =>
        c.id.toLowerCase() === activeTreatment.cowId.toLowerCase() ||
        c.name.toLowerCase() === activeTreatment.cowName.toLowerCase()
    );
    if (found) {
      return {
        ...found,
        name: activeTreatment.cowName || found.name,
        id: activeTreatment.cowId || found.id,
      };
    }
    return {
      id: activeTreatment.cowId || 'C-024',
      name: activeTreatment.cowName || 'Lakshmi',
      breed: 'HF Cross',
      age: '4.2 yrs',
      lactationStage: 'Lactation 2',
      stall: 4,
      shed: 'Shed B',
      riskLevel: 'High',
      riskPercentage: 82,
      scc: 450,
      milkYield: 24.5,
      yieldSparkline: [27.0, 26.5, 26.0, 25.1, 24.0, 22.5, 18.2],
      affectedQuarter: 'Left-rear quarter',
      photoUrl: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=600&auto=format&fit=crop&q=80',
      lactationDays: 142,
      temperature: 40.1,
      ruminationMinutes: 320,
      activityPercentage: 72,
      rfid: '982-024',
    };
  }, [activeHerdList, activeTreatment]);

  // Focus cow RFID formatted cleanly
  const focusCowRfid = useMemo(() => {
    if (focusCow.rfid) {
      return focusCow.rfid.includes('-')
        ? focusCow.rfid
        : focusCow.rfid.replace(/\s+/g, '-').slice(-7);
    }
    return `982-${focusCow.id.replace(/\D/g, '') || '024'}`;
  }, [focusCow.rfid, focusCow.id]);

  // Dynamic herd distribution based on setup herd strength and registered cattle
  const numericHerdTotal = Math.max(parseInt(activeHerdStrength, 10) || 24, activeHerdList.length);
  const lowCount = useMemo(() => {
    const directLow = activeHerdList.filter((c) => c.riskLevel === 'Low').length;
    return Math.max(directLow, Math.round((numericHerdTotal * 4) / 8));
  }, [activeHerdList, numericHerdTotal]);

  // Clean lactation stage without day indicator
  const cleanFocusLactation = useMemo(() => {
    return (focusCow.lactationStage || 'Lactation 2')
      .replace(/ · Day \d+/gi, '')
      .replace(/Day \d+/gi, '')
      .replace(/\(Day \d+\)/gi, '')
      .replace(/\b\d+\s*days?\b/gi, '')
      .trim();
  }, [focusCow.lactationStage]);

  const moderateCount = useMemo(() => {
    const directMod = activeHerdList.filter((c) => c.riskLevel === 'Moderate' || c.riskLevel === 'Watch').length;
    return Math.max(directMod, Math.round((numericHerdTotal * 3) / 8));
  }, [activeHerdList, numericHerdTotal]);

  const highCount = useMemo(() => {
    const directHigh = activeHerdList.filter((c) => c.riskLevel === 'High').length;
    const calc = numericHerdTotal - lowCount - moderateCount;
    return Math.max(1, directHigh, calc > 0 ? calc : 1);
  }, [activeHerdList, numericHerdTotal, lowCount, moderateCount]);

  const milkingCount = Math.round(numericHerdTotal * 0.75);
  const dryCount = numericHerdTotal - milkingCount;

  // Actionable intervention checklist local states: localized titles and descriptions based on currentLang
  const [completedActions, setCompletedActions] = useState<Record<string, boolean>>({
    'action-1': false,
    'action-2': false,
    'action-3': false,
    'action-4': false,
  });

  const lakshmiActions: FarmerActionItem[] = useMemo(() => [
    {
      id: 'action-1',
      title: t.actionMilkSeparate || `Keep ${focusCow.name}'s milk separate`,
      description: t.actionMilkSeparateDesc || `Do not mix her milk with the main milk can. Keep in a separate bucket.`,
      completed: !!completedActions['action-1'],
      priority: 'Immediate',
    },
    {
      id: 'action-2',
      title: t.actionDipTeats || `Clean and dip teats in medicine`,
      description: t.actionDipTeatsDesc || `Wash teats clean and apply antiseptic dip after milking.`,
      completed: !!completedActions['action-2'],
      priority: 'Immediate',
    },
    {
      id: 'action-3',
      title: t.actionMedicineOnTime || `Give medicine on time`,
      description: t.actionMedicineOnTimeDesc || `Give doctor's medicine for ${activeTreatment.disease} on schedule.`,
      completed: !!completedActions['action-3'],
      priority: 'High',
    },
    {
      id: 'action-4',
      title: t.actionCallDoctorIfNeed || `Call doctor if needed`,
      description: t.actionCallDoctorIfNeedDesc || `Call ${activeTreatment.vetName} (${activeTreatment.vetPhone}) if fever or swelling increases.`,
      completed: !!completedActions['action-4'],
      priority: 'Routine',
    },
  ], [t, focusCow.name, activeTreatment.disease, activeTreatment.vetName, activeTreatment.vetPhone, completedActions]);

  const completedActionsCount = useMemo(() => {
    return Object.values(completedActions).filter(Boolean).length;
  }, [completedActions]);

  // Urgent message sent-to-farmer state
  const [isSmsSentToFarmer, setIsSmsSentToFarmer] = useState(false);
  const [smsSentTimestamp, setSmsSentTimestamp] = useState('09:15 AM');
  const [isSendingAlert, setIsSendingAlert] = useState(false);
  const [autoAlertedIds, setAutoAlertedIds] = useState<string[]>([]);

  const handleSendUrgentMessageToFarmer = async () => {
    if (isSendingAlert) return;
    setIsSendingAlert(true);
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    try {
      const result = await sendSmsAlert({
        to: (FARMER_PROFILE.phone || '+91 9443287610').replace(/\D/g, '').slice(-10),
        carrier: 'jio',
        cowId: focusCow.id,
        cowName: focusCow.name,
        disease: `${activeTreatment.disease} (${activeTreatment.currentCondition})`,
        vetName: activeTreatment.vetName,
        farmerName: activeFarmerName,
        message: buildMastitisMessage({
          cowId: focusCow.id,
          cowName: focusCow.name,
          disease: `${activeTreatment.disease} (${activeTreatment.currentCondition})`,
          vetName: activeTreatment.vetName,
          vetPhone: activeTreatment.vetPhone,
          farmerName: activeFarmerName,
          stall: focusCow.stall,
          scc: focusCow.scc,
        }),
      });
      setIsSmsSentToFarmer(true);
      setSmsSentTimestamp(timeStr);
      onShowSnackbar(
        result.mode === 'dev-simulated'
          ? `SMS simulated for ${activeFarmerName} — set EMAIL_USER/EMAIL_PASS in .env for real delivery`
          : `Urgent SMS sent to Farmer ${activeFarmerName} (${FARMER_PROFILE.phone || '+91 94432 87610'}): Cow ${focusCow.id} ${focusCow.name} HIGH RISK in Stall ${focusCow.stall}`
      );
    } catch (e: any) {
      onShowSnackbar(`SMS failed: ${e?.message || 'network error'}`);
    } finally {
      setIsSendingAlert(false);
    }
  };

  // Automatic trigger: fire backend alert when any cow SCC > 400k (deduped per session)
  useEffect(() => {
    if (!activeHerdList || activeHerdList.length === 0) return;
    checkAndAlertHighScc(activeHerdList, {
      vetName: activeTreatment.vetName,
      vetPhone: activeTreatment.vetPhone,
      farmerName: activeFarmerName,
      farmerPhone: (FARMER_PROFILE.phone || '9443287610').replace(/\D/g, '').slice(-10),
      carrier: 'jio',
    })
      .then((ids) => {
        if (ids.length > 0) {
          setAutoAlertedIds(ids);
          onShowSnackbar(`Auto SMS alert dispatched for ${ids.length} critical cow(s): ${ids.join(', ')}`);
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeHerdList]);

  // Live farm clock timer for real-time responsiveness & automatic time-of-day transitions
  const [currentHour, setCurrentHour] = useState(() => new Date().getHours());
  const [liveTime, setLiveTime] = useState(() => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLiveTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setCurrentHour(now.getHours());
    };
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Automatic time-of-day calculation: Morning (4 AM - 11:59 AM), Afternoon (12 PM - 4:59 PM), Evening (5 PM - 3:59 AM)
  const timePeriod: 'morning' | 'afternoon' | 'evening' =
    currentHour >= 4 && currentHour < 12
      ? 'morning'
      : currentHour >= 12 && currentHour < 17
      ? 'afternoon'
      : 'evening';

  const timeGreetingData = {
    morning: {
      id: 'morning' as const,
      label: {
        en: 'Good Morning',
        hi: 'शुभ प्रभात',
        pa: 'ਸ਼ੁਭ ਸਵੇਰ',
        ta: 'காலை வணக்கம்',
      },
      nativeGreeting: {
        en: 'Dawn milking shift · Herd is active & feeding',
        hi: 'सवेरे का दुग्ध दोहन · पशु सक्रिय एवं ताजा चारा ले रहे हैं',
        pa: 'ਸਵੇਰ ਦੀ ਚੁਆਈ · ਪਸ਼ੂ ਤੰਦਰੁਸਤ ਤੇ ਤਾਜ਼ਾ ਚਾਰਾ',
        ta: 'காலை கறவை வேளை · பசுக்கள் சுறுசுறுப்பு & பசுந்தீவனம்',
      },
      shiftTitle: {
        en: 'Dawn Milking Shift',
        hi: 'सुबह का दुग्ध दोहन',
        pa: 'ਸਵੇਰ ਦਾ ਦੁੱਧ ਚੁਆਈ',
        ta: 'காலை கறவை வேளை',
      },
      timeRange: '04:00 AM – 11:59 AM',
      conditionTemp: '22°C · Fresh Dew',
      tagline: 'Morning Milking Round & Fresh Green Fodder Inspection',
      protocolTip: 'Wash hands, pre-dip teats in chlorhexidine for 30s & inspect first 3 milk streams for flakes.',
      protocolShort: 'Pre-dip teats & inspect foremilk',
      icon: Sunrise,
      bannerGradient: 'from-amber-950/95 via-emerald-950/90 to-teal-950/95',
      badgeGradient: 'from-amber-400/25 via-orange-400/20 to-amber-500/15 text-amber-100 border-amber-400/40 shadow-amber-950/50',
      heroAura: 'from-amber-400/30 via-orange-500/15 to-transparent',
      glowColor: 'bg-amber-400/25',
      accentColor: 'text-amber-300',
      borderTint: 'border-amber-500/35',
      skyMood: 'Golden Sunrise Ambience',
      emoji: '🌅',
    },
    afternoon: {
      id: 'afternoon' as const,
      label: {
        en: 'Good Afternoon',
        hi: 'शुभ दोपहर',
        pa: 'ਸ਼ੁਭ ਦੁਪਹਿਰ',
        ta: 'மதிய வணக்கம்',
      },
      nativeGreeting: {
        en: 'Sunlit afternoon · Keep shed cool & water troughs full',
        hi: 'दोपहर की बाड़े की देखभाल · पशुओं को शीतल छाया एवं जल दें',
        pa: 'ਦੁਪਹਿਰ ਦੀ ਦੇਖਭਾਲ · ਠੰਡੀ ਛਾਂ ਤੇ ਸਾਫ਼ ਪਾਣੀ ਦਾ ਪ੍ਰਬੰਧ',
        ta: 'மதிய பண்ணை பராமரிப்பு · நிழலான கொட்டகை & போதிய நீர்',
      },
      shiftTitle: {
        en: 'Midday Barn & Cattle Care',
        hi: 'दोपहर की बाड़े की देखभाल',
        pa: 'ਦੁਪਹਿਰ ਦੀ ਵਾੜੇ ਦੀ ਦੇਖਭਾਲ',
        ta: 'மதிய பண்ணை பராமரிப்பு',
      },
      timeRange: '12:00 PM – 04:59 PM',
      conditionTemp: '31°C · Sunny & Warm',
      tagline: 'Afternoon Heat Mitigation & Fresh Clean Trough Water',
      protocolTip: 'Keep barn mist fans running, inspect resting comfort & ensure unlimited cool drinking water.',
      protocolShort: 'Mist fans running & water troughs filled',
      icon: Sun,
      bannerGradient: 'from-yellow-950/95 via-emerald-950/90 to-teal-950/95',
      badgeGradient: 'from-yellow-400/25 via-amber-400/20 to-yellow-500/15 text-yellow-100 border-yellow-400/40 shadow-yellow-950/50',
      heroAura: 'from-yellow-400/30 via-amber-500/15 to-transparent',
      glowColor: 'bg-yellow-400/25',
      accentColor: 'text-yellow-300',
      borderTint: 'border-yellow-500/35',
      skyMood: 'Radiant Sun Ambience',
      emoji: '☀️',
    },
    evening: {
      id: 'evening' as const,
      label: {
        en: 'Good Evening',
        hi: 'शुभ संध्या',
        pa: 'ਸ਼ੁਭ ਸ਼ਾਮ',
        ta: 'மாலை வணக்கம்',
      },
      nativeGreeting: {
        en: 'Pleasant evening twilight · Second milking & dry bedding',
        hi: 'शाम का दुग्ध दोहन · स्वच्छ सूखा बिस्तर एवं टीट बैरियर',
        pa: 'ਸ਼ਾਮ ਦੀ ਦੁੱਧ ਚੁਆਈ · ਸੁੱਕਾ ਬਿਸਤਰਾ ਤੇ ਨਾਈਟ ਕੇਅਰ',
        ta: 'மாலை கறவை வேளை · இரண்டாம் கறவை & உலர்ந்த படுக்கை',
      },
      shiftTitle: {
        en: 'Sunset Milking & Night Bedding',
        hi: 'शाम का दुग्ध दोहन एवं बिस्तर',
        pa: 'ਸ਼ਾਮ ਦੀ ਦੁੱਧ ਚੁਆਈ ਤੇ ਬਿਸਤਰਾ',
        ta: 'மாலை கறவை & படுக்கை பராமரிப்பு',
      },
      timeRange: '05:00 PM – 03:59 AM',
      conditionTemp: '24°C · Pleasant Twilight',
      tagline: 'Evening Yield Collection & Post-Milking Teat Barrier Dip',
      protocolTip: 'Apply thick post-dip barrier iodine & keep cows standing on clean dry rubber mats for 30 minutes.',
      protocolShort: 'Apply barrier teat dip & clean bedding',
      icon: Sunset,
      bannerGradient: 'from-emerald-950/95 via-green-950/85 to-slate-950/95',
      badgeGradient: 'from-emerald-400/25 via-green-400/20 to-emerald-500/15 text-emerald-100 border-emerald-400/40 shadow-emerald-950/50',
      heroAura: 'from-emerald-400/30 via-green-500/15 to-transparent',
      glowColor: 'bg-emerald-400/25',
      accentColor: 'text-emerald-300',
      borderTint: 'border-emerald-500/35',
      skyMood: 'Peaceful Twilight Ambience',
      emoji: '🌇',
    },
  };

  const currentGreeting = timeGreetingData[timePeriod];
  const greetingText = currentGreeting.label[currentLang] || currentGreeting.label.en;
  const nativeSubtitle = currentGreeting.nativeGreeting[currentLang] || currentGreeting.nativeGreeting.en;
  const shiftTitleText = currentGreeting.shiftTitle[currentLang] || currentGreeting.shiftTitle.en;
  const TimeIcon = currentGreeting.icon;

  const toggleLakshmiAction = (id: string) => {
    setCompletedActions((prev) => {
      const nextState = !prev[id];
      const targetAction = lakshmiActions.find((a) => a.id === id);
      const title = targetAction?.title || 'Action item';
      onShowSnackbar(nextState ? `✓ Completed: ${title}` : `Marked pending: ${title}`);
      return {
        ...prev,
        [id]: nextState,
      };
    });
  };

  return (
    <div id="screen-3-home" className="space-y-4 pb-24">
      {/* SECTION 1: Welcome Hero Card with Dynamic Time-of-Day Atmosphere & Live Setup Details */}
      <section
        id="home-section-1-welcome"
        className={`relative overflow-hidden rounded-3xl shadow-xl border ${currentGreeting.borderTint} bg-gradient-to-br ${currentGreeting.bannerGradient} text-white transition-all duration-700`}
      >
        {/* Subtle cinematic photographic background */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img
            src={fixedDairyHeroImg}
            alt="Healthy modern Indian dairy farm with green surroundings and clean cattle shed"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center scale-105 opacity-25 filter blur-[1px] transition-all duration-700"
          />
          {/* Elegant dark gradient vignettes */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-emerald-950/85 to-slate-950/90" />
          <div className={`absolute inset-0 bg-gradient-to-t ${currentGreeting.bannerGradient} opacity-80`} />
        </div>

        {/* Ambient soft glow aura */}
        <div className={`absolute -top-16 -right-16 w-72 h-72 rounded-full ${currentGreeting.glowColor} blur-3xl pointer-events-none z-1 opacity-60`} />

        <div className="relative z-10 p-5 sm:p-7 space-y-4 sm:space-y-5">
          {/* Top Row: Live Status Pill & Notifications Bell */}
          <div className="flex items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-white/95 font-medium shadow-2xs flex-wrap">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <span className="font-mono font-bold text-white tracking-tight">{liveTime}</span>
              <span className="text-white/30">·</span>
              <TimeIcon className={`w-3.5 h-3.5 ${currentGreeting.accentColor} shrink-0`} />
              <span>{shiftTitleText}</span>
              <span className="text-white/30 hidden sm:inline">·</span>
              <span className="text-emerald-200/90 hidden sm:inline">{currentGreeting.conditionTemp}</span>
            </div>

            {/* Notification Bell with Refined Glass Style */}
            <button
              id="home-notifications-bell"
              type="button"
              onClick={onOpenNotifications}
              className="relative w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 flex items-center justify-center text-white transition-all shadow-xs backdrop-blur-md cursor-pointer shrink-0"
              aria-label="View Notifications"
            >
              <Bell className="w-4 h-4 text-emerald-100" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center ring-2 ring-slate-900 shadow-xs">
                2
              </span>
            </button>
          </div>

          {/* Hero Farmer Profile: Premium Card Presentation with Avatar, Verification, and Farm Details */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-white/[0.08] backdrop-blur-md border border-white/15 shadow-inner">
            <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
              {/* Farmer Avatar with ambient glow and active indicator */}
              <div className="relative shrink-0">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-emerald-500/30 via-teal-600/30 to-slate-900/50 border border-emerald-400/40 flex items-center justify-center shadow-lg shadow-emerald-950/40 backdrop-blur-md ring-2 ring-emerald-400/20">
                  <span className="text-3xl sm:text-4xl select-none filter drop-shadow-sm" role="img" aria-label={activeFarmerName}>
                    👨‍🌾
                  </span>
                </div>
                {/* Active farm status dot */}
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-slate-950 flex items-center justify-center shadow-xs" title="Farm Profile Active">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />
                </span>
              </div>

              {/* Farmer & Farm Lockup */}
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-base select-none">{currentGreeting.emoji}</span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 font-mono">
                    {currentGreeting.skyMood}
                  </span>
                  <span className="text-white/30 hidden xs:inline">·</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-200 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/15">
                    <Building2 className="w-3 h-3 text-emerald-300" />
                    <span className="truncate max-w-[170px] sm:max-w-xs">{activeFarmName}</span>
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white font-display leading-tight truncate">
                  <span className="text-white/90">{greetingText}, </span>
                  <span className="text-amber-200 drop-shadow-xs">{activeFarmerName}</span>
                </h1>

                <div className="flex flex-wrap items-center gap-2 text-xs text-emerald-100/90 pt-0.5">
                  <span className="inline-flex items-center gap-1 font-medium">
                    <span className="text-emerald-300 font-mono text-[11px] bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/30">
                      {FARMER_PROFILE.dairyId}
                    </span>
                  </span>
                  <span className="text-white/30">·</span>
                  <span className="text-[11px] text-emerald-200/90 font-medium">
                    {activeHerdStrength} {t.cowsRegistered || 'Cows Registered'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Profile Setup / Edit Affordance */}
            {onOpenSetupWizard && (
              <button
                id="home-profile-edit-btn"
                type="button"
                onClick={onOpenSetupWizard}
                className="self-start sm:self-center px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer backdrop-blur-md shadow-xs shrink-0"
                title={t.editFarmProfile || 'Edit Farm Profile'}
              >
                <Pencil className="w-3.5 h-3.5 text-emerald-200" />
                <span>{t.editFarmProfile || 'Edit Farm Profile'}</span>
              </button>
            )}
          </div>

          <p className="text-xs sm:text-sm text-emerald-100/90 font-medium leading-relaxed max-w-2xl px-1">
            {nativeSubtitle}
          </p>

          {/* Bottom Glance Bar: Configured Location, Milking Schedule & Operating Method */}
          <div className="pt-3 border-t border-white/15 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3 text-emerald-100/80">
              <span className="flex items-center gap-1.5 font-medium text-white">
                <MapPin className="w-3.5 h-3.5 text-teal-300 shrink-0" />
                <span>{activeLocation} · PIN {activePincode}</span>
              </span>
              <span className="text-white/20 hidden sm:inline">·</span>
              <span className="text-white/70 font-mono text-[11px]">
                {FARMER_PROFILE.dairyId}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white text-[11px] font-medium">
                <Clock className="w-3 h-3 text-amber-300" />
                <span>{activeMilkingProc === 'pump' ? '⚡ Machine Pump' : '🖐 Manual Milking'}</span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white text-[11px] font-medium">
                <Droplet className="w-3 h-3 text-teal-300" />
                <span>{t.bulkTankMilkCells || 'Bulk Tank'}:</span>
                <span className="font-bold text-amber-200">225k SCC</span>
                <span className="text-emerald-300 font-semibold">(Grade A)</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Herd Health At A Glance (Calculated from Setup Herd Data) */}
      <section
        id="home-section-2-glance"
        className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>{t.herdHealthGlance}</span>
            <span className="text-slate-400 font-normal text-xs sm:text-sm">· {numericHerdTotal} Head</span>
          </h2>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping opacity-75" />
            <span>{t.liveCollarUpdates || 'Live Collar Updates'}</span>
          </span>
        </div>

        {/* 2×2 Statistics Grid reflecting setup herd strength */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {/* Box 1: Total Cattle */}
          <div
            id="stat-box-total"
            className="p-4 rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100/70 border border-slate-200/90 flex flex-col justify-between hover:border-slate-300 transition-all shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                {t.totalCattle}
              </span>
              <div className="w-7 h-7 rounded-xl bg-slate-200/80 flex items-center justify-center">
                <PawPrint className="w-3.5 h-3.5 text-slate-700" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                {numericHerdTotal}
              </span>
              <span className="text-[11px] text-slate-500 block mt-1 font-normal">
                {milkingCount} Milking · {dryCount} Dry
              </span>
            </div>
          </div>

          {/* Box 2: Low Risk */}
          <div
            id="stat-box-low"
            className="p-4 rounded-2xl bg-gradient-to-b from-emerald-50/80 to-emerald-100/50 border border-emerald-200 flex flex-col justify-between hover:border-emerald-300 transition-all shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">
                {t.lowRisk}
              </span>
              <div className="w-7 h-7 rounded-xl bg-emerald-200/80 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl sm:text-4xl font-extrabold text-emerald-900 tracking-tight">
                {lowCount}
              </span>
              <span className="text-[11px] text-emerald-700 block mt-1 font-normal">
                {t.safeHealthy || 'Safe & Healthy'}
              </span>
            </div>
          </div>

          {/* Box 3: Moderate Risk */}
          <div
            id="stat-box-moderate"
            className="p-4 rounded-2xl bg-gradient-to-b from-[#F4F5EF] to-[#EAECE3] border border-[#B8BEA9] flex flex-col justify-between hover:border-[#9DA38E] transition-all shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#484E3C] uppercase tracking-wide">
                {t.moderateRisk}
              </span>
              <div className="w-7 h-7 rounded-xl bg-[#DCDFCF] flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-[#484E3C]" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl sm:text-4xl font-extrabold text-[#383D2F] tracking-tight">
                {moderateCount}
              </span>
              <span className="text-[11px] text-[#484E3C] block mt-1 font-normal">
                {t.keepWatching || 'Keep Watching'}
              </span>
            </div>
          </div>

          {/* Box 4: High Risk */}
          <div
            id="stat-box-high"
            className="p-4 rounded-2xl bg-gradient-to-b from-rose-50 to-rose-100/60 border border-rose-300 flex flex-col justify-between hover:border-rose-400 transition-all shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-rose-800 uppercase tracking-wide">
                {t.highRisk}
              </span>
              <div className="w-7 h-7 rounded-xl bg-rose-200/80 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4 text-rose-700" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl sm:text-4xl font-extrabold text-rose-900 tracking-tight">
                {highCount}
              </span>
              <span className="text-[11px] text-rose-700 block mt-1 font-semibold">
                {t.callDoctorSoon || 'Call Doctor Soon'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* SMS URGENT ALERT & HIGH RISK COW (LAKSHMI) */}
      <section id="home-combined-alert-lakshmi" className="space-y-3">
        {/* Top Orange Banner - Clickable to send urgent message to farmer */}
        <div
          id="home-urgent-message-banner"
          onClick={handleSendUrgentMessageToFarmer}
          role="button"
          tabIndex={0}
          title={`Click to send urgent message to Farmer ${activeFarmerName}`}
          className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-4 sm:p-5 text-white rounded-3xl border border-amber-400/40 shadow-sm relative cursor-pointer select-none transition-all active:brightness-95 hover:brightness-105 group overflow-hidden"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {/* Red warning radio/broadcast icon in squircle */}
              <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-xs shrink-0">
                <Radio className="w-4 h-4 text-rose-600" />
              </div>

              <div className="inline-flex items-center gap-1.5 bg-[#ffd8b2] text-[#d9381e] font-extrabold text-[10px] sm:text-[11px] px-2.5 py-1 rounded-xl shadow-2xs group-hover:bg-white group-hover:text-rose-700 transition-colors">
                <MessageSquare className="w-3.5 h-3.5 text-[#d9381e]" />
                <span>{t.urgentSmsBadge || 'URGENT SMS'}</span>
              </div>

              <span className="text-amber-100 font-mono text-xs font-semibold">
                {smsSentTimestamp}
              </span>
            </div>

            <div className="inline-flex items-center gap-1 bg-white/20 text-white font-semibold text-xs px-2.5 py-1 rounded-full backdrop-blur-xs">
              {isSmsSentToFarmer ? (
                <>
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-300 stroke-[2.5]" />
                  <span className="text-emerald-100 font-bold">{t.sentToFarmerBadge || 'Sent to Farmer'}</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                  <span>{t.deliveredBadge || 'Delivered'}</span>
                </>
              )}
            </div>
          </div>

          {/* Heading */}
          <h3 className="text-base sm:text-lg font-extrabold text-white mt-3 leading-snug">
            {t.urgentMastitisHeading || 'Urgent Mastitis SMS Sent to Doctor & You'}
          </h3>

          {/* Quote body text reflecting live treatment records */}
          <div className="mt-2 text-xs sm:text-sm text-white/95 leading-relaxed font-normal bg-black/10 hover:bg-black/15 p-2.5 rounded-xl border border-white/15 transition-all">
            <p>
              &quot;[{t.urgentSmsBadge || 'URGENT SMS'}] Cow {focusCow.id} {focusCow.name} is under treatment for {activeTreatment.disease} ({activeTreatment.currentCondition}). {t.sentToVetLabel || 'Sent to'} {activeTreatment.vetName} ({activeTreatment.vetPhone}). {t.actionMilkSeparate || 'Keep her milk separate'}.&quot;
            </p>

            <div className="mt-2 pt-2 border-t border-white/15 flex items-center justify-between text-[11px] text-amber-100 font-medium">
              <span className="flex items-center gap-1 text-white font-semibold">
                <Smartphone className="w-3.5 h-3.5 text-amber-200" />
                {isSmsSentToFarmer
                  ? `${t.sentToFarmerBadge || 'Sent to Farmer'} ${activeFarmerName} (${FARMER_PROFILE.phone || '+91 94432 87610'})`
                  : `${t.tapToSendSms || 'Tap to send urgent message to Farmer'} ${activeFarmerName}`}
              </span>
              <span className="bg-white/20 px-2 py-0.5 rounded-md text-[10px] text-white font-bold">
                {isSendingAlert ? 'Sending...' : isSmsSentToFarmer ? (t.smsSentCheck || 'SMS Sent ✓') : (t.tapToSend || 'Tap to Send')}
              </span>
            </div>
            {autoAlertedIds.length > 0 && (
              <div className="mt-2 text-[11px] font-mono text-emerald-100 bg-black/15 rounded-lg px-2.5 py-1.5 border border-white/15">
                Auto-alert via /api/alerts/send-sms: {autoAlertedIds.join(', ')} (SCC &gt;400k)
              </div>
            )}
          </div>
        </div>

        {/* Lakshmi Cow Profile & Diagnostics Box with Border */}
        <div
          id="home-lakshmi-card"
          className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-6 space-y-4 transition-all"
        >
          {/* Row 1: Profile Header with Photo, Tag, and Risk Status */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3.5 min-w-0">
              {/* Cow Photo with Tag ID overlay badge */}
              <div className="relative shrink-0">
                <img
                  src={focusCow.photoUrl}
                  alt={`${focusCow.name} ${focusCow.id}`}
                  className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl object-cover border border-slate-200/90 shadow-sm"
                />
                <span className="absolute -bottom-1 -right-1 font-mono text-[10px] font-extrabold bg-slate-900 text-white px-1.5 py-0.5 rounded-md border border-white/70 shadow-xs">
                  {focusCow.id}
                </span>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-tight truncate font-display">
                    {focusCow.name}
                  </h3>
                  <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                    {focusCow.breed}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-950 border border-emerald-300 shadow-2xs">
                    <Radio className="w-3 h-3 text-emerald-700 shrink-0" />
                    <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-tight">
                      RFID: {focusCowRfid}
                    </span>
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium mt-1">
                  <span className="inline-flex items-center gap-1 text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/70">
                    Stall {focusCow.stall} · {focusCow.shed}
                  </span>
                  <span className="text-slate-300 hidden xs:inline">·</span>
                  <span className="text-[11px] text-slate-500 truncate">{cleanFocusLactation}</span>
                </div>
              </div>
            </div>

            {/* High Risk Pill badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs shrink-0 shadow-2xs">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>{focusCow.riskLevel} Risk</span>
              <span className="text-rose-600 font-extrabold font-mono">({focusCow.riskPercentage}%)</span>
            </div>
          </div>

          {/* Row 2: 3 Stat Cards in a Grid */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
            {/* Card 1: Score */}
            <div className="bg-rose-50/70 border border-rose-200/80 rounded-2xl p-3 flex flex-col justify-between shadow-2xs">
              <div className="flex items-center justify-between mb-1.5 text-rose-700">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 font-mono">
                  SCORE
                </span>
                <Activity className="w-3.5 h-3.5 text-rose-600" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-extrabold text-rose-950">
                  {focusCow.riskLevel} Risk
                </div>
                <div className="text-[10px] text-slate-500 font-medium mt-0.5 truncate">
                  {focusCow.affectedQuarter || 'Teat Watch'}
                </div>
              </div>
            </div>

            {/* Card 2: SCC */}
            <div className="bg-sky-50/70 border border-sky-200/80 rounded-2xl p-3 flex flex-col justify-between shadow-2xs">
              <div className="flex items-center justify-between mb-1.5 text-sky-700">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 font-mono">
                  SCC
                </span>
                <Droplet className="w-3.5 h-3.5 text-sky-600" />
              </div>
              <div>
                <div className="text-sm sm:text-base font-extrabold text-rose-700 font-mono">
                  {focusCow.scc}k
                </div>
                <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                  (Elevated)
                </div>
              </div>
            </div>

            {/* Card 3: Milk Temperature */}
            <div className="bg-rose-50/70 border border-rose-200/80 rounded-2xl p-3 flex flex-col justify-between shadow-2xs">
              <div className="flex items-center justify-between mb-1.5 text-rose-700">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 font-mono">
                  MILK TEMP
                </span>
                <Thermometer className="w-3.5 h-3.5 text-rose-600" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-extrabold text-rose-950 font-mono">
                  {focusCow.temperature}°C <span className="text-[10px] font-normal text-slate-500">(High)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Row 3: Red warning status row with setup disease and condition */}
          <div className="bg-rose-50 border border-rose-200/80 rounded-2xl px-3.5 py-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="font-bold text-slate-900 truncate">
                {activeTreatment.disease}
              </span>
            </div>
            <div className="flex items-center gap-1 text-rose-700 font-mono font-bold shrink-0 ml-2">
              <Thermometer className="w-3.5 h-3.5 text-rose-600" />
              <span>{focusCow.temperature}°C</span>
            </div>
          </div>

          {/* Row 4: Green Doctor contact banner reflecting setup assigned vet */}
          <button
            id="home-lakshmi-contact-doctor-banner"
            type="button"
            onClick={onCallVet}
            className="w-full bg-emerald-50/90 hover:bg-emerald-100/80 border border-emerald-200/80 rounded-2xl px-3.5 py-2 flex items-center justify-between text-xs transition-all cursor-pointer text-left"
          >
            <div className="flex items-center gap-2 text-slate-800 min-w-0">
              <div className="w-4 h-4 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>
              <span className="font-semibold text-slate-800 truncate text-[11px] sm:text-xs">
                Sent to {activeTreatment.vetName} ({activeTreatment.vetPhone})
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 shrink-0 ml-1" />
          </button>

          {/* Row 5: Action buttons */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              id="home-lakshmi-view-cow"
              type="button"
              onClick={() => onOpenCowDiagnostic(focusCow.id)}
              className="py-3 px-3 sm:px-4 bg-emerald-800 hover:bg-emerald-900 active:scale-98 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>{t.viewCow || 'View'} {focusCow.name}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              id="home-lakshmi-call-doctor"
              type="button"
              onClick={onCallVet}
              className="py-3 px-3 sm:px-4 bg-rose-50 hover:bg-rose-100 active:scale-98 text-rose-800 border border-rose-200 text-xs sm:text-sm font-bold rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <PhoneCall className="w-4 h-4 text-rose-700" />
              <span>{t.callVet || 'Call Doctor'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 4: Actionable Interventions reflecting setup cow & treatment protocol */}
      <section id="home-section-4-interventions" className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
            {t.actionableInterventions}
          </h2>
          <span
            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border transition-colors ${
              completedActionsCount === 4
                ? 'text-emerald-900 bg-emerald-100 border-emerald-300 font-bold'
                : 'text-emerald-800 bg-emerald-50 border-emerald-200'
            }`}
          >
            {completedActionsCount === 4 ? 'All 4 Done ✓' : `${completedActionsCount} of 4 Completed`}
          </span>
        </div>

        {/* Dynamic Checklist for focus cow */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-sm space-y-3.5">
          <div className="space-y-2 pb-2.5 border-b border-slate-100">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 shrink-0" />
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                  {focusCow.id} {focusCow.name} · Urgent Steps for Farmer (4 Steps)
                </h3>
              </div>
              <span
                className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 ${
                  completedActionsCount === 4
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-100 text-rose-800 border border-rose-200'
                }`}
              >
                {completedActionsCount === 4 ? 'Completed' : 'High Priority'}
              </span>
            </div>

            {/* Visual Step Progress Bar */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${(completedActionsCount / 4) * 100}%` }}
              />
            </div>
          </div>

          {/* All Steps Completed Congratulatory Banner */}
          {completedActionsCount === 4 && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Great job! All 4 urgent steps completed for {focusCow.name}. Milk is separated and treatment is underway.</span>
            </div>
          )}

          <div className="space-y-2.5">
            {lakshmiActions.map((action, index) => {
              const isChecked = !!action.completed;
              return (
                <div
                  key={action.id}
                  id={`action-item-${action.id}`}
                  onClick={() => toggleLakshmiAction(action.id)}
                  role="checkbox"
                  aria-checked={isChecked}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                      e.preventDefault();
                      toggleLakshmiAction(action.id);
                    }
                  }}
                  className={`group relative flex items-start gap-3.5 p-3.5 sm:p-4 rounded-2xl border transition-all duration-150 cursor-pointer select-none active:scale-[0.99] ${
                    isChecked
                      ? 'bg-emerald-50/85 border-emerald-300/90 shadow-2xs'
                      : 'bg-white hover:bg-slate-50/90 border-slate-200/90 hover:border-emerald-300 shadow-2xs hover:shadow-xs'
                  }`}
                >
                  {/* Visually-hidden accessible native checkbox */}
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleLakshmiAction(action.id)}
                    tabIndex={-1}
                    className="sr-only"
                    aria-label={action.title}
                  />

                  {/* Engineered Custom Android-Grade Tick Box */}
                  <div className="pt-0.5 shrink-0">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-200 ${
                        isChecked
                          ? 'bg-emerald-600 border-2 border-emerald-600 text-white shadow-xs scale-100 ring-2 ring-emerald-400/30'
                          : 'bg-white border-2 border-slate-300 group-hover:border-emerald-500 shadow-2xs group-active:scale-90'
                      }`}
                    >
                      {isChecked ? (
                        <Check className="w-4 h-4 stroke-[3] text-white" />
                      ) : (
                        <span className="text-[11px] font-mono font-bold text-slate-400 group-hover:text-emerald-600">
                          {index + 1}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            isChecked
                              ? 'bg-emerald-200/70 text-emerald-900 font-bold'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          Step {index + 1}
                        </span>
                        <p
                          className={`text-xs sm:text-sm font-bold leading-tight transition-colors ${
                            isChecked
                              ? 'text-emerald-950 line-through decoration-emerald-600/60'
                              : 'text-slate-900 group-hover:text-emerald-950'
                          }`}
                        >
                          {action.title}
                        </p>
                      </div>

                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full shrink-0 uppercase tracking-wider transition-colors ${
                          isChecked
                            ? 'bg-emerald-200/80 text-emerald-900 border border-emerald-300 font-extrabold'
                            : action.priority === 'Immediate'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {isChecked ? 'Done ✓' : action.priority}
                      </span>
                    </div>

                    <p
                      className={`text-xs mt-1.5 leading-relaxed font-normal transition-colors ${
                        isChecked ? 'text-emerald-900/85' : 'text-slate-600'
                      }`}
                    >
                      {action.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 5: "Ask AAROGYA AI about Focus Cow" */}
      <section id="home-section-5-ask-ai">
        <button
          id="home-ask-aarogya-ai-button"
          type="button"
          onClick={() =>
            onOpenAskAi(`Why is ${focusCow.name} (${focusCow.id}) under treatment for ${activeTreatment.disease}?`)
          }
          className="w-full text-left bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white rounded-3xl p-5 shadow-md hover:shadow-lg active:scale-98 transition-all flex items-center justify-between group border border-emerald-700/50 relative overflow-hidden cursor-pointer"
        >
          {/* Subtle background glow */}
          <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-emerald-400/10 blur-2xl pointer-events-none" />

          <div className="relative z-10 flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur-xs text-emerald-300 group-hover:scale-105 transition-transform border border-white/20 shadow-xs">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-emerald-300 text-[11px] font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t.dairyDoctorAiHelper || 'Dairy Doctor AI Helper'}</span>
              </div>
              <h3 className="text-sm sm:text-base font-bold tracking-tight text-white">
                {t.askAiAboutCow || 'Ask AAROGYA AI about'} {focusCow.name}
              </h3>
              <p className="text-xs text-emerald-100/90 mt-0.5 font-normal">
                {t.askAiSubtitle || 'Tap to ask about medicine, milk cells, and doctor visit for'} {focusCow.name}
              </p>
            </div>
          </div>

          <div className="relative z-10 w-9 h-9 rounded-full bg-white/20 group-hover:bg-white/30 flex items-center justify-center shrink-0 ml-2 transition-colors border border-white/20 shadow-2xs">
            <ChevronRight className="w-5 h-5 text-white group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>
      </section>
    </div>
  );
};
