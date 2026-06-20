import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Play, SkipForward, Home } from 'lucide-react';
import binOrange from '../assets/uploads/bin-orange.svg';
import binBlue from '../assets/uploads/bin-blue.svg';
import binPurple from '../assets/uploads/bin-purple.svg';
import binBrown from '../assets/uploads/bin-brown.svg';

const slides = [
  { emoji: '', titleHe: 'הכירו את הרובוט!', descHe: 'הרובוט שלנו עוזר למיין אשפה לפחים הנכונים', video: '/1rd onboarding video.mp4' },
  { emoji: '', titleHe: 'צלמו פריט', descHe: 'צלמו את האשפה והאפליקציה תזהה לאן היא שייכת', video: '/2rd onboarding video.mp4' },
  { emoji: '', titleHe: 'אשרו את המיון', descHe: 'בדקו שהאפליקציה צדקה ולחצו על הפח הנכון', video: '/3rd onboarding video.mp4' },
  { emoji: '', titleHe: 'שמרו על העולם!', descHe: 'כל מיון נכון עוזר לשמור על כדור הארץ', video: '/4rd onboarding video.mp4' },
];

// 4 סרטוני דוגמאות מיון - הקבצים נמצאים בתיקיית public/ עם רווחים בשם (בדיוק כמו שאר סרטוני האונבורדינג)
const wasteExamples = [
  { id: 'plastic-bottle', titleHe: 'בקבוק פלסטיק', descHe: 'בקבוק פלסטיק שייך לפח הכתום', icon: binOrange, video: '/1rd grid video orange bin.mp4' },
  { id: 'paper', titleHe: 'נייר', descHe: 'נייר שייך לפח הכחול', icon: binBlue, video: '/2rd grid video blue bin.mp4' },
  { id: 'glass-jar', titleHe: 'צנצנת זכוכית', descHe: 'צנצנת זכוכית שייכת לפח הסגול', icon: binPurple, video: '/3rd grid video purple bin.mp4' },
  { id: 'banana-peel', titleHe: 'קליפת בננה', descHe: 'קליפת בננה שייכת לפח החום', icon: binBrown, video: '/4rd gris video brown bin.mp4' },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [started, setStarted] = useState(false); // האם המשתמש כבר לחץ "התחל" ועבר את מסך הפתיחה
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showWasteGrid, setShowWasteGrid] = useState(false); // שקף גריד דוגמאות המיון - מופיע ישירות אחרי הסרטון הרביעי
  const [openVideoIndex, setOpenVideoIndex] = useState<number | null>(null); // איזה כרטיס בגריד פתוח כרגע במודאל מוגדל
  const [isVisible, setIsVisible] = useState(true); // לאנימציית fade בין סליידים
  const videoRef = useRef<HTMLVideoElement>(null);
  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const TRANSITION_MS = 800;

  // כשעוברים לסלייד חדש (אחרי שהתחילו) - לטעון את הוידאו, להריץ fade-in, ולנגן אותו אוטומטית עם קול
  useEffect(() => {
    if (!started || showWasteGrid) return;
    const videoEl = videoRef.current;
    if (!videoEl) return;

    videoEl.muted = false;
    videoEl.load();
    videoEl.play().catch(() => {}); // אם הדפדפן חוסם, פשוט נשאר על הפריים הראשון

    // לאחר שהמקור הוחלף, מציגים בהדרגה (fade-in)
    const fadeInTimeout = setTimeout(() => setIsVisible(true), 30);
    return () => clearTimeout(fadeInTimeout);
  }, [currentSlide, started, showWasteGrid]);

  // כניסה לשקף הגריד - גם כאן צריך fade-in (אין וידאו שמפעיל אותו)
  useEffect(() => {
    if (!showWasteGrid) return;
    const fadeInTimeout = setTimeout(() => setIsVisible(true), 30);
    return () => clearTimeout(fadeInTimeout);
  }, [showWasteGrid]);

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    };
  }, []);

  // מעבר רך: קודם דוהים (fade-out), ורק לאחר מכן מחליפים את הסלייד בפועל
  const goToSlide = (index: number) => {
    if (index === currentSlide && !showWasteGrid) return;
    setIsVisible(false);
    if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    transitionTimeoutRef.current = setTimeout(() => {
      setShowWasteGrid(false);
      setCurrentSlide(index);
    }, TRANSITION_MS);
  };

  // מעבר רך אל שקף גריד דוגמאות המיון (ישירות אחרי הסרטון הרביעי, או דרך "דלג")
  const goToWasteGrid = () => {
    if (showWasteGrid) return;
    setIsVisible(false);
    if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    transitionTimeoutRef.current = setTimeout(() => {
      setShowWasteGrid(true);
    }, TRANSITION_MS);
  };

  const handleStart = () => {
    setStarted(true);
  };

  // "דלג" מוביל ישירות לגריד דוגמאות המיון
  const handleSkip = () => {
    if (!started) setStarted(true);
    goToWasteGrid();
  };

  // כפתור קבוע: חזרה לדף הראשי של האפליקציה, זמין בכל מסכי האונבורדינג
  const handleGoHome = () => navigate('/home');

  // כשהוידאו מסיים לנגן - מעבר אוטומטי לסלייד הבא, ובסרטון האחרון מעבר ישיר לגריד
  const handleVideoEnded = () => {
    if (currentSlide < slides.length - 1) {
      goToSlide(currentSlide + 1);
    } else {
      goToWasteGrid();
    }
  };

  const handleOpenWasteVideo = (index: number) => setOpenVideoIndex(index);
  const handleCloseWasteVideo = () => setOpenVideoIndex(null);
  const handleWasteVideoEnded = () => setOpenVideoIndex(null);

  // כפתור קבוע בתחתית הגריד - ממשיך לאפליקציה עצמה, לא תלוי בצפייה באף סרטון
  const handleGridContinue = () => navigate('/camera');

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
      ) : showWasteGrid ? (
        // שקף גריד דוגמאות מיון - ישירות אחרי הסרטון הרביעי
        <div
          className={`flex-1 flex flex-col items-center p-6 min-h-0 overflow-y-auto transition-all duration-[600ms] ease-in-out ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        >
          <div className="text-center mb-6 shrink-0">
            <h2 className="text-xl font-bold text-foreground mb-1">דוגמאות למיון פסולת</h2>
            <p className="text-muted-foreground text-sm max-w-xs">לחצו על כל כרטיס כדי לצפות בדוגמה</p>
          </div>
          <div className="grid grid-cols-2 gap-4 w-full max-w-md mb-6">
            {wasteExamples.map((item, index) => (
              <button
                key={item.id}
                onClick={() => handleOpenWasteVideo(index)}
                className="flex flex-col items-center justify-center gap-2 p-4 bg-white rounded-3xl shadow-md hover:shadow-lg hover:scale-105 transition-all"
              >
                <img src={item.icon} alt={item.titleHe} className="w-20 h-20 object-contain" />
              </button>
            ))}
          </div>
          <button
            onClick={handleGridContinue}
            className="px-8 py-4 bg-primary text-black rounded-full shadow-lg font-bold text-lg hover:bg-green-600 transition-colors flex items-center gap-2 shrink-0"
          >
            <span>בואו נתחיל למיין!</span><span className="text-xl"></span>
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center p-6 min-h-0 overflow-hidden">
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
          <div className={`text-center mb-4 shrink-0 transition-all duration-[600ms] ease-in-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
            <div className="text-4xl mb-2">{slides[currentSlide].emoji}</div>
            <h2 className="text-xl font-bold text-foreground mb-1">{slides[currentSlide].titleHe}</h2>
            <p className="text-muted-foreground text-sm max-w-xs">{slides[currentSlide].descHe}</p>
          </div>
          <div className="flex gap-2 mb-4 shrink-0">
            {slides.map((_, index) => (
              <button key={index} onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${index === currentSlide ? 'bg-primary w-8' : 'bg-gray-300 hover:bg-gray-400'}`} />
            ))}
          </div>
        </div>
      )}

      {openVideoIndex !== null && (
        // מודאל מוגדל לצפייה בסרטון דוגמה - לחיצה על הרקע סוגרת אותו, וגם סיום הסרטון סוגר אותו
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6"
          onClick={handleCloseWasteVideo}
        >
          <div className="relative w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <video
              key={wasteExamples[openVideoIndex].id}
              className="max-w-full max-h-[80vh] w-auto h-auto rounded-3xl shadow-lg mx-auto"
              playsInline
              autoPlay
              onEnded={handleWasteVideoEnded}
            >
              <source src={wasteExamples[openVideoIndex].video} type="video/mp4" />
            </video>
            <div className="text-center mt-4">
              <p className="text-white font-bold text-lg">{wasteExamples[openVideoIndex].titleHe}</p>
              <p className="text-white/80 text-sm">{wasteExamples[openVideoIndex].descHe}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}