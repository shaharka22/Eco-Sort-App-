import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowRight, Lock, Eye, EyeOff, AlertCircle, X } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { useApp } from '@/context/AppContext';

const TEACHER_PASSWORD = '1234';

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function PasswordModal({ isOpen, onClose, onSuccess }: PasswordModalProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (isOpen) { setPassword(''); setError(false); setAttempts(0); }
  }, [isOpen]);
  useEffect(() => {
  if (!isOpen) return;
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key >= '0' && e.key <= '9') handleDigitClick(e.key);
    else if (e.key === 'Backspace') handleDelete();
    else if (e.key === 'Enter' && password.length === 4) handleSubmit(e as unknown as React.FormEvent);
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [isOpen, password]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === TEACHER_PASSWORD) { onSuccess(); }
    else {
      setError(true); setIsShaking(true); setAttempts((prev) => prev + 1);
      setTimeout(() => setIsShaking(false), 600); setPassword('');
    }
  };

  const handleDigitClick = (digit: string) => {
    if (password.length < 4) { setPassword((prev) => prev + digit); setError(false); }
  };

  const handleDelete = () => { setPassword((prev) => prev.slice(0, -1)); setError(false); };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl ${isShaking ? 'animate-shake' : ''}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Lock size={24} className="text-secondary" />
            <h2 className="text-xl font-bold text-foreground">אזור מורה</h2>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
            <X size={20} className="text-gray-600" />
          </button>
        </div>
        <div className="flex gap-3 justify-center mb-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={`w-14 h-14 rounded-xl border-4 flex items-center justify-center transition-all duration-200 ${password.length > i ? 'bg-secondary border-secondary' : error ? 'border-destructive bg-red-50' : 'border-gray-300 bg-white'}`}>
              {password.length > i && (showPassword ? <span className="text-2xl font-bold text-white">{password[i]}</span> : <div className="w-4 h-4 rounded-full bg-white" />)}
            </div>
          ))}
        </div>
        {error && <div className="flex items-center justify-center gap-2 text-destructive mb-4 animate-pulse"><AlertCircle size={20} /><span className="font-medium">סיסמה שגויה, נסו שוב</span></div>}
        {attempts >= 3 && <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4 text-center"><span className="text-yellow-700 text-sm">💡 רמז: הקוד לאב-טיפוס הוא 1234</span></div>}
        <button onClick={() => setShowPassword(!showPassword)} className="flex items-center justify-center gap-2 text-muted-foreground mb-4 w-full hover:text-foreground transition-colors">
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          <span className="text-sm">{showPassword ? 'הסתר' : 'הצג'}</span>
        </button>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {['1','2','3','4','5','6','7','8','9'].map((digit) => (
              <button key={digit} type="button" onClick={() => handleDigitClick(digit)}
                className="h-14 rounded-xl bg-gray-50 border-2 border-gray-200 text-2xl font-bold text-foreground hover:bg-gray-100 active:bg-gray-200 transition-colors">
                {digit}
              </button>
            ))}
            <button type="button" onClick={handleDelete} className="h-14 rounded-xl bg-gray-100 border-2 border-gray-200 text-base font-medium text-gray-600 hover:bg-gray-200 transition-colors">מחק</button>
            <button type="button" onClick={() => handleDigitClick('0')} className="h-14 rounded-xl bg-gray-50 border-2 border-gray-200 text-2xl font-bold text-foreground hover:bg-gray-100 transition-colors">0</button>
            <button type="submit" disabled={password.length !== 4} className="h-14 rounded-xl bg-secondary text-white text-base font-bold bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors">אישור</button>
          </div>
        </form>
      </div>
      <style>{`@keyframes shake { 0%, 100% { transform: translateX(0); } 10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); } 20%, 40%, 60%, 80% { transform: translateX(8px); } } .animate-shake { animation: shake 0.6s ease-in-out; }`}</style>
    </div>
  );
}

export default function PasswordEntry() {
  const navigate = useNavigate();
  const { setUserLevel } = useApp();
  const handleSuccess = () => { setUserLevel('teacher'); navigate('/dashboard'); };
  return (
    <div className="h-dvh bg-gradient-to-b from-blue-50 to-white flex flex-col items-center p-6">
      <button onClick={() => navigate('/')} className="absolute top-6 right-6 w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors">
        <ArrowRight size={24} className="text-gray-600" />
      </button>
      <div className="mt-12 mb-8"><Logo size="sm" /></div>
      <PasswordModal isOpen={true} onClose={() => navigate('/')} onSuccess={handleSuccess} />
    </div>
  );
}
