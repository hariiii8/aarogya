import React, { useState } from 'react';
import { AarogyaChatBot } from './components/AarogyaChatBot';
import { AarogyaToast } from './components/AarogyaToast';
import {
  AndroidNotificationsSheet,
  AndroidPhoneCallModal,
  AndroidSmsModal,
  BiometricPromptModal,
  PermissionDialog
} from './components/AndroidModals';
import { AndroidStatusBar } from './components/AndroidSystemBar';
import { BottomNavigation } from './components/BottomNavigation';
import { Screen1Login } from './screens/Screen1Login';
import { Screen2SetupWizard } from './screens/Screen2SetupWizard';
import { Screen3Home } from './screens/Screen3Home';
import { Screen4MyCows } from './screens/Screen4MyCows';
import { Screen5CowDiagnostic } from './screens/Screen5CowDiagnostic';
import { Screen6Herd } from './screens/Screen6Herd';
import { Screen7Veterinarian } from './screens/Screen7Veterinarian';
import { Screen8Profile } from './screens/Screen8Profile';
import { DEFAULT_FARM_SETUP, THREE_INPUT_COW_DATA } from './data/mockData';
import {
  AppScreen,
  BottomTabType,
  Cow,
  FarmSetupData,
  HerdSubSection,
  LanguageCode,
  VetSubSection
} from './types';

