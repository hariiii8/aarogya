import { Cow, FarmerActionItem, FutureForecastPoint, RiskLevel, TelemetryDataPoint, UdderQuarterStatus } from '../types';
import {
  LAKSHMI_FARMER_ACTIONS,
  LAKSHMI_FUTURE_FORECAST,
  LAKSHMI_TELEMETRY_7DAY,
  LAKSHMI_UDDER_QUARTERS,
  LAKSHMI_WHY_THIS_RISK,
  PONNI_MONITORING_ACTIONS,
} from './mockData';

export interface DetailedCowHealth {
  age: string;
  lactationInfo: string;
  quarters: UdderQuarterStatus[];
  whyThisRisk: string[];
  aiForecast: FutureForecastPoint[];
  treatments: FarmerActionItem[];
  telemetry7Day: TelemetryDataPoint[];
}

export function getCowAge(cow: Cow): string {
  if (cow.age) return cow.age;
  if (cow.id === 'C-024') return '4.2 yrs';
  if (cow.id === 'C-018') return '3.6 yrs';
  if (cow.id === 'C-007') return '5.1 yrs';
  if (cow.id === 'C-031') return '3.9 yrs';
  if (cow.id === 'C-012') return '4.4 yrs';
  if (cow.id === 'C-003') return '4.0 yrs';
  if (cow.id === 'C-011') return '3.8 yrs';
  if (cow.id === 'C-009') return '3.5 yrs';
  if (cow.id === 'C-014') return '4.8 yrs';
  if (cow.id === 'C-027') return '3.7 yrs';
  if (cow.id === 'C-001') return '4.1 yrs';
  if (cow.id === 'C-002') return '3.4 yrs';
  if (cow.id === 'C-005') return '4.6 yrs';
  if (cow.id === 'C-006') return '3.8 yrs';
  if (cow.id === 'C-010') return '4.3 yrs';

  // Derived from lactation days or hash
  const days = cow.lactationDays || 100;
  if (days > 180) return '4.8 yrs';
  if (days > 140) return '4.2 yrs';
  if (days > 90) return '3.8 yrs';
  return '3.2 yrs';
}

export function getCowLactationInfo(cow: Cow): string {
  if (cow.lactationStage) {
    return cow.lactationStage
      .replace(/ · Day \d+/gi, '')
      .replace(/Day \d+/gi, '')
      .replace(/\(Day \d+\)/gi, '')
      .replace(/\bdays?\b/gi, '')
      .trim();
  }
  const lactationNum = Math.max(1, Math.min(5, Math.floor((cow.lactationDays || 100) / 75) + 1));
  return `Lactation ${lactationNum}`;
}

