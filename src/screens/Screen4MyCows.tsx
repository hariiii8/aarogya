import {
  Activity,
  ArrowUpDown,
  CheckCircle2,
  ChevronRight,
  Droplets,
  Filter,
  MapPin,
  PawPrint,
  Plus,
  Radio,
  Search,
  ShieldAlert,
  Sparkles,
  Thermometer,
  TrendingUp,
  X,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { CowDetailView } from '../components/CowDetailView';
import { RiskBadge } from '../components/RiskBadge';
import { COWS_DATA, THREE_INPUT_COW_DATA, TRANSLATIONS } from '../data/mockData';
import { Cow, LanguageCode, RiskLevel } from '../types';

interface Screen4MyCowsProps {
  currentLang: LanguageCode;
  onSelectCow: (cowId: string) => void;
  onShowSnackbar: (msg: string) => void;
  herdList?: Cow[];
  onUpdateCowRfid?: (cowId: string, newRfid: string) => void;
  onAddCows?: (newCows: Cow[]) => void;
}

type FilterOption = 'All' | 'High' | 'Moderate' | 'Low' | 'SCC' | 'Rumination';
type SortOption = 'risk-desc' | 'scc-desc' | 'rumination-asc' | 'stall-asc' | 'yield-desc';

export const Screen4MyCows: React.FC<Screen4MyCowsProps> = ({
  currentLang,
  onSelectCow,
  onShowSnackbar,
  herdList,
  onUpdateCowRfid,
  onAddCows,
}) => {
  const t = TRANSLATIONS[currentLang];

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterOption>('All');
  const [activeSort, setActiveSort] = useState<SortOption>('risk-desc');
  const [isAddCowOpen, setIsAddCowOpen] = useState(false);
  const [cowsList, setCowsList] = useState<Cow[]>(() => {
    const base = herdList && herdList.length > 0 ? herdList : COWS_DATA;
    const existingIds = new Set(base.map((c) => c.id));
    const missing = THREE_INPUT_COW_DATA.filter((c) => !existingIds.has(c.id));
    return [...base, ...missing];
  });

  // Synchronize herd list whenever herd setup or parent state updates
  React.useEffect(() => {
    if (herdList && herdList.length > 0) {
      const existingIds = new Set(herdList.map((c) => c.id));
      const missing = THREE_INPUT_COW_DATA.filter((c) => !existingIds.has(c.id));
      setCowsList([...herdList, ...missing]);
    }
  }, [herdList]);

  const [selectedCowForModal, setSelectedCowForModal] = useState<Cow | null>(null);

  // New cow form state
  const [newCowId, setNewCowId] = useState('');
  const [newCowName, setNewCowName] = useState('');
  const [newCowBreed, setNewCowBreed] = useState('HF Cross');
  const [newCowStall, setNewCowStall] = useState('8');
  const [newCowRfid, setNewCowRfid] = useState('');
  const [newCowRumination, setNewCowRumination] = useState('480');

  // Dynamic filter chips reflecting actual herd from setup
  const highCount = cowsList.filter((c) => c.riskLevel === 'High').length;
  const modCount = cowsList.filter((c) => c.riskLevel === 'Moderate' || c.riskLevel === 'Watch').length;
  const lowCount = cowsList.filter((c) => c.riskLevel === 'Low').length;
  const lowRuminationCount = cowsList.filter((c) => c.ruminationMinutes < 420).length;

  const filterChips: { id: FilterOption; label: string; count?: number }[] = [
    { id: 'All', label: `All ${cowsList.length}` },
    { id: 'High', label: `High ${highCount}` },
    { id: 'Moderate', label: `Moderate ${modCount}` },
    { id: 'Low', label: `Low ${lowCount}` },
    { id: 'SCC', label: 'SCC >200k' },
    { id: 'Rumination', label: `Rumination <420m ${lowRuminationCount}` },
  ];

  const filteredCows = useMemo(() => {
    let result = [...cowsList];

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.id.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q) ||
          c.breed.toLowerCase().includes(q) ||
          (c.rfid && c.rfid.toLowerCase().includes(q)) ||
          c.stall.toString().includes(q)
      );
    }

    // Filter chips
    if (activeFilter === 'High') {
      result = result.filter((c) => c.riskLevel === 'High');
    } else if (activeFilter === 'Moderate') {
      result = result.filter((c) => c.riskLevel === 'Moderate');
    } else if (activeFilter === 'Low') {
      result = result.filter((c) => c.riskLevel === 'Low');
    } else if (activeFilter === 'SCC') {
      // Show cows with elevated SCC (>200k)
      result = result.filter((c) => c.scc >= 200);
    } else if (activeFilter === 'Rumination') {
      // Show cows with dropped rumination (<420 min)
      result = result.filter((c) => c.ruminationMinutes < 420);
    }

    // Sorting: High-risk cows appear first by default
    result.sort((a, b) => {
      if (activeSort === 'risk-desc') {
        const riskOrder: Record<RiskLevel, number> = { High: 4, Watch: 3, Moderate: 2, Low: 1 };
        const diff = riskOrder[b.riskLevel] - riskOrder[a.riskLevel];
        if (diff !== 0) return diff;
        return b.riskPercentage - a.riskPercentage;
      }
      if (activeSort === 'scc-desc') {
        return b.scc - a.scc;
      }
      if (activeSort === 'rumination-asc') {
        return a.ruminationMinutes - b.ruminationMinutes;
      }
      if (activeSort === 'stall-asc') {
        return a.stall - b.stall;
      }
      if (activeSort === 'yield-desc') {
        return b.milkYield - a.milkYield;
      }
      return 0;
    });

    return result;
  }, [cowsList, searchQuery, activeFilter, activeSort]);

  const sampleFourCows: Cow[] = [
    {
      id: 'C-029',
      name: 'Radha',
      breed: 'Gir',
      stall: 9,
      shed: 'Shed A',
      riskLevel: 'Low',
      riskPercentage: 11,
      scc: 135,
      milkYield: 23.5,
      yieldSparkline: [22.8, 23.0, 23.2, 23.5, 23.4, 23.5, 23.5],
      photoUrl: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=500&auto=format&fit=crop&q=80',
      lactationStage: 'Lactation 2',
      lactationDays: 60,
      temperature: 38.4,
      ruminationMinutes: 495,
      activityPercentage: 99,
      rfid: '982-029',
    },
    {
      id: 'C-030',
      name: 'Kavery',
      breed: 'HF Cross',
      stall: 10,
      shed: 'Shed A',
      riskLevel: 'Low',
      riskPercentage: 14,
      scc: 145,
      milkYield: 27.0,
      yieldSparkline: [26.5, 26.8, 27.0, 26.9, 27.2, 27.0, 27.0],
      photoUrl: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=500&auto=format&fit=crop&q=80',
      lactationStage: 'Lactation 1',
      lactationDays: 85,
      temperature: 38.3,
      ruminationMinutes: 510,
      activityPercentage: 100,
      rfid: '982-030',
    },
    {
      id: 'C-031',
      name: 'Ganga',
      breed: 'Sahiwal',
      stall: 11,
      shed: 'Shed B',
      riskLevel: 'Moderate',
      riskPercentage: 42,
      scc: 250,
      milkYield: 19.2,
      yieldSparkline: [20.0, 19.8, 19.5, 19.2, 19.4, 19.2, 19.2],
      affectedQuarter: 'None',
      photoUrl: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=500&auto=format&fit=crop&q=80',
      lactationStage: 'Lactation 3',
      lactationDays: 130,
      temperature: 38.7,
      ruminationMinutes: 435,
      activityPercentage: 91,
      rfid: '982-031',
    },
    {
      id: 'C-032',
      name: 'Yamuna',
      breed: 'Gir',
      stall: 12,
      shed: 'Shed B',
      riskLevel: 'Low',
      riskPercentage: 16,
      scc: 155,
      milkYield: 21.0,
      yieldSparkline: [20.5, 20.8, 21.0, 21.0, 21.2, 21.0, 21.0],
      photoUrl: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=500&auto=format&fit=crop&q=80',
      lactationStage: 'Lactation 2',
      lactationDays: 110,
      temperature: 38.5,
      ruminationMinutes: 480,
      activityPercentage: 97,
      rfid: '982-032',
    },
  ];

  const handleAddFourSampleCows = () => {
    const existingIds = new Set(cowsList.map((c) => c.id));
    const freshFour = sampleFourCows.filter((c) => !existingIds.has(c.id));
    if (freshFour.length === 0) {
      onShowSnackbar('4 sample cows (Radha, Kavery, Ganga, Yamuna) are already added');
      setIsAddCowOpen(false);
      return;
    }
    const updated = [...freshFour, ...cowsList];
    setCowsList(updated);
    if (onAddCows) {
      onAddCows(freshFour);
    }
    freshFour.forEach((c) => {
      if (onUpdateCowRfid && c.rfid) onUpdateCowRfid(c.id, c.rfid);
    });
    setIsAddCowOpen(false);
    onShowSnackbar(`✓ Added 4 cows to your herd (Radha, Kavery, Ganga, Yamuna)`);
  };

  const handleAddThreeInputCows = () => {
    const existingIds = new Set(cowsList.map((c) => c.id));
    const freshThree = THREE_INPUT_COW_DATA.filter((c) => !existingIds.has(c.id));
    if (freshThree.length === 0) {
      onShowSnackbar('3 input cows (Maha, Meena, Malar) are already in your herd');
      setIsAddCowOpen(false);
      return;
    }
    const updated = [...freshThree, ...cowsList];
    setCowsList(updated);
    if (onAddCows) {
      onAddCows(freshThree);
    }
    freshThree.forEach((c) => {
      if (onUpdateCowRfid && c.rfid) onUpdateCowRfid(c.id, c.rfid);
    });
    setIsAddCowOpen(false);
    onShowSnackbar(`✓ Added 3 cows to your herd (Maha, Meena, Malar)`);
  };

  const handleCreateCow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCowName || !newCowId) return;

    const stallNum = parseInt(newCowStall, 10) || 1;
    const generatedRfid = newCowRfid.trim() || `982-${(stallNum % 100).toString().padStart(3, '0')}`;
    const parsedRumination = parseInt(newCowRumination, 10) || 480;

    const created: Cow = {
      id: newCowId.toUpperCase(),
      name: newCowName,
      breed: newCowBreed,
      stall: stallNum,
      shed: stallNum <= 24 ? 'Shed A' : 'Shed B',
      riskLevel: 'Low',
      riskPercentage: 12,
      scc: 130,
      milkYield: 22.0,
      yieldSparkline: [21, 21.5, 22, 22, 22.2, 22, 22],
      photoUrl: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=300&auto=format&fit=crop&q=80',
      lactationStage: 'Lactation 1',
      lactationDays: 45,
      temperature: 38.4,
      ruminationMinutes: parsedRumination,
      activityPercentage: 98,
      rfid: generatedRfid,
    };

    const updated = [created, ...cowsList];
    setCowsList(updated);
    if (onAddCows) {
      onAddCows([created]);
    }
    if (onUpdateCowRfid) {
      onUpdateCowRfid(created.id, generatedRfid);
    }
    setIsAddCowOpen(false);
    setNewCowId('');
    setNewCowName('');
    setNewCowRfid('');
    setNewCowRumination('480');
    onShowSnackbar(`Added new cow ${created.name} (${created.id}) with RFID ${generatedRfid}`);
  };

  return (
    <div id="screen-4-my-cows" className="space-y-3.5 sm:space-y-4 pb-24">
      {/* Top Controls: Attractive Search Bar & Add Cow */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 text-emerald-800/70 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="cows-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-9 pr-8 py-2 sm:py-2.5 bg-white border border-slate-200/90 rounded-2xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20 shadow-2xs transition-all font-sans"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 w-5 h-5 flex items-center justify-center rounded-full bg-slate-100 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Action Buttons: Quick Add 3 Cows (Maha) + Quick Add 4 Cows + Custom Add Cow */}
        <button
          id="btn-add-3-input-cows"
          type="button"
          onClick={handleAddThreeInputCows}
          title="Quickly add 3 input cows like Maha (Maha, Meena, Malar)"
          className="py-2 sm:py-2.5 px-3 sm:px-3.5 bg-emerald-50 hover:bg-emerald-100 active:scale-95 text-emerald-950 text-xs font-semibold rounded-2xl shadow-2xs border border-emerald-300 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer font-sans"
        >
          <PawPrint className="w-4 h-4 text-emerald-700" />
          <span className="whitespace-nowrap font-bold">+ 3 Cows (Maha)</span>
        </button>

        <button
          id="btn-add-4-cows"
          type="button"
          onClick={handleAddFourSampleCows}
          title={t.quickAdd4CowsLong || 'Quickly add 4 registered cows (Radha, Kavery, Ganga, Yamuna)'}
          className="py-2 sm:py-2.5 px-3 sm:px-3.5 bg-emerald-50 hover:bg-emerald-100 active:scale-95 text-emerald-950 text-xs font-semibold rounded-2xl shadow-2xs border border-emerald-300 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer font-sans"
        >
          <PawPrint className="w-4 h-4 text-emerald-700" />
          <span className="whitespace-nowrap font-bold">{t.quickAdd4Cows || '+ 4 Cows'}</span>
        </button>

        {/* Existing "+ Add Cow" button with elevated aesthetic */}
        <button
          id="btn-add-cow"
          type="button"
          onClick={() => setIsAddCowOpen(true)}
          className="py-2 sm:py-2.5 px-3 sm:px-3.5 bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-900 hover:to-teal-900 active:scale-95 text-white text-xs font-semibold rounded-2xl shadow-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer border border-emerald-700/60 font-sans tracking-tight"
        >
          <Plus className="w-4 h-4 text-emerald-200" />
          <span className="whitespace-nowrap">{t.addCow}</span>
        </button>
      </div>

      {/* Filter Chips & Sort Controls with Mobile-Friendly Wrapping */}
      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none flex-1 min-w-0">
          {filterChips.map((chip) => {
            const isActive = activeFilter === chip.id;
            return (
              <button
                key={chip.id}
                id={`filter-chip-${chip.id.toLowerCase()}`}
                type="button"
                onClick={() => setActiveFilter(chip.id)}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer shrink-0 ${
                  isActive
                    ? chip.id === 'High'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                      : chip.id === 'Moderate'
                      ? 'bg-[#5B634D] text-white border-[#5B634D] shadow-xs'
                      : 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/80 shadow-2xs'
                }`}
              >
                {chip.id === 'All' ? (
                  <span className="font-sans">{t.filterAll?.split(' ')[0] || 'All'} <span className="font-mono font-extrabold">{cowsList.length}</span></span>
                ) : chip.id === 'High' ? (
                  <span className="font-sans">{t.highRisk?.split(' ')[0] || 'High'} <span className="font-mono font-extrabold">{highCount}</span></span>
                ) : chip.id === 'Moderate' ? (
                  <span className="font-sans">{t.moderateRisk?.split(' ')[0] || 'Moderate'} <span className="font-mono font-extrabold">{modCount}</span></span>
                ) : chip.id === 'Low' ? (
                  <span className="font-sans">{t.lowRisk || 'Low'} <span className="font-mono font-extrabold">{lowCount}</span></span>
                ) : chip.id === 'Rumination' ? (
                  <span className="font-sans">{t.ruminationLabel?.split(' ')[0] || 'Rumination'} <span className="font-mono font-extrabold">&lt;420m</span></span>
                ) : (
                  <span className="font-sans">{t.sccLabel || 'SCC'} <span className="font-mono">&gt;200k</span></span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sort dropdown control */}
        <div className="relative shrink-0 self-end xs:self-auto">
          <select
            id="cows-sort-select"
            value={activeSort}
            onChange={(e) => setActiveSort(e.target.value as SortOption)}
            aria-label="Sort cows"
            className="appearance-none bg-white border border-slate-200/90 text-slate-700 text-[11px] sm:text-xs font-semibold py-1.5 pl-2.5 sm:pl-3 pr-7 rounded-full shadow-2xs focus:outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 cursor-pointer font-sans"
          >
            <option value="risk-desc">{t.sortMostSick || 'Sort: Most Sick First'}</option>
            <option value="scc-desc">{t.sortHighCells || 'Sort: High Cells First'}</option>
            <option value="rumination-asc">{t.sortLowestRumination || 'Sort: Lowest Rumination First'}</option>
            <option value="stall-asc">{t.sortStallNumber || 'Sort: Stall Number'}</option>
            <option value="yield-desc">{t.sortMostMilk || 'Sort: Most Milk First'}</option>
          </select>
          <ArrowUpDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Herd Count & Clinical Bands Status Strip (Anti-Cramp responsive stack) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 px-3 sm:px-3.5 py-2 bg-white rounded-2xl border border-slate-200/90 shadow-2xs text-[11px] text-slate-600">
        <div className="flex items-center gap-1.5 font-medium min-w-0">
          <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
          <span className="truncate">{t.showingCowsHerd || 'Showing'} <span className="font-mono font-extrabold text-slate-900">{filteredCows.length}</span> {t.cowsInYourHerd || 'cows in your herd'}</span>
        </div>
        <span className="font-mono text-emerald-950 font-bold bg-emerald-50/90 px-2 py-0.5 rounded-md border border-emerald-200/70 text-[10px] sm:text-[11px] self-start sm:self-auto shrink-0">
          {t.cellsBands || 'Cells: Safe (<200k) · Watch (200-400k) · Sick (>400k)'}
        </span>
      </div>

      {/* Cow Cards List: Shows RFID for all cows and dedicated Rumination */}
      <div className="space-y-3 sm:space-y-3.5">
        {filteredCows.map((cow) => {
          const isHigh = cow.riskLevel === 'High';
          const isModerate = cow.riskLevel === 'Moderate';
          // Live synchronize with herd setup: if setup updated the cow's RFID, use it immediately
          const setupCow = herdList?.find((h) => h.id === cow.id);
          const cowRfid = setupCow?.rfid || cow.rfid || `982-${cow.id.replace(/\D/g, '').padStart(3, '0')}`;
          const cleanLactation = (cow.lactationStage || 'Lactation 2')
            .replace(/ · Day \d+/gi, '')
            .replace(/Day \d+/gi, '')
            .trim();

          return (
            <div
              key={cow.id}
              id={`cow-card-item-${cow.id}`}
              onClick={() => onSelectCow(cow.id)}
              className={`group bg-white rounded-3xl p-3.5 sm:p-5 border transition-all cursor-pointer hover:shadow-md relative overflow-hidden space-y-3 ${
                isHigh
                  ? 'border-2 border-rose-300 shadow-xs bg-gradient-to-br from-white via-white to-rose-50/30'
                  : isModerate
                  ? 'border border-[#B8BEA9] bg-gradient-to-br from-white via-white to-[#F9FAF6]'
                  : 'border border-slate-200/90 hover:border-emerald-300'
              }`}
            >
              {/* Top indicator bar for risk categorization */}
              {isHigh && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-amber-500" />
              )}
              {isModerate && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#8A9473]" />
              )}

              {/* Main Info Row with Cow photo, Ear Tag ID, Name, RFID chip and Risk */}
              <div className="flex items-start gap-2.5 sm:gap-3.5">
                <div className="relative shrink-0">
                  <img
                    src={cow.photoUrl}
                    alt={cow.name}
                    className="w-14 h-14 sm:w-18 sm:h-18 rounded-2xl object-cover border border-slate-200 shadow-2xs bg-slate-100"
                  />
                  {isHigh && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-600 rounded-full ring-2 ring-white animate-pulse" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Cow Name, ID & Risk Badge */}
                  <div className="flex items-start justify-between gap-1.5 mb-1 flex-wrap sm:flex-nowrap">
                    <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                      <h3 className="text-base sm:text-lg font-display font-extrabold text-slate-900 tracking-tight">
                        {cow.name}
                      </h3>
                      <span className="text-[10px] sm:text-[11px] font-mono font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200 shadow-2xs shrink-0">
                        {cow.id}
                      </span>
                    </div>

                    {/* Risk Badge */}
                    <div className="shrink-0">
                      <RiskBadge
                        risk={cow.riskLevel}
                        percentage={cow.riskPercentage}
                        size="sm"
                      />
                    </div>
                  </div>

                  {/* RFID Tag Chip & Rumination Metric Pill */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-950 border border-emerald-300 shadow-2xs">
                      <Radio className="w-3 h-3 text-emerald-700 shrink-0" />
                      <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-tight text-emerald-950">
                        RFID: {cowRfid}
                      </span>
                    </span>

                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-mono font-bold shadow-2xs border ${
                      cow.ruminationMinutes < 400
                        ? 'bg-amber-50 text-amber-900 border-amber-300'
                        : 'bg-indigo-50 text-indigo-900 border-indigo-200'
                    }`}>
                      <Activity className="w-3 h-3 text-indigo-600 shrink-0" />
                      <span>Rumination: {cow.ruminationMinutes} min</span>
                    </span>
                  </div>

                  {/* Breed, Stall & Lactation Stage (Day 142 removed) */}
                  <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5 text-xs text-slate-600 font-medium">
                    <span className="text-slate-700 font-medium truncate text-[11px] sm:text-xs">
                      {cow.breed} • {cleanLactation}
                    </span>
                    <span className="text-slate-700 font-semibold font-mono text-[11px] sm:text-xs shrink-0">
                      Stall {cow.stall}
                    </span>
                  </div>
                </div>
              </div>

              {/* 4 Telemetry Stat Badges Row with Dedicated Rumination */}
              <div className="grid grid-cols-4 gap-1 sm:gap-1.5 pt-0.5">
                {/* SCC */}
                <div className="bg-slate-50/80 rounded-xl p-1.5 sm:p-2 border border-slate-200/80 text-center min-w-0">
                  <div className="text-[9px] sm:text-[10px] text-slate-500 font-semibold flex items-center justify-center gap-0.5 truncate">
                    <Droplets className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-sky-600 shrink-0" />
                    <span className="truncate">SCC</span>
                  </div>
                  <div className="text-[11px] sm:text-xs font-bold text-slate-900 font-mono mt-0.5">
                    {cow.scc}k
                  </div>
                  <div className={`text-[8.5px] sm:text-[9px] font-bold truncate ${isHigh ? 'text-rose-600' : 'text-emerald-700'}`}>
                    {isHigh ? '+38%' : 'Normal'}
                  </div>
                </div>

                {/* Milk Temp */}
                <div className="bg-slate-50/80 rounded-xl p-1.5 sm:p-2 border border-slate-200/80 text-center min-w-0">
                  <div className="text-[9px] sm:text-[10px] text-slate-500 font-semibold flex items-center justify-center gap-0.5 truncate">
                    <Thermometer className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-600 shrink-0" />
                    <span className="truncate">Temp</span>
                  </div>
                  <div className="text-[11px] sm:text-xs font-bold text-slate-900 font-mono mt-0.5">
                    {cow.temperature}°C
                  </div>
                  <div className={`text-[8.5px] sm:text-[9px] font-bold truncate ${cow.temperature > 39.5 ? 'text-rose-600' : 'text-emerald-700'}`}>
                    {cow.temperature > 39.5 ? 'Elevated' : 'Normal'}
                  </div>
                </div>

                {/* Rumination - Dedicated Core Metric */}
                <div className="bg-slate-50/80 rounded-xl p-1.5 sm:p-2 border border-slate-200/80 text-center min-w-0">
                  <div className="text-[9px] sm:text-[10px] text-slate-500 font-semibold flex items-center justify-center gap-0.5 truncate">
                    <Activity className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-indigo-600 shrink-0" />
                    <span className="truncate">Rumination</span>
                  </div>
                  <div className="text-[11px] sm:text-xs font-bold text-slate-900 font-mono mt-0.5">
                    {cow.ruminationMinutes}m
                  </div>
                  <div className={`text-[8.5px] sm:text-[9px] font-bold truncate ${cow.ruminationMinutes < 400 ? 'text-amber-700' : 'text-emerald-700'}`}>
                    {cow.ruminationMinutes < 400 ? 'Low' : 'Normal'}
                  </div>
                </div>

                {/* Milk Yield */}
                <div className="bg-slate-50/80 rounded-xl p-1.5 sm:p-2 border border-slate-200/80 text-center min-w-0">
                  <div className="text-[9px] sm:text-[10px] text-slate-500 font-semibold flex items-center justify-center gap-0.5 truncate">
                    <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-600 shrink-0" />
                    <span className="truncate">Milk</span>
                  </div>
                  <div className="text-[11px] sm:text-xs font-bold text-slate-900 font-mono mt-0.5">
                    {cow.milkYield}L
                  </div>
                  <div className={`text-[8.5px] sm:text-[9px] font-bold truncate ${isHigh ? 'text-rose-600' : 'text-emerald-700'}`}>
                    {isHigh ? '▼ Drop' : 'Stable'}
                  </div>
                </div>
              </div>

              {/* Action Button: Open Cow Health Card directly */}
              <div className="pt-0.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectCow(cow.id);
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 border border-slate-200/90 hover:border-emerald-300 font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <PawPrint className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>{t.openHealthCard || 'Open Health Card & Diagnostic'}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Cow Dialog Modal with Ear Tag and RFID Input */}
      {isAddCowOpen && (
        <div
          id="add-cow-modal-backdrop"
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in"
        >
          <div
            id="add-cow-modal-card"
            className="w-full max-w-sm bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="text-base font-display font-extrabold text-slate-900 tracking-tight">
                {t.addCowModalTitle || 'Add Cow to Your Farm'}
              </h3>
              <button
                onClick={() => setIsAddCowOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCow} className="space-y-3.5 text-xs">
              {/* Quick Input Presets for 3 Cow Data like Maha */}
              <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-2xl p-2.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-950 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                    Quick Input Cow Data (like Maha):
                  </span>
                  <button
                    type="button"
                    onClick={handleAddThreeInputCows}
                    className="text-[10px] font-bold text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
                  >
                    + Add All 3
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {THREE_INPUT_COW_DATA.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setNewCowId(preset.id);
                        setNewCowRfid(preset.rfid || '');
                        setNewCowName(preset.name);
                        setNewCowBreed(preset.breed);
                        setNewCowStall(preset.stall.toString());
                        setNewCowRumination(preset.ruminationMinutes.toString());
                        onShowSnackbar(`Filled input data for ${preset.name} (${preset.id})`);
                      }}
                      className="px-2 py-1.5 bg-white hover:bg-emerald-100 active:bg-emerald-200 border border-emerald-300/80 rounded-xl text-center shadow-2xs transition-all cursor-pointer flex flex-col items-center"
                    >
                      <span className="font-bold text-[11px] text-slate-800 leading-tight">{preset.name}</span>
                      <span className="font-mono text-[9px] text-emerald-700">{preset.id}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 font-sans">
                  {t.yellowEarTagLabel || 'Yellow Ear Tag Number'}
                </label>
                <input
                  type="text"
                  required
                  value={newCowId}
                  onChange={(e) => setNewCowId(e.target.value)}
                  placeholder="e.g. C-049"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 font-sans">
                  {t.rfidMicrochipLabel || 'RFID Microchip Tag Number'}
                </label>
                <input
                  type="text"
                  value={newCowRfid}
                  onChange={(e) => setNewCowRfid(e.target.value)}
                  placeholder="e.g. 982-049"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 font-sans">
                  {t.cowNameLabel || 'Cow Name'}
                </label>
                <input
                  type="text"
                  required
                  value={newCowName}
                  onChange={(e) => setNewCowName(e.target.value)}
                  placeholder="e.g. Gauri II"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 font-sans">
                    {t.breedLabel || 'Breed'}
                  </label>
                  <select
                    value={newCowBreed}
                    onChange={(e) => setNewCowBreed(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 cursor-pointer font-sans"
                  >
                    <option value="HF Cross">HF Cross</option>
                    <option value="Gir">Gir</option>
                    <option value="Sahiwal">Sahiwal</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1 font-sans">
                    {t.stallNumberLabel || 'Stall Number (1-8)'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={newCowStall}
                    onChange={(e) => setNewCowStall(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 font-sans">
                  {t.ruminationLabel || 'Rumination (mins/day)'}
                </label>
                <input
                  type="number"
                  min="100"
                  max="700"
                  value={newCowRumination}
                  onChange={(e) => setNewCowRumination(e.target.value)}
                  placeholder="e.g. 480"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div className="pt-3 flex flex-wrap items-center justify-between gap-2.5 border-t border-slate-100">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleAddThreeInputCows}
                    className="px-2.5 py-1.5 font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl transition-colors cursor-pointer font-sans text-xs flex items-center gap-1.5"
                  >
                    <PawPrint className="w-3.5 h-3.5 text-emerald-700" />
                    <span>+ 3 Cows (Maha)</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleAddFourSampleCows}
                    className="px-2.5 py-1.5 font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition-colors cursor-pointer font-sans text-xs flex items-center gap-1.5"
                  >
                    <PawPrint className="w-3.5 h-3.5 text-slate-600" />
                    <span>{t.quickAdd4CowsLong || '+ 4 Cows'}</span>
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddCowOpen(false)}
                    className="px-3.5 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer font-sans"
                  >
                    {t.cancelBtn || 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 font-semibold bg-emerald-800 text-white rounded-xl hover:bg-emerald-900 shadow-xs transition-colors cursor-pointer font-sans"
                  >
                    {t.saveCowBtn || 'Save Cow'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full-Screen Cow Health Detail View */}
      {selectedCowForModal && (
        <div
          id="cow-detail-full-screen-backdrop"
          className="fixed inset-0 z-50 bg-[#F8FAF9] flex flex-col overflow-y-auto animate-in fade-in duration-150 p-0 sm:p-4"
        >
          <div
            className="w-full max-w-4xl mx-auto flex-1 flex flex-col my-0 sm:my-4"
            onClick={(e) => e.stopPropagation()}
          >
            <CowDetailView
              cow={selectedCowForModal}
              currentLang={currentLang}
              onBack={() => setSelectedCowForModal(null)}
              onCallVet={() => onShowSnackbar(`Calling farm veterinarian for ${selectedCowForModal.name}...`)}
              onShowSnackbar={onShowSnackbar}
            />
          </div>
        </div>
      )}
    </div>
  );
};
