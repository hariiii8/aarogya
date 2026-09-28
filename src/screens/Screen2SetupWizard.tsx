import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Building2,
  Camera,
  Check,
  CheckCircle2,
  Clock,
  HeartPulse,
  Image as ImageIcon,
  MapPin,
  PawPrint,
  Pencil,
  Phone,
  Plus,
  Radio,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Trash2,
  Upload,
  User,
  Wheat,
  X,
} from 'lucide-react';
import React, { useRef, useState } from 'react';
import allDoneCowHeroImg from '../assets/images/all_done_cow_hero_1789996081930.jpg';
import { COWS_DATA, FARMER_PROFILE } from '../data/mockData';
import { Cow, FarmSetupData, LanguageCode } from '../types';

interface Screen2SetupWizardProps {
  initialFarmerName?: string;
  initialSetupData?: FarmSetupData;
  onCompleteWizard?: (updatedName?: string, setupData?: FarmSetupData) => void;
  onComplete?: (updatedName?: string, setupData?: FarmSetupData) => void;
  onCancel?: () => void;
  currentLang?: LanguageCode;
  onRequestPermission?: (type: 'camera' | 'location' | 'mic') => void;
  onShowSnackbar?: (msg: string) => void;
  onUpdateCowRfid?: (cowId: string, newRfid: string) => void;
}

