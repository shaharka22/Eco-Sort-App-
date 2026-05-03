import { useNavigate } from 'react-router';
import { Home, RotateCcw, Trophy, TreeDeciduous, Trash2 } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { useApp } from '@/context/AppContext';
import { WASTE_BINS } from '@/types';

export default function Summary() {
  const navigate = useNavigate();
  const { score, sessionStats, resetSession } = useApp();
  const handleNewSession = () => { resetSession(); navigate('/'); };
  const handleContinue = () => navigate('/camera');

  return (
    <div className="h-dvh bg-gradient-to-b from-blue-50 via-green-50 to-white flex flex-col">
      <div className="p-6 text-center"><Logo size="sm" /></div>
      <div className="flex-1 flex flex-col items-center p-6 gap-6">
        <div className="text-center">
          <div className="text-6xl mb-4">🏆</div>
          <h1 className="text-3xl font-black text-foreground mb-2">סיכום המיון</h1>
          <p className="text-muted-foreground">כל הכבוד על העבודה!</p>
        </div>
        <div className="w-full max-w-sm bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-center gap-4">
            <Trophy size={48} className="text-yellow-600" />
            <div className="text-center">
              <p className="text-sm text-yellow-700">הניקוד שלך</p>
              <p className="text-5xl font-black text-yellow-600">{score}</p>
              <p className="text-yellow-700">נקודות</p>
            </div>
          </div>
        </div>
        <div className="w-full max-w-sm bg-white rounded-xl p-6 shadow-md text-center">
          <Trash2 size={36} className="mx-auto text-primary mb-3" />
          <p className="text-4xl font-bold text-foreground">{sessionStats.totalItems}</p>
          <p className="text-muted-foreground">פריטים מוינו</p>
        </div>
        <div className="w-full max-w-sm bg-white rounded-xl p-5 shadow-md">
          <h3 className="font-bold text-foreground mb-4 text-center">פירוט לפי סוגים</h3>
          <div className="flex flex-col gap-3">
            {WASTE_BINS.map((bin) => {
              const count = sessionStats[`${bin.category}Count` as keyof typeof sessionStats] as number;
              const percentage = sessionStats.totalItems > 0 ? Math.round(count / sessionStats.totalItems * 100) : 0;
              return (
                <div key={bin.category} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: bin.color }}>
                    <Trash2 size={24} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-foreground">{bin.labelHe}</span>
                      <span className="font-bold" style={{ color: bin.color }}>{count}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%`, backgroundColor: bin.color }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="w-full max-w-sm bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl p-5 shadow-md">
          <div className="flex items-center gap-3 mb-3">
            <TreeDeciduous size={32} className="text-green-600" />
            <h3 className="font-bold text-green-800">ההשפעה שלך על הסביבה</h3>
          </div>
          <p className="text-green-700 leading-relaxed">🌍 המיון שלך עזר לשמור על כדור הארץ! כל פריט שממוינים נכון מפחית זיהום ועוזר ליצור מוצרים חדשים.</p>
        </div>
        <div className="flex flex-col gap-3 w-full max-w-sm mt-4">
          <button onClick={handleContinue} className="flex items-center justify-center gap-3 bg-gradient-to-r from-primary to-primary-dark text-white text-xl font-bold py-5 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95">
            <RotateCcw size={28} /><span>המשך למיין</span>
          </button>
          <button onClick={handleNewSession} className="flex items-center justify-center gap-3 bg-white border-2 border-gray-200 text-foreground text-lg font-medium py-4 px-8 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 hover:border-primary">
            <Home size={24} /><span>סיום והתחלה מחדש</span>
          </button>
        </div>
      </div>
    </div>
  );
}
