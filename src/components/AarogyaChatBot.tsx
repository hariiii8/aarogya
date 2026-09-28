import React, { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  Bot,
  ChevronDown,
  ChevronUp,
  Compass,
  Copy,
  Check,
  Eye,
  Maximize2,
  Mic,
  MicOff,
  Minimize2,
  PhoneCall,
  RefreshCw,
  Send,
  Sparkles,
  Thermometer,
  Trash2,
  Volume2,
  VolumeX,
  X,
  Droplets
} from 'lucide-react';
import { Cow, FarmSetupData, LanguageCode } from '../types';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  isActionable?: boolean;
  actionType?: 'call_vet' | 'view_cow' | 'locate_stall';
  actionCowId?: string;
  actionStall?: number;
}

interface AarogyaChatBotProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
  currentLang: LanguageCode;
  farmerName: string;
  farmSetup?: FarmSetupData;
  activeCow?: Cow;
  herdList?: Cow[];
  onCallVet?: () => void;
  onOpenCowDiagnostic?: (cowId: string) => void;
  onLocateCowInBarn?: (stallNum: number) => void;
  initialPrompt?: string;
}

const DEFAULT_SUGGESTIONS = [
  '🌡️ Why is milk temperature elevated in mastitis?',
  '🧪 Explain SCC numbers (<200k vs >400k)',
  '🐄 How is Lakshmi (C-024) doing today?',
  '🧴 What is the best post-milking teat dip?',
  '🥛 Can mastitis milk be mixed into the vat?',
  '🚑 Call Emergency Mobile Vet Clinic',
];

/** Dynamic per-cow chips: reference the selected/active cow by name + live SCC. */
function getDynamicCowSuggestions(cow?: Pick<Cow, 'name' | 'id' | 'scc'> | null): string[] {
  const name = cow?.name || 'Lakshmi';
  const id = cow?.id || 'C-024';
  const scc = cow?.scc ?? 450;
  return [
    `🐄 Why is ${name}'s SCC high (${scc}k)?`,
    `🌡️ ${name} (${id}) milk temp + conductivity rules?`,
    `🧴 How to treat ${name}'s affected quarter?`,
    `🚑 When to call Dr. Rajesh Sharma for ${name}?`,
  ];
}

