import { useState } from 'react';
import { useNavigate } from 'react-router';
import { User, BookOpen, Gamepad2, ArrowRight } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { useApp } from '@/context/AppContext';
import { PasswordModal } from '@/pages/PasswordEntry';
import { supabase } from '@/supabaseClient';

export default function Splash() {
  const navigate = useNavigate();
  const { resetSession, setUserLevel, setStudentId, setStudentName } = useApp();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [studentName, setStudentNameLocal] = useState('');

  const handleStudentClick = () => { setShowNameModal(true); };

  const handleNameModalClose = () => {
    setShowNameModal(false);
    setStudentNameLocal('');
  };

const handleNameSubmit = async () => {
  if (!studentName.trim()) return;
  const trimmedName = studentName.trim();
  const { data } = await supabase.from('students').insert({ name: trimmedName }).select().single();
  resetSession();
  setUserLevel('elementary');
  setStudentName(trimmedName);
  if (data) setStudentId(data.id);
  navigate('/onboarding');
};

  const handlePasswordSuccess = () => { setShowPasswordModal(false); setUserLevel('teacher'); navigate('/dashboard'); };

  return (
    <div className="h-dvh bg-gradient-to-b from-green-50 via-blue-50 to-white flex flex-col items-center justify-center p-6">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 text-6xl opacity-20 animate-bounce" style={{ animationDuration: '3s' }}>🌿</div>
        <div className="absolute top-20 right-10 text-5xl opacity-20 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>🌱</div>
        <div className="absolute bottom-20 left-20 text-5xl opacity-20 animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}>♻️</div>
        <div className="absolute bottom-10 right-20 text-6xl opacity-20 animate-bounce" style={{ animationDuration: '4.5s', animationDelay: '1.5s' }}>🌱</div>
      </div>
      <div className="relative z-10 flex flex-col items-center gap-12">
        <Logo size="lg" />
        <p className="text-xl text-muted-foreground text-center max-w-xs">
          בואו נלמד למיין אשפה ולשמור על כדור הארץ!
        </p>
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <button onClick={handleStudentClick} className="flex items-center justify-between bg-gradient-to-r from-green-300 to-green-500 text-white text-xl font-bold py-6 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center"><User size={36} /></div>
            <span className="ml-20">תלמיד</span>
          </button>
          <button onClick={() => navigate('/game')} className="flex items-center justify-between bg-gradient-to-r from-purple-300 to-pink-500 text-white text-xl font-bold py-6 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center"><Gamepad2 size={36} /></div>
            <span className="ml-10">משחק תרגול</span>
          </button>
          <button onClick={() => setShowPasswordModal(true)} className="flex items-center justify-between bg-gradient-to-r from-blue-300 to-blue-600 text-white text-xl font-bold py-6 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center"><BookOpen size={36} /></div>
            <span className="ml-20">מורה</span>
          </button>
        </div>
      </div>
      <div className="absolute bottom-6 text-sm text-muted-foreground">EcoSort v1.0 - למען עתיד ירוק יותר 🌍</div>
      <PasswordModal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} onSuccess={handlePasswordSuccess} />
      {showNameModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative">
            <button
              onClick={handleNameModalClose}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              aria-label="חזרה"
            >
              <ArrowRight size={20} className="text-gray-600" />
            </button>
            <div className="text-5xl mb-4">👤</div>
            <h2 className="text-2xl font-black text-foreground mb-6">מה השם שלך?</h2>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentNameLocal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
              placeholder="כתוב את שמך כאן"
              className="w-full text-center text-xl border-2 border-gray-200 rounded-xl py-4 px-6 mb-6 focus:outline-none focus:border-primary"
              autoFocus
            />
            <button
              onClick={handleNameSubmit}
              className="w-full bg-green-500 text-white text-xl font-bold py-4 rounded-2xl hover:bg-green-600 transition-colors">
              בואו נתחיל! 🌿
            </button>
          </div>
        </div>
      )}
    </div>
  );
}