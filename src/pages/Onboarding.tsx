import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Play, SkipForward, ChevronLeft, ChevronRight, Recycle } from 'lucide-react';

const slides = [
  { emoji: '🤖', titleHe: 'הכירו את הרובוט!', descHe: 'הרובוט שלנו עוזר למיין אשפה לפחים הנכונים' },
  { emoji: '📸', titleHe: 'צלמו פריט', descHe: 'צלמו את האשפה והאפליקציה תזהה לאן היא שייכת' },
  { emoji: '✅', titleHe: 'אשרו את המיון', descHe: 'בדקו שהאפליקציה צדקה ולחצו על הפח הנכון' },
  { emoji: '🌍', titleHe: 'שמרו על העולם!', descHe: 'כל מיון נכון עוזר לשמור על כדור הארץ' },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleSkip = () => navigate('/camera');
  const handleNext = () => {
    if (currentSlide < slides.length - 1) setCurrentSlide((prev) => prev + 1);
    else navigate('/camera');
  };
  const handlePrev = () => { if (currentSlide > 0) setCurrentSlide((prev) => prev - 1); };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 flex flex-col">
      <div className="p-4 flex justify-end">
        <button onClick={handleSkip} className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur rounded-full shadow-md hover:bg-white transition-colors">
          <span className="text-muted-foreground">דלג</span>
          <SkipForward size={20} className="text-muted-foreground" />
        </button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl mb-8 flex items-center justify-center shadow-lg overflow-hidden relative">
          {isPlaying ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="text-8xl animate-bounce" style={{ animationDuration: '2s' }}>{slides[currentSlide].emoji}</div>
                <Recycle size={40} className="absolute -bottom-2 -right-2 text-primary animate-spin" style={{ animationDuration: '3s' }} />
              </div>
            </div>
          ) : (
            <button onClick={() => setIsPlaying(true)} className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform">
              <Play size={40} className="text-primary ml-1" fill="currentColor" />
            </button>
          )}
        </div>
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">{slides[currentSlide].emoji}</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">{slides[currentSlide].titleHe}</h2>
          <p className="text-muted-foreground max-w-xs">{slides[currentSlide].descHe}</p>
        </div>
        <div className="flex gap-2 mb-8">
          {slides.map((_, index) => (
            <button key={index} onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${index === currentSlide ? 'bg-primary w-8' : 'bg-gray-300 hover:bg-gray-400'}`} />
          ))}
        </div>
        <div className="flex gap-4">
          {currentSlide > 0 && (
            <button onClick={handlePrev} className="w-14 h-14 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors">
              <ChevronRight size={28} className="text-gray-600" />
            </button>
          )}
          <button onClick={handleNext} className="px-8 py-4 bg-primary text-white rounded-full shadow-lg font-bold text-lg hover:bg-primary-dark transition-colors flex items-center gap-2">
            {currentSlide < slides.length - 1 ? (
              <><span>הבא</span><ChevronLeft size={24} /></>
            ) : (
              <><span>בואו נתחיל!</span><span className="text-2xl">🚀</span></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