export const AarogyaChatBot: React.FC<AarogyaChatBotProps> = ({
  isOpen,
  onClose,
  onToggle,
  currentLang,
  farmerName,
  farmSetup,
  activeCow,
  herdList = [],
  onCallVet,
  onOpenCowDiagnostic,
  onLocateCowInBarn,
  initialPrompt,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome-1',
      sender: 'bot',
      text: `Namaste ${farmerName ? farmerName.split(' ')[0] : 'Farmer'} ji! 🙏\n\nI am **AAROGYA Bovine AI**, your dedicated cattle health and mastitis intelligence assistant. I track **milk temperature**, somatic cell count (SCC), and milking telemetry in real-time.\n\nHow can I help you and your dairy herd right now?`,
      timestamp: 'Just now',
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedCowId, setSelectedCowId] = useState<string>(activeCow?.id || 'C-024');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Sync selected cow when activeCow changes
  useEffect(() => {
    if (activeCow?.id) {
      setSelectedCowId(activeCow.id);
    }
  }, [activeCow]);

  // Handle external initial prompt
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      handleSend(initialPrompt);
    }
  }, [initialPrompt]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Setup Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang =
        currentLang === 'hi'
          ? 'hi-IN'
          : currentLang === 'ta'
          ? 'ta-IN'
          : currentLang === 'pa'
          ? 'pa-IN'
          : 'en-IN';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputQuery(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [currentLang]);

  // TTS Reader
  const speakText = (text: string) => {
    if (!ttsEnabled || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      // Remove markdown asterisks and emojis for speech
      const cleanText = text
        .replace(/[*_#`]/g, '')
        .replace(/[🌡️🧪🐄🧴🥛🚑⚡🙏]/g, '')
        .replace(/\n+/g, '. ');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('TTS Speech error:', e);
    }
  };

  const toggleVoiceRecording = () => {
    if (!recognitionRef.current) {
      alert('Voice dictation is supported in modern mobile/desktop browsers with microphone access.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        setIsListening(false);
      }
    }
  };

  // Find target cow details
  const targetCow =
    herdList.find((c) => c.id === selectedCowId) ||
    activeCow || {
      id: 'C-024',
      name: 'Lakshmi',
      stall: 4,
      scc: 450,
      temperature: 40.1,
      riskLevel: 'High',
      riskPercentage: 82,
      affectedQuarter: 'Left-rear quarter',
    };

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || isLoading) return;

    const userMsgId = `user-${Date.now()}`;
    const userMessage: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: messages.slice(-6).map((m) => ({
            sender: m.sender,
            text: m.text,
          })),
          cowContext: {
            id: targetCow.id,
            name: targetCow.name,
            stall: targetCow.stall,
            scc: targetCow.scc,
            temperature: targetCow.temperature,
            riskLevel: targetCow.riskLevel,
            riskPercentage: targetCow.riskPercentage,
            affectedQuarter: (targetCow as any).affectedQuarter || 'Left-rear quarter',
            vetName: farmSetup?.treatmentRecord?.vetName || 'Dr. Rajesh Sharma',
            vetPhone: farmSetup?.treatmentRecord?.vetPhone || '+91 98960 11982',
          },
          language: currentLang,
        }),
      });

      let replyText = '';
      if (response.ok) {
        const data = await response.json();
        replyText = data.reply || 'Data received.';
      } else {
        replyText = getLocalVeterinaryReply(query, targetCow);
      }

      // Detect actionable elements
      const hasVetCall =
        query.toLowerCase().includes('vet') ||
        query.toLowerCase().includes('doctor') ||
        query.toLowerCase().includes('emergency') ||
        replyText.toLowerCase().includes('call dr') ||
        replyText.toLowerCase().includes('mobile van');

      const botMsgId = `bot-${Date.now()}`;
      const botMessage: ChatMessage = {
        id: botMsgId,
        sender: 'bot',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isActionable: hasVetCall,
        actionType: hasVetCall ? 'call_vet' : undefined,
        actionCowId: targetCow.id,
        actionStall: targetCow.stall,
      };

      setMessages((prev) => [...prev, botMessage]);
      speakText(replyText);
    } catch (err) {
      // Offline fallback
      const fallbackReply = getLocalVeterinaryReply(query, targetCow);
      const botMsgId = `bot-${Date.now()}`;
      const botMessage: ChatMessage = {
        id: botMsgId,
        sender: 'bot',
        text: fallbackReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isActionable: true,
        actionType: 'call_vet',
      };
      setMessages((prev) => [...prev, botMessage]);
      speakText(fallbackReply);
    } finally {
      setIsLoading(false);
    }
  };

  const getLocalVeterinaryReply = (query: string, cow: any): string => {
    const q = query.toLowerCase();
    if (q.includes('temp') || q.includes('milk temp') || q.includes('temperature') || q.includes('तापमान')) {
      return `🌡️ **Milk Temperature & Mastitis Detection**:
• **Normal Milk Temp**: 38.0°C – 38.8°C (~38.5°C normal).
• **Elevated Reading**: ${cow.name}'s milk temperature is currently **${cow.temperature}°C** (High Alert).
• **Scientific Reason**: Mastitis causes localized vasodilation in udder quarters, releasing inflammatory heat directly into the milk as it is extracted.
• **What to do**:
  1. Inspect the affected teat for heat and swelling.
  2. Strip milk into a black CMT paddle to inspect for flakes or clots.
  3. Keep milk from this quarter isolated from the bulk vat.`;
    }

    if (q.includes('scc') || q.includes('somatic') || q.includes('cell')) {
      return `🧪 **Somatic Cell Count (SCC) Guide**:
• **< 200,000 cells/mL**: Healthy udder tissue.
• **200,000 – 400,000 cells/mL**: Subclinical mastitis warning zone.
• **> 400,000 cells/mL**: Active clinical infection (${cow.name} is currently at **${cow.scc}k cells/mL**).
• **Action**: Move ${cow.name} to isolation stall ${cow.stall}, withhold milk from bulk vat, and initiate prescribed teat protocol.`;
    }

    if (q.includes('lakshmi') || q.includes('c-024') || q.includes('risk')) {
      return `🐄 **Status Report for ${cow.name} (${cow.id})**:
• **Risk Level**: ${cow.riskPercentage}% High Mastitis Risk in Stall ${cow.stall}.
• **Milk Temperature**: Elevated at **${cow.temperature}°C** (normal 38.5°C).
• **SCC**: ${cow.scc},000 cells/mL (danger zone).
• **Assigned Doctor**: Dr. Rajesh Sharma (+91 98960 11982) has been notified. Mobile van arriving in ~35 mins.`;
    }

    if (q.includes('dip') || q.includes('iodine') || q.includes('clean') || q.includes('hygiene')) {
      return `🧴 **Post-Milking Teat Disinfection Protocol**:
• Apply 0.5%–1.0% iodine barrier dip immediately upon cup removal.
• Teat canal remains open for 30–45 minutes after milking; keep cow standing by feeding fresh fodder.
• Clean and dry stall bedding with lime powder to eliminate bacterial dampness.`;
    }

    return `Understood. I am monitoring your herd's milk telemetry. For ${cow.name} (Stall ${cow.stall}), keep close watch on milk temperature (${cow.temperature}°C) and ensure clean, dry bedding. Contact Dr. Rajesh Sharma if swelling persists.`;
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'bot',
        text: `Chat cleared. Namaste ${farmerName ? farmerName.split(' ')[0] : 'Farmer'}! How can I assist with your cows or milk telemetry?`,
        timestamp: 'Just now',
      },
    ]);
  };

  return (
    <>
      {/* 1. FLOATING LAUNCHER BUTTON (Visible on all screens) */}
      {!isOpen && (
        <aside aria-label="AAROGYA AI Assistant" className="fixed bottom-20 right-4 z-40 flex items-center gap-2">
          {/* Pulsing prompt badge */}
          <div
            onClick={onToggle}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-md border border-emerald-300 rounded-full shadow-md text-emerald-950 text-xs font-bold cursor-pointer hover:bg-emerald-50 transition-all select-none animate-bounce"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            <span>Ask AI Bot</span>
          </div>

          {/* Main Floating Circle Bot Button */}
          <button
            id="floating-aarogya-chatbot-trigger"
            type="button"
            onClick={onToggle}
            aria-label="Open AAROGYA Inbuilt AI Chatbot"
            className="group relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-900 via-emerald-800 to-teal-700 text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer border-2 border-emerald-400/50"
          >
            {/* Pulsing ring aura */}
            <span className="absolute -inset-1 rounded-2xl bg-emerald-500/20 animate-pulse pointer-events-none" />

            <div className="relative flex items-center justify-center">
              <Bot className="w-7 h-7 text-emerald-200 group-hover:text-white transition-colors" />
              {/* Online indicator dot */}
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full" />
            </div>

            {/* Micro label underneath for mobile */}
            <span className="absolute -bottom-5 text-[10px] font-extrabold text-emerald-900 tracking-tight bg-emerald-100/90 px-1.5 py-0.2 rounded-full border border-emerald-300 shadow-2xs">
              AI BOT
            </span>
          </button>
        </aside>
      )}

      {/* 2. INBUILT CHATBOT DIALOG / FLOATING WINDOW */}
      {isOpen && (
        <aside
          id="aarogya-chatbot-panel"
          aria-label="AAROGYA AI Chatbot Window"
          className={`fixed z-50 transition-all duration-300 flex flex-col bg-white border border-slate-200/90 shadow-2xl overflow-hidden font-sans ${
            isExpanded
              ? 'inset-2 sm:inset-4 md:inset-10 rounded-3xl'
              : 'bottom-20 right-2 sm:right-4 w-[95vw] sm:w-[420px] max-w-[440px] h-[580px] max-h-[82vh] rounded-3xl'
          }`}
        >
          {/* Header */}
          <header className="px-4 py-3 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white flex items-center justify-between shadow-xs select-none">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-emerald-200 shrink-0">
                <Bot className="w-5 h-5" />
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-emerald-900 rounded-full animate-ping" />
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-emerald-900 rounded-full" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-sm font-display font-extrabold text-white truncate">
                    AAROGYA Bovine AI
                  </h2>
                  <span className="px-1.5 py-0.2 bg-emerald-400/20 text-emerald-300 text-[9px] font-mono font-bold rounded-md border border-emerald-400/30">
                    Gemini 3.8
                  </span>
                </div>
                <p className="text-[10px] text-emerald-200/80 font-medium truncate flex items-center gap-1">
                  <span>Milk Temp & Mastitis Guard</span>
                  <span>•</span>
                  <span className="text-emerald-300 font-semibold">Online</span>
                </p>
              </div>
            </div>

            {/* Header Action Tools */}
            <div className="flex items-center gap-1">
              {/* TTS Read Aloud Toggle */}
              <button
                type="button"
                onClick={() => setTtsEnabled(!ttsEnabled)}
                title={ttsEnabled ? 'Mute AI voice readout' : 'Read AI responses aloud'}
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-colors cursor-pointer ${
                  ttsEnabled
                    ? 'bg-amber-400 text-slate-900 font-bold'
                    : 'text-emerald-200 hover:bg-white/10'
                }`}
              >
                {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              {/* Clear History */}
              <button
                type="button"
                onClick={handleClearChat}
                title="Clear chat history"
                className="w-7 h-7 rounded-lg flex items-center justify-center text-emerald-200 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              {/* Expand / Minimize Window */}
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Restore size' : 'Expand window'}
                className="hidden sm:flex w-7 h-7 rounded-lg items-center justify-center text-emerald-200 hover:bg-white/10 transition-colors cursor-pointer"
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close Chatbot"
                className="w-7 h-7 rounded-lg flex items-center justify-center text-emerald-200 hover:bg-white/10 hover:text-white transition-colors cursor-pointer ml-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Context Strip: Focus Cow & Quick Telemetry Glance */}
          <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-[11px] font-semibold text-slate-500">Focus:</span>
              <select
                value={selectedCowId}
                onChange={(e) => setSelectedCowId(e.target.value)}
                aria-label="Select cow for telemetry context"
                className="bg-white border border-slate-200/90 rounded-lg px-2 py-0.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700 cursor-pointer max-w-[130px] truncate"
              >
                {herdList && herdList.length > 0 ? (
                  herdList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.id})
                    </option>
                  ))
                ) : (
                  <>
                    <option value="C-024">Lakshmi (C-024)</option>
                    <option value="C-018">Ponni (C-018)</option>
                    <option value="C-007">Ganga (C-007)</option>
                    <option value="TN-SLM-04">Sundari</option>
                  </>
                )}
              </select>
            </div>

            {/* Live Metrics for Selected Cow */}
            <div className="flex items-center gap-2 text-[11px] font-mono shrink-0">
              <span className="flex items-center gap-0.5 text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                <Thermometer className="w-3 h-3 text-amber-600" />
                <span>{targetCow.temperature}°C</span>
              </span>
              <span className="flex items-center gap-0.5 text-sky-800 font-bold bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
                <Droplets className="w-3 h-3 text-sky-600" />
                <span>{targetCow.scc}k</span>
              </span>
            </div>
          </div>

          {/* Message List */}
          <main className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-[#F8FAF9]">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
                >
                  <div
                    className={`max-w-[88%] sm:max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-2xs relative group ${
                      isUser
                        ? 'bg-emerald-800 text-white rounded-br-xs font-medium'
                        : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs'
                    }`}
                  >
                    {/* Bot avatar icon inside bubble header */}
                    {!isUser && (
                      <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100">
                        <span className="font-extrabold text-[10px] text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-500 fill-amber-400" />
                          <span>AAROGYA BOT</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(msg.id, msg.text)}
                          title="Copy message"
                          className="text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    )}

                    {/* Text content with clean formatting */}
                    <div className="whitespace-pre-line space-y-1.5">
                      {msg.text}
                    </div>

                    {/* Interactive Action Buttons if bot suggested an action */}
                    {!isUser && msg.isActionable && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                        {onCallVet && (
                          <button
                            type="button"
                            onClick={onCallVet}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                          >
                            <PhoneCall className="w-3 h-3 text-rose-600" />
                            <span>Call Dr. Rajesh Sharma</span>
                          </button>
                        )}
                        {onOpenCowDiagnostic && msg.actionCowId && (
                          <button
                            type="button"
                            onClick={() => onOpenCowDiagnostic(msg.actionCowId!)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                          >
                            <Eye className="w-3 h-3 text-emerald-700" />
                            <span>View Diagnostics</span>
                          </button>
                        )}
                        {onLocateCowInBarn && msg.actionStall && (
                          <button
                            type="button"
                            onClick={() => onLocateCowInBarn(msg.actionStall!)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                          >
                            <Compass className="w-3 h-3 text-sky-700" />
                            <span>Locate Stall {msg.actionStall}</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <span className="text-[10px] text-slate-400 font-mono px-1">
                    {msg.timestamp}
                  </span>
                </div>
              );
            })}

            {/* Live Typing Indicator */}
            {isLoading && (
              <div className="flex items-center gap-2 p-2.5 bg-white border border-slate-200/80 rounded-2xl w-fit shadow-2xs">
                <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center animate-pulse">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="flex items-center gap-1 text-slate-500 text-xs">
                  <span>AAROGYA AI is checking telemetry</span>
                  <span className="inline-flex gap-0.5">
                    <span className="w-1 h-1 bg-emerald-700 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1 h-1 bg-emerald-700 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1 h-1 bg-emerald-700 rounded-full animate-bounce" />
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </main>

          {/* Quick Suggestions: dynamic active-cow chips + general guides */}
          <div className="px-3 pt-2 bg-slate-50/90 border-t border-slate-200/80 overflow-x-auto scrollbar-none flex items-center gap-1.5 select-none">
            {getDynamicCowSuggestions(targetCow).map((chip, idx) => (
              <button
                key={`dyn-${idx}`}
                type="button"
                onClick={() => handleSend(chip)}
                title={`Ask about ${targetCow.name} (${targetCow.id})`}
                className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-900 active:scale-95 text-white border border-emerald-800 rounded-full text-[11px] font-bold whitespace-nowrap transition-all shadow-2xs cursor-pointer shrink-0"
              >
                {chip}
              </button>
            ))}
          </div>
          <div className="px-3 py-2 bg-slate-50/90 overflow-x-auto scrollbar-none flex items-center gap-1.5 select-none">
            {DEFAULT_SUGGESTIONS.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(chip)}
                className="px-2.5 py-1 bg-white hover:bg-emerald-50 active:scale-95 text-slate-700 hover:text-emerald-900 border border-slate-200/90 hover:border-emerald-300 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all shadow-2xs cursor-pointer shrink-0"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Footer Input Area */}
          <footer className="p-3 bg-white border-t border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              {/* Mic Voice Dictation Button */}
              <button
                type="button"
                onClick={toggleVoiceRecording}
                title={isListening ? 'Stop listening' : 'Speak your question'}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                  isListening
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Text Input */}
              <input
                ref={inputRef}
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder={
                  isListening
                    ? 'Listening... Speak now'
                    : 'Ask about milk temp, SCC, mastitis...'
                }
                className="flex-1 bg-slate-50 border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700 font-medium font-sans"
              />

              {/* Send Button */}
              <button
                id="aarogya-chatbot-send-btn"
                type="submit"
                disabled={isLoading || !inputQuery.trim()}
                aria-label="Send query"
                className="w-9 h-9 rounded-xl bg-emerald-800 hover:bg-emerald-900 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </footer>
        </aside>
      )}
    </>
  );
};
