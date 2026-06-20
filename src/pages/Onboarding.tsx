import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Play, SkipForward, ChevronLeft, ChevronRight, Home } from 'lucide-react';

const slides = [
  { titleHe: 'הכירו את הרובוט!', descHe: 'הרובוט שלנו עוזר למיין אשפה לפחים הנכונים', video: '/1rd onboarding video.mp4' },
  { titleHe: 'צלמו פריט', descHe: 'צלמו את האשפה והאפליקציה תזהה לאן היא שייכת', video: '/2rd onboarding video.mp4' },
  { titleHe: 'אשרו את המיון', descHe: 'בדקו שהאפליקציה צדקה ולחצו על הפח הנכון', video: '/3rd onboarding video.mp4' },
  { titleHe: 'שמרו על העולם!', descHe: 'כל מיון נכון עוזר לשמור על כדור הארץ', video: '/4rd onboarding video.mp4' },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [started, setStarted] = useState(false); // האם המשתמש כבר לחץ "התחל" ועבר את מסך הפתיחה
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showFinish, setShowFinish] = useState(false); // שקף הסיום (אחרי הסרטון האחרון) - בלי וידאו, רק כותרת+תיאור+כפתור
  const [isVisible, setIsVisible] = useState(true); // לאנימציית fade בין סליידים
  const videoRef = useRef<HTMLVideoElement>(null);
  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const TRANSITION_MS = 800;

  // כשעוברים לסלייד חדש (אחרי שהתחילו) - לטעון את הוידאו, להריץ fade-in, ולנגן אותו אוטומטית עם קול
  useEffect(() => {
    if (!started || showFinish) return;
    const videoEl = videoRef.current;
    if (!videoEl) return;

    videoEl.muted = false;
    videoEl.load();
    videoEl.play().catch(() => {}); // אם הדפדפן חוסם, פשוט נשאר על הפריים הראשון

    // לאחר שהמקור הוחלף, מציגים בהדרגה (fade-in)
    const fadeInTimeout = setTimeout(() => setIsVisible(true), 30);
    return () => clearTimeout(fadeInTimeout);
  }, [currentSlide, started, showFinish]);

  // כניסה לשקף הסיום - גם כאן צריך את ה-fade-in (אין וידאו שמפעיל אותו)
  useEffect(() => {
    if (!started || !showFinish) return;
    const fadeInTimeout = setTimeout(() => setIsVisible(true), 30);
    return () => clearTimeout(fadeInTimeout);
  }, [showFinish, started]);

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    };
  }, []);

  // מעבר רך: קודם דוהים (fade-out), ורק לאחר מכן מחליפים את הסלייד בפועל
  const goToSlide = (index: number) => {
    if (index === currentSlide && !showFinish) return;
    setIsVisible(false);
    if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    transitionTimeoutRef.current = setTimeout(() => {
      setShowFinish(false);
      setCurrentSlide(index);
    }, TRANSITION_MS);
  };

  // מעבר רך אל שקף הסיום (אותה אנימציית fade/scale כמו בין שאר השקפים)
  const goToFinish = () => {
    if (showFinish) return;
    setIsVisible(false);
    if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    transitionTimeoutRef.current = setTimeout(() => {
      setShowFinish(true);
    }, TRANSITION_MS);
  };

  const handleStart = () => {
    setStarted(true);
  };

  // "דלג" כעת מוביל לשקף הסיום (עם כפתור "בואו נתחיל!"), לא ישירות למצלמה
  const handleSkip = () => {
    if (!started) setStarted(true);
    goToFinish();
  };

  // כפתור קבוע: חזרה לדף הראשי של האפליקציה, זמין בכל מסכי האונבורדינג
  const handleGoHome = () => navigate('/home');

  const handlePrev = () => {
    if (showFinish) { goToSlide(slides.length - 1); return; }
    if (currentSlide > 0) goToSlide(currentSlide - 1);
  };

  // כשהוידאו מסיים לנגן - מעבר אוטומטי לסלייד הבא, ובסרטון האחרון מעבר לשקף הסיום
  const handleVideoEnded = () => {
    if (currentSlide < slides.length - 1) {
      goToSlide(currentSlide + 1);
    } else {
      goToFinish();
    }
  };

  const handleFinishCta = () => navigate('/camera');

  return (
    <div className="h-dvh bg-gradient-to-b from-green-50 to-blue-50 flex flex-col">
      <div className="p-4 flex justify-between items-center">
        <button onClick={handleGoHome} className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur rounded-full shadow-md hover:bg-white transition-colors">
          <Home size={20} className="text-muted-foreground" />
          <span className="text-muted-foreground">דף ראשי</span>
        </button>
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
          {!showFinish ? (
            <div
              className={`w-full max-w-lg flex-1 min-h-0 flex items-center justify-center mb-4 transition-all duration-[600ms] ease-in-out ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
            >
              <video
                ref={videoRef}
                className="max-w-full max-h-full w-auto h-auto rounded-3xl shadow-lg"
                playsInline
                autoPlay
                onEnded={handleVideoEnded}
              >
                <source src={slides[currentSlide].video} type="video/mp4" />
              </video>
            </div>
          ) : (
            <div
              className={`w-full max-w-lg flex-1 min-h-0 flex items-center justify-center mb-4 transition-all duration-[600ms] ease-in-out ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
            >
              <div className="text-8xl">♻️</div>
            </div>
          )}
          <div className={`text-center mb-4 shrink-0 transition-all duration-[600ms] ease-in-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
            <div className="text-4xl mb-2">{slides[showFinish ? slides.length - 1 : currentSlide].emoji}</div>
            <h2 className="text-xl font-bold text-foreground mb-1">{slides[showFinish ? slides.length - 1 : currentSlide].titleHe}</h2>
            <p className="text-muted-foreground text-sm max-w-xs">{slides[showFinish ? slides.length - 1 : currentSlide].descHe}</p>
          </div>
          {!showFinish && (
            <div className="flex gap-2 mb-4 shrink-0">
              {slides.map((_, index) => (
                <button key={index} onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all ${index === currentSlide ? 'bg-primary w-8' : 'bg-gray-300 hover:bg-gray-400'}`} />
              ))}
            </div>
          )}
          <div className="flex gap-4 shrink-0">
            {(showFinish || currentSlide > 0) && (
              <button onClick={handlePrev} className="w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors">
                <ChevronRight size={24} className="text-gray-600" />
              </button>
            )}
            {showFinish && (
              <button onClick={handleFinishCta} className="px-6 py-3 bg-primary text-black rounded-full shadow-lg font-bold hover:bg-green-600 transition-colors flex items-center gap-2">
                <span>בואו נתחיל!</span><span className="text-xl"></span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}