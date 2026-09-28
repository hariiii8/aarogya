export type RiskLevel = 'Low' | 'Moderate' | 'Watch' | 'High';

export type LanguageCode = 'en' | 'hi' | 'pa' | 'ta';

export interface UdderQuarterStatus {
  quarter: 'Left Front' | 'Right Front' | 'Left Rear' | 'Right Rear';
  code: 'LF' | 'RF' | 'LR' | 'RR';
  scc: number; // in thousands cells/mL
  status: RiskLevel;
  conductivity: number; // mS/cm
  temperature: number; // Celsius
  isAffected?: boolean;
}

export interface Cow {
  id: string; // e.g. "C-024"
  name: string; // e.g. "Lakshmi"
  breed: string; // e.g. "HF Cross"
  age?: string; // e.g. "4.2 yrs"
  lactationStage?: string; // e.g. "Lactation 2"
  stall: number; // e.g. 4
  shed: string; // e.g. "Shed B"
  riskLevel: RiskLevel;
  riskPercentage: number; // e.g. 82
  scc: number; // e.g. 450 (meaning 450,000 cells/mL)
  milkYield: number; // liters/day e.g. 24.5
  yieldSparkline: number[]; // 7-day yields
  affectedQuarter?: string; // e.g. "left-rear quarter"
  photoUrl: string;
  lactationDays: number;
  temperature: number;
  ruminationMinutes: number;
  activityPercentage: number;
  rfid?: string;
}

export interface FarmerActionItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: 'Immediate' | 'High' | 'Routine';
}

export interface TelemetryDataPoint {
  day: string;
  scc: number; // in k cells/mL
  conductivity: number;
  temperature: number;
  rumination: number;
}

export interface FutureForecastPoint {
  timeframe: string;
  riskPercentage: number;
  riskLevel: RiskLevel;
  clinicalState: string;
  recommendation: string;
}

export type MainTab = 'home' | 'cows' | 'herd' | 'veterinarian' | 'profile';

export type BottomTabType = 'home' | 'my_cows' | 'herd' | 'veterinarian' | 'profile';

export type AppScreen =
  | 'screen_1_login'
  | 'screen_2_setup'
  | 'screen_3_home'
  | 'screen_4_my_cows'
  | 'screen_5_cow_diagnostic'
  | 'screen_6_herd'
  | 'screen_7_veterinarian'
  | 'screen_8_profile';

export type HerdSubSection = 'health_analytics' | 'analytics' | 'scc' | 'farm_map' | 'recommendations' | 'regional';

export type VetSubSection = 'vet' | 'nearby_map' | 'ask_ai';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'critical' | 'alert' | 'info';
  cowId?: string;
  actions?: {
    label: string;
    actionType: 'call_vet' | 'view_cow';
    cowId?: string;
  }[];
}

export interface FarmSetupData {
  farmerName: string;
  farmName: string;
  location: string;
  pincode: string;
  herdStrength: string;
  feedingPractice: string;
  housingCondition: string;
  milkingProcedure: 'manual' | 'pump';
  milkingSchedule: string;
  environmentCondition: string;
  herdList: Cow[];
  treatmentRecord: {
    cowId: string;
    cowName: string;
    date: string;
    disease: string;
    period: string;
    currentCondition: string;
    vetName: string;
    vetClinic: string;
    vetPhone: string;
    vetEta: string;
    vetNotes: string;
  };
}