export default function App() {
  // Navigation state
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('screen_1_login');
  const [activeTab, setActiveTab] = useState<BottomTabType>('home');
  const [previousScreen, setPreviousScreen] = useState<AppScreen>('screen_3_home');

  // Complete farm setup configuration state with localStorage persistence
  const [farmSetup, setFarmSetup] = useState<FarmSetupData>(() => {
    try {
      const stored = localStorage.getItem('aarogya_farm_setup_data');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && Array.isArray(parsed.herdList)) {
          parsed.herdList = parsed.herdList.map((c: any) => ({
            ...c,
            rfid: c.rfid || DEFAULT_FARM_SETUP.herdList.find((dh) => dh.id === c.id)?.rfid || `982 0004 1289 10${(c.stall || 1).toString().padStart(2, '0')}`,
          }));
          // Ensure Maha and 3 input cows are in herdList
          const hasMaha = parsed.herdList.some((c: any) => c.name?.toLowerCase() === 'maha' || c.id === 'C-015');
          if (!hasMaha) {
            parsed.herdList = [...parsed.herdList, ...THREE_INPUT_COW_DATA];
          }
        }
        return parsed;
      }
    } catch {}
    return DEFAULT_FARM_SETUP;
  });

  // Diagnostic context state
  const [selectedCowId, setSelectedCowId] = useState<string>('C-024');

  // Herd subsection and stall highlight state
  const [herdSubSection, setHerdSubSection] = useState<HerdSubSection>('health_analytics');
  const [highlightedStall, setHighlightedStall] = useState<number | null>(null);

  // Vet subsection and AI prompt state
  const [vetSubSection, setVetSubSection] = useState<VetSubSection>('vet');
  const [initialAiPrompt, setInitialAiPrompt] = useState<string | undefined>(undefined);

  // Inbuilt ChatBot State
  const [isChatBotOpen, setIsChatBotOpen] = useState(false);
  const [chatBotInitialPrompt, setChatBotInitialPrompt] = useState<string | undefined>(undefined);

  // App settings & simulation states
  const [currentLang, setCurrentLang] = useState<LanguageCode>('en');
  const [isOffline, setIsOffline] = useState(false);

  // Farmer name state for onboarding
  const [farmerName, setFarmerName] = useState(DEFAULT_FARM_SETUP.farmerName);

  // Setup completion state: defaults to true for existing farmer accounts
  const [hasCompletedSetup, setHasCompletedSetup] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('aarogya_farm_setup_completed');
      return stored !== null ? stored === 'true' : true;
    } catch {
      return true;
    }
  });

  // Modals state
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [permissionType, setPermissionType] = useState<'camera' | 'location' | 'mic'>('camera');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCallVetModal, setShowCallVetModal] = useState(false);
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setSnackbarMessage(msg);
  };

  // Switch Bottom Tab
  const handleTabChange = (tab: BottomTabType) => {
    setActiveTab(tab);
    if (tab === 'home') {
      setCurrentScreen('screen_3_home');
    } else if (tab === 'my_cows') {
      setCurrentScreen('screen_4_my_cows');
    } else if (tab === 'herd') {
      setCurrentScreen('screen_6_herd');
    } else if (tab === 'veterinarian') {
      setCurrentScreen('screen_7_veterinarian');
    } else if (tab === 'profile') {
      setCurrentScreen('screen_8_profile');
    }
  };

  // Login handler:
  // - If isNewAccount: 1-time onboarding setup wizard opens
  // - If standard login: goes directly to Dairy Dashboard (screen_3_home) without repeating setup!
  const handleLoginSuccess = (name?: string, isNewAccount: boolean = false) => {
    const cleanName = name && name.trim() ? name.trim() : farmerName;
    setFarmerName(cleanName);
    setFarmSetup((prev) => ({ ...prev, farmerName: cleanName }));
    setPreviousScreen(currentScreen);

    if (isNewAccount) {
      setCurrentScreen('screen_2_setup');
      showToast(`Welcome ${cleanName}! Starting 1-time Farm Setup`);
    } else {
      setCurrentScreen('screen_3_home');
      setActiveTab('home');
      showToast(`Welcome back, ${cleanName}! Direct Dashboard Access`);
    }
  };

  // Transition from Setup to Home with complete setup data
  const handleSetupComplete = (name?: string, setupData?: FarmSetupData) => {
    try {
      localStorage.setItem('aarogya_farm_setup_completed', 'true');
    } catch {}
    setHasCompletedSetup(true);

    if (setupData) {
      setFarmSetup(setupData);
      setFarmerName(setupData.farmerName);
      try {
        localStorage.setItem('aarogya_farm_setup_data', JSON.stringify(setupData));
      } catch {}
    } else if (name && name.trim()) {
      const cleanName = name.trim();
      setFarmerName(cleanName);
      setFarmSetup((prev) => {
        const next = { ...prev, farmerName: cleanName };
        try {
          localStorage.setItem('aarogya_farm_setup_data', JSON.stringify(next));
        } catch {}
        return next;
      });
    }
    setCurrentScreen('screen_3_home');
    setActiveTab('home');
    showToast(`${setupData?.farmName || farmSetup.farmName} profile saved on Dashboard`);
  };

  // Live RFID update handler synchronized across setup and My Cows
  const handleUpdateCowRfid = (cowId: string, newRfid: string) => {
    setFarmSetup((prev) => {
      const updatedHerd = prev.herdList.map((c) =>
        c.id === cowId ? { ...c, rfid: newRfid } : c
      );
      const updated = { ...prev, herdList: updatedHerd };
      try {
        localStorage.setItem('aarogya_farm_setup_data', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    showToast(`Updated RFID for cow ${cowId} to ${newRfid}`);
  };

  // Add new cows handler synchronized to farmSetup and dashboard
  const handleAddCows = (newCows: Cow[]) => {
    setFarmSetup((prev) => {
      const existingIds = new Set(prev.herdList.map((c) => c.id));
      const freshToAdd = newCows.filter((c) => !existingIds.has(c.id));
      const updatedHerd = [...prev.herdList, ...freshToAdd];
      const updated = {
        ...prev,
        herdList: updatedHerd,
        herdStrength: `${Math.max(parseInt(prev.herdStrength || '0', 10), updatedHerd.length)}`,
      };
      try {
        localStorage.setItem('aarogya_farm_setup_data', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Open Cow Diagnostic Detail
  const handleOpenCowDiagnostic = (cowId: string) => {
    setSelectedCowId(cowId);
    setPreviousScreen(currentScreen);
    setCurrentScreen('screen_5_cow_diagnostic');
  };

  // From Cow Diagnostic -> Locate cow in Barn Map
  const handleLocateCowInBarn = (stallNum: number) => {
    setHighlightedStall(stallNum);
    setHerdSubSection('farm_map');
    setActiveTab('herd');
    setCurrentScreen('screen_6_herd');
  };

  // Open Inbuilt Bovine AI Chatbot directly from any screen
  const handleOpenAskAi = (prompt?: string) => {
    setChatBotInitialPrompt(prompt);
    setIsChatBotOpen(true);
    setInitialAiPrompt(prompt);
    setVetSubSection('ask_ai');
  };

  // Call Vet Action
  const handleCallVet = () => {
    setShowCallVetModal(true);
  };

  // Logout
  const handleLogout = () => {
    setCurrentScreen('screen_1_login');
    showToast('Logged out successfully');
  };

  // Biometric fast bio on Login
  const handleTriggerBiometric = () => {
    setShowBiometricModal(true);
  };

  const handleBiometricSuccess = () => {
    setShowBiometricModal(false);
    if (currentScreen === 'screen_1_login') {
      handleLoginSuccess();
    } else {
      showToast('Biometric Fingerprint Verified');
    }
  };

  // Render current active screen
  const renderScreen = () => {
    switch (currentScreen) {
      case 'screen_1_login':
        return (
          <Screen1Login
            currentLang={currentLang}
            onSelectLang={setCurrentLang}
            onLoginSuccess={handleLoginSuccess}
            onShowSnackbar={showToast}
          />
        );

      case 'screen_2_setup':
        return (
          <Screen2SetupWizard
            currentLang={currentLang}
            initialFarmerName={farmSetup.farmerName}
            initialSetupData={farmSetup}
            onComplete={handleSetupComplete}
            onCancel={() => {
              if (previousScreen === 'screen_3_home' || previousScreen === 'screen_8_profile') {
                setCurrentScreen('screen_3_home');
                setActiveTab('home');
              } else {
                setCurrentScreen('screen_1_login');
              }
            }}
            onRequestPermission={(type) => {
              setPermissionType(type);
              setShowPermissionDialog(true);
            }}
            onShowSnackbar={showToast}
            onUpdateCowRfid={handleUpdateCowRfid}
          />
        );

      case 'screen_3_home':
        return (
          <Screen3Home
            farmerName={farmSetup.farmerName}
            farmSetup={farmSetup}
            currentLang={currentLang}
            onOpenCowDiagnostic={handleOpenCowDiagnostic}
            onOpenAskAi={handleOpenAskAi}
            onOpenNotifications={() => setShowNotifications(true)}
            onCallVet={handleCallVet}
            onShowSnackbar={showToast}
            onOpenSmsAlert={() => setShowSmsModal(true)}
            onOpenSetupWizard={() => {
              setPreviousScreen('screen_3_home');
              setCurrentScreen('screen_2_setup');
            }}
          />
        );

      case 'screen_4_my_cows':
        return (
          <Screen4MyCows
            currentLang={currentLang}
            onSelectCow={handleOpenCowDiagnostic}
            onShowSnackbar={showToast}
            herdList={farmSetup.herdList}
            onUpdateCowRfid={handleUpdateCowRfid}
            onAddCows={handleAddCows}
          />
        );

      case 'screen_5_cow_diagnostic':
        return (
          <Screen5CowDiagnostic
            cowId={selectedCowId}
            currentLang={currentLang}
            herdList={farmSetup.herdList}
            onBack={() => {
              // Return to previous screen (either Home or My Cows)
              if (previousScreen === 'screen_4_my_cows') {
                setActiveTab('my_cows');
                setCurrentScreen('screen_4_my_cows');
              } else {
                setActiveTab('home');
                setCurrentScreen('screen_3_home');
              }
            }}
            onLocateCowInBarn={handleLocateCowInBarn}
            onOpenAskAi={handleOpenAskAi}
            onCallVet={handleCallVet}
            onShowSnackbar={showToast}
          />
        );

      case 'screen_6_herd':
        return (
          <Screen6Herd
            initialSubSection={herdSubSection}
            highlightStall={highlightedStall}
            currentLang={currentLang}
            onOpenCowDiagnostic={handleOpenCowDiagnostic}
            onOpenAskAi={handleOpenAskAi}
            onShowSnackbar={showToast}
            herdList={farmSetup.herdList}
            farmSetup={farmSetup}
          />
        );

      case 'screen_7_veterinarian':
        return (
          <Screen7Veterinarian
            farmerName={farmSetup.farmerName}
            initialSubSection={vetSubSection}
            initialAiPrompt={initialAiPrompt}
            currentLang={currentLang}
            onSelectLang={setCurrentLang}
            onCallVet={handleCallVet}
            onShowSnackbar={showToast}
            farmSetup={farmSetup}
          />
        );

      case 'screen_8_profile':
        return (
          <Screen8Profile
            farmerName={farmSetup.farmerName}
            farmName={farmSetup.farmName}
            location={farmSetup.location}
            herdStrength={farmSetup.herdStrength}
            currentLang={currentLang}
            onSelectLang={setCurrentLang}
            onLogout={handleLogout}
            onShowSnackbar={showToast}
            onOpenSetup={() => {
              setPreviousScreen('screen_8_profile');
              setCurrentScreen('screen_2_setup');
            }}
          />
        );

      default:
        return null;
    }
  };

  const showBottomNav =
    currentScreen !== 'screen_1_login' &&
    currentScreen !== 'screen_2_setup';

  return (
    <div
      id="app-root"
      className="w-full min-h-screen bg-[#F8FAF9] flex flex-col text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] selection:bg-emerald-200 overflow-x-hidden"
    >
      {/* App Top Navigation Bar with Logo, Name, and Common Language Change */}
      <AndroidStatusBar
        currentLang={currentLang}
        onSelectLang={(lang) => {
          setCurrentLang(lang);
          showToast(
            lang === 'en'
              ? 'Language changed to English'
              : lang === 'hi'
              ? 'भाषा हिंदी में बदली गई'
              : lang === 'pa'
              ? 'ਭਾਸ਼ਾ ਪੰਜਾਬੀ ਵਿੱਚ ਬਦਲੀ ਗਈ'
              : 'மொழி தமிழுக்கு மாற்றப்பட்டது'
          );
        }}
      />

      {/* Full Screen Content Container - responsive mobile padding to prevent cramping */}
      <main
        id="main-screen-container"
        className="flex-1 w-full max-w-5xl mx-auto px-2.5 sm:px-6 pt-2.5 sm:pt-3 pb-24 relative overflow-x-hidden"
      >
        {renderScreen()}
      </main>

      {/* Existing 5 Bottom Tabs: Home, My Cows, Herd, Veterinarian, Profile */}
      {showBottomNav && (
        <BottomNavigation
          activeTab={activeTab}
          currentLang={currentLang}
          onTabChange={handleTabChange}
        />
      )}

      {/* Android System Modals & Sheets */}
      <BiometricPromptModal
        isOpen={showBiometricModal}
        onClose={() => setShowBiometricModal(false)}
        onSuccess={handleBiometricSuccess}
        farmerName={farmerName}
      />

      <PermissionDialog
        isOpen={showPermissionDialog}
        type={permissionType}
        onAllow={() => {
          setShowPermissionDialog(false);
          showToast(`Granted ${permissionType} permission`);
        }}
        onDeny={() => {
          setShowPermissionDialog(false);
          showToast(`Denied ${permissionType} permission`);
        }}
      />

      <AndroidNotificationsSheet
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        onSelectAlert={(cowId) => {
          setShowNotifications(false);
          handleOpenCowDiagnostic(cowId);
        }}
        onCallVet={handleCallVet}
        onOpenSmsAlert={() => {
          setShowNotifications(false);
          setShowSmsModal(true);
        }}
      />

      <AndroidSmsModal
        isOpen={showSmsModal}
        onClose={() => setShowSmsModal(false)}
        farmerName={farmSetup.farmerName}
        onShowSnackbar={showToast}
        onCallVet={handleCallVet}
        onViewCow={handleOpenCowDiagnostic}
        vetName={farmSetup.treatmentRecord.vetName}
        vetPhone={farmSetup.treatmentRecord.vetPhone}
        focusCowName={farmSetup.treatmentRecord.cowName}
        focusCowId={farmSetup.treatmentRecord.cowId}
        disease={farmSetup.treatmentRecord.disease}
      />

      <AndroidPhoneCallModal
        isOpen={showCallVetModal}
        onClose={() => setShowCallVetModal(false)}
        onShowSnackbar={showToast}
        vetName={farmSetup.treatmentRecord.vetName}
        vetPhone={farmSetup.treatmentRecord.vetPhone}
        focusCowName={farmSetup.treatmentRecord.cowName}
      />

      {/* Inbuilt Bovine AI Chatbot */}
      {currentScreen !== 'screen_1_login' && currentScreen !== 'screen_2_setup' && (
        <AarogyaChatBot
          isOpen={isChatBotOpen}
          onClose={() => setIsChatBotOpen(false)}
          onToggle={() => setIsChatBotOpen(!isChatBotOpen)}
          currentLang={currentLang}
          farmerName={farmSetup.farmerName}
          farmSetup={farmSetup}
          activeCow={
            (farmSetup.herdList && farmSetup.herdList.find((c) => c.id === selectedCowId)) ||
            (farmSetup.herdList && farmSetup.herdList[0])
          }
          herdList={farmSetup.herdList}
          onCallVet={handleCallVet}
          onOpenCowDiagnostic={handleOpenCowDiagnostic}
          onLocateCowInBarn={handleLocateCowInBarn}
          initialPrompt={chatBotInitialPrompt}
        />
      )}

      <AarogyaToast
        message={snackbarMessage}
        onClose={() => setSnackbarMessage(null)}
      />
    </div>
  );
}
