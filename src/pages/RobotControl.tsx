import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Play, ArrowRight, Loader2, WifiOff, RefreshCw, AlertTriangle } from 'lucide-react';
import { EmergencyStop } from '@/components/EmergencyStop';
import { VirtualJoystick } from '@/components/VirtualJoystick';
import { StarCounter } from '@/components/StarCounter';
import { useApp } from '@/context/AppContext';
import { robotAPI } from '@/utils/MockRobotAPI';
import { WASTE_BINS } from '@/types';

type RobotState = 'idle' | 'executing' | 'complete' | 'stopped' | 'disconnected' | 'emergency' | 'error';

export default function RobotControl() {
  const navigate = useNavigate();
  const { currentImage, sortingSession, startRobotAction, completeRobotAction } = useApp();
  const [robotStatus, setRobotStatus] = useState<string>('idle');
  const [robotState, setRobotState] = useState<RobotState>('idle');
  const [progress, setProgress] = useState(0);
  const progressInterval = useRef<number | null>(null);

  const targetBin = sortingSession.selectedBinCategory;
  const selectedBin = targetBin ? WASTE_BINS.find((b) => b.category === targetBin) : null;

  useEffect(() => {
    const unsubscribe = robotAPI.subscribe((status) => setRobotStatus(status));
    return () => { unsubscribe(); if (progressInterval.current) clearInterval(progressInterval.current); };
  }, []);

  useEffect(() => {
    if (!currentImage || !sortingSession.binSelectionCorrect || !targetBin) navigate('/camera');
  }, [currentImage, sortingSession, targetBin, navigate]);

  const handleLaunch = async () => {
    const robotTargetBin = startRobotAction();
    if (!robotTargetBin) { setRobotState('error'); return; }
    setRobotState('executing'); setProgress(0);
    progressInterval.current = window.setInterval(() => {
      setProgress((prev) => { if (prev >= 95) return prev; return prev + Math.random() * 15; });
    }, 300);
    if (Math.random() < 0.1) {
      setTimeout(() => { if (progressInterval.current) clearInterval(progressInterval.current); completeRobotAction(false); setRobotState('disconnected'); }, 1500);
      return;
    }
    const success = await robotAPI.executeFullSequence(robotTargetBin);
    if (progressInterval.current) clearInterval(progressInterval.current);
    if (success && robotState !== 'emergency') { setProgress(100); completeRobotAction(true); setRobotState('complete'); setTimeout(() => navigate('/impact'), 1500); }
  };

  const handleEmergencyStop = () => {
    if (progressInterval.current) clearInterval(progressInterval.current);
    completeRobotAction(false); setRobotState('emergency'); setRobotStatus('EMERGENCY_STOP');
  };

  if (!targetBin || !selectedBin) return null;

  if (robotState === 'error') return (
    <div className="h-dvh bg-gradient-to-b from-yellow-100 to-orange-100 flex flex-col items-center justify-center p-6">
      <div className="bg-white rounded-3xl p-8 max-w-sm text-center shadow-xl">
        <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6"><AlertTriangle size={48} className="text-yellow-600" /></div>
        <h2 className="text-2xl font-bold text-foreground mb-2">אירעה שגיאה בתהליך</h2>
        <p className="text-muted-foreground mb-6">נסו שוב מההתחלה</p>
        <button onClick={() => navigate('/camera')} className="w-full flex items-center justify-center gap-3 bg-primary text-white font-bold py-4 px-8 rounded-xl hover:bg-primary-dark transition-colors">
          <RefreshCw size={24} /><span>נסה שוב</span>
        </button>
      </div>
    </div>
  );

  if (robotState === 'emergency') return (
    <div className="h-dvh bg-red-600 flex flex-col items-center justify-center p-6">
      <div className="text-center text-white">
        <AlertTriangle size={80} className="mx-auto mb-6 animate-pulse" />
        <h1 className="text-4xl font-black mb-4">עצירת חירום!</h1>
        <p className="text-xl mb-8 opacity-90">הרובוט נעצר</p>
        <div className="bg-white/20 backdrop-blur rounded-2xl p-6 mb-8">
          <div className="text-6xl mb-4">👩‍🏫</div>
          <p className="text-lg">לקרוא למורה לאיפוס</p>
        </div>
        <button onClick={() => navigate('/')} className="bg-white text-red-600 font-bold py-4 px-8 rounded-xl hover:bg-gray-100 transition-colors">חזרה למסך הראשי</button>
      </div>
    </div>
  );

  if (robotState === 'disconnected') return (
    <div className="h-dvh bg-gradient-to-b from-gray-100 to-gray-200 flex flex-col items-center justify-center p-6">
      <div className="bg-white rounded-3xl p-8 max-w-sm text-center shadow-xl">
        <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6"><WifiOff size={48} className="text-orange-500" /></div>
        <h2 className="text-2xl font-bold text-foreground mb-2">הקשר עם הרובוט נותק</h2>
        <p className="text-muted-foreground mb-6">בואו ננסה להתחבר שוב</p>
        <button onClick={() => { setRobotState('idle'); setProgress(0); }} className="w-full flex items-center justify-center gap-3 bg-primary text-white font-bold py-4 px-8 rounded-xl hover:bg-primary-dark transition-colors">
          <RefreshCw size={24} /><span>נסה להתחבר שוב</span>
        </button>
        <button onClick={() => navigate('/camera')} className="w-full py-3 mt-3 text-muted-foreground hover:text-foreground transition-colors">חזרה למצלמה</button>
      </div>
    </div>
  );

  return (
    <div className="h-dvh bg-gradient-to-b from-gray-100 to-gray-200 flex flex-col">
      <div className="p-4 flex items-center justify-between">
        <button onClick={() => navigate('/analysis')} disabled={robotState === 'executing'} className="w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50">
          <ArrowRight size={24} className="text-gray-600" />
        </button>
        <StarCounter />
      </div>
      <div className="flex-1 flex flex-col p-6 gap-6">
        <div className="relative w-full max-w-sm mx-auto aspect-video bg-gray-800 rounded-2xl overflow-hidden shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
            <div className="text-center"><span className="text-6xl">🤖</span><p className="text-white/60 text-sm mt-2">תצוגת רובוט</p></div>
          </div>
          <div className="absolute top-3 right-3">
            <div className={`w-3 h-3 rounded-full ${robotState === 'executing' ? 'bg-green-500 animate-pulse' : robotState === 'complete' ? 'bg-green-500' : 'bg-yellow-500'}`} />
          </div>
          <div className="absolute bottom-3 left-3 right-3 py-2 px-4 rounded-xl flex items-center justify-center gap-2" style={{ backgroundColor: selectedBin.bgColor }}>
            <span className="text-2xl">{selectedBin.icon}</span>
            <span className="font-bold" style={{ color: selectedBin.color }}>יעד: {selectedBin.labelHe}</span>
          </div>
        </div>
        {robotState === 'executing' && (
          <div className="w-full max-w-sm mx-auto">
            <div className="h-4 bg-gray-300 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-green-400 transition-all duration-300 rounded-full" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-center text-sm text-muted-foreground mt-2">
              {progress < 30 ? 'תופס את הפריט...' : progress < 70 ? 'זז לפח...' : 'משחרר...'}
            </p>
          </div>
        )}
        {robotState !== 'executing' && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">סטטוס רובוט:</p>
            <p className="font-mono text-lg font-bold text-foreground">{robotStatus === 'idle' ? 'מוכן' : robotStatus}</p>
          </div>
        )}
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          {robotState === 'complete' ? (
            <div className="text-center"><div className="text-6xl mb-4 animate-bounce">🎉</div><p className="text-xl font-bold text-primary">מעולה! הפריט מוין!</p></div>
          ) : robotState === 'idle' || robotState === 'stopped' ? (
            <button onClick={handleLaunch} className="w-48 h-48 rounded-full flex flex-col items-center justify-center gap-2 shadow-2xl bg-gradient-to-b from-primary to-primary-dark hover:scale-105 active:scale-95 transition-all duration-300 border-2">
              <Play size={64} className="text-black" fill="black " />
              <span className="text-black font-bold text-lg">שגר!</span>
            </button>
          ) : robotState === 'executing' ? (
            <div className="w-48 h-48 rounded-full bg-gray-400 flex items-center justify-center"><Loader2 size={64} className="text-white animate-spin" /></div>
          ) : null}
          {robotState === 'idle' && (
            <div className="mt-4">
              <p className="text-center text-sm text-muted-foreground mb-2">שליטה ידנית</p>
              <VirtualJoystick disabled={false} />
            </div>
          )}
        </div>
      </div>
      <div className="p-4 pb-8"><EmergencyStop onStop={handleEmergencyStop} /></div>
    </div>
  );
}
