import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Home, RotateCcw, LogOut, AlertTriangle, Trash2 } from 'lucide-react';
import { GrowingTree } from '@/components/GrowingTree';
import { useApp } from '@/context/AppContext';
import { WASTE_BINS, MOTIVATION_MESSAGES } from '@/types';

export default function Impact() {
  const navigate = useNavigate();
  const { score, sessionStats, sortingSession, validateFullSuccess, recordSuccessfulSort, resetSortingSession } = useApp();
  const [showConfetti, setShowConfetti] = useState(false);
  const [isFullSuccess, setIsFullSuccess] = useState(false);
  const hasRecorded = useRef(false);

  useEffect(() => {
    if (hasRecorded.current) return;
    const success = validateFullSuccess();
    setIsFullSuccess(success);
    if (success) {
      hasRecorded.current = true;
      recordSuccessfulSort();
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSortAnother = () => { resetSortingSession(); navigate('/camera'); };
  const handleFinish = () => navigate('/summary');
  const handleRetry = () => { resetSortingSession(); navigate('/camera'); };

  const sortedCategory = sortingSession.identifiedCategory;
  const sortedBin = sortedCategory ? WASTE_BINS.find((b) => b.category === sortedCategory) : null;
  const motivationMessage = sortedCategory ? MOTIVATION_MESSAGES[sortedCategory] : '';

  if (!isFullSuccess && !hasRecorded.current) {
    const success = validateFullSuccess();
    if (!success) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-yellow-100 to-orange-100 flex flex-col items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-8 max-w-sm text-center shadow-xl">
            <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={48} className="text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">אירעה שגיאה בתהליך</h2>
            <p className="text-muted-foreground mb-6">משהו השתבש בדרך. בואו ננסה שוב!</p>
            <button onClick={handleRetry} className="w-full flex items-center justify-center gap-3 bg-primary text-white font-bold py-4 px-8 rounded-xl hover:bg-primary-dark transition-colors">
              <RotateCcw size={24} /><span>נסה שוב</span>
            </button>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 via-emerald-50 to-white flex flex-col">
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="absolute animate-bounce"
              style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 50}%`, animationDelay: `${Math.random() * 2}s`, animationDuration: `${2 + Math.random() * 2}s`, fontSize: `${16 + Math.random() * 16}px`, opacity: 0.6 }}>
              {['⭐', '🌟', '✨', '🎉', '🌱', '♻️', '🌍'][i % 7]}
            </div>
          ))}
        </div>
      )}
      <div className="p-4 flex items-center justify-between">
        <button onClick={() => navigate('/')} className="w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors">
          <Home size={24} className="text-gray-600" />
        </button>
        <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-md flex items-center gap-2">
          <span className="text-lg font-bold text-primary">{score}</span>
          <span className="text-sm text-muted-foreground">נקודות</span>
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6 relative z-20">
        <div className="text-center mb-4">
          <div className="text-6xl mb-4 animate-bounce">🎉</div>
          <h1 className="text-4xl font-black text-primary mb-2">כל הכבוד!</h1>
        </div>
        <GrowingTree score={score} animated />
        {sortedBin && (
          <div className="w-full max-w-sm p-6 rounded-2xl text-center shadow-lg" style={{ backgroundColor: sortedBin.bgColor }}>
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ backgroundColor: sortedBin.color }}>
                <Trash2 size={28} className="text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">מיינת בהצלחה:</p>
                <p className="text-2xl font-bold" style={{ color: sortedBin.color }}>{sortedBin.icon} {sortedBin.labelHe}</p>
              </div>
            </div>
            <div className="bg-white/60 rounded-xl p-4">
              <p className="text-foreground font-medium leading-relaxed">💚 {motivationMessage}</p>
            </div>
          </div>
        )}
        <div className="w-full max-w-sm bg-white rounded-xl p-4 shadow-md">
          <h3 className="font-bold text-foreground mb-3 text-center">הסטטיסטיקה שלי</h3>
          <div className="bg-gray-50 rounded-lg p-4 text-center mb-4">
            <p className="text-4xl font-bold text-primary">{sessionStats.totalItems}</p>
            <p className="text-sm text-muted-foreground">פריטים מוינו</p>
          </div>
          <div className="flex justify-center gap-4">
            {WASTE_BINS.map((bin) => {
              const count = sessionStats[`${bin.category}Count` as keyof typeof sessionStats] as number;
              return (
                <div key={bin.category} className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-1" style={{ backgroundColor: bin.bgColor }}>
                    <span className="text-lg">{bin.icon}</span>
                  </div>
                  <span className="text-sm font-bold" style={{ color: bin.color }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex flex-col gap-3 w-full max-w-sm mt-4">
          <button onClick={handleSortAnother} className="flex items-center justify-center gap-3 bg-gradient-to-r from-primary to-primary-dark text-white text-xl font-bold py-5 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95">
            <RotateCcw size={28} /><span>מיין עוד פריט</span>
          </button>
          <button onClick={handleFinish} className="flex items-center justify-center gap-3 bg-white border-2 border-gray-200 text-foreground text-lg font-medium py-4 px-8 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 hover:border-primary">
            <LogOut size={24} /><span>סיימתי למיין</span>
          </button>
        </div>
      </div>
    </div>
  );
}