export const Screen2SetupWizard: React.FC<Screen2SetupWizardProps> = ({
  initialFarmerName,
  initialSetupData,
  onCompleteWizard,
  onComplete,
  onCancel,
  currentLang = 'en',
  onRequestPermission,
  onShowSnackbar,
  onUpdateCowRfid,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 1: Farm Setup, Step 2: Herd Setup, Step 3: Treatment Records, Step 4: All Done
  const [currentStep, setCurrentStep] = useState<number>(1);

  // -------------------------------------------------------------
  // 1. FARM SETUP STATE (Matches Column 3 of flowchart)
  // -------------------------------------------------------------
  const [farmerName, setFarmerName] = useState(
    initialSetupData?.farmerName || initialFarmerName || FARMER_PROFILE.name || 'Murugan Natarajan'
  );
  const [farmName, setFarmName] = useState(
    initialSetupData?.farmName || FARMER_PROFILE.farmName || 'Velan Dairy & Cattle Farm'
  );
  const [location, setLocation] = useState(
    initialSetupData?.location || FARMER_PROFILE.location || 'Salem, Tamil Nadu'
  );
  const [pincode, setPincode] = useState(
    initialSetupData?.pincode || FARMER_PROFILE.pincode || '636001'
  );
  const [herdStrength, setHerdStrength] = useState(
    initialSetupData?.herdStrength || '24'
  );

  // Feeding practices options (Simple, practical language for dairy farmers)
  const feedingOptions = [
    '🌿 Fresh Green Grass & Fodder (Daily Cut)',
    '🌾 Dry Straw & Grain Bran Feed (Vaikkol / Thavudu)',
    '🌽 Corn Silage & Green Fodder',
    '🧂 Green Fodder with Mineral Salt Mixture',
  ];
  const [feedingPractice, setFeedingPractice] = useState(
    initialSetupData?.feedingPractice || feedingOptions[0]
  );

  // Housing condition options (Clear and recognizable shed types)
  const housingOptions = [
    '🏡 Open Covered Shed (Sand / Soft Dirt Floor)',
    '🧱 Cement Floor Shed with Rubber Mats & Drain',
    '💨 Airy Barn with Overhead Fans (Free Walking)',
    '🌳 Fenced Yard with Tree Shade & Open Shed',
  ];
  const [housingCondition, setHousingCondition] = useState(
    initialSetupData?.housingCondition || housingOptions[0]
  );

  // Milking procedures: manual / pump (direct toggle matching sketch)
  const [milkingProcedure, setMilkingProcedure] = useState<'manual' | 'pump'>(
    initialSetupData?.milkingProcedure || 'pump'
  );

  // Milking schedule options (Easy, farmer-friendly timing options)
  const milkingScheduleOptions = [
    '🌅 Morning 5:30 AM & 🌇 Evening 5:00 PM (Twice Daily)',
    '🌅 Morning 6:00 AM & 🌇 Evening 6:00 PM (Every 12 Hours)',
    '🌅 Morning 5:00 AM & 🌇 Evening 4:30 PM (Early Shift)',
    '🌅 Morning 6:30 AM & 🌇 Evening 5:30 PM (Standard Dairy)',
    '🌅 5:00 AM, ☀️ 1:00 PM & 🌇 9:00 PM (3 Times Daily - High Yield)',
    '🌅 Morning 6:00 AM Only (Once Daily)',
    'Custom Milking Time...',
  ];
  const [milkingSchedule, setMilkingSchedule] = useState(
    initialSetupData?.milkingSchedule || milkingScheduleOptions[0]
  );

  // Normal environment condition options (Everyday farm cleanliness terms)
  const environmentOptions = [
    '✨ Clean & Washed Daily (Dung cleared twice a day)',
    '💨 Dry & Cool Shed (Fans with good airflow)',
    '☀️ Natural Open Shed (Good sunlight & fresh breeze)',
    '🧼 Sanitized Shed with Sloped Water Drains',
  ];
  const [environmentCondition, setEnvironmentCondition] = useState(
    initialSetupData?.environmentCondition || environmentOptions[0]
  );

  // -------------------------------------------------------------
  // 2. HERD SETUP STATE (Matches Column 4 of flowchart)
  // -------------------------------------------------------------
  const [cowImagePreview, setCowImagePreview] = useState<string>(
    'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=600&auto=format&fit=crop&q=80'
  );
  const [cowId, setCowId] = useState('C-024');
  const [cowRfid, setCowRfid] = useState('982-024');
  const [editingCowForRfid, setEditingCowForRfid] = useState<Cow | null>(null);
  const [editingRfidValue, setEditingRfidValue] = useState('');
  const [cowName, setCowName] = useState('Lakshmi');
  const breedOptions = [
    'HF Cross (Holstein Friesian)',
    'Jersey Cross',
    'Gir (Desi Cow)',
    'Sahiwal',
    'Red Sindhi',
    'Murrah Buffalo',
    'Country / Native Cow',
  ];
  const [cattleBreed, setCattleBreed] = useState(breedOptions[0]);
  const [cowAge, setCowAge] = useState('4.2 yrs');
  const lactationOptions = [
    '1st Calving / Fresh Milking (Early Stage)',
    '2nd Calving / In Full Milk (Mid Stage)',
    '3rd+ Calving / Peak Yield (High Producer)',
    'Dry Period / Resting (Pregnant, Not Milking)',
  ];
  const [lactationCycle, setLactationCycle] = useState(lactationOptions[1]);
  const [milkYield, setMilkYield] = useState('24.5 L/day');
  const vaccinationOptions = [
    '✅ All Vaccines Given (FMD / Foot & Mouth Protected)',
    '⚠️ Partially Vaccinated (Next dose pending)',
    '❌ Not Vaccinated Yet',
    '📅 Booster Dose Scheduled Soon',
  ];
  const [vaccinationStatus, setVaccinationStatus] = useState(vaccinationOptions[0]);
  const [hasPreviousDisease, setHasPreviousDisease] = useState<'Yes' | 'No'>('Yes');
  const [diseaseNotes, setDiseaseNotes] = useState('Prior teat irritation in Left-Rear quarter; treated with barrier dip');

  // Registered Herd List
  const [herdList, setHerdList] = useState<Cow[]>(
    initialSetupData?.herdList && initialSetupData.herdList.length > 0
      ? initialSetupData.herdList
      : [
          {
            ...COWS_DATA[0],
            name: 'Lakshmi',
            id: 'C-024',
            breed: 'HF Cross',
            age: '4.2 yrs',
            lactationStage: 'Lactation 2',
            shed: 'Shed B',
            stall: 4,
            milkYield: 24.5,
            riskLevel: 'High',
            affectedQuarter: 'Left-rear quarter',
            photoUrl: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=600&auto=format&fit=crop&q=80',
            rfid: '982-024',
          },
          {
            ...COWS_DATA[1],
            name: 'Ponni',
            id: 'C-018',
            breed: 'Gir',
            age: '3.6 yrs',
            lactationStage: 'Lactation 1',
            shed: 'Shed A',
            stall: 2,
            milkYield: 18.0,
            riskLevel: 'Moderate',
            affectedQuarter: 'None',
            rfid: '982-018',
          },
          {
            ...COWS_DATA[2],
            name: 'Gauri',
            id: 'C-012',
            breed: 'Gir',
            age: '4.4 yrs',
            lactationStage: 'Lactation 2',
            shed: 'Shed A',
            stall: 6,
            milkYield: 16.5,
            riskLevel: 'Low',
            affectedQuarter: 'None',
            rfid: '982-012',
          },
        ]
  );

  // -------------------------------------------------------------
  // 3. TREATMENT RECORDS STATE (Matches Column 5 of flowchart)
  // -------------------------------------------------------------
  const [treatmentCowId, setTreatmentCowId] = useState(
    initialSetupData?.treatmentRecord?.cowId || 'C-024'
  );
  const [treatmentCowName, setTreatmentCowName] = useState(
    initialSetupData?.treatmentRecord?.cowName || 'Lakshmi'
  );
  const [treatmentDate, setTreatmentDate] = useState(
    initialSetupData?.treatmentRecord?.date || 'May 18, 2024'
  );
  const [treatmentDisease, setTreatmentDisease] = useState(
    initialSetupData?.treatmentRecord?.disease || 'Subclinical Mastitis (Left-rear quarter)'
  );
  const [treatmentPeriod, setTreatmentPeriod] = useState(
    initialSetupData?.treatmentRecord?.period || '5-Day Veterinary Protocol (Day 2 of 5)'
  );
  const [currentCondition, setCurrentCondition] = useState(
    initialSetupData?.treatmentRecord?.currentCondition ||
      'In Isolation Stall 4 · Inflammation Decreasing · Withholding milk'
  );
  const [vetName, setVetName] = useState(
    initialSetupData?.treatmentRecord?.vetName || 'Dr. Rajesh Sharma (B.V.Sc & A.H)'
  );
  const [vetPhone, setVetPhone] = useState(
    initialSetupData?.treatmentRecord?.vetPhone || '+91 98960 11982'
  );

  const treatmentDetails = {
    medication: 'Intramammary Infusion (Cephapirin Sodium 300mg)',
    teatCare: '0.5% Polyvinyl Iodine post-milking barrier teat dip twice daily',
    hydrotherapy: '10-minute clean cold water hydrotherapy flush to left-rear quarter',
    vetName: vetName,
    vetClinic: 'Salem Mobile Veterinary Polyclinic Van #4',
    vetPhone: vetPhone,
    vetEta: '8.4 km away · On call for AAROGYA Dairy Network',
    vetNotes:
      'Left-rear quarter warmth receding. Milk conductivity lowered to 6.8 mS/cm. Keep in Stall 4 isolation until clearance.',
  };

  const handleWizardDone = (nameToPass?: string) => {
    const finalName = typeof nameToPass === 'string' && nameToPass.trim() ? nameToPass.trim() : farmerName.trim() || 'Murugan Natarajan';
    const finalSetupData: FarmSetupData = {
      farmerName: finalName,
      farmName: farmName.trim() || 'Velan Dairy & Cattle Farm',
      location: location.trim() || 'Salem, Tamil Nadu',
      pincode: pincode.trim() || '636001',
      herdStrength: herdStrength.trim() || `${herdList.length}`,
      feedingPractice,
      housingCondition,
      milkingProcedure,
      milkingSchedule,
      environmentCondition,
      herdList,
      treatmentRecord: {
        cowId: treatmentCowId.trim() || 'C-024',
        cowName: treatmentCowName.trim() || 'Lakshmi',
        date: treatmentDate.trim() || 'May 18, 2024',
        disease: treatmentDisease.trim() || 'Subclinical Mastitis (Left-rear quarter)',
        period: treatmentPeriod.trim() || '5-Day Veterinary Protocol (Day 2 of 5)',
        currentCondition: currentCondition.trim() || 'In Isolation Stall 4 · Inflammation Decreasing · Withholding milk',
        vetName: vetName.trim() || 'Dr. Rajesh Sharma (B.V.Sc & A.H)',
        vetClinic: treatmentDetails.vetClinic,
        vetPhone: vetPhone.trim() || '+91 98960 11982',
        vetEta: treatmentDetails.vetEta,
        vetNotes: treatmentDetails.vetNotes,
      },
    };
    if (onComplete) {
      onComplete(finalName, finalSetupData);
    } else if (onCompleteWizard) {
      onCompleteWizard(finalName, finalSetupData);
    }
  };

  // Handle image upload from file input
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCowImagePreview(url);
      if (onShowSnackbar) onShowSnackbar(`Image uploaded for cow: ${file.name}`);
    }
  };

  // Preset cow image options for quick farmer selection
  const presetPhotos = [
    { label: 'HF Cross', url: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=600&auto=format&fit=crop&q=80' },
    { label: 'Gir Cow', url: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=600&auto=format&fit=crop&q=80' },
    { label: 'Sahiwal', url: 'https://images.unsplash.com/photo-1527153857715-3908f2ae5e81?w=600&auto=format&fit=crop&q=80' },
  ];

  // Add Cow to list and reset form
  const handleAddCow = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!cowName.trim() || !cowId.trim()) {
      if (onShowSnackbar) onShowSnackbar('Please enter cow name and tag ID');
      return;
    }

    const stallNum = herdList.length + 1;
    const finalRfid = cowRfid.trim() || `982 0004 1289 10${stallNum.toString().padStart(2, '0')}`;

    const newCow: Cow = {
      id: cowId.toUpperCase().trim(),
      name: cowName.trim(),
      breed: cattleBreed,
      age: cowAge,
      lactationStage: lactationCycle,
      stall: stallNum,
      shed: 'Shed A',
      riskLevel: hasPreviousDisease === 'Yes' ? 'Moderate' : 'Low',
      riskPercentage: hasPreviousDisease === 'Yes' ? 35 : 12,
      scc: 180,
      milkYield: parseFloat(milkYield) || 18,
      yieldSparkline: [17, 18, 18.2, 17.8, 18.5, 18],
      photoUrl: cowImagePreview,
      lactationDays: 60,
      temperature: 38.6,
      ruminationMinutes: 440,
      activityPercentage: 90,
      affectedQuarter: hasPreviousDisease === 'Yes' ? 'Quarter under watch' : 'None',
      rfid: finalRfid,
    };

    setHerdList([...herdList, newCow]);
    if (onShowSnackbar) {
      onShowSnackbar(`✓ Added ${newCow.name} (${newCow.id}) with RFID ${finalRfid} to herd!`);
    }

    // Auto-generate next cow ID & RFID
    const nextNum = herdList.length + 25;
    setCowId(`C-0${nextNum}`);
    setCowRfid(`982-${(nextNum % 100).toString().padStart(3, '0')}`);
    setCowName('');
    setMilkYield('20.0 L/day');
    setHasPreviousDisease('No');
  };

  const handleOpenEditRfid = (cow: Cow) => {
    setEditingCowForRfid(cow);
    setEditingRfidValue(cow.rfid || `982-${cow.id.replace(/\D/g, '').padStart(3, '0')}`);
  };

  const handleSaveRfidChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCowForRfid) return;
    const cleanRfid = editingRfidValue.trim();
    if (!cleanRfid) return;

    setHerdList((prev) =>
      prev.map((c) => (c.id === editingCowForRfid.id ? { ...c, rfid: cleanRfid } : c))
    );

    // Live propagate RFID change to parent state immediately
    if (onUpdateCowRfid) {
      onUpdateCowRfid(editingCowForRfid.id, cleanRfid);
    }

    if (onShowSnackbar) {
      onShowSnackbar(`✓ Changed RFID for ${editingCowForRfid.name} (${editingCowForRfid.id}) to ${cleanRfid}`);
    }
    setEditingCowForRfid(null);
  };

  const handleRemoveCow = (id: string) => {
    if (herdList.length <= 1) {
      if (onShowSnackbar) onShowSnackbar('At least one cow must remain in herd');
      return;
    }
    setHerdList(herdList.filter((c) => c.id !== id));
  };

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleWizardDone();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (onCancel) {
      onCancel();
    }
  };

  return (
    <div id="screen-2-setup" className="w-full max-w-2xl mx-auto flex flex-col justify-between py-2 px-2 sm:px-4 font-sans">
      {/* Top Flow Header & Step Controls (AAROGYA logo handled exclusively by Top Module) */}
      <header className="pt-1 mb-4">
        <div className="flex items-center justify-between mb-3 px-0.5">
          <button
            id="setup-back-btn"
            type="button"
            onClick={handlePrevStep}
            className="w-10 h-10 rounded-full bg-white border border-slate-200/80 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            aria-label="Previous step"
          >
            <ArrowLeft className="w-4 h-4 text-slate-700" />
          </button>

          <div className="inline-flex items-center gap-2 bg-[#d1fae5] border border-[#6ee7b7] text-[#065f46] px-5 py-1.5 rounded-full font-extrabold text-xs tracking-wider uppercase shadow-2xs">
            <div className="w-4 h-4 rounded-full bg-[#047857] text-white flex items-center justify-center shrink-0">
              <Check className="w-2.5 h-2.5 stroke-[3]" />
            </div>
            <span>
              {currentStep === 1 && 'STEP 1: FARM SETUP'}
              {currentStep === 2 && 'STEP 2: HERD SETUP'}
              {currentStep === 3 && 'STEP 3: TREATMENT'}
              {currentStep === 4 && 'STEP 4: ALL DONE'}
            </span>
          </div>

          <button
            id="setup-skip-btn"
            type="button"
            onClick={() => handleWizardDone(farmerName)}
            className="text-xs font-bold text-slate-700 hover:text-[#065f46] transition-colors cursor-pointer flex items-center gap-1"
          >
            <span>Skip</span>
            <span>→</span>
          </button>
        </div>

        {/* 4 Step Pills matching image */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
          {[
            { num: 1, label: 'Farm Setup', icon: 'cow' },
            { num: 2, label: 'Herd Setup', icon: 'cow' },
            { num: 3, label: 'Treatment', icon: 'plus' },
            { num: 4, label: 'All Done', icon: 'check' },
          ].map((s) => {
            const isCurrent = s.num === currentStep;
            const isDone = s.num < currentStep || (currentStep === 4 && s.num < 4);

            if (isCurrent) {
              return (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => setCurrentStep(s.num)}
                  className="py-2 px-1 sm:px-2.5 rounded-full text-center transition-all cursor-pointer text-xs font-bold flex items-center justify-center gap-1.5 bg-[#064e3b] text-white shadow-xs border border-[#064e3b]"
                >
                  <div className="w-4 h-4 rounded-full bg-[#34d399] text-[#064e3b] flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span className="truncate">{s.label}</span>
                </button>
              );
            }

            if (isDone || s.num <= currentStep) {
              return (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => setCurrentStep(s.num)}
                  className="py-2 px-1 sm:px-2.5 rounded-full text-center transition-all cursor-pointer text-xs font-bold flex items-center justify-center gap-1.5 bg-[#d1fae5] text-[#065f46] border border-[#a7f3d0] shadow-2xs"
                >
                  <Check className="w-3.5 h-3.5 text-[#047857] stroke-[3] shrink-0" />
                  {s.icon === 'cow' ? (
                    <span className="text-xs shrink-0">🐄</span>
                  ) : s.icon === 'plus' ? (
                    <span className="w-3.5 h-3.5 rounded-full bg-[#064e3b] text-white flex items-center justify-center text-[9px] shrink-0 font-black">+</span>
                  ) : null}
                  <span className="truncate">{s.label}</span>
                </button>
              );
            }

            return (
              <button
                key={s.num}
                type="button"
                onClick={() => setCurrentStep(s.num)}
                className="py-2 px-1 sm:px-2.5 rounded-full text-center transition-all cursor-pointer text-xs font-bold flex items-center justify-center gap-1.5 bg-slate-100 text-slate-500 border border-slate-200"
              >
                {s.icon === 'cow' ? (
                  <span className="text-xs shrink-0 opacity-70">🐄</span>
                ) : s.icon === 'plus' ? (
                  <span className="w-3.5 h-3.5 rounded-full bg-slate-400 text-white flex items-center justify-center text-[9px] shrink-0 font-black">+</span>
                ) : null}
                <span className="truncate">{s.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* ============================================================= */}
      {/* STEP 1: FARM SETUP (Column 3 of flowchart)                    */}
      {/* ============================================================= */}
      {currentStep === 1 && (
        <section id="step-1-farm-setup" className="space-y-4 animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
            {/* Header: Welcome [name] ? Enter your farm details. */}
            <div className="mb-4 pb-3 border-b border-slate-100">
              <h2 className="text-lg sm:text-xl font-display font-extrabold text-slate-900">
                Welcome, {farmerName} ?
              </h2>
              <p className="text-xs text-slate-600 mt-0.5 font-medium">
                Enter your farm details.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleNextStep();
              }}
              className="space-y-3.5 text-xs"
            >
              {/* Field 0: Farmer & Farm Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="farm-farmer-name-input" className="block font-bold text-slate-700 mb-1">
                    Farmer Name :
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4 text-emerald-700" />
                    </div>
                    <input
                      id="farm-farmer-name-input"
                      type="text"
                      required
                      value={farmerName}
                      onChange={(e) => setFarmerName(e.target.value)}
                      placeholder="e.g. Murugan Natarajan"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700 font-medium text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="farm-name-input" className="block font-bold text-slate-700 mb-1">
                    Farm Name / Dairy :
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Building2 className="w-4 h-4 text-emerald-700" />
                    </div>
                    <input
                      id="farm-name-input"
                      type="text"
                      required
                      value={farmName}
                      onChange={(e) => setFarmName(e.target.value)}
                      placeholder="e.g. Velan Dairy & Cattle Farm"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700 font-medium text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Field 1: Location */}
              <div>
                <label htmlFor="farm-location-input" className="block font-bold text-slate-700 mb-1">
                  Location :
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <MapPin className="w-4 h-4 text-emerald-700" />
                  </div>
                  <input
                    id="farm-location-input"
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Salem, Tamil Nadu"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700 font-medium text-slate-900"
                  />
                </div>
              </div>

              {/* Field 2: Pincode */}
              <div>
                <label htmlFor="farm-pincode-input" className="block font-bold text-slate-700 mb-1">
                  Pincode :
                </label>
                <input
                  id="farm-pincode-input"
                  type="text"
                  required
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="636001"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700 font-mono font-bold text-slate-900"
                />
              </div>

              {/* Field 3: Herd strength */}
              <div>
                <label htmlFor="farm-herd-strength-input" className="block font-bold text-slate-700 mb-1">
                  Herd strength :
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="farm-herd-strength-input"
                    type="number"
                    min={1}
                    required
                    value={herdStrength}
                    onChange={(e) => setHerdStrength(e.target.value)}
                    placeholder="24"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700 font-mono font-bold text-slate-900"
                  />
                  <span className="text-slate-500 font-bold whitespace-nowrap">Cattle Total</span>
                </div>
              </div>

              {/* Field 4: Feeding practices */}
              <div>
                <label htmlFor="farm-feeding-select" className="block font-bold text-slate-700 mb-1">
                  feeding practices :
                </label>
                <select
                  id="farm-feeding-select"
                  value={feedingPractice}
                  onChange={(e) => setFeedingPractice(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700 font-medium text-slate-900 cursor-pointer"
                >
                  {feedingOptions.map((opt, i) => (
                    <option key={i} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Field 5: Housing condition */}
              <div>
                <label htmlFor="farm-housing-select" className="block font-bold text-slate-700 mb-1">
                  Housing condition :
                </label>
                <select
                  id="farm-housing-select"
                  value={housingCondition}
                  onChange={(e) => setHousingCondition(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700 font-medium text-slate-900 cursor-pointer"
                >
                  {housingOptions.map((opt, i) => (
                    <option key={i} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Field 6: Milking procedures: manual / pump (Interactive direct toggle) */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  milking procedures: manual / pump
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200">
                  <button
                    id="milking-proc-manual-btn"
                    type="button"
                    onClick={() => setMilkingProcedure('manual')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      milkingProcedure === 'manual'
                        ? 'bg-white text-emerald-950 shadow-xs border border-emerald-300 font-extrabold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>Manual (Hand)</span>
                    {milkingProcedure === 'manual' && <Check className="w-3.5 h-3.5 text-emerald-700" />}
                  </button>

                  <button
                    id="milking-proc-pump-btn"
                    type="button"
                    onClick={() => setMilkingProcedure('pump')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      milkingProcedure === 'pump'
                        ? 'bg-emerald-800 text-white shadow-xs font-extrabold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>Pump (Machine)</span>
                    {milkingProcedure === 'pump' && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                </div>
              </div>

              {/* Field 7: Milking schedule: timing */}
              <div>
                <label htmlFor="farm-milking-schedule-select" className="block font-bold text-slate-700 mb-1">
                  milking schedule: timing :
                </label>
                <div className="relative">
                  <select
                    id="farm-milking-schedule-select"
                    value={
                      milkingScheduleOptions.includes(milkingSchedule)
                        ? milkingSchedule
                        : 'Custom Milking Time...'
                    }
                    onChange={(e) => {
                      if (e.target.value !== 'Custom Milking Time...') {
                        setMilkingSchedule(e.target.value);
                      } else {
                        setMilkingSchedule('Morning 5:00 AM & Evening 5:00 PM');
                      }
                    }}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700 font-medium text-slate-900 cursor-pointer"
                  >
                    {milkingScheduleOptions.map((opt, i) => (
                      <option key={i} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                {/* If custom or user wants to edit specific time */}
                {!milkingScheduleOptions.slice(0, -1).includes(milkingSchedule) && (
                  <div className="relative mt-2">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Clock className="w-4 h-4 text-slate-500" />
                    </div>
                    <input
                      id="farm-milking-schedule-input"
                      type="text"
                      value={milkingSchedule}
                      onChange={(e) => setMilkingSchedule(e.target.value)}
                      placeholder="e.g. Morning 5:00 AM & Evening 5:00 PM"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700 font-medium text-slate-900 text-xs"
                    />
                  </div>
                )}
              </div>

              {/* Field 8: Normal environment condition */}
              <div>
                <label htmlFor="farm-environment-select" className="block font-bold text-slate-700 mb-1">
                  normal environment condition :
                </label>
                <select
                  id="farm-environment-select"
                  value={environmentCondition}
                  onChange={(e) => setEnvironmentCondition(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700 font-medium text-slate-900 cursor-pointer"
                >
                  {environmentOptions.map((opt, i) => (
                    <option key={i} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Flowchart Pagination Dots: ● ○ ○ */}
              <div className="pt-2 flex items-center justify-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-800 ring-4 ring-emerald-200" title="Farm Setup" />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" title="Herd Setup" />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" title="Treatment Records" />
              </div>

              {/* Next → Button */}
              <button
                id="farm-setup-next-btn"
                type="submit"
                className="w-full py-3.5 px-4 bg-emerald-800 hover:bg-emerald-900 active:scale-[0.99] text-white text-sm font-display font-extrabold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer font-sans mt-3"
              >
                <span>Next →</span>
              </button>
            </form>
          </div>
        </section>
      )}

      {/* ============================================================= */}
      {/* STEP 2: HERD SETUP (Column 4 of flowchart)                    */}
      {/* ============================================================= */}
      {currentStep === 2 && (
        <section id="step-2-herd-setup" className="space-y-4 animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
            {/* Header: Enter the details of cow. */}
            <div className="mb-4 pb-3 border-b border-slate-100">
              <h2 className="text-lg sm:text-xl font-display font-extrabold text-slate-900">
                Enter the details of cow.
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Register cows into your AAROGYA herd database.
              </p>
            </div>

            <form onSubmit={handleAddCow} className="space-y-3.5 text-xs">
              {/* Add Image: file (matching sketch) */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Add Image: file
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-emerald-600/30 bg-slate-50 shrink-0 shadow-2xs">
                    <img
                      src={cowImagePreview}
                      alt="Cow Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 space-y-1.5">
                    {/* Hidden Native File Input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold rounded-xl border border-emerald-300 flex items-center gap-1.5 cursor-pointer text-xs"
                      >
                        <Upload className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Choose File</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (onRequestPermission) onRequestPermission('camera');
                          else fileInputRef.current?.click();
                        }}
                        className="py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-xl border border-slate-200 flex items-center gap-1.5 cursor-pointer text-xs"
                      >
                        <Camera className="w-3.5 h-3.5 text-slate-500" />
                        <span>Take Photo</span>
                      </button>
                    </div>

                    {/* Quick preset selector */}
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <span className="text-[10px] text-slate-400 font-medium">Presets:</span>
                      {presetPhotos.map((preset, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setCowImagePreview(preset.url)}
                          className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 hover:bg-emerald-100 cursor-pointer"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* cow ID / Yellow Ear Tag number & RFID Tag number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="cow-id-input" className="block font-bold text-slate-700 mb-1">
                    Ear Tag ID :
                  </label>
                  <input
                    id="cow-id-input"
                    type="text"
                    required
                    value={cowId}
                    onChange={(e) => setCowId(e.target.value)}
                    placeholder="EX: C-024"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700 font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label htmlFor="cow-rfid-input" className="block font-bold text-slate-700 mb-1">
                    RFID Tag Number :
                  </label>
                  <input
                    id="cow-rfid-input"
                    type="text"
                    required
                    value={cowRfid}
                    onChange={(e) => setCowRfid(e.target.value)}
                    placeholder="e.g. 982-024"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700 font-mono font-bold text-slate-900"
                  />
                </div>
              </div>

              {/* Name of cow: */}
              <div>
                <label htmlFor="cow-name-input" className="block font-bold text-slate-700 mb-1">
                  Name of cow :
                </label>
                <input
                  id="cow-name-input"
                  type="text"
                  required
                  value={cowName}
                  onChange={(e) => setCowName(e.target.value)}
                  placeholder="e.g. Lakshmi"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700 font-medium text-slate-900"
                />
              </div>

              {/* cattle breed */}
              <div>
                <label htmlFor="cow-breed-select" className="block font-bold text-slate-700 mb-1">
                  cattle breed :
                </label>
                <select
                  id="cow-breed-select"
                  value={cattleBreed}
                  onChange={(e) => setCattleBreed(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700 font-medium text-slate-900 cursor-pointer"
                >
                  {breedOptions.map((opt, i) => (
                    <option key={i} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Age: */}
              <div>
                <label htmlFor="cow-age-input" className="block font-bold text-slate-700 mb-1">
                  Age :
                </label>
                <input
                  id="cow-age-input"
                  type="text"
                  required
                  value={cowAge}
                  onChange={(e) => setCowAge(e.target.value)}
                  placeholder="e.g. 4.2 yrs"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700 font-medium text-slate-900"
                />
              </div>

              {/* lactation cycle */}
              <div>
                <label htmlFor="cow-lactation-select" className="block font-bold text-slate-700 mb-1">
                  lactation cycle :
                </label>
                <select
                  id="cow-lactation-select"
                  value={lactationCycle}
                  onChange={(e) => setLactationCycle(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700 font-medium text-slate-900 cursor-pointer"
                >
                  {lactationOptions.map((opt, i) => (
                    <option key={i} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* normal milk yield: */}
              <div>
                <label htmlFor="cow-yield-input" className="block font-bold text-slate-700 mb-1">
                  normal milk yield :
                </label>
                <input
                  id="cow-yield-input"
                  type="text"
                  required
                  value={milkYield}
                  onChange={(e) => setMilkYield(e.target.value)}
                  placeholder="e.g. 24.5 L/day"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700 font-mono font-bold text-slate-900"
                />
              </div>

              {/* vaccination status */}
              <div>
                <label htmlFor="cow-vaccination-select" className="block font-bold text-slate-700 mb-1">
                  vaccination status :
                </label>
                <select
                  id="cow-vaccination-select"
                  value={vaccinationStatus}
                  onChange={(e) => setVaccinationStatus(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700 font-medium text-slate-900 cursor-pointer"
                >
                  {vaccinationOptions.map((opt, i) => (
                    <option key={i} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Any previous Disease: Yes / No */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Any previous Disease: Yes / No
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200">
                  <button
                    id="prev-disease-yes-btn"
                    type="button"
                    onClick={() => setHasPreviousDisease('Yes')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      hasPreviousDisease === 'Yes'
                        ? 'bg-amber-50 text-amber-950 shadow-xs border border-amber-300 font-extrabold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>Yes</span>
                    {hasPreviousDisease === 'Yes' && <Check className="w-3.5 h-3.5 text-amber-700" />}
                  </button>

                  <button
                    id="prev-disease-no-btn"
                    type="button"
                    onClick={() => setHasPreviousDisease('No')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      hasPreviousDisease === 'No'
                        ? 'bg-emerald-800 text-white shadow-xs font-extrabold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>No</span>
                    {hasPreviousDisease === 'No' && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                </div>

                {hasPreviousDisease === 'Yes' && (
                  <div className="mt-2 space-y-1.5">
                    <input
                      type="text"
                      value={diseaseNotes}
                      onChange={(e) => setDiseaseNotes(e.target.value)}
                      placeholder="Enter prior disease or mastitis details"
                      className="w-full px-3 py-2 bg-amber-50/70 border border-amber-200 rounded-xl text-amber-950 font-medium text-xs focus:ring-2 focus:ring-amber-500"
                    />
                    <div className="flex flex-wrap gap-1">
                      {[
                        'Prior Mastitis in Left-Rear Teat',
                        'Teat Irritation / Cracks',
                        'High Somatic Cell Count (SCC)',
                        'Calving / Milk Fever',
                      ].map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => setDiseaseNotes(chip)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                            diseaseNotes === chip
                              ? 'bg-amber-100 text-amber-950 border-amber-300'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-amber-50'
                          }`}
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Flowchart Pagination Dots: ○ ● ○ */}
              <div className="pt-2 flex items-center justify-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" title="Farm Setup" />
                <span className="w-3 h-3 rounded-full bg-emerald-800 ring-4 ring-emerald-200" title="Herd Setup" />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" title="Treatment Records" />
              </div>

              {/* Two Bottom Action Buttons matching flowchart Column 4:
                  [ + ADD COW'S ]    [ SETUP ] */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  id="add-cows-btn"
                  type="button"
                  onClick={() => handleAddCow()}
                  className="py-3 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border-2 border-emerald-700 rounded-2xl text-xs font-display font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-emerald-800 stroke-[3]" />
                  <span>+ ADD COW'S</span>
                </button>

                <button
                  id="herd-setup-next-btn"
                  type="button"
                  onClick={handleNextStep}
                  className="py-3 px-3 bg-emerald-800 hover:bg-emerald-900 active:scale-[0.99] text-white rounded-2xl text-xs font-display font-extrabold shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>SETUP →</span>
                </button>
              </div>
            </form>

            {/* Registered Cows Badges section with RFID Management */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700">
                  Registered Cows in Herd ({herdList.length}) :
                </span>
                <span className="text-[10px] text-slate-500 font-medium">Click "Change RFID" to update</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {herdList.map((cow) => {
                  const cowRfid = cow.rfid || `982-${cow.id.replace(/\D/g, '').padStart(3, '0')}`;
                  return (
                    <div
                      key={cow.id}
                      className="p-2.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-2 shadow-2xs hover:border-emerald-300 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-emerald-800 font-mono font-bold text-[11px] bg-emerald-100/70 px-1.5 py-0.5 rounded">
                            {cow.id}
                          </span>
                          <span className="font-bold text-slate-900 text-xs truncate">{cow.name}</span>
                          <span className="text-[10px] text-slate-500 font-medium">Stall {cow.stall}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-[11px] font-mono text-emerald-900 font-bold bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                          <Radio className="w-3 h-3 text-emerald-700 shrink-0 animate-pulse" />
                          <span className="truncate">RFID: {cowRfid}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenEditRfid(cow)}
                          className="px-2 py-1 text-[11px] font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-100 hover:bg-emerald-200 rounded-lg flex items-center gap-1 transition-colors cursor-pointer border border-emerald-300"
                          title="Change RFID in Herd Setup"
                        >
                          <Pencil className="w-3 h-3" />
                          <span>Change RFID</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveCow(cow.id)}
                          className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Remove cow"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Modal to Change RFID in Herd Setup */}
          {editingCowForRfid && (
            <div
              id="change-rfid-modal-backdrop"
              onClick={() => setEditingCowForRfid(null)}
              className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in"
            >
              <div
                id="change-rfid-modal-card"
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                      <Radio className="w-4 h-4 text-emerald-700" />
                    </div>
                    <div>
                      <h3 className="text-sm font-display font-extrabold text-slate-900 leading-tight">
                        Change Cow RFID Tag
                      </h3>
                      <span className="text-[10px] text-slate-500 font-medium">
                        Herd Setup · {editingCowForRfid.name} ({editingCowForRfid.id})
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingCowForRfid(null)}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSaveRfidChange} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      New RFID Microchip Tag Number :
                    </label>
                    <input
                      type="text"
                      required
                      value={editingRfidValue}
                      onChange={(e) => setEditingRfidValue(e.target.value)}
                      placeholder="e.g. 982-024"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-700"
                    />
                    <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">
                      RFID microchip tag number. Saving will immediately update this cow in My Cows.
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setEditingCowForRfid(null)}
                      className="px-3 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 font-bold bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      Save RFID
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ============================================================= */}
      {/* STEP 3: TREATMENT RECORDS (Column 5 of flowchart)             */}
      {/* Pop-up screen with cow ID, Name, disease, period, condt.      */}
      {/* ============================================================= */}
      {currentStep === 3 && (
        <section id="step-3-treatment-records" className="space-y-4 animate-in fade-in">
          {/* Card styled as the "Pop-up screen" from the sketch */}
          <div className="bg-white border-2 border-emerald-600/60 rounded-3xl p-5 shadow-lg relative overflow-hidden">
            {/* Pop-up screen indicator badge */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-300">
                  Pop-up screen
                </span>
                <span className="text-xs font-bold text-slate-600">
                  Treatment Records
                </span>
              </div>
              <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                Active Protocol
              </span>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleNextStep();
              }}
              className="space-y-3.5 text-xs"
            >
              {/* Cow ID : C-024 */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Cow ID :
                </label>
                <input
                  type="text"
                  value={treatmentCowId}
                  onChange={(e) => setTreatmentCowId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-extrabold text-emerald-950 text-sm focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              {/* Name of cow : Lakshmi */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Name of cow :
                </label>
                <input
                  type="text"
                  value={treatmentCowName}
                  onChange={(e) => setTreatmentCowName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 text-sm focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              {/* Date of identification : */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Date of identification :
                </label>
                <input
                  type="text"
                  value={treatmentDate}
                  onChange={(e) => setTreatmentDate(e.target.value)}
                  placeholder="May 18, 2024"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 text-xs focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              {/* disease */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  disease :
                </label>
                <input
                  type="text"
                  value={treatmentDisease}
                  onChange={(e) => setTreatmentDisease(e.target.value)}
                  placeholder="Subclinical Mastitis"
                  className="w-full px-3 py-2.5 bg-red-50/50 border border-red-200 rounded-xl font-bold text-red-950 text-xs focus:ring-2 focus:ring-red-500"
                />
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {[
                    'Subclinical Mastitis',
                    'Teat Swelling / Redness',
                    'Teat Cut or Scratch',
                    'Milk Fever after Calving',
                  ].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setTreatmentDisease(d)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                        treatmentDisease === d
                          ? 'bg-rose-100 text-rose-900 border-rose-300'
                          : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200/70'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* treatment period */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  treatment period :
                </label>
                <input
                  type="text"
                  value={treatmentPeriod}
                  onChange={(e) => setTreatmentPeriod(e.target.value)}
                  placeholder="5-Day Veterinary Protocol (Day 2 of 5)"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 text-xs focus:ring-2 focus:ring-emerald-700"
                />
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {[
                    '5-Day Veterinary Protocol (Day 2 of 5)',
                    '3-Day Antibiotic Course (Day 1 of 3)',
                    '7-Day Observation Course',
                    'Course Finished / Follow-up',
                  ].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setTreatmentPeriod(p)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                        treatmentPeriod === p
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200/70'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Current condt. */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Current condt. :
                </label>
                <textarea
                  rows={2}
                  value={currentCondition}
                  onChange={(e) => setCurrentCondition(e.target.value)}
                  placeholder="In Isolation Stall 4 · Inflammation Decreasing · Withholding milk"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 text-xs focus:ring-2 focus:ring-emerald-700"
                />
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {[
                    'In Isolation Stall · Milk Withheld',
                    'Swelling Decreased · Normal Eating',
                    'Mild Redness · Teat Barrier Dip Applied',
                    'Cleared by Vet · Ready to Return to Herd',
                  ].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCurrentCondition(c)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                        currentCondition === c
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200/70'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Assigned Vet Doctor & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Assigned Vet Doctor :
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                      <Stethoscope className="w-3.5 h-3.5 text-emerald-700" />
                    </div>
                    <input
                      type="text"
                      value={vetName}
                      onChange={(e) => setVetName(e.target.value)}
                      placeholder="Dr. Rajesh Sharma"
                      className="w-full pl-8 pr-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 text-xs focus:ring-2 focus:ring-emerald-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Vet Phone Number :
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-3.5 h-3.5 text-emerald-700" />
                    </div>
                    <input
                      type="text"
                      value={vetPhone}
                      onChange={(e) => setVetPhone(e.target.value)}
                      placeholder="+91 98960 11982"
                      className="w-full pl-8 pr-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-medium text-slate-900 text-xs focus:ring-2 focus:ring-emerald-700"
                    />
                  </div>
                </div>
              </div>

              {/* Clinical notes card */}
              <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-1 text-xs">
                <div className="flex items-center gap-1.5 text-emerald-950 font-bold">
                  <Stethoscope className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Assigned Vet: {vetName}</span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  {treatmentDetails.vetClinic} · Tel: {vetPhone}
                </p>
                <p className="text-slate-700 text-[11px] font-medium pt-1">
                  <em>"{treatmentDetails.vetNotes}"</em>
                </p>
              </div>

              {/* Flowchart Pagination Dots: ○ ○ ● */}
              <div className="pt-2 flex items-center justify-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" title="Farm Setup" />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" title="Herd Setup" />
                <span className="w-3 h-3 rounded-full bg-emerald-800 ring-4 ring-emerald-200" title="Treatment Records" />
              </div>

              {/* Button: [ enter ] (matching sketch Column 5) */}
              <button
                id="treatment-enter-btn"
                type="submit"
                className="w-full py-3.5 px-4 bg-emerald-800 hover:bg-emerald-900 active:scale-[0.99] text-white text-sm font-display font-extrabold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer font-sans mt-2"
              >
                <span>enter →</span>
              </button>
            </form>
          </div>
        </section>
      )}

      {/* ============================================================= */}
      {/* STEP 4: ALL DONE (Setup Completion)                           */}
      {/* ============================================================= */}
      {currentStep === 4 && (
        <section id="step-4-all-done" className="w-full max-w-xl mx-auto space-y-4 animate-in fade-in duration-300">
          {/* Main All Done Card */}
          <div className="bg-gradient-to-b from-emerald-50/50 via-white to-teal-50/30 border border-emerald-900/10 rounded-[28px] p-5 sm:p-7 shadow-[0_10px_25px_-5px_rgba(6,78,59,0.06)] relative overflow-hidden space-y-5 sm:space-y-6">
            {/* Top Hero Section: All Done Header + Cow Hero Image */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 sm:gap-6">
              {/* Checkmark + All Done Title & Description */}
              <div className="flex items-start gap-4 flex-1 min-w-0">
                {/* Premium circular check icon with subtle success glow */}
                <div className="relative shrink-0 mt-0.5">
                  <div className="absolute -inset-2.5 rounded-full bg-emerald-400/25 blur-lg pointer-events-none" />
                  <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-emerald-50 border border-emerald-200/90 flex items-center justify-center shadow-xs">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-700/20 text-white">
                      <Check className="w-6 h-6 stroke-[3.5]" />
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-w-0 pt-0.5">
                  <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-emerald-950 tracking-tight leading-none">
                    All Done
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed mt-2">
                    Your AAROGYA bovine health & mastitis guard setup is complete!
                  </p>
                </div>
              </div>

              {/* Clean Rounded Rectangular Cow Image Card with natural professional crop */}
              <div className="w-full sm:w-52 md:w-56 h-44 sm:h-36 shrink-0 rounded-2xl overflow-hidden border border-emerald-950/10 shadow-sm bg-slate-100 relative group">
                <img
                  src={allDoneCowHeroImg}
                  alt="Aarogya Bovine Dairy Farm"
                  className="w-full h-full object-cover object-[center_30%] transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/15 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>

            {/* Completion Summary: Premium Checklist Card */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs divide-y divide-slate-100">
              {/* Row 1: Farmer setup completed */}
              <div className="flex items-start gap-3.5 pb-3.5">
                <div className="w-5.5 h-5.5 sm:w-6 sm:h-6 rounded-full bg-emerald-100/90 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5 ring-2 ring-emerald-500/10">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                    Farmer setup completed
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 font-normal leading-relaxed mt-0.5">
                    ({farmerName} - {location})
                  </p>
                </div>
              </div>

              {/* Row 2: Herd setup completed */}
              <div className="flex items-start gap-3.5 py-3.5">
                <div className="w-5.5 h-5.5 sm:w-6 sm:h-6 rounded-full bg-emerald-100/90 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5 ring-2 ring-emerald-500/10">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                    Herd setup completed
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 font-normal leading-relaxed mt-0.5">
                    ({herdList.length} Cows registered & profiled)
                  </p>
                </div>
              </div>

              {/* Row 3: Treatment records logged */}
              <div className="flex items-start gap-3.5 pt-3.5">
                <div className="w-5.5 h-5.5 sm:w-6 sm:h-6 rounded-full bg-emerald-100/90 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5 ring-2 ring-emerald-500/10">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                    Treatment records logged
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 font-normal leading-relaxed mt-0.5">
                    ({treatmentCowName} {treatmentCowId} protocol active - Mobile Vet connected)
                  </p>
                </div>
              </div>
            </div>

            {/* Primary CTA Button: Ready to go → */}
            <div className="pt-1">
              <button
                id="ready-to-go-btn"
                type="button"
                onClick={() => handleWizardDone(farmerName)}
                className="w-full py-4 px-6 bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 hover:from-emerald-900 hover:via-emerald-800 hover:to-teal-900 active:scale-[0.985] text-white text-sm sm:text-base font-display font-extrabold rounded-2xl shadow-lg shadow-emerald-900/15 hover:shadow-xl hover:shadow-emerald-900/20 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer font-sans"
              >
                <span>Ready to go →</span>
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
