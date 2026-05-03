import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { LogOut, Settings, Users, BarChart3, Sliders, RefreshCw, Check, AlertTriangle, Loader2, Gamepad2, Trophy, Star } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { useApp } from '@/context/AppContext';
import { WASTE_BINS } from '@/types';
import { supabase } from '@/supabaseClient';

type CalibrationStatus = 'idle' | 'calibrating' | 'success' | 'error';
type MotorError = { motor: number; message: string } | null;

interface Student { name: string; total_score: number; total_items: number; }
interface SortEvent { correct_bin: string; is_correct: boolean; }
interface GameScore { score: number; correct_catches: number; wrong_catches: number; misses: number; stars: number; played_at: string; }
interface DashboardStats { totalStudents: number; totalItemsSorted: number; accuracy: number; }
interface GameStats { totalGames: number; avgScore: number; avgStars: number; topScore: number; }

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { setUserLevel, resetSession } = useApp();
  const [activeTab, setActiveTab] = useState<'stats' | 'game' | 'settings'>('stats');
  const [robotCalibration, setRobotCalibration] = useState({ speed: 50, precision: 75, gripForce: 60 });
  const [calibrationStatus, setCalibrationStatus] = useState<CalibrationStatus>('idle');
  const [motorError, setMotorError] = useState<MotorError>(null);
  const [sessionResetConfirm, setSessionResetConfirm] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({ totalStudents: 0, totalItemsSorted: 0, accuracy: 0 });
  const [leaderboard, setLeaderboard] = useState<Student[]>([]);
  const [binStats, setBinStats] = useState<Record<string, number>>({});
  const [gameStats, setGameStats] = useState<GameStats>({ totalGames: 0, avgScore: 0, avgStars: 0, topScore: 0 });
  const [gameScores, setGameScores] = useState<GameScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: students } = await supabase.from('students').select('name, total_score, total_items');
    const { data: sortEvents } = await supabase.from('sort_events').select('correct_bin, is_correct');
    const { data: scores } = await supabase.from('game_scores').select('*').order('played_at', { ascending: false });

    if (students) {
      const sorted = [...students].sort((a, b) => b.total_score - a.total_score);
      setLeaderboard(sorted.slice(0, 5));
      setStats(prev => ({ ...prev, totalStudents: students.length }));
    }

    if (sortEvents) {
      const total = sortEvents.length;
      const correct = sortEvents.filter((e: SortEvent) => e.is_correct).length;
      const accuracy = total > 0 ? Math.round(correct / total * 100) : 0;
      const binCounts: Record<string, number> = {};
      sortEvents.forEach((e: SortEvent) => { binCounts[e.correct_bin] = (binCounts[e.correct_bin] || 0) + 1; });
      setStats(prev => ({ ...prev, totalItemsSorted: total, accuracy }));
      setBinStats(binCounts);
    }

    if (scores && scores.length > 0) {
      setGameScores(scores);
      const avgScore = Math.round(scores.reduce((a: number, b: GameScore) => a + b.score, 0) / scores.length);
      const avgStars = Math.round(scores.reduce((a: number, b: GameScore) => a + b.stars, 0) / scores.length * 10) / 10;
      const topScore = Math.max(...scores.map((s: GameScore) => s.score));
      setGameStats({ totalGames: scores.length, avgScore, avgStars, topScore });
    }

    setLoading(false);
  };

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

  const totalBinEvents = Object.values(binStats).reduce((a, b) => a + b, 0);

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
        <div className="flex gap-2 mb-6 flex-wrap">
          <button onClick={() => setActiveTab('stats')} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${activeTab === 'stats' ? 'bg-primary text-black' : 'bg-white text-muted-foreground hover:bg-gray-100'}`}>
            <BarChart3 size={20} /><span>מיון</span>
          </button>
          <button onClick={() => setActiveTab('game')} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${activeTab === 'game' ? 'bg-primary text-black' : 'bg-white text-muted-foreground hover:bg-gray-100'}`}>
            <Gamepad2 size={20} /><span>משחק</span>
          </button>
        </div>

        {activeTab === 'stats' && (
          <div className="flex flex-col gap-6">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={40} className="animate-spin text-primary" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2"><Users size={20} /><span className="text-sm">תלמידים</span></div>
                    <p className="text-3xl font-bold">{stats.totalStudents}</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2"><RefreshCw size={20} /><span className="text-sm">פריטים מוינו</span></div>
                    <p className="text-3xl font-bold text-primary">{stats.totalItemsSorted}</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2"><Check size={20} /><span className="text-sm">דיוק מיון</span></div>
                    <p className="text-3xl font-bold text-green-600">{stats.accuracy}%</p>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="font-bold text-foreground mb-4">התפלגות לפי קטגוריה</h3>
                  <div className="flex flex-col gap-3">
                    {WASTE_BINS.map((bin) => {
                      const count = binStats[bin.category] || 0;
                      const percentage = totalBinEvents > 0 ? Math.round(count / totalBinEvents * 100) : 0;
                      return (
                        <div key={bin.category} className="flex items-center gap-3">
                          <span className="text-2xl w-8">{bin.icon}</span>
                          <span className="w-20 text-sm font-medium" style={{ color: bin.color }}>{bin.labelHe}</span>
                          <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%`, backgroundColor: bin.color }} />
                          </div>
                          <span className="text-sm font-bold text-muted-foreground w-12">{percentage}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="font-bold text-foreground mb-4">🏆 לוח מובילים</h3>
                  {leaderboard.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">אין נתונים עדיין</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {leaderboard.map((student, index) => (
                        <div key={student.name} className={`flex items-center gap-4 p-3 rounded-lg ${index === 0 ? 'bg-yellow-50' : index === 1 ? 'bg-gray-50' : index === 2 ? 'bg-orange-50' : 'bg-white'}`}>
                          <span className="text-2xl w-8 text-center">{index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}</span>
                          <span className="flex-1 font-medium">{student.name}</span>
                          <span className="text-sm text-muted-foreground">{student.total_items} פריטים</span>
                          <span className="font-bold text-primary">{student.total_score} נקודות</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'game' && (
          <div className="flex flex-col gap-6">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={40} className="animate-spin text-primary" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2"><Gamepad2 size={20} /><span className="text-sm">משחקים</span></div>
                    <p className="text-3xl font-bold">{gameStats.totalGames}</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2"><BarChart3 size={20} /><span className="text-sm">ממוצע ניקוד</span></div>
                    <p className="text-3xl font-bold text-primary">{gameStats.avgScore}</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2"><Star size={20} /><span className="text-sm">ממוצע כוכבים</span></div>
                    <p className="text-3xl font-bold text-yellow-500">{gameStats.avgStars}⭐</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2"><Trophy size={20} /><span className="text-sm">שיא</span></div>
                    <p className="text-3xl font-bold text-green-600">{gameStats.topScore}</p>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="font-bold text-foreground mb-4">תוצאות אחרונות</h3>
                  {gameScores.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">אין נתונים עדיין</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {gameScores.slice(0, 10).map((game, index) => (
                        <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                          <span className="text-lg">{[...Array(game.stars)].map((_, i) => <span key={i}>⭐</span>)}{[...Array(3 - game.stars)].map((_, i) => <span key={i}>☆</span>)}</span>
                          <span className="flex-1 font-bold text-primary">{game.score} נקודות</span>
                          <span className="text-sm text-green-600">{game.correct_catches} ✓</span>
                          <span className="text-sm text-red-500">{game.wrong_catches} ✗</span>
                          <span className="text-sm text-muted-foreground">{new Date(game.played_at).toLocaleDateString('he-IL')}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
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