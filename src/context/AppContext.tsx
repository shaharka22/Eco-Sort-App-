import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { UserLevel, WasteCategory, SessionStats, SortingResult, SortingSession } from '@/types';

interface AppContextType {
  userLevel: UserLevel | null;
  setUserLevel: (level: UserLevel | null) => void;
  score: number;
  addScore: (points: number) => void;
  currentImage: string | null;
  setCurrentImage: (image: string | null) => void;
  sortingSession: SortingSession;
  setIdentifiedCategory: (category: WasteCategory) => void;
  confirmIdentification: () => void;
  selectBin: (category: WasteCategory) => boolean;
  startRobotAction: () => WasteCategory | null;
  completeRobotAction: (success: boolean) => void;
  validateFullSuccess: () => boolean;
  sessionStats: SessionStats;
  sortingHistory: SortingResult[];
  recordSuccessfulSort: () => void;
  resetSortingSession: () => void;
  resetSession: () => void;
  soundEnabled: boolean;
  toggleSound: () => void;
}

const initialStats: SessionStats = {
  totalItems: 0, successfulSorts: 0,
  plasticCount: 0, paperCount: 0, glassCount: 0, organicCount: 0,
};

const initialSortingSession: SortingSession = {
  identifiedCategory: null, identificationConfirmed: false,
  selectedBinCategory: null, binSelectionCorrect: false,
  robotTargetBin: null, robotActionCompleted: false, isFullSuccess: false,
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [userLevel, setUserLevel] = useState<UserLevel | null>(null);
  const [score, setScore] = useState(0);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [sortingSession, setSortingSession] = useState<SortingSession>(initialSortingSession);
  const [sessionStats, setSessionStats] = useState<SessionStats>(initialStats);
  const [sortingHistory, setSortingHistory] = useState<SortingResult[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const addScore = useCallback((points: number) => setScore(prev => prev + points), []);

  const setIdentifiedCategory = useCallback((category: WasteCategory) => {
    setSortingSession(prev => ({ ...prev, identifiedCategory: category, identificationConfirmed: false, selectedBinCategory: null, binSelectionCorrect: false, robotTargetBin: null, robotActionCompleted: false, isFullSuccess: false }));
  }, []);

  const confirmIdentification = useCallback(() => {
    setSortingSession(prev => ({ ...prev, identificationConfirmed: true }));
  }, []);

  const selectBin = useCallback((category: WasteCategory): boolean => {
    const isCorrect = category === sortingSession.identifiedCategory;
    setSortingSession(prev => ({ ...prev, selectedBinCategory: category, binSelectionCorrect: isCorrect }));
    return isCorrect;
  }, [sortingSession.identifiedCategory]);

  const startRobotAction = useCallback((): WasteCategory | null => {
    if (!sortingSession.binSelectionCorrect || !sortingSession.selectedBinCategory) return null;
    const targetBin = sortingSession.selectedBinCategory;
    setSortingSession(prev => ({ ...prev, robotTargetBin: targetBin }));
    return targetBin;
  }, [sortingSession.binSelectionCorrect, sortingSession.selectedBinCategory]);

  const completeRobotAction = useCallback((success: boolean) => {
    setSortingSession(prev => {
      const isFullSuccess = success && prev.identificationConfirmed && prev.binSelectionCorrect && prev.robotTargetBin === prev.identifiedCategory;
      return { ...prev, robotActionCompleted: success, isFullSuccess };
    });
  }, []);

  const validateFullSuccess = useCallback((): boolean => {
    const { identifiedCategory, identificationConfirmed, selectedBinCategory, binSelectionCorrect, robotTargetBin, robotActionCompleted } = sortingSession;
    return identifiedCategory !== null && identificationConfirmed && selectedBinCategory !== null && binSelectionCorrect && robotTargetBin !== null && robotActionCompleted && identifiedCategory === selectedBinCategory && selectedBinCategory === robotTargetBin;
  }, [sortingSession]);

  const recordSuccessfulSort = useCallback(() => {
    if (!sortingSession.isFullSuccess || !sortingSession.identifiedCategory) return;
    const category = sortingSession.identifiedCategory;
    setSessionStats(prev => ({ ...prev, totalItems: prev.totalItems + 1, successfulSorts: prev.successfulSorts + 1, [`${category}Count`]: (prev as unknown as Record<string, number>)[`${category}Count`] + 1, }));
    setSortingHistory(prev => [...prev, { category, timestamp: new Date(), success: true }]);
    addScore(10);
  }, [sortingSession, addScore]);

  const resetSortingSession = useCallback(() => { setSortingSession(initialSortingSession); setCurrentImage(null); }, []);
  const resetSession = useCallback(() => { setScore(0); setSessionStats(initialStats); setSortingHistory([]); setSortingSession(initialSortingSession); setCurrentImage(null); }, []);
  const toggleSound = useCallback(() => setSoundEnabled(prev => !prev), []);

  const value: AppContextType = {
    userLevel, setUserLevel, score, addScore, currentImage, setCurrentImage,
    sortingSession, setIdentifiedCategory, confirmIdentification, selectBin,
    startRobotAction, completeRobotAction, validateFullSuccess,
    sessionStats, sortingHistory, recordSuccessfulSort,
    resetSortingSession, resetSession, soundEnabled, toggleSound,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
