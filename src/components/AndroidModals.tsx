import {
  Bell,
  Camera,
  CheckCheck,
  CheckCircle2,
  Fingerprint,
  MapPin,
  MessageSquare,
  Mic,
  MicOff,
  Phone,
  PhoneCall,
  PhoneOff,
  Send,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Volume2,
  X
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { NOTIFICATIONS_DATA, VETERINARIAN_DATA } from '../data/mockData';
import { NotificationItem } from '../types';
import { AarogyaToast } from './AarogyaToast';
import { buildMastitisMessage, sendSmsAlert } from '../utils/alerts';

// 1. Android BiometricPrompt (Fast Bio)
interface BiometricPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  farmerName?: string;
}

export const BiometricPromptModal: React.FC<BiometricPromptModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  farmerName = 'Murugan Natarajan',
}) => {
  const [verifying, setVerifying] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);

  if (!isOpen) return null;

  const handleTouch = () => {
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setAuthSuccess(true);
      setTimeout(() => {
        setAuthSuccess(false);
        onSuccess();
        onClose();
      }, 600);
    }, 800);
  };

  return (
    <div
      id="android-biometric-prompt-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="android-biometric-prompt-sheet"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-slate-200 animate-in slide-in-from-bottom duration-200"
      >
        <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-4 sm:hidden" />

        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800">
            <Fingerprint className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 leading-tight">
              Fingerprint Login
            </h3>
            <p className="text-xs text-slate-500">AAROGYA Fast Fingerprint Login</p>
          </div>
        </div>

        <p className="text-sm text-slate-700 mb-6 leading-relaxed">
          Touch your finger to verify identity for <span className="font-semibold text-slate-900">{farmerName}</span> (Saraswati Dairy Farm).
        </p>

        <div className="flex flex-col items-center justify-center py-6 border border-dashed border-slate-200 rounded-2xl bg-slate-50/60 mb-6">
          <button
            id="biometric-sensor-touch-target"
            onClick={handleTouch}
            className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              authSuccess
                ? 'bg-emerald-600 text-white scale-105 shadow-lg shadow-emerald-500/30'
                : verifying
                ? 'bg-emerald-100 text-emerald-700 animate-pulse ring-4 ring-emerald-300'
                : 'bg-white text-slate-700 border-2 border-slate-200 shadow-md hover:border-emerald-500 hover:text-emerald-700 active:scale-95'
            }`}
          >
            {authSuccess ? (
              <CheckCircle2 className="w-10 h-10" />
            ) : (
              <Fingerprint className="w-10 h-10" />
            )}
          </button>
          <span className="text-xs font-semibold text-slate-600 mt-3">
            {authSuccess
              ? 'Fingerprint matched!'
              : verifying
              ? 'Checking fingerprint...'
              : 'Touch the fingerprint sensor to log in'}
          </span>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            id="biometric-cancel-button"
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Use PIN
          </button>
          <button
            id="biometric-simulate-button"
            type="button"
            onClick={handleTouch}
            className="px-5 py-2 text-xs font-semibold bg-emerald-800 text-white rounded-lg hover:bg-emerald-900 transition-colors shadow-xs cursor-pointer"
          >
            Fast Login
          </button>
        </div>
      </div>
    </div>
  );
};

// 2. Android System Permissions Dialog
interface PermissionDialogProps {
  isOpen?: boolean;
  permission?: 'camera' | 'location' | 'microphone' | 'notification' | 'mic' | null;
  type?: 'camera' | 'location' | 'microphone' | 'notification' | 'mic';
  onClose?: () => void;
  onGranted?: (perm: string) => void;
  onAllow?: () => void;
  onDeny?: () => void;
}

export const PermissionDialog: React.FC<PermissionDialogProps> = ({
  isOpen = true,
  permission,
  type,
  onClose,
  onGranted,
  onAllow,
  onDeny,
}) => {
  if (!isOpen) return null;

  const resolved = (type || permission || 'camera') as string;
  const key = resolved === 'mic' ? 'microphone' : resolved;

  const permConfig: Record<string, { icon: any; title: string; desc: string }> = {
    camera: {
      icon: Camera,
      title: 'Allow AAROGYA to take pictures?',
      desc: 'Used to scan cow ear tags, test milk color, and take photos of teats.',
    },
    location: {
      icon: MapPin,
      title: 'Allow AAROGYA to access device location?',
      desc: 'Used to show your farm on the map, alert you about nearby sick herds, and show the doctor’s arrival time.',
    },
    microphone: {
      icon: Mic,
      title: 'Allow AAROGYA to record voice?',
      desc: 'Used to speak to the AI cow helper in Hindi, Punjabi, Tamil, or English.',
    },
    notification: {
      icon: Bell,
      title: 'Allow AAROGYA to send notifications?',
      desc: 'Urgent alerts for sick cows, high milk cell count, and doctor van arrival.',
    },
  };

  const currentConfig = permConfig[key] || permConfig.camera;
  const IconComp = currentConfig.icon;

  const handleGrant = () => {
    onGranted?.(key);
    onAllow?.();
    onClose?.();
  };

  const handleDeny = () => {
    onDeny?.();
    onClose?.();
  };

  return (
    <div
      id="android-permission-dialog-backdrop"
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-in fade-in"
    >
      <div
        id="android-permission-dialog-card"
        className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150"
      >
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-800 mb-4 mx-auto">
          <IconComp className="w-6 h-6" />
        </div>

        <h3 className="text-base font-bold text-slate-900 text-center mb-2 leading-snug">
          {currentConfig.title}
        </h3>
        <p className="text-xs text-slate-600 text-center mb-6 leading-relaxed">
          {currentConfig.desc}
        </p>

        <div className="flex flex-col gap-2">
          <button
            id="permission-while-using-app"
            onClick={handleGrant}
            className="w-full py-2.5 px-4 bg-emerald-800 text-white text-xs font-semibold rounded-xl hover:bg-emerald-900 transition-colors cursor-pointer"
          >
            While using the app
          </button>
          <button
            id="permission-only-this-time"
            onClick={handleGrant}
            className="w-full py-2.5 px-4 bg-slate-100 text-slate-800 text-xs font-semibold rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Only this time
          </button>
          <button
            id="permission-dont-allow"
            onClick={handleDeny}
            className="w-full py-2 px-4 text-slate-500 text-xs font-semibold rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Don't allow
          </button>
        </div>
      </div>
    </div>
  );
};

// 3. Android Notification Bottom Sheet
interface NotificationSheetProps {
  isOpen: boolean;
  onClose: () => void;
  notifications?: NotificationItem[];
  onViewCow?: (cowId: string) => void;
  onSelectAlert?: (cowId: string) => void;
  onCallVet?: () => void;
  onOpenSmsAlert?: () => void;
}

export const NotificationSheet: React.FC<NotificationSheetProps> = ({
  isOpen,
  onClose,
  notifications = NOTIFICATIONS_DATA,
  onViewCow,
  onSelectAlert,
  onCallVet,
  onOpenSmsAlert,
}) => {
  if (!isOpen) return null;

  const handleSelectCow = (cowId: string) => {
    onClose();
    if (onSelectAlert) onSelectAlert(cowId);
    if (onViewCow) onViewCow(cowId);
  };

  return (
    <div
      id="notification-sheet-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end justify-center animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="notification-sheet-content"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white rounded-t-3xl max-h-[85vh] flex flex-col p-5 shadow-2xl border-t border-slate-200 animate-in slide-in-from-bottom duration-200"
      >
        <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-3" />

        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-800" />
            <h3 className="font-bold text-slate-900 text-base">
              Android Push Notifications
            </h3>
            <span className="text-[10px] bg-rose-600 text-white font-bold px-1.5 py-0.5 rounded-full">
              {notifications.length}
            </span>
          </div>
          <button
            id="close-notifications-sheet"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto divide-y divide-slate-100 my-2 space-y-2">
          {notifications.map((n: NotificationItem) => (
            <div
              key={n.id}
              id={`notification-card-${n.id}`}
              className={`p-3.5 rounded-2xl ${
                n.type === 'critical'
                  ? 'bg-rose-50/80 border border-rose-200'
                  : n.type === 'alert'
                  ? 'bg-amber-50/80 border border-amber-200'
                  : 'bg-slate-50 border border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-xs font-bold flex items-center gap-1 ${
                    n.type === 'critical' ? 'text-rose-900' : 'text-slate-900'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5 text-rose-700 shrink-0" />
                  {n.title}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">{n.time}</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed mb-3 font-normal">{n.message}</p>

              {/* Exact Actions: "Call Vet" and "View Cow", plus Open SMS if SMS notification */}
              <div className="flex items-center gap-2">
                {n.title.includes('SMS') && onOpenSmsAlert && (
                  <button
                    id={`notification-open-sms-${n.id}`}
                    onClick={() => {
                      onClose();
                      onOpenSmsAlert();
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 bg-amber-500 text-amber-950 text-xs font-semibold rounded-lg shadow-xs hover:bg-amber-600 active:scale-98 transition-all cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Open SMS</span>
                  </button>
                )}
                <button
                  id={`notification-call-vet-${n.id}`}
                  onClick={() => {
                    onClose();
                    onCallVet?.();
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-xs hover:bg-emerald-900 active:scale-98 transition-all cursor-pointer"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call Vet</span>
                </button>

                {n.cowId && (
                  <button
                    id={`notification-view-cow-${n.id}`}
                    onClick={() => handleSelectCow(n.cowId!)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 bg-white border border-slate-300 text-slate-800 text-xs font-semibold rounded-lg shadow-xs hover:bg-slate-50 active:scale-98 transition-all cursor-pointer"
                  >
                    <span>View Cow</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const AndroidNotificationsSheet = NotificationSheet;

// 4. Android Phone Call Modal (simulates live call with assigned veterinarian)
interface AndroidPhoneCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowSnackbar?: (msg: string) => void;
  vetName?: string;
  vetPhone?: string;
  focusCowName?: string;
}

export const AndroidPhoneCallModal: React.FC<AndroidPhoneCallModalProps> = ({
  isOpen,
  onClose,
  onShowSnackbar,
  vetName = VETERINARIAN_DATA.name,
  vetPhone = VETERINARIAN_DATA.phone,
  focusCowName = 'Lakshmi',
}) => {
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(true);

  useEffect(() => {
    let timer: any;
    if (isOpen) {
      setCallDuration(0);
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    onClose();
    onShowSnackbar?.(`Call ended (${formatTime(callDuration)}) with ${vetName}`);
  };

  return (
    <div
      id="android-phone-call-modal"
      className="fixed inset-0 z-50 bg-slate-950 flex flex-col justify-between p-6 text-white animate-in fade-in"
    >
      {/* Top Header */}
      <div className="flex flex-col items-center pt-8 text-center">
        <div className="w-24 h-24 rounded-full bg-emerald-700/80 border-4 border-emerald-500/50 flex items-center justify-center text-white text-2xl font-extrabold mb-4 shadow-xl">
          DR
        </div>
        <h2 className="text-xl font-extrabold">{vetName}</h2>
        <p className="text-xs text-emerald-300 mt-1 font-mono">{vetPhone}</p>
        <p className="text-xs text-slate-400 mt-0.5">{VETERINARIAN_DATA.clinic}</p>
        <span className="mt-3 px-3 py-1 bg-emerald-900/60 border border-emerald-600/40 rounded-full text-xs font-mono text-emerald-300 font-bold">
          Connected · {formatTime(callDuration)}
        </span>
      </div>

      {/* Center Clinical Context Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-xs space-y-1">
        <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
          Cow Health Details Sent to Doctor
        </span>
        <p className="text-slate-300">
          Sent: {focusCowName} · High milk cells · Fever 39.8°C · Teat under watch
        </p>
      </div>

      {/* Call In-Progress Controls */}
      <div className="space-y-6 pb-8">
        <div className="flex items-center justify-around">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
              isMuted ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300'
            }`}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          <button
            onClick={() => setIsSpeaker(!isSpeaker)}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
              isSpeaker ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300'
            }`}
          >
            <Volume2 className="w-6 h-6" />
          </button>
        </div>

        {/* End Call Button */}
        <div className="flex justify-center">
          <button
            id="android-end-call-button"
            onClick={handleEndCall}
            className="w-18 h-18 rounded-full bg-rose-600 hover:bg-rose-700 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-rose-900/50 transition-all cursor-pointer"
          >
            <PhoneOff className="w-8 h-8" />
          </button>
        </div>
      </div>
    </div>
  );
};

// 5. Common Reusable Aarogya Toast / Android Snackbar
export { AarogyaToast } from './AarogyaToast';
export type { AarogyaToastProps } from './AarogyaToast';

export interface SnackbarMessage {
  id?: string;
  text: string;
  actionText?: string;
  onAction?: () => void;
}

interface AndroidSnackbarProps {
  message?: string | null;
  snackbar?: SnackbarMessage | null;
  onClose?: () => void;
  onDismiss?: () => void;
}

export const AndroidSnackbar: React.FC<AndroidSnackbarProps> = ({
  message,
  snackbar,
  onClose,
  onDismiss,
}) => {
  const text = message || snackbar?.text;
  const dismiss = onDismiss || onClose;

  return <AarogyaToast message={text} onClose={dismiss} duration={2000} />;
};

// 6. Android SMS Mastitis Alert Modal (In-App SMS Center)
interface AndroidSmsModalProps {
  isOpen: boolean;
  onClose: () => void;
  farmerName?: string;
  onShowSnackbar?: (msg: string) => void;
  onCallVet?: () => void;
  onViewCow?: (cowId: string) => void;
  vetName?: string;
  vetPhone?: string;
  focusCowName?: string;
  focusCowId?: string;
  disease?: string;
}

export const AndroidSmsModal: React.FC<AndroidSmsModalProps> = ({
  isOpen,
  onClose,
  farmerName = 'Murugan Natarajan',
  onShowSnackbar,
  onCallVet,
  onViewCow,
  vetName = VETERINARIAN_DATA.name,
  vetPhone = VETERINARIAN_DATA.phone,
  focusCowName = 'Lakshmi',
  focusCowId = 'C-024',
  disease = 'Subclinical Mastitis',
}) => {
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [lastSendMode, setLastSendMode] = useState<string | null>(null);
  const [messages, setMessages] = useState([
    {
      id: 'sms-1',
      sender: 'VM-AAROGYA (National Dairy SMS Gateway)',
      type: 'system',
      timestamp: '09:15 AM',
      text: `[URGENT SMS] Alert: Cow ${focusCowName} (${focusCowId}) is under active watch for ${disease}. Milk cell count elevated. ${vetName} notified. Move ${focusCowName} to separate stall and do not mix her milk in the dairy tank.`,
      status: `Delivered to Farmer & ${vetName} (${vetPhone})`,
    },
    {
      id: 'sms-2',
      sender: `${vetName} (${vetPhone})`,
      type: 'incoming',
      timestamp: '09:22 AM',
      text: `SMS received ${farmerName.split(' ')[0]} ji. Doctor mobile clinic on call for AAROGYA network. Keep milk separate and continue prescribed care.`,
      status: 'Received via GSM',
    },
  ]);

  if (!isOpen) return null;

  const handleSendReply = async (customText?: string) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim() || isSending) return;

    setIsSending(true);
    const newMsg = {
      id: `sms-${Date.now()}`,
      sender: `Farmer ${farmerName} (+91 98765 43210)`,
      type: 'outgoing',
      timestamp: 'Just now',
      text: textToSend.trim(),
      status: 'Sending via /api/alerts/send-sms...',
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
    try {
      const result = await sendSmsAlert({
        to: '9443287610',
        carrier: 'jio',
        cowId: focusCowId,
        cowName: focusCowName,
        disease,
        vetName,
        farmerName,
        message: textToSend.trim(),
      });
      setLastSendMode(result.mode || 'smtp');
      setMessages((prev) =>
        prev.map((m) =>
          m.id === newMsg.id
            ? { ...m, status: result.mode === 'dev-simulated' ? 'Simulated (set EMAIL_USER/EMAIL_PASS in .env)' : `Sent via ${result.via || 'SMS gateway'} ✓` }
            : m
        )
      );
      onShowSnackbar?.(
        result.mode === 'dev-simulated'
          ? `SMS simulated for ${focusCowName} — add Gmail creds in .env to send for real`
          : `SMS dispatched via ${result.via || 'gateway'} to ${result.to || vetName}`
      );
    } catch (e: any) {
      setMessages((prev) =>
        prev.map((m) => (m.id === newMsg.id ? { ...m, status: `Failed: ${e?.message || 'network error'}` } : m))
      );
      onShowSnackbar?.(`SMS failed: ${e?.message || 'network error'} — reply kept in thread`);
    } finally {
      setIsSending(false);
    }
  };

  const handleResendAlert = async () => {
    if (isSending) return;
    setIsSending(true);
    try {
      const result = await sendSmsAlert({
        to: '9443287610',
        carrier: 'jio',
        cowId: focusCowId,
        cowName: focusCowName,
        disease,
        vetName,
        farmerName,
        message: buildMastitisMessage({ cowId: focusCowId, cowName: focusCowName, disease, vetName, vetPhone, farmerName }),
      });
      setLastSendMode(result.mode || 'smtp');
      onShowSnackbar?.(
        result.mode === 'dev-simulated'
          ? `Alert simulated for ${farmerName} & ${vetName} — configure .env for real SMS`
          : `SMS Alert re-sent to Farmer ${farmerName} & ${vetName} (${result.to || vetPhone})`
      );
    } catch (e: any) {
      onShowSnackbar?.(`Resend failed: ${e?.message || 'network error'}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      id="android-sms-alert-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="android-sms-alert-sheet"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 animate-in slide-in-from-bottom duration-200 overflow-hidden"
      >
        {/* Android drag bar */}
        <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mt-3 mb-1 sm:hidden" />

        {/* SMS Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                  SMS Mastitis Alert
                </h3>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <CheckCheck className="w-3 h-3 text-emerald-600" />
                  GSM Online
                </span>
              </div>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                Gateway: VM-AAROGYA · SIM 1 (Jio 4G)
              </p>
            </div>
          </div>

          <button
            id="close-sms-modal"
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SMS Recipient Banner */}
        <div className="bg-amber-50/90 border-b border-amber-200/80 px-5 py-2.5 flex items-center justify-between text-xs text-amber-950">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-amber-700 shrink-0" />
            <span className="font-semibold">
              Recipients: <span className="font-normal text-slate-700">Farmer (+91 98765 43210) & Dr. Sharma (+91 98960 11982)</span>
            </span>
          </div>
          <button
            id="sms-modal-resend-header"
            type="button"
            onClick={handleResendAlert}
            disabled={isSending}
            className="text-[11px] font-bold text-amber-800 hover:text-amber-950 underline cursor-pointer shrink-0 ml-2 disabled:opacity-50"
          >
            {isSending ? 'Sending...' : 'Resend Alert'}
          </button>
        </div>
        {lastSendMode && (
          <div className="px-5 py-1.5 bg-slate-50 border-b border-slate-100 text-[10px] font-mono text-slate-500">
            Backend: /api/alerts/send-sms · mode: {lastSendMode}
          </div>
        )}

        {/* SMS Messages Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50 min-h-[240px] max-h-[380px]">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${
                m.type === 'outgoing' ? 'items-end' : 'items-start'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1 px-1">
                <span className="text-[11px] font-semibold text-slate-600">
                  {m.sender}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {m.timestamp}
                </span>
              </div>

              <div
                className={`max-w-[90%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                  m.type === 'outgoing'
                    ? 'bg-emerald-800 text-white rounded-tr-xs'
                    : m.type === 'system'
                    ? 'bg-amber-50 border border-amber-300/80 text-slate-900 rounded-tl-xs'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                }`}
              >
                <p>{m.text}</p>
                <div
                  className={`mt-2 pt-1.5 border-t text-[10px] flex items-center justify-between font-mono ${
                    m.type === 'outgoing'
                      ? 'border-emerald-700/60 text-emerald-200'
                      : 'border-slate-200/80 text-slate-500'
                  }`}
                >
                  <span>{m.status}</span>
                  <CheckCheck className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Response Pills */}
        <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[11px]">
          <span className="text-slate-400 font-semibold shrink-0 text-[10px] uppercase">Quick SMS:</span>
          <button
            type="button"
            onClick={() => handleSendReply('Lakshmi moved to separate stall. Sick teat milk kept separate.')}
            className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium shrink-0 cursor-pointer transition-colors"
          >
            Lakshmi separated in stall
          </button>
          <button
            type="button"
            onClick={() => handleSendReply('When will you reach, Doctor?')}
            className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium shrink-0 cursor-pointer transition-colors"
          >
            Check Doctor Arrival Time
          </button>
          <button
            type="button"
            onClick={() => handleSendReply('Washed left-back teat with cool water.')}
            className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium shrink-0 cursor-pointer transition-colors"
          >
            Washed teat with cool water
          </button>
        </div>

        {/* SMS Input Box */}
        <div className="p-3.5 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendReply();
            }}
            placeholder="Type SMS reply to Dr. Sharma..."
            className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700/30"
          />
          <button
            type="button"
            onClick={() => handleSendReply()}
            disabled={isSending}
            className="w-9 h-9 rounded-xl bg-emerald-800 hover:bg-emerald-900 active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-xs disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom Actions: View Cow & Call Vet */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              onClose();
              onViewCow?.('C-024');
            }}
            className="flex-1 py-2 px-3 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>View Cow (Lakshmi C-024)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onCallVet?.();
            }}
            className="py-2 px-3.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Call Vet</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export const SmsAlertModal = AndroidSmsModal;
