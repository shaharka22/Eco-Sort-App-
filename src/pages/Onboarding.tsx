import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Play, SkipForward, ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  { emoji: '🤖', titleHe: 'הכירו את הרובוט!', descHe: 'הרובוט שלנו עוזר למיין אשפה לפחים הנכונים', video: '/1rd onboarding video.mp4' },
  { emoji: '📸', titleHe: 'צלמו פריט', descHe: 'צלמו את האשפה והאפליקציה תזהה לאן היא שייכת', video: '/2rd onboarding video.mp4' },
  { emoji: '✅', titleHe: 'אשרו את המיון', descHe: 'בדקו שהאפליקציה צדקה ולחצו על הפח הנכון', video: '/3rd onboarding video.mp4' },
  { emoji: '🌍', titleHe: 'שמרו על העולם!', descHe: 'כל מיון נכון עוזר לשמור על כדור הארץ', video: '/4rd onboarding video.mp4' },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [started, setStarted] = useState(false); // האם המשתמש כבר לחץ "התחל" ועבר את מסך הפתיחה
  const [currentSlide, setCurrentSlide] = useState(0);
  const videoRef = useRef(null);

  // כל פעם שעוברים סלייד (אחרי שהתחילו) - לטעון את הוידאו החדש ולנגן אותו אוטומטית עם קול
  useEffect(() => {
    if (!started) return;
    const videoEl = videoRef.current;
    if (!videoEl) return;

    videoEl.muted = false;
    videoEl.load();
    videoEl.play().catch(() => {}); // אם הדפדפן חוסם, פשוט נשאר על הפריים הראשון
  }, [currentSlide, started]);

  const handleStart = () => {
    setStarted(true);
  };

  const handleSkip = () => navigate('/camera');
  const handleNext = () => {
    if (currentSlide < slides.length - 1) setCurrentSlide((prev) => prev + 1);
    else navigate('/camera');
  };
  const handlePrev = () => { if (currentSlide > 0) setCurrentSlide((prev) => prev - 1); };

  return (
    <div className="h-dvh bg-gradient-to-b from-green-50 to-blue-50 flex flex-col">
      <div className="p-4 flex justify-end">
        <button onClick={handleSkip} className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur rounded-full shadow-md hover:bg-white transition-colors">
          <span className="text-muted-foreground">דלג</span>
          <SkipForward size={20} className="text-muted-foreground" />
        </button>
      </div>

      {!started ? (
        // מסך פתיחה - לא וידאו, רק כפתור התחל
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="text-7xl mb-6">🤖♻️</div>
          <h1 className="text-3xl font-bold text-foreground mb-3">ברוכים הבאים!</h1>
          <p className="text-muted-foreground max-w-xs mb-10">
            בואו נראה לכם איך האפליקציה עוזרת לכם למיין אשפה בקלות
          </p>
          <button
            onClick={handleStart}
            className="px-10 py-5 bg-primary text-black rounded-full shadow-lg font-bold text-xl hover:bg-green-600 transition-colors flex items-center gap-3"
          >
            <Play size={28} fill="currentColor" />
            <span>התחל</span>
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center p-6 min-h-0 overflow-hidden">
          <div className="w-full max-w-lg flex-1 min-h-0 flex items-center justify-center mb-4">
            <video
              ref={videoRef}
              className="max-w-full max-h-full w-auto h-auto rounded-3xl shadow-lg"
              playsInline
              autoPlay
            >
              <source src={slides[currentSlide].video} type="video/mp4" />
            </video>
          </div>
          <div className="text-center mb-4 shrink-0">
            <div className="text-4xl mb-2">{slides[currentSlide].emoji}</div>
            <h2 className="text-xl font-bold text-foreground mb-1">{slides[currentSlide].titleHe}</h2>
            <p className="text-muted-foreground text-sm max-w-xs">{slides[currentSlide].descHe}</p>
          </div>
          <div className="flex gap-2 mb-4 shrink-0">
            {slides.map((_, index) => (
              <button key={index} onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${index === currentSlide ? 'bg-primary w-8' : 'bg-gray-300 hover:bg-gray-400'}`} />
            ))}
          </div>
          <div className="flex gap-4 shrink-0">
            {currentSlide > 0 && (
              <button onClick={handlePrev} className="w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors">
                <ChevronRight size={24} className="text-gray-600" />
              </button>
            )}
            <button onClick={handleNext} className="px-6 py-3 bg-primary text-black rounded-full shadow-lg font-bold hover:bg-green-600 transition-colors flex items-center gap-2">
              {currentSlide < slides.length - 1 ? (
                <><span>הבא</span><ChevronLeft size={20} /></>
              ) : (
                <><span>בואו נתחיל!</span><span className="text-xl"></span></>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}