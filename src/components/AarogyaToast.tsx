import { CheckCircle2, Fingerprint, Globe, ShieldCheck } from 'lucide-react';
import React, { useEffect, useState } from 'react';

export interface AarogyaToastProps {
  message?: string | null;
  onClose?: () => void;
  duration?: number; // defaults to 2000ms (2 seconds)
}

/**
 * Common, reusable toast notification for the AAROGYA app.
 * Appears only for important confirmation actions (successful logout, save, update, completion).
 * Small, clean, farmer-friendly, automatically disappears after 2 seconds.
 * No buttons, no manual dismiss required.
 */
export const AarogyaToast: React.FC<AarogyaToastProps> = ({
  message,
  onClose,
  duration = 2000,
}) => {
  const [activeText, setActiveText] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (!message) {
      setIsExiting(false);
      setIsVisible(false);
      setIsMounted(false);
      setActiveText(null);
      return;
    }

    setActiveText(message);
    setIsMounted(true);
    setIsExiting(false);

    // Frame request to smoothly trigger fade-in transition
    const enterRaf = requestAnimationFrame(() => {
      setIsVisible(true);
    });

    // 2 seconds display only, then smooth fade-out
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
      setIsVisible(false);
    }, duration);

    // After fade-out transition finishes (250ms), unmount and trigger onClose
    const closeTimer = setTimeout(() => {
      setIsMounted(false);
      setIsExiting(false);
      setActiveText(null);
      onClose?.();
    }, duration + 250);

    return () => {
      cancelAnimationFrame(enterRaf);
      clearTimeout(exitTimer);
      clearTimeout(closeTimer);
    };
  }, [message, duration, onClose]);

  if (!isMounted || !activeText) return null;

  // Determine a suitable farmer-friendly icon based on the action confirmed
  const getActionIcon = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes('fingerprint') || lower.includes('biometric')) {
      return <Fingerprint className="w-4 h-4 text-emerald-300 shrink-0" />;
    }
    if (lower.includes('logout') || lower.includes('logged out') || lower.includes('lock')) {
      return <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />;
    }
    if (lower.includes('language') || lower.includes('भाषा') || lower.includes('ਭਾਸ਼ਾ') || lower.includes('மொழி')) {
      return <Globe className="w-4 h-4 text-emerald-300 shrink-0" />;
    }
    return <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />;
  };

  return (
    <div
      id="aarogya-toast-notification"
      role="status"
      aria-live="polite"
      className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-250 ease-out ${
        isVisible && !isExiting
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 translate-y-2 scale-95'
      }`}
    >
      <div className="flex items-center gap-2.5 px-4 py-2.5 bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white rounded-2xl shadow-lg shadow-emerald-950/25 border border-emerald-600/40 backdrop-blur-md max-w-[92vw] sm:max-w-md">
        <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 border border-emerald-400/30">
          {getActionIcon(activeText)}
        </div>
        <p className="text-xs font-semibold text-emerald-50 leading-snug tracking-normal select-none">
          {activeText}
        </p>
      </div>
    </div>
  );
};
