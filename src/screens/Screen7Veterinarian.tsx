import {
  AlertCircle,
  Bot,
  Calendar,
  CheckCircle,
  Clock,
  Compass,
  FileText,
  MapPin,
  Mic,
  Navigation,
  Phone,
  PhoneCall,
  Send,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Stethoscope
} from 'lucide-react';
import React, { useState } from 'react';
import {
  INITIAL_AI_MESSAGES,
  NEARBY_VET_PINS,
  TRANSLATIONS,
  VETERINARIAN_DATA
} from '../data/mockData';
import { FarmSetupData, LanguageCode, VetSubSection } from '../types';

interface Screen7VeterinarianProps {
  farmerName?: string;
  initialSubSection?: VetSubSection;
  initialAiPrompt?: string;
  currentLang: LanguageCode;
  onSelectLang?: (lang: LanguageCode) => void;
  onCallVet: () => void;
  onShowSnackbar: (msg: string) => void;
  farmSetup?: FarmSetupData;
}

export const Screen7Veterinarian: React.FC<Screen7VeterinarianProps> = ({
  farmerName = 'Murugan Natarajan',
  initialSubSection = 'vet',
  initialAiPrompt,
  currentLang,
  onCallVet,
  onShowSnackbar,
  farmSetup,
}) => {
  const t = TRANSLATIONS[currentLang];
  const [activeSub, setActiveSub] = useState<VetSubSection>(initialSubSection);

  const activeVetName = farmSetup?.treatmentRecord?.vetName || VETERINARIAN_DATA.name;
  const activeVetPhone = farmSetup?.treatmentRecord?.vetPhone || VETERINARIAN_DATA.phone;
  const activeVetClinic = farmSetup?.treatmentRecord?.vetClinic || VETERINARIAN_DATA.clinic;
  const activeCowName = farmSetup?.treatmentRecord?.cowName || 'Lakshmi';
  const activeCowId = farmSetup?.treatmentRecord?.cowId || 'C-024';
  const activeDisease = farmSetup?.treatmentRecord?.disease || 'Subclinical Mastitis';
  const activeFarmName = farmSetup?.farmName || 'Velan Dairy & Cattle Farm';

  const firstName = farmerName.trim().split(' ')[0] || farmerName;

  // Ask AI Chat state
  const [aiMessages, setAiMessages] = useState(() => [
    {
      sender: 'bot' as const,
      text: `Namaste ${firstName} ji! I am AAROGYA AI – your cow health helper. I am keeping watch over ${activeCowName} (${activeCowId}) and all your cows in ${activeFarmName}. How can I help you right now?`,
      timestamp: '10:00 AM'
    },
    ...INITIAL_AI_MESSAGES.slice(1),
  ]);
  const [inputText, setInputText] = useState(initialAiPrompt || '');
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);

  // Quick reply chips
  const quickReplies = [
    `Why is ${activeCowName} high risk?`,
    'Check milk temperature',
    'What should I do now?',
    'Show SCC trend',
    'Call vet',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const userMsg = {
      sender: 'user' as const,
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setInputText('');
    setAiMessages((prev) => [...prev, userMsg]);

    let replyText = '';
    const lower = query.toLowerCase();

    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          cowContext: {
            name: activeCowName,
            id: activeCowId,
            temperature: 40.1,
            scc: 450,
            vetName: activeVetName,
            vetPhone: activeVetPhone,
            affectedQuarter: 'Left-rear quarter',
          },
          language: currentLang,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.reply) {
          replyText = data.reply;
        }
      }
    } catch (e) {
      // offline fallback handled below
    }

    if (!replyText) {
      if (lower.includes('temp') || lower.includes('temperature')) {
        replyText = `🌡️ **Milk Temperature Check**: ${activeCowName}'s milk temperature during recent milking is elevated at **40.1°C** (healthy normal is 38.0–38.8°C). Elevated milk temp indicates active mastitis inflammation in the left-rear quarter. Keep this quarter isolated.`;
      } else if (lower.includes('why is') || lower.includes('high risk') || lower.includes(activeCowName.toLowerCase())) {
        replyText =
          `${activeCowName} (${activeCowId}) is under active watch for ${activeDisease}:\n1. Somatic cell count jumped to 450k cells/mL.\n2. Milk temperature is elevated at 40.1°C.\n3. Left-rear teat inflammation under watch.\n4. Assigned doctor ${activeVetName} notified.`;
      } else if (lower.includes('what should i do now')) {
        replyText =
          `Immediate steps for ${activeCowName}:\n1. Move to isolation stall.\n2. Withhold milk from main tank.\n3. Apply post-milking barrier teat dip.\n4. Call ${activeVetName} (${activeVetPhone}).`;
      } else if (lower.includes('show scc trend')) {
        replyText =
          `${activeCowName}’s milk cell history:\n• 6 days ago: 160k (Healthy)\n• 3 days ago: 210k (Starting to rise)\n• Yesterday: 380k\n• Today: 450k (Active watch).\n\nDoctor will check teats on arrival.`;
      } else if (lower.includes('call vet')) {
        replyText =
          `Connecting you directly to ${activeVetName} (${activeVetPhone})... Mobile clinic van is 8.4 km away, reaching in 35 mins.`;
        onCallVet();
      } else {
        replyText = `Understood, ${firstName} ji. I have saved your question about "${query}". All numbers are sent to ${activeVetName}'s phone. Keep the cow comfortable and offer fresh drinking water.`;
      }
    }

    setAiMessages((prev) => [
      ...prev,
      {
        sender: 'bot' as const,
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const handleVoiceInputSimulate = () => {
    setIsVoiceRecording(true);
    onShowSnackbar('Listening... Speak now in Hindi, Punjabi, Tamil, or English');
    setTimeout(() => {
      setIsVoiceRecording(false);
      handleSendMessage('What should I do now?');
    }, 2000);
  };

  const handleScheduleVisit = () => {
    onShowSnackbar('Booking doctor visit for next week...');
  };

  return (
    <div id="screen-7-veterinarian" className="space-y-3.5 pb-24">
      {/* 3 Sub-tabs: 1. Vet, 2. Nearby Map, 3. Ask AI */}
      <div className="bg-white p-1 rounded-2xl border border-slate-200 shadow-2xs grid grid-cols-3 gap-1">
        <button
          id="vet-subtab-vet"
          type="button"
          onClick={() => setActiveSub('vet')}
          className={`py-2 px-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer font-sans ${
            activeSub === 'vet'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          <span className="tracking-tight">{t.vetTab}</span>
        </button>

        <button
          id="vet-subtab-nearby-map"
          type="button"
          onClick={() => setActiveSub('nearby_map')}
          className={`py-2 px-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer font-sans ${
            activeSub === 'nearby_map'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span className="tracking-tight">{t.nearbyMapTab}</span>
        </button>

        <button
          id="vet-subtab-ask-ai"
          type="button"
          onClick={() => setActiveSub('ask_ai')}
          className={`py-2 px-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer font-sans ${
            activeSub === 'ask_ai'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span className="tracking-tight">{t.askAiTab}</span>
        </button>
      </div>

      {/* 1. VET */}
      {activeSub === 'vet' && (
        <div className="space-y-3.5 animate-in fade-in duration-150">
          {/* Primary Doctor Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-display font-extrabold text-lg border border-emerald-200 shadow-2xs">
                  DR
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-base sm:text-lg font-display font-extrabold text-slate-900 tracking-tight">
                      {activeVetName}
                    </h2>
                    <span className="text-[10px] font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-700" />
                      {VETERINARIAN_DATA.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 font-semibold font-sans">{activeVetPhone}</p>
                  <p className="text-xs text-slate-500 font-normal font-sans">{activeVetClinic}</p>

                  <div className="flex items-center gap-2 mt-1.5 text-xs">
                    <span className="flex items-center gap-1 text-amber-700 font-bold font-mono">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      {VETERINARIAN_DATA.rating}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-500 font-normal font-sans">
                      <span className="font-mono font-bold text-slate-800">{VETERINARIAN_DATA.reviewsCount}</span> farm visits
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Van arriving status banner */}
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-300/90 flex items-center justify-between text-xs text-amber-950 font-semibold">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-700 animate-pulse" />
                <span className="font-sans">{VETERINARIAN_DATA.status}</span>
              </div>
              <span className="text-[11px] font-mono font-bold bg-amber-200/90 text-amber-950 px-2.5 py-0.5 rounded-md border border-amber-300 shadow-2xs">
                ETA 35m
              </span>
            </div>

            {/* Simple Call Doctor Button */}
            <div className="pt-1 font-sans">
              <button
                id="vet-action-call"
                type="button"
                onClick={onCallVet}
                className="w-full py-3 px-4 bg-emerald-800 hover:bg-emerald-900 active:scale-[0.99] text-white text-xs sm:text-sm font-semibold rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                <span>Call Doctor</span>
              </button>
            </div>
          </div>

          {/* Upcoming Visits */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-display font-extrabold text-slate-900 tracking-tight">Doctor Visits</h3>
              <Calendar className="w-4 h-4 text-slate-400" />
            </div>

            <div className="space-y-2">
              {VETERINARIAN_DATA.upcomingVisits.map((visit, i) => (
                <div
                  key={i}
                  className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-display font-bold text-slate-900 tracking-tight">{visit.title}</h4>
                    <p className="text-[11px] text-slate-500 font-normal font-sans">{visit.time}</p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      visit.status === 'En Route'
                        ? 'bg-amber-100 text-amber-900 border-amber-300 font-mono'
                        : 'bg-slate-200/80 text-slate-700 border-slate-300 font-sans'
                    }`}
                  >
                    {visit.status}
                  </span>
                </div>
              ))}
            </div>

            {/* Schedule Routine Visit button */}
            <button
              id="schedule-routine-visit-button"
              type="button"
              onClick={handleScheduleVisit}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-2xl transition-all flex items-center justify-center gap-2 border border-slate-200 cursor-pointer font-sans"
            >
              <Calendar className="w-4 h-4 text-emerald-800" />
              <span>Book Next Visit</span>
            </button>
          </div>

          {/* Emergency Helpline */}
          <div className="bg-rose-50 border border-rose-200 rounded-3xl p-4 flex items-center justify-between text-rose-950">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 block font-display">
                24/7 Emergency Animal Helpline
              </span>
              <span className="text-sm font-extrabold font-mono text-rose-950 tracking-wider">
                {VETERINARIAN_DATA.emergencyHelpline}
              </span>
            </div>
            <button
              id="helpline-call-button"
              type="button"
              onClick={() => onShowSnackbar('Dialing National Animal Health Helpline 1962...')}
              className="py-1.5 px-3.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer font-sans"
            >
              Call 1962
            </button>
          </div>

          {/* Recent Vet Notes */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-display font-extrabold text-slate-900 tracking-tight">Doctor Notes</h3>
              <FileText className="w-4 h-4 text-slate-400" />
            </div>

            <div className="space-y-2">
              {VETERINARIAN_DATA.recentNotes.map((note, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold text-slate-900">{note.author}</span>
                    <span className="text-[10px] text-slate-500 font-mono font-semibold">{note.date}</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed font-normal">{note.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. NEARBY MAP (GIS: vet clinic pins, live route, ETA, nearest emergency vet) */}
      {activeSub === 'nearby_map' && (
        <div className="space-y-3.5 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-display font-extrabold text-slate-900 flex items-center gap-1.5 tracking-tight">
                  <Navigation className="w-4 h-4 text-emerald-800" />
                  <span>Doctor Mobile Van Route</span>
                </h2>
                <p className="text-xs text-slate-500 font-normal font-sans">
                  Van on the way to your farm (Stall 4)
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-amber-100 text-amber-950 px-2.5 py-0.5 rounded-full border border-amber-300">
                ETA 35 mins
              </span>
            </div>

            {/* Interactive Live Map Canvas */}
            <div className="relative h-64 w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-800">
              {/* Map Canvas Background Lines */}
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:20px_20px]" />

              <svg viewBox="0 0 320 220" className="w-full h-full relative z-10">
                {/* Roads */}
                <path
                  d="M 40 180 Q 120 140 160 110 T 260 60"
                  fill="none"
                  stroke="#334155"
                  strokeWidth="8"
                />
                <path
                  d="M 40 180 Q 120 140 160 110 T 260 60"
                  fill="none"
                  stroke="#64748B"
                  strokeWidth="4"
                  strokeDasharray="6 4"
                />

                {/* Live Route: Vet Van to Farm */}
                <path
                  d="M 120 140 Q 150 120 200 130 T 260 60"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="4"
                  strokeLinecap="round"
                />

                {/* Farm Location Pin */}
                <g transform="translate(260, 60)">
                  <circle r="8" fill="#10B981" className="animate-ping opacity-75" />
                  <circle r="6" fill="#047857" stroke="#FFFFFF" strokeWidth="2" />
                  <text x="12" y="4" fill="#F8FAFC" fontSize="10" fontWeight="bold">
                    Saraswati Dairy
                  </text>
                </g>

                {/* Vet Mobile Van Pin */}
                <g transform="translate(120, 140)">
                  <circle r="10" fill="#F59E0B" className="animate-pulse opacity-80" />
                  <circle r="7" fill="#D97706" stroke="#FFFFFF" strokeWidth="2" />
                  <text x="-40" y="20" fill="#FDE68A" fontSize="9" fontWeight="bold">
                    Doctor Van (8.4 km)
                  </text>
                </g>

                {/* Government Vet Hospital Pin */}
                <g transform="translate(60, 80)">
                  <circle r="5" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="1.5" />
                  <text x="8" y="3" fill="#93C5FD" fontSize="8">
                    Govt Hospital
                  </text>
                </g>

                {/* NDRI Referral Hospital Pin */}
                <g transform="translate(180, 180)">
                  <circle r="5" fill="#8B5CF6" stroke="#FFFFFF" strokeWidth="1.5" />
                  <text x="8" y="3" fill="#C4B5FD" fontSize="8">
                    NDRI Center
                  </text>
                </g>
              </svg>

              {/* Status Floating Pill */}
              <div className="absolute top-2 left-2 bg-slate-950/90 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-slate-700 text-xs text-slate-100 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-medium font-sans">Van on the way · Driver: Sukhdev Singh</span>
              </div>
            </div>

            {/* Nearest Emergency Vet Card */}
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-300 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider font-display">
                  Nearest Available Doctor
                </span>
                <span className="text-xs font-mono font-bold text-emerald-900 bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                  ETA 35 mins
                </span>
              </div>
              <h4 className="text-sm font-display font-extrabold text-slate-900 tracking-tight">
                Dr. Rajesh Sharma · Mobile Unit #4
              </h4>
              <p className="text-xs text-slate-600 font-normal leading-relaxed font-sans">
                Distance: 8.4 km away on Sector 14 Bypass. Carries teat medicines, testing kits, and scanner.
              </p>
            </div>

            {/* Vet Clinic Pins list */}
            <div className="space-y-2 pt-1">
              <span className="text-xs font-semibold text-slate-700 block font-sans">Nearby Animal Hospitals:</span>
              {NEARBY_VET_PINS.map((pin) => (
                <div
                  key={pin.id}
                  className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between"
                >
                  <div>
                    <h5 className="text-xs font-display font-bold text-slate-900 tracking-tight">{pin.name}</h5>
                    <p className="text-[11px] text-slate-500 font-normal font-sans">
                      {pin.type} · <span className="font-mono font-bold text-slate-700">{pin.distance}</span> ({pin.eta})
                    </p>
                  </div>
                  <button
                    onClick={() => onShowSnackbar(`Connecting to ${pin.name}...`)}
                    className="py-1 px-3 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 hover:bg-slate-100 cursor-pointer font-sans"
                  >
                    Contact
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. ASK AI: "AAROGYA AI – Your Cattle Health Assistant" */}
      {activeSub === 'ask_ai' && (
        <div className="space-y-3.5 animate-in fade-in duration-150">
          {/* Identity & Language Chip */}
          <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-3xl p-4 shadow-md flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-xs text-emerald-300">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-sm font-display font-extrabold tracking-tight">
                  AAROGYA AI – Cow Health Helper
                </h2>
                <p className="text-[11px] text-emerald-200 font-normal font-sans">
                  AI Veterinary Clinical Decision Support
                </p>
              </div>
            </div>
          </div>

          {/* Quick-Reply Chips:
              "Why is Lakshmi high risk?"
              "What should I do now?"
              "Show SCC trend"
              "Call vet"
          */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {quickReplies.map((qr, idx) => (
              <button
                key={idx}
                id={`ai-quick-reply-${idx}`}
                type="button"
                onClick={() => handleSendMessage(qr)}
                className="px-3 py-1.5 bg-white border border-emerald-300 text-emerald-900 hover:bg-emerald-50 rounded-full text-xs font-semibold whitespace-nowrap shadow-2xs transition-all active:scale-95 cursor-pointer font-sans"
              >
                {qr}
              </button>
            ))}
          </div>

          {/* Chat Messages Container */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm min-h-[300px] max-h-[380px] overflow-y-auto space-y-3 font-sans">
            {aiMessages.map((msg, index) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={index}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                      isUser
                        ? 'bg-emerald-800 text-white rounded-br-xs'
                        : 'bg-slate-50 text-slate-800 border border-slate-200 rounded-bl-xs'
                    }`}
                  >
                    {!isUser && (
                      <div className="flex items-center gap-1.5 text-emerald-800 text-[10px] font-bold mb-1 font-display">
                        <Sparkles className="w-3 h-3" />
                        <span>AAROGYA AI Assistant</span>
                      </div>
                    )}
                    <p className="whitespace-pre-line font-medium leading-relaxed">{msg.text}</p>
                    <span
                      className={`text-[9px] block text-right mt-1 font-mono ${
                        isUser ? 'text-emerald-200' : 'text-slate-400'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Voice & Text Input Bar */}
          <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
            {/* Voice Input Button */}
            <button
              id="ai-voice-input-button"
              type="button"
              onClick={handleVoiceInputSimulate}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                isVoiceRecording
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
              }`}
              title="Voice input in Hindi / Punjabi / Tamil / English"
            >
              <Mic className="w-5 h-5" />
            </button>

            <input
              id="ai-chat-input"
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask anything about cow health or care..."
              className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 font-medium font-sans text-slate-900"
            />

            <button
              id="ai-chat-send-button"
              type="button"
              onClick={() => handleSendMessage()}
              className="w-10 h-10 rounded-xl bg-emerald-800 hover:bg-emerald-900 active:scale-95 text-white flex items-center justify-center transition-all shadow-xs cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
