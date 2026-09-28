import React from 'react';
import { CowDetailView } from '../components/CowDetailView';
import { COWS_DATA } from '../data/mockData';
import { Cow, LanguageCode } from '../types';

interface Screen5CowDiagnosticProps {
  cowId: string;
  currentLang: LanguageCode;
  onBack: () => void;
  onLocateCowInBarn: (stallNum: number) => void;
  onOpenAskAi: (initialPrompt?: string) => void;
  onCallVet: () => void;
  onShowSnackbar: (msg: string) => void;
  herdList?: Cow[];
}

export const Screen5CowDiagnostic: React.FC<Screen5CowDiagnosticProps> = ({
  cowId,
  currentLang,
  onBack,
  onLocateCowInBarn,
  onOpenAskAi,
  onCallVet,
  onShowSnackbar,
  herdList,
}) => {
  // Dynamically resolve the selected cow from setup herdList or fallback to COWS_DATA
  const allCows = herdList && herdList.length > 0 ? herdList : COWS_DATA;
  const cow = allCows.find((c) => c.id === cowId) || COWS_DATA.find((c) => c.id === cowId) || allCows[0];

  return (
    <div id="screen-5-cow-diagnostic" className="w-full pb-10">
      <CowDetailView
        cow={cow}
        currentLang={currentLang}
        onBack={onBack}
        onCallVet={onCallVet}
        onLocateCowInBarn={onLocateCowInBarn}
        onOpenAskAi={onOpenAskAi}
        onShowSnackbar={onShowSnackbar}
      />
    </div>
  );
};