export function getCowHealthDetails(cow: Cow): DetailedCowHealth {
  const age = getCowAge(cow);
  const lactationInfo = getCowLactationInfo(cow);

  // 0. SPECIFIC DATA FOR SUNDARI (TN-SLM-04 / Sundari)
  if (cow.id === 'TN-SLM-04' || cow.name === 'Sundari') {
    const sundariQuarters: UdderQuarterStatus[] = [
      {
        quarter: 'Left Front',
        code: 'LF',
        scc: 140,
        status: 'Low',
        conductivity: 4.8,
        temperature: 38.4,
        isAffected: false,
      },
      {
        quarter: 'Right Front',
        code: 'RF',
        scc: 155,
        status: 'Low',
        conductivity: 4.9,
        temperature: 38.5,
        isAffected: false,
      },
      {
        quarter: 'Left Rear',
        code: 'LR',
        scc: 160,
        status: 'Low',
        conductivity: 5.0,
        temperature: 38.5,
        isAffected: false,
      },
      {
        quarter: 'Right Rear',
        code: 'RR',
        scc: 580,
        status: 'High',
        conductivity: 7.4,
        temperature: 39.8,
        isAffected: true,
      },
    ];

    const sundariWhyThisRisk = [
      'Cow is chewing cud 130 minutes less and moving less',
      'Right-back teat feels hot during evening milking',
    ];

    const sundariForecast: FutureForecastPoint[] = [
      {
        timeframe: '7 Days Ahead',
        riskPercentage: 78,
        riskLevel: 'High',
        clinicalState: 'Right-back teat feels warm and tender during milking.',
        recommendation: 'Call the doctor right away and start cooling treatment.',
      },
      {
        timeframe: '10 Days Ahead',
        riskPercentage: 84,
        riskLevel: 'High',
        clinicalState: 'High risk of mastitis with milk clots in right-back teat.',
        recommendation: 'Give teat medicine as prescribed by the doctor.',
      },
      {
        timeframe: '14 Days Ahead',
        riskPercentage: 90,
        riskLevel: 'High',
        clinicalState: 'Udder can suffer lasting damage if not treated.',
        recommendation: 'Complete full doctor treatment to save the cow’s milk.',
      },
    ];

    const sundariTreatments: FarmerActionItem[] = [
      {
        id: 'sun-1',
        title: 'Doctor Check of Udder & Teats',
        description: 'Check udder with hands and test milk from right-back teat.',
        completed: false,
        priority: 'High',
      },
      {
        id: 'sun-2',
        title: 'Dip Teats in Iodine Right After Milking',
        description: 'Dip all 4 teats in antiseptic iodine after morning and evening milking.',
        completed: false,
        priority: 'High',
      },
      {
        id: 'sun-3',
        title: 'Keep Stall Dry with Fresh Straw Bedding',
        description: 'Spread clean, dry straw in the stall so germs cannot enter the teats.',
        completed: false,
        priority: 'Routine',
      },
    ];

    const sundariTelemetry7Day: TelemetryDataPoint[] = [
      { day: 'Day -6', scc: 210, conductivity: 4.8, temperature: 38.5, rumination: 450 },
      { day: 'Day -5', scc: 230, conductivity: 4.9, temperature: 38.6, rumination: 440 },
      { day: 'Day -4', scc: 270, conductivity: 5.2, temperature: 38.7, rumination: 420 },
      { day: 'Day -3', scc: 340, conductivity: 5.8, temperature: 38.9, rumination: 390 },
      { day: 'Day -2', scc: 430, conductivity: 6.4, temperature: 39.2, rumination: 360 },
      { day: 'Day -1', scc: 510, conductivity: 6.9, temperature: 39.5, rumination: 340 },
      { day: 'Today', scc: 580, conductivity: 7.4, temperature: 39.8, rumination: 320 },
    ];

    return {
      age: cow.age || '4 yrs',
      lactationInfo: (cow.lactationStage || 'Early Lactation')
        .replace(/ · Day \d+/gi, '')
        .replace(/Day \d+/gi, '')
        .replace(/\(Day \d+\)/gi, '')
        .trim(),
      quarters: sundariQuarters,
      whyThisRisk: sundariWhyThisRisk,
      aiForecast: sundariForecast,
      treatments: sundariTreatments,
      telemetry7Day: sundariTelemetry7Day,
    };
  }

  // 1. SPECIFIC DATA FOR LAKSHMI (C-024)
  if (cow.id === 'C-024') {
    // Standardize quarters with Left Fore, Right Fore, Left Hind, Right Hind
    const standardizedQuarters: UdderQuarterStatus[] = [
      {
        quarter: 'Left Front',
        code: 'LF',
        scc: 140,
        status: 'Low',
        conductivity: 4.8,
        temperature: 38.4,
        isAffected: false,
      },
      {
        quarter: 'Right Front',
        code: 'RF',
        scc: 165,
        status: 'Low',
        conductivity: 5.0,
        temperature: 38.5,
        isAffected: false,
      },
      {
        quarter: 'Left Rear',
        code: 'LR',
        scc: 450,
        status: 'High',
        conductivity: 7.2,
        temperature: 40.1,
        isAffected: true,
      },
      {
        quarter: 'Right Rear',
        code: 'RR',
        scc: 220,
        status: 'Watch',
        conductivity: 5.6,
        temperature: 38.8,
        isAffected: false,
      },
    ];

    return {
      age,
      lactationInfo,
      quarters: standardizedQuarters,
      whyThisRisk: LAKSHMI_WHY_THIS_RISK,
      aiForecast: LAKSHMI_FUTURE_FORECAST,
      treatments: LAKSHMI_FARMER_ACTIONS,
      telemetry7Day: LAKSHMI_TELEMETRY_7DAY,
    };
  }

  // 2. SPECIFIC DATA FOR PONNI (C-018)
  if (cow.id === 'C-018') {
    const ponniQuarters: UdderQuarterStatus[] = [
      {
        quarter: 'Left Front',
        code: 'LF',
        scc: 135,
        status: 'Low',
        conductivity: 4.7,
        temperature: 38.4,
        isAffected: false,
      },
      {
        quarter: 'Right Front',
        code: 'RF',
        scc: 310,
        status: 'Watch',
        conductivity: 5.9,
        temperature: 38.9,
        isAffected: true,
      },
      {
        quarter: 'Left Rear',
        code: 'LR',
        scc: 145,
        status: 'Low',
        conductivity: 4.8,
        temperature: 38.4,
        isAffected: false,
      },
      {
        quarter: 'Right Rear',
        code: 'RR',
        scc: 150,
        status: 'Low',
        conductivity: 4.8,
        temperature: 38.4,
        isAffected: false,
      },
    ];

    const ponniWhyThisRisk = [
      'Milk cell count rising (SCC 310,000 cells/mL – needs watching)',
      'Right-front teat feels slightly warm during morning milking',
      'Cow is chewing cud less today (down by 70 minutes)',
      'Neck sensor shows the cow was slightly restless last night',
    ];

    const ponniForecast: FutureForecastPoint[] = [
      {
        timeframe: '7 Days Ahead',
        riskPercentage: 42,
        riskLevel: 'Watch',
        clinicalState: 'Mild irritation starting inside right-front teat.',
        recommendation: 'Dip teats in antiseptic iodine and check milk with test paddle.',
      },
      {
        timeframe: '10 Days Ahead',
        riskPercentage: 54,
        riskLevel: 'Moderate',
        clinicalState: 'Milk changes starting; cow chewing cud less.',
        recommendation: 'Check milk daily and keep stall bedding dry.',
      },
      {
        timeframe: '12 Days Ahead',
        riskPercentage: 68,
        riskLevel: 'Moderate',
        clinicalState: 'Teat turning warmer; medium chance of infection flare-up.',
        recommendation: 'Prepare a clean stall and ask the doctor to check her.',
      },
      {
        timeframe: '14 Days Ahead',
        riskPercentage: 78,
        riskLevel: 'High',
        clinicalState: 'High risk of mastitis breakout if teat dip is skipped.',
        recommendation: 'Start doctor medicine promptly if swelling increases.',
      },
    ];

    const ponniTreatments: FarmerActionItem[] = [
      ...PONNI_MONITORING_ACTIONS,
      {
        id: 'pon-3',
        title: 'Dip Teats in Iodine Right After Milking',
        description: 'Dip the right-front teat completely in iodine after every milking.',
        completed: false,
        priority: 'High',
      },
      {
        id: 'pon-4',
        title: 'Milk Test (CMT) During Morning Milking',
        description: 'Use the 4-cup paddle to test milk from all 4 teats tomorrow morning.',
        completed: false,
        priority: 'Routine',
      },
    ];

    const ponniTelemetry: TelemetryDataPoint[] = [
      { day: 'Day -6', scc: 175, conductivity: 4.7, temperature: 38.3, rumination: 480 },
      { day: 'Day -5', scc: 190, conductivity: 4.8, temperature: 38.4, rumination: 475 },
      { day: 'Day -4', scc: 210, conductivity: 5.0, temperature: 38.5, rumination: 460 },
      { day: 'Day -3', scc: 240, conductivity: 5.2, temperature: 38.6, rumination: 445 },
      { day: 'Day -2', scc: 270, conductivity: 5.5, temperature: 38.7, rumination: 430 },
      { day: 'Yesterday', scc: 295, conductivity: 5.7, temperature: 38.8, rumination: 420 },
      { day: 'Today', scc: 310, conductivity: 5.9, temperature: 38.9, rumination: 410 },
    ];

    return {
      age,
      lactationInfo,
      quarters: ponniQuarters,
      whyThisRisk: ponniWhyThisRisk,
      aiForecast: ponniForecast,
      treatments: ponniTreatments,
      telemetry7Day: ponniTelemetry,
    };
  }

  // 3. SPECIFIC DATA FOR GANGA (C-007)
  if (cow.id === 'C-007') {
    const gangaQuarters: UdderQuarterStatus[] = [
      { quarter: 'Left Front', code: 'LF', scc: 140, status: 'Low', conductivity: 4.8, temperature: 38.4, isAffected: false },
      { quarter: 'Right Front', code: 'RF', scc: 155, status: 'Low', conductivity: 4.9, temperature: 38.5, isAffected: false },
      { quarter: 'Left Rear', code: 'LR', scc: 180, status: 'Low', conductivity: 5.0, temperature: 38.5, isAffected: false },
      { quarter: 'Right Rear', code: 'RR', scc: 420, status: 'High', conductivity: 6.9, temperature: 39.5, isAffected: true },
    ];

    const gangaWhy = [
      'Milk cell count jumped to 420,000 cells/mL in right-back teat',
      'Milk temperature is high at 39.5°C (mastitis indicator)',
      'Cow is chewing cud 350 min/day and resting less',
      'Right-back teat is warm and swollen',
    ];

    const gangaForecast: FutureForecastPoint[] = [
      { timeframe: '7 Days Ahead', riskPercentage: 62, riskLevel: 'Watch', clinicalState: 'Early swelling inside right-back teat.', recommendation: 'Dip teats in iodine and keep stall bedding dry.' },
      { timeframe: '10 Days Ahead', riskPercentage: 76, riskLevel: 'Moderate', clinicalState: 'Udder starting to swell; cud-chewing dropped.', recommendation: 'Check milk daily and watch cow closely.' },
      { timeframe: '12 Days Ahead', riskPercentage: 88, riskLevel: 'High', clinicalState: 'Teat turning hot; mastitis flare-up likely.', recommendation: 'Move cow to sick stall and call doctor.' },
      { timeframe: '14 Days Ahead', riskPercentage: 94, riskLevel: 'High', clinicalState: 'Severe mastitis breakout if untreated.', recommendation: 'Start doctor medicine immediately to save milk.' },
    ];

    const gangaTreatments: FarmerActionItem[] = [
      { id: 'gan-1', title: 'Move Ganga to Separate Stall (Stall 7)', description: 'Keep her apart from other milking cows to stop spread.', completed: false, priority: 'Immediate' },
      { id: 'gan-2', title: 'Do Not Mix Right-Back Teat Milk in Tank', description: 'Do not pour milk from the sick teat into the main milk can.', completed: false, priority: 'Immediate' },
      { id: 'gan-3', title: 'Dip Teats in Iodine After Milking', description: 'Cover all teats with protective iodine dip.', completed: false, priority: 'High' },
      { id: 'gan-4', title: 'Wash Right-Back Teat with Cool Water (10 min)', description: 'Gently spray cool water on the hot teat to calm heat and swelling.', completed: false, priority: 'High' },
    ];

    const gangaTelemetry: TelemetryDataPoint[] = [
      { day: 'Day -6', scc: 190, conductivity: 4.8, temperature: 38.5, rumination: 460 },
      { day: 'Day -5', scc: 210, conductivity: 5.0, temperature: 38.6, rumination: 445 },
      { day: 'Day -4', scc: 250, conductivity: 5.3, temperature: 38.8, rumination: 420 },
      { day: 'Day -3', scc: 290, conductivity: 5.8, temperature: 39.0, rumination: 400 },
      { day: 'Day -2', scc: 340, conductivity: 6.2, temperature: 39.2, rumination: 380 },
      { day: 'Yesterday', scc: 385, conductivity: 6.6, temperature: 39.4, rumination: 365 },
      { day: 'Today', scc: 420, conductivity: 6.9, temperature: 39.5, rumination: 350 },
    ];

    return {
      age,
      lactationInfo,
      quarters: gangaQuarters,
      whyThisRisk: gangaWhy,
      aiForecast: gangaForecast,
      treatments: gangaTreatments,
      telemetry7Day: gangaTelemetry,
    };
  }

  // 4. GENERAL DYNAMIC HEALTH DATA RESOLVER FOR ANY COW (SUNDARI, KAMADHENU, GAURI, ETC.)
  const isHigh = cow.riskLevel === 'High';
  const isModerate = cow.riskLevel === 'Moderate';
  const isLow = cow.riskLevel === 'Low';

  // Determine affected quarter based on cow properties or default
  let affectedQuarterName = 'None';
  let affectedCode: 'LF' | 'RF' | 'LR' | 'RR' | null = null;

  if (cow.affectedQuarter && cow.affectedQuarter.toLowerCase() !== 'none') {
    const aq = cow.affectedQuarter.toLowerCase();
    if (aq.includes('left') && (aq.includes('rear') || aq.includes('hind'))) {
      affectedCode = 'LR';
      affectedQuarterName = 'Left Hind';
    } else if (aq.includes('right') && (aq.includes('rear') || aq.includes('hind'))) {
      affectedCode = 'RR';
      affectedQuarterName = 'Right Hind';
    } else if (aq.includes('left') && (aq.includes('front') || aq.includes('fore'))) {
      affectedCode = 'LF';
      affectedQuarterName = 'Left Fore';
    } else if (aq.includes('right') && (aq.includes('front') || aq.includes('fore'))) {
      affectedCode = 'RF';
      affectedQuarterName = 'Right Fore';
    }
  } else if (isHigh) {
    affectedCode = 'LR';
    affectedQuarterName = 'Left Hind';
  } else if (isModerate) {
    affectedCode = 'RF';
    affectedQuarterName = 'Right Fore';
  }

  // Construct 4 Quarters: Left Fore, Right Fore, Left Hind, Right Hind
  const quarters: UdderQuarterStatus[] = [
    {
      quarter: 'Left Front',
      code: 'LF',
      scc: affectedCode === 'LF' ? cow.scc : isHigh ? 160 : Math.min(150, Math.round(cow.scc * 0.85)),
      status: affectedCode === 'LF' ? cow.riskLevel : 'Low',
      conductivity: affectedCode === 'LF' ? (isHigh ? 6.8 : 5.8) : 4.8,
      temperature: affectedCode === 'LF' ? cow.temperature : 38.4,
      isAffected: affectedCode === 'LF',
    },
    {
      quarter: 'Right Front',
      code: 'RF',
      scc: affectedCode === 'RF' ? cow.scc : isHigh ? 170 : Math.min(155, Math.round(cow.scc * 0.9)),
      status: affectedCode === 'RF' ? cow.riskLevel : 'Low',
      conductivity: affectedCode === 'RF' ? (isHigh ? 6.9 : 5.7) : 4.9,
      temperature: affectedCode === 'RF' ? cow.temperature : 38.4,
      isAffected: affectedCode === 'RF',
    },
    {
      quarter: 'Left Rear',
      code: 'LR',
      scc: affectedCode === 'LR' ? cow.scc : isHigh ? 165 : Math.min(145, Math.round(cow.scc * 0.88)),
      status: affectedCode === 'LR' ? cow.riskLevel : 'Low',
      conductivity: affectedCode === 'LR' ? (isHigh ? 7.1 : 5.9) : 4.8,
      temperature: affectedCode === 'LR' ? cow.temperature : 38.4,
      isAffected: affectedCode === 'LR',
    },
    {
      quarter: 'Right Rear',
      code: 'RR',
      scc: affectedCode === 'RR' ? cow.scc : isHigh ? 180 : Math.min(150, Math.round(cow.scc * 0.92)),
      status: affectedCode === 'RR' ? cow.riskLevel : 'Low',
      conductivity: affectedCode === 'RR' ? (isHigh ? 7.0 : 5.8) : 4.8,
      temperature: affectedCode === 'RR' ? cow.temperature : 38.4,
      isAffected: affectedCode === 'RR',
    },
  ];

  // Construct "WHY THIS RISK?"
  let whyThisRisk: string[] = [];
  if (isHigh) {
    whyThisRisk = [
      `Milk cell count jumped to ${cow.scc},000 cells/mL (danger level – udder infection)`,
      `Milk temperature high at ${cow.temperature}°C (mastitis heat indicator)`,
      `Cow is resting less and chewing cud down to ${cow.ruminationMinutes} min/day`,
      `${affectedQuarterName} teat is hot, swollen, and tender to touch`,
    ];
  } else if (isModerate) {
    whyThisRisk = [
      `Milk cell count rising (${cow.scc},000 cells/mL) – needs watching`,
      `Milk temperature slightly elevated at ${cow.temperature}°C (early inflammation sign)`,
      `Cow is chewing cud at ${cow.ruminationMinutes} min/day`,
      `${affectedQuarterName !== 'None' ? `${affectedQuarterName} teat` : 'Udder teats'} under daily watching during milking`,
    ];
  } else {
    // Low / Healthy (e.g. Sundari, Kamadhenu, Surabhi)
    whyThisRisk = [
      `Milk cell count is healthy at ${cow.scc},000 cells/mL (clean, safe milk)`,
      `Milk temperature normal at ${cow.temperature}°C (healthy 38.0–38.8°C range)`,
      `Cow is active and chewing cud well (${cow.ruminationMinutes} min/day)`,
      `All 4 teats are clean, healthy, and giving good milk`,
    ];
  }

  // Construct AI Future Forecast
  let aiForecast: FutureForecastPoint[] = [];
  if (isHigh) {
    aiForecast = [
      {
        timeframe: '7 Days Ahead',
        riskPercentage: Math.max(50, cow.riskPercentage - 20),
        riskLevel: 'Watch',
        clinicalState: `Early infection starting inside ${affectedQuarterName} teat.`,
        recommendation: 'Dip teats in antiseptic iodine and keep stall bedding dry.',
      },
      {
        timeframe: '10 Days Ahead',
        riskPercentage: Math.max(65, cow.riskPercentage - 8),
        riskLevel: 'Moderate',
        clinicalState: 'Udder starting to swell; cow chewing cud less.',
        recommendation: 'Check milk daily and watch cow closely.',
      },
      {
        timeframe: '12 Days Ahead',
        riskPercentage: Math.min(92, cow.riskPercentage + 6),
        riskLevel: 'High',
        clinicalState: 'Teat turning hot and sore; high chance of severe mastitis.',
        recommendation: 'Move cow to sick stall and call the doctor.',
      },
      {
        timeframe: '14 Days Ahead',
        riskPercentage: Math.min(98, cow.riskPercentage + 14),
        riskLevel: 'High',
        clinicalState: 'Severe mastitis breakout if not treated now.',
        recommendation: 'Start doctor medicine right away to save milk production.',
      },
    ];
  } else if (isModerate) {
    aiForecast = [
      {
        timeframe: '7 Days Ahead',
        riskPercentage: Math.max(30, cow.riskPercentage - 15),
        riskLevel: 'Watch',
        clinicalState: 'Mild irritation starting inside udder teats.',
        recommendation: 'Dip teats in antiseptic iodine and test milk with paddle.',
      },
      {
        timeframe: '10 Days Ahead',
        riskPercentage: cow.riskPercentage,
        riskLevel: 'Moderate',
        clinicalState: 'Milk changes starting; keep stall clean and dry.',
        recommendation: 'Check milk daily and spread clean dry sand.',
      },
      {
        timeframe: '12 Days Ahead',
        riskPercentage: Math.min(75, cow.riskPercentage + 15),
        riskLevel: 'Moderate',
        clinicalState: 'Teat turning warmer; medium risk of infection flare-up.',
        recommendation: 'Prepare a clean stall and ask the doctor to check her.',
      },
      {
        timeframe: '14 Days Ahead',
        riskPercentage: Math.min(85, cow.riskPercentage + 25),
        riskLevel: 'High',
        clinicalState: 'Risk of mastitis infection if teat cleaning is skipped.',
        recommendation: 'Apply teat dip and protect udder right away.',
      },
    ];
  } else {
    // Low risk forecast (Sundari, etc.)
    aiForecast = [
      {
        timeframe: '7 Days Ahead',
        riskPercentage: Math.max(5, cow.riskPercentage - 4),
        riskLevel: 'Low',
        clinicalState: 'Clean, healthy udder with no infection.',
        recommendation: 'Keep dipping teats in iodine after milking.',
      },
      {
        timeframe: '10 Days Ahead',
        riskPercentage: cow.riskPercentage,
        riskLevel: 'Low',
        clinicalState: 'Strong natural health and good cud-chewing.',
        recommendation: 'Keep giving clean water and balanced green fodder.',
      },
      {
        timeframe: '12 Days Ahead',
        riskPercentage: cow.riskPercentage + 2,
        riskLevel: 'Low',
        clinicalState: `Milk production steady at ~${cow.milkYield} Liters/day.`,
        recommendation: 'Keep checking daily milk quality.',
      },
      {
        timeframe: '14 Days Ahead',
        riskPercentage: cow.riskPercentage + 3,
        riskLevel: 'Low',
        clinicalState: 'Cow is in peak health with zero health issues.',
        recommendation: 'Regular herd check scheduled on Oct 2.',
      },
    ];
  }

  // Construct Treatments
  let treatments: FarmerActionItem[] = [];
  if (isHigh) {
    treatments = [
      {
        id: `${cow.id}-act-1`,
        title: `Move ${cow.name} to a Separate Stall (Stall ${cow.stall})`,
        description: 'Keep her alone so the udder infection does not spread to other cows.',
        completed: false,
        priority: 'Immediate',
      },
      {
        id: `${cow.id}-act-2`,
        title: `Do Not Put ${affectedQuarterName} Teat Milk in the Tank`,
        description: `Throw away milk from the sick ${affectedQuarterName} teat. Do not pour into the main milk can.`,
        completed: false,
        priority: 'Immediate',
      },
      {
        id: `${cow.id}-act-3`,
        title: 'Dip All 4 Teats in Iodine After Milking',
        description: 'Dip every teat in iodine medicine right away to kill germs and protect her udder.',
        completed: false,
        priority: 'High',
      },
      {
        id: `${cow.id}-act-4`,
        title: `Wash ${affectedQuarterName} Teat with Cool Clean Water (10 Mins)`,
        description: 'Gently pour clean cool water on the hot teat to reduce swelling and pain.',
        completed: false,
        priority: 'High',
      },
      {
        id: `${cow.id}-act-5`,
        title: 'Doctor Van Is On The Way',
        description: 'Dr. Rajesh Sharma is coming in his mobile van. Keep clean water ready.',
        completed: false,
        priority: 'Immediate',
      },
    ];
  } else if (isModerate) {
    treatments = [
      {
        id: `${cow.id}-act-1`,
        title: `Test Milk with Paddle in Stall ${cow.stall}`,
        description: `Use 4-cup paddle to test milk, focusing on ${affectedQuarterName}.`,
        completed: false,
        priority: 'High',
      },
      {
        id: `${cow.id}-act-2`,
        title: 'Dip Teats in Iodine Right After Milking',
        description: 'Dip all 4 teats in antiseptic iodine right after milking.',
        completed: false,
        priority: 'High',
      },
      {
        id: `${cow.id}-act-3`,
        title: `Check Stall Bedding (Stall ${cow.stall})`,
        description: 'Keep stall dry and clean out any wet spots.',
        completed: false,
        priority: 'Routine',
      },
      {
        id: `${cow.id}-act-4`,
        title: `Check Evening Cud-Chewing & Fever`,
        description: `Make sure the cow is chewing cud normally and has no fever.`,
        completed: false,
        priority: 'Routine',
      },
    ];
  } else {
    // Low risk treatments / maintenance
    treatments = [
      {
        id: `${cow.id}-act-1`,
        title: 'Routine Teat Dip After Milking',
        description: 'Dip all 4 teats in protective iodine right after milking.',
        completed: false,
        priority: 'Routine',
      },
      {
        id: `${cow.id}-act-2`,
        title: `Keep Stall Bedding Clean & Dry (Stall ${cow.stall})`,
        description: 'Keep clean, dry sand or straw in the stall so germs cannot grow.',
        completed: false,
        priority: 'Routine',
      },
      {
        id: `${cow.id}-act-3`,
        title: 'Clean Teats with Dry Wipe Before Milking',
        description: 'Wipe each teat clean before attaching the milking machine.',
        completed: false,
        priority: 'Routine',
      },
      {
        id: `${cow.id}-act-4`,
        title: 'Check Salt Lick & Mineral Feed',
        description: 'Make sure the cow has access to salt lick and fresh drinking water.',
        completed: false,
        priority: 'Routine',
      },
    ];
  }

  // Construct 7-Day Telemetry Trend
  const telemetry7Day: TelemetryDataPoint[] = [
    {
      day: 'Day -6',
      scc: Math.max(90, Math.round(cow.scc * (isHigh ? 0.35 : isModerate ? 0.6 : 0.95))),
      conductivity: isHigh ? 4.7 : 4.6,
      temperature: 38.3,
      rumination: Math.min(520, cow.ruminationMinutes + (isHigh ? 160 : isModerate ? 60 : 10)),
    },
    {
      day: 'Day -5',
      scc: Math.max(95, Math.round(cow.scc * (isHigh ? 0.4 : isModerate ? 0.65 : 0.96))),
      conductivity: isHigh ? 4.8 : 4.6,
      temperature: 38.4,
      rumination: Math.min(510, cow.ruminationMinutes + (isHigh ? 150 : isModerate ? 50 : 10)),
    },
    {
      day: 'Day -4',
      scc: Math.max(100, Math.round(cow.scc * (isHigh ? 0.45 : isModerate ? 0.72 : 0.97))),
      conductivity: isHigh ? 5.0 : 4.7,
      temperature: 38.4,
      rumination: Math.min(500, cow.ruminationMinutes + (isHigh ? 130 : isModerate ? 40 : 5)),
    },
    {
      day: 'Day -3',
      scc: Math.max(105, Math.round(cow.scc * (isHigh ? 0.52 : isModerate ? 0.8 : 0.98))),
      conductivity: isHigh ? 5.3 : 4.8,
      temperature: isHigh ? 38.7 : 38.4,
      rumination: Math.min(490, cow.ruminationMinutes + (isHigh ? 110 : isModerate ? 30 : 0)),
    },
    {
      day: 'Day -2',
      scc: Math.max(110, Math.round(cow.scc * (isHigh ? 0.68 : isModerate ? 0.88 : 0.99))),
      conductivity: isHigh ? 5.9 : 5.0,
      temperature: isHigh ? 39.1 : 38.5,
      rumination: Math.min(480, cow.ruminationMinutes + (isHigh ? 70 : isModerate ? 20 : 0)),
    },
    {
      day: 'Yesterday',
      scc: Math.max(115, Math.round(cow.scc * (isHigh ? 0.85 : isModerate ? 0.95 : 1.0))),
      conductivity: isHigh ? 6.5 : 5.3,
      temperature: isHigh ? 39.4 : 38.6,
      rumination: Math.min(470, cow.ruminationMinutes + (isHigh ? 30 : isModerate ? 10 : 0)),
    },
    {
      day: 'Today',
      scc: cow.scc,
      conductivity: isHigh ? 7.2 : isModerate ? 5.7 : 4.8,
      temperature: cow.temperature,
      rumination: cow.ruminationMinutes,
    },
  ];

  return {
    age,
    lactationInfo,
    quarters,
    whyThisRisk,
    aiForecast,
    treatments,
    telemetry7Day,
  };
}
