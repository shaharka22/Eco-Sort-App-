import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Play, ArrowRight, Loader2, WifiOff, RefreshCw, AlertTriangle } from 'lucide-react';
import { EmergencyStop } from '@/components/EmergencyStop';
import { StarCounter } from '@/components/StarCounter';
import { useApp } from '@/context/AppContext';
import { robotAPI } from '@/utils/MockRobotAPI';
import { WASTE_BINS, type WasteCategory } from '@/types';

type RobotState = 'idle' | 'executing' | 'complete' | 'stopped' | 'disconnected' | 'emergency' | 'error';

// וידאו מנקודת מבט הרובוט לכל קטגוריית פסולת - מציג את הרובוט תופס את הפריט ושם אותו בפח המתאים
const ROBOT_POV_VIDEOS: Record<WasteCategory, string> = {
  plastic: '/pov_orange.mp4',
  paper: '/pov_blue.mp4',
  glass: '/pov_purple.mp4',
  organic: '/pov_brown.mp4',
};

export default function RobotControl() {
  const navigate = useNavigate();
  const { currentImage, sortingSession, startRobotAction, completeRobotAction } = useApp();
  const [robotStatus, setRobotStatus] = useState<string>('idle');
  const [robotState, setRobotState] = useState<RobotState>('idle');
  const [progress, setProgress] = useState(0);
  const progressInterval = useRef<number | null>(null);

  const targetBin = sortingSession.selectedBinCategory;
  const selectedBin = targetBin ? WASTE_BINS.find((b) => b.category === targetBin) : null;
  const povVideo = targetBin ? ROBOT_POV_VIDEOS[targetBin] : null;

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
    <div className="h-dvh bg-gradient-to-b from-gray-100 to-gray-200 flex flex-col overflow-hidden">
      <div className="p-3 flex items-center justify-between shrink-0">
        <button onClick={() => navigate('/analysis')} disabled={robotState === 'executing'} className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50">
          <ArrowRight size={20} className="text-gray-600" />
        </button>
        <StarCounter />
      </div>
      <div className="flex-1 flex flex-col p-4 gap-3 min-h-0">
        <div className="relative w-full max-w-sm mx-auto aspect-video bg-gray-800 rounded-2xl overflow-hidden shadow-lg shrink-0">
          {povVideo ? (
            <video
              key={povVideo}
              className="absolute inset-0 w-full h-full object-cover"
              src={povVideo}
              autoPlay
              loop
              muted
              playsInline
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
              <div className="text-center"><span className="text-6xl">🤖</span><p className="text-white/60 text-sm mt-2">תצוגת רובוט</p></div>
            </div>
          )}
          <div className="absolute top-3 right-3">
            <div className={`w-3 h-3 rounded-full ${robotState === 'executing' ? 'bg-green-500 animate-pulse' : robotState === 'complete' ? 'bg-green-500' : 'bg-yellow-500'}`} />
          </div>
        </div>
        {robotState === 'executing' && (
          <div className="w-full max-w-sm mx-auto shrink-0">
            <div className="h-3 bg-gray-300 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-green-400 transition-all duration-300 rounded-full" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-center text-sm text-muted-foreground mt-1">
              {progress < 30 ? 'תופס את הפריט...' : progress < 70 ? 'זז לפח...' : 'משחרר...'}
            </p>
          </div>
        )}
        {robotState !== 'executing' && (
          <div className="text-center shrink-0">
            <p className="text-sm text-muted-foreground">סטטוס רובוט:</p>
            <p className="font-mono text-base font-bold text-foreground">{robotStatus === 'idle' ? 'מוכן' : robotStatus}</p>
          </div>
        )}
        <div className="flex-1 flex flex-col items-center justify-center gap-3 min-h-0">
          {robotState === 'complete' ? (
            <div className="text-center"><div className="text-5xl mb-2 animate-bounce">🎉</div><p className="text-lg font-bold text-primary">מעולה! הפריט מוין!</p></div>
          ) : robotState === 'idle' || robotState === 'stopped' ? (
            <button onClick={handleLaunch} className="w-32 h-32 rounded-full flex flex-col items-center justify-center gap-1 shadow-2xl bg-gradient-to-b from-primary to-primary-dark hover:scale-105 active:scale-95 transition-all duration-300 border-2">
              <Play size={48} className="text-black" fill="black " />
              <span className="text-black font-bold text-base">שגר!</span>
            </button>
          ) : robotState === 'executing' ? (
            <div className="w-32 h-32 rounded-full bg-gray-400 flex items-center justify-center"><Loader2 size={48} className="text-white animate-spin" /></div>
          ) : null}
        </div>
        <div className="max-w-sm mx-auto w-full shrink-0"><EmergencyStop onStop={handleEmergencyStop} /></div>
      </div>
    </div>
  );
}