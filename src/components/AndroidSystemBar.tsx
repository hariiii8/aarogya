import { Activity, Globe, ShieldCheck } from 'lucide-react';
import React from 'react';
import panoramicBg from '../assets/images/icon_friendly_dairy_header.jpg';
import { TRANSLATIONS } from '../data/mockData';
import { LanguageCode } from '../types';

export interface AndroidSystemBarProps {
  currentLang?: LanguageCode;
  onSelectLang?: (lang: LanguageCode) => void;
  isOffline?: boolean;
  onToggleOffline?: () => void;
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  canGoBack?: boolean;
  rightAction?: React.ReactNode;
  onTriggerBiometric?: () => void;
  onOpenNotifications?: () => void;
  unreadCount?: number;
}

const LANGUAGE_OPTIONS: { code: LanguageCode; label: string; short: string }[] = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'hi', label: 'हिंदी', short: 'हिं' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ', short: 'ਪੰ' },
  { code: 'ta', label: 'தமிழ்', short: 'த' },
];

export const AndroidSystemBar: React.FC<AndroidSystemBarProps> = ({
  currentLang = 'en',
  onSelectLang,
}) => {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  return (
    <header
      id="app-top-navigation-bar"
      className="sticky top-0 z-40 w-full overflow-hidden border-b border-[#044e42]/15 shadow-sm bg-white relative"
    >
      {/* Serene, icon-friendly panoramic dairy-farm background with gentle rolling pasture, trees, and morning daylight */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <img
          src={panoramicBg}
          alt="Serene Dairy Farm Panorama with Grazing Cattle in Soft Morning Daylight"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-[center_35%] brightness-[1.02] contrast-[1.02]"
        />
        {/* Soft mint & white gradient wash: guarantees maximum contrast for all icons and typography */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 via-35% to-white/10 sm:via-white/85 sm:via-42% sm:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-[#E8F5F1]/20 pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-3 min-h-[60px] sm:min-h-[74px]">
        {/* Left: Prominent AAROGYA Logo & Commercial AgriTech Branding */}
        <div className="flex items-center gap-2 sm:gap-3.5 shrink-0 min-w-0">
          {/* AAROGYA Logo Squircle Badge with Deep Teal Gradient & Soft Mint Pulse */}
          <div
            id="aarogya-brand-logo"
            className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#044e42] via-[#023d33] to-[#012822] flex items-center justify-center text-white shadow-md shadow-[#023d33]/20 border border-teal-600/30 ring-1 ring-emerald-400/30 shrink-0 transition-transform hover:scale-[1.02]"
          >
            <Activity className="w-5 h-5 sm:w-6.5 sm:h-6.5 text-[#A7F3D0]" />
          </div>

          {/* Prominent Name & Clean Bold Poppins Subtitle */}
          <div className="flex flex-col justify-center min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-xl sm:text-3xl font-black tracking-tight text-[#023d33] font-display leading-none">
                {t.appName || 'AAROGYA'}
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold text-[#044e42] bg-[#E8F5F1] px-2 sm:px-2.5 py-0.5 rounded-full border border-[#a7f3d0] uppercase tracking-wider hidden xs:inline-flex items-center gap-1 shadow-2xs">
                <ShieldCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#044e42]" />
                {t.dairyBadge || 'Dairy'}
              </span>
            </div>
            <span className="text-[11px] sm:text-[13px] text-[#056152] font-poppins font-bold tracking-tight mt-0.5 sm:mt-1 leading-tight truncate">
              {t.appSubtitle || 'Cow Health & Doctor Care'}
            </span>
          </div>
        </div>

        {/* Right: Compact Rounded Language Selector Control (EN, HI, PA, TA) */}
        {onSelectLang && (
          <nav
            id="top-language-selector-control"
            aria-label="Language Selector"
            className="flex items-center gap-0.5 bg-white/92 backdrop-blur-md p-0.5 sm:p-1 rounded-xl sm:rounded-2xl border border-[#044e42]/25 shadow-xs ring-1 ring-emerald-950/5 shrink-0"
          >
            <div className="px-1.5 text-[#044e42] hidden md:flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-[#044e42]" />
              <span className="text-[11px] font-poppins font-bold text-[#023d33]">Lang:</span>
            </div>
            {LANGUAGE_OPTIONS.map((lang) => {
              const isActive = currentLang === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  id={`top-lang-btn-${lang.code}`}
                  onClick={() => onSelectLang(lang.code)}
                  className={`px-2 sm:px-3 py-1 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-poppins font-bold transition-all cursor-pointer select-none ${
                    isActive
                      ? 'bg-[#044e42] text-white shadow-xs border border-[#023d33]'
                      : 'text-[#023d33] hover:text-[#044e42] hover:bg-[#E8F5F1] border border-transparent'
                  }`}
                  title={lang.label}
                  aria-pressed={isActive}
                >
                  <span className="sm:hidden">{lang.short}</span>
                  <span className="hidden sm:inline">{lang.label}</span>
                </button>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
};

export const AndroidStatusBar = AndroidSystemBar;


