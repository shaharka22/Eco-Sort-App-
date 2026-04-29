import { useState } from 'react';
import { useNavigate } from 'react-router';
import { LogOut, Settings, Users, BarChart3, Sliders, RefreshCw, Check, AlertTriangle, Loader2 } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { useApp } from '@/context/AppContext';
import { WASTE_BINS } from '@/types';

const MOCK_CLASS_STATS = { totalStudents: 24, activeToday: 18, totalItemsSorted: 156, accuracy: 78 };
const MOCK_LEADERBOARD = [
  { name: 'נועם כ.', score: 120, items: 12 },
  { name: 'מיה ל.', score: 95, items: 10 },
  { name: 'איתי ש.', score: 85, items: 9 },
  { name: 'דניאל ג.', score: 70, items: 7 },
  { name: 'עדי ב.', score: 65, items: 7 },
];

type CalibrationStatus = 'idle' | 'calibrating' | 'success' | 'error';
type MotorError = { motor: number; message: string } | null;

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { setUserLevel, resetSession } = useApp();
  const [activeTab, setActiveTab] = useState<'stats' | 'settings'>('stats');
  const [robotCalibration, setRobotCalibration] = useState({ speed: 50, precision: 75, gripForce: 60 });
  const [calibrationStatus, setCalibrationStatus] = useState<CalibrationStatus>('idle');
  const [motorError, setMotorError] = useState<MotorError>(null);
  const [sessionResetConfirm, setSessionResetConfirm] = useState(false);

  const handleLogout = () => { setUserLevel(null); navigate('/'); };

  const handleSaveCalibration = async () => {
    setCalibrationStatus('calibrating'); setMotorError(null);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    if (Math.random() < 0.85) {
      setCalibrationStatus('success');
      setTimeout(() => setCalibrationStatus('idle'), 3000);
    } else {
      const motorNum = Math.floor(Math.random() * 4) + 1;
      setMotorError({ motor: motorNum, message: `מנוע ${motorNum} לא מגיב, בדקו חיבורי חשמל פיזיים` });
      setCalibrationStatus('error');
    }
  };

  const handleSessionReset = () => {
    if (!sessionResetConfirm) { setSessionResetConfirm(true); return; }
    resetSession(); setSessionResetConfirm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Logo size="sm" />
          <h1 className="text-xl font-bold text-foreground">לוח בקרה - מורה</h1>
          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-foreground transition-colors">
            <LogOut size={20} /><span>יציאה</span>
          </button>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 mt-6">
        <div className="flex gap-2 mb-6">
          <button onClick={() => setActiveTab('stats')} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${activeTab === 'stats' ? 'bg-primary text-white' : 'bg-white text-muted-foreground hover:bg-gray-100'}`}>
            <BarChart3 size={20} /><span>סטטיסטיקות</span>
          </button>
          <button onClick={() => setActiveTab('settings')} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${activeTab === 'settings' ? 'bg-primary text-white' : 'bg-white text-muted-foreground hover:bg-gray-100'}`}>
            <Settings size={20} /><span>הגדרות</span>
          </button>
        </div>

        {activeTab === 'stats' && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 text-muted-foreground mb-2"><Users size={20} /><span className="text-sm">תלמידים פעילים</span></div>
                <p className="text-3xl font-bold">{MOCK_CLASS_STATS.activeToday}<span className="text-lg text-muted-foreground">/{MOCK_CLASS_STATS.totalStudents}</span></p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 text-muted-foreground mb-2"><RefreshCw size={20} /><span className="text-sm">פריטים מוינו</span></div>
                <p className="text-3xl font-bold text-primary">{MOCK_CLASS_STATS.totalItemsSorted}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 text-muted-foreground mb-2"><Check size={20} /><span className="text-sm">דיוק מיון</span></div>
                <p className="text-3xl font-bold text-green-600">{MOCK_CLASS_STATS.accuracy}%</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 text-muted-foreground mb-2"><BarChart3 size={20} /><span className="text-sm">מגמה השבוע</span></div>
                <p className="text-3xl font-bold text-secondary">↑ 15%</p>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-foreground mb-4">התפלגות לפי קטגוריה</h3>
              <div className="flex flex-col gap-3">
                {WASTE_BINS.map((bin) => {
                  const percentage = Math.floor(Math.random() * 30) + 15;
                  return (
                    <div key={bin.category} className="flex items-center gap-3">
                      <span className="text-2xl w-8">{bin.icon}</span>
                      <span className="w-20 text-sm font-medium" style={{ color: bin.color }}>{bin.labelHe}</span>
                      <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${percentage}%`, backgroundColor: bin.color }} />
                      </div>
                      <span className="text-sm font-bold text-muted-foreground w-12">{percentage}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-foreground mb-4">🏆 לוח מובילים</h3>
              <div className="flex flex-col gap-2">
                {MOCK_LEADERBOARD.map((student, index) => (
                  <div key={student.name} className={`flex items-center gap-4 p-3 rounded-lg ${index === 0 ? 'bg-yellow-50' : index === 1 ? 'bg-gray-50' : index === 2 ? 'bg-orange-50' : 'bg-white'}`}>
                    <span className="text-2xl w-8 text-center">{index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}</span>
                    <span className="flex-1 font-medium">{student.name}</span>
                    <span className="text-sm text-muted-foreground">{student.items} פריטים</span>
                    <span className="font-bold text-primary">{student.score} נקודות</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6"><Sliders size={24} className="text-primary" /><h3 className="font-bold text-foreground">כיול רובוט</h3></div>
              {motorError && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={24} className="text-red-500 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-red-700">שגיאה טכנית</h4>
                      <p className="text-red-600 mt-1">{motorError.message}</p>
                      <button onClick={() => { setMotorError(null); setCalibrationStatus('idle'); }} className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors">נסה שוב</button>
                    </div>
                  </div>
                </div>
              )}
              {calibrationStatus === 'success' && (
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center"><Check size={24} className="text-white" /></div>
                    <div><h4 className="font-bold text-green-700">כיול הושלם בהצלחה!</h4><p className="text-green-600 text-sm">הרובוט מוכן לפעולה</p></div>
                  </div>
                </div>
              )}
              <div className="flex flex-col gap-6">
                {[{ key: 'speed', label: 'מהירות תנועה', min: 'איטי', max: 'מהיר' }, { key: 'precision', label: 'דיוק מיקום', min: '', max: '' }, { key: 'gripForce', label: 'עוצמת אחיזה', min: 'עדין', max: 'חזק' }].map(({ key, label, min, max }) => (
                  <div key={key}>
                    <div className="flex justify-between mb-2">
                      <label className="font-medium text-foreground">{label}</label>
                      <span className="text-primary font-bold">{robotCalibration[key as keyof typeof robotCalibration]}%</span>
                    </div>
                    <input type="range" min="10" max="100" value={robotCalibration[key as keyof typeof robotCalibration]}
                      onChange={(e) => setRobotCalibration(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                      disabled={calibrationStatus === 'calibrating'}
                      className="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer accent-primary disabled:opacity-50" />
                    {(min || max) && <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>{min}</span><span>{max}</span></div>}
                  </div>
                ))}
              </div>
              <button onClick={handleSaveCalibration} disabled={calibrationStatus === 'calibrating' || calibrationStatus === 'success'}
                className={`mt-6 w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${calibrationStatus === 'success' ? 'bg-green-500 text-white' : calibrationStatus === 'calibrating' ? 'bg-gray-300 text-gray-500 cursor-wait' : 'bg-primary text-white hover:bg-primary-dark'}`}>
                {calibrationStatus === 'calibrating' ? <><Loader2 size={20} className="animate-spin" /><span>מכייל...</span></> : calibrationStatus === 'success' ? <><Check size={20} /><span>נשמר!</span></> : <span>שמור הגדרות</span>}
              </button>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-foreground mb-4">אפשרויות נוספות</h3>
              {sessionResetConfirm && (
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-4">
                  <p className="text-yellow-800 font-medium">⚠️ האם אתם בטוחים? פעולה זו תמחק את כל הנתונים של היום.</p>
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={handleSessionReset} className={`flex-1 py-3 rounded-xl font-bold transition-colors ${sessionResetConfirm ? 'bg-destructive text-white hover:bg-red-600' : 'border-2 border-destructive text-destructive hover:bg-red-50'}`}>
                  {sessionResetConfirm ? 'אפס סופית!' : 'אפס נתוני היום'}
                </button>
                {sessionResetConfirm && (
                  <button onClick={() => setSessionResetConfirm(false)} className="flex-1 py-3 rounded-xl border-2 border-gray-300 text-gray-600 font-bold hover:bg-gray-50 transition-colors">ביטול</button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="text-center py-8 text-sm text-muted-foreground">EcoSort גרסת מורה v1.0</div>
    </div>
  );
}
