import { BarChart3, Home, PawPrint, Stethoscope, User } from 'lucide-react';
import React from 'react';
import { TRANSLATIONS } from '../data/mockData';
import { BottomTabType, LanguageCode } from '../types';

interface BottomNavigationProps {
  activeTab: BottomTabType;
  onTabChange: (tab: BottomTabType) => void;
  currentLang?: LanguageCode;
  unreadCount?: number;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabChange,
  currentLang = 'en',
  unreadCount = 2,
}) => {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  // Exactly 5 bottom tabs as specified:
  // 1. Home
  // 2. My Cows
  // 3. Herd
  // 4. Veterinarian
  // 5. Profile
  const tabs: { id: BottomTabType; label: string; icon: any; badge?: string | number | null }[] = [
    { id: 'home', label: t.tabHome || 'Home', icon: Home, badge: null },
    { id: 'my_cows', label: t.tabMyCows || 'My Cows', icon: PawPrint, badge: unreadCount > 0 ? unreadCount : null },
    { id: 'herd', label: t.tabHerd || 'Herd', icon: BarChart3, badge: null },
    { id: 'veterinarian', label: t.tabVeterinarian || 'Vet', icon: Stethoscope, badge: 'ETA' },
    { id: 'profile', label: t.tabProfile || 'Profile', icon: User, badge: null },
  ];

  return (
    <nav
      id="android-bottom-navigation"
      aria-label="Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 w-full z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-lg px-4 pt-2 pb-4 sm:pb-3"
    >
      <div className="max-w-xl mx-auto grid grid-cols-5 items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`tab-button-${tab.id}`}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-1 transition-all duration-200 group cursor-pointer ${
                isActive ? 'text-emerald-800' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {/* Material 3 active pill background indicator */}
              <div
                className={`relative flex items-center justify-center w-14 h-8 rounded-full transition-all duration-200 ${
                  isActive ? 'bg-emerald-100/90 text-emerald-800' : 'bg-transparent text-slate-500'
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'
                  }`}
                />

                {/* Badge indicator */}
                {tab.badge && (
                  <span className="absolute -top-1 -right-0.5 min-w-[18px] h-[18px] px-1 bg-rose-600 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                    {tab.badge}
                  </span>
                )}
              </div>

              {/* Navigation Label: SemiBold 600 */}
              <span
                className={`text-[11px] font-semibold tracking-tight mt-1 whitespace-nowrap transition-colors ${
                  isActive ? 'text-emerald-950' : 'text-slate-500'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
