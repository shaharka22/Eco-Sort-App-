import { useState } from 'react';
import { useNavigate } from 'react-router';
import { User, BookOpen, Gamepad2 } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { useApp } from '@/context/AppContext';
import { PasswordModal } from '@/pages/PasswordEntry';

export default function Splash() {
  const navigate = useNavigate();
  const { resetSession, setUserLevel } = useApp();
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const handleStudentClick = () => { resetSession(); setUserLevel('elementary'); navigate('/onboarding'); };
  const handlePasswordSuccess = () => { setShowPasswordModal(false); setUserLevel('teacher'); navigate('/dashboard'); };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-blue-50 to-white flex flex-col items-center justify-center p-6">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 text-6xl opacity-20 animate-bounce" style={{ animationDuration: '3s' }}>🌿</div>
        <div className="absolute top-20 right-10 text-5xl opacity-20 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>🌍</div>
        <div className="absolute bottom-20 left-20 text-5xl opacity-20 animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}>♻️</div>
        <div className="absolute bottom-10 right-20 text-6xl opacity-20 animate-bounce" style={{ animationDuration: '4.5s', animationDelay: '1.5s' }}>🌱</div>
      </div>
      <div className="relative z-10 flex flex-col items-center gap-12">
        <Logo size="lg" />
        <p className="text-xl text-muted-foreground text-center max-w-xs">
          בואו נלמד למיין אשפה ולשמור על כדור הארץ!
        </p>
        <div className="flex flex-col gap-4 w-full max-w-xs ">
<button onClick={handleStudentClick} className="flex items-center justify-between bg-gradient-to-r from-green-300 to-green-500 text-white text-xl font-bold py-6 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95">
  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center"><User size={36} /></div>
  <span className="ml-20">תלמיד</span>
</button>

<button onClick={() => navigate('/game')} className="flex items-center justify-between bg-gradient-to-r from-purple-300 to-pink-500 text-white text-xl font-bold py-6 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95">
  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center"><Gamepad2 size={36} /></div>
  <span className="ml-10">למשחק תרגול</span>
</button>

<button onClick={() => setShowPasswordModal(true)} className="flex items-center justify-between bg-gradient-to-r from-blue-300 to-blue-600 text-white text-xl font-bold py-6 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95">
  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center"><BookOpen size={36} /></div>
  <span className="ml-20">מורה</span>
</button>
        </div>
      </div>
      <div className="absolute bottom-6 text-sm text-muted-foreground">EcoSort v1.0 - למען עתיד ירוק יותר 🌍</div>
      <PasswordModal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} onSuccess={handlePasswordSuccess} />
    </div>
  );
}
