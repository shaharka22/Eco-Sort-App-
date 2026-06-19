import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Play, Pause, SkipForward, ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  { emoji: '🤖', titleHe: 'הכירו את הרובוט!', descHe: 'הרובוט שלנו עוזר למיין אשפה לפחים הנכונים', video: '/1rd onboarding video.mp4' },
  { emoji: '📸', titleHe: 'צלמו פריט', descHe: 'צלמו את האשפה והאפליקציה תזהה לאן היא שייכת', video: '/2rd onboarding video.mp4' },
  { emoji: '✅', titleHe: 'אשרו את המיון', descHe: 'בדקו שהאפליקציה צדקה ולחצו על הפח הנכון', video: '/3rd onboarding video.mp4' },
  { emoji: '🌍', titleHe: 'שמרו על העולם!', descHe: 'כל מיון נכון עוזר לשמור על כדור הארץ', video: '/4rd onboarding video.mp4' },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false); // האם המשתמש כבר לחץ Play פעם אחת
  const videoRef = useRef(null);

  // כל פעם שעוברים סלייד - לטעון את הוידאו החדש ולנגן אותו אוטומטית
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    videoEl.muted = !hasInteracted; // לפני אינטראקציה ראשונה - מושתק (כדי שה-autoplay יעבוד); אחריה - עם קול
    videoEl.load();
    const playPromise = videoEl.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false)); // הדפדפן חוסם autoplay - נשאר על מצב מושהה
    }
  }, [currentSlide, hasInteracted]);

  const togglePlay = () => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    if (!hasInteracted) {
      // לחיצה ראשונה: מסירים השתקה ומפעילים קול מעכשיו והלאה
      setHasInteracted(true);
      videoEl.muted = false;
    }

    if (videoEl.paused) {
      videoEl.play();
      setIsPlaying(true);
    } else {
      videoEl.pause();
      setIsPlaying(false);
    }
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
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-lg aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl mb-8 shadow-lg overflow-hidden relative">
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            playsInline
            loop
            onClick={togglePlay}
          >
            <source src={slides[currentSlide].video} type="video/mp4" />
          </video>

          {/* כפתור Play/Pause מרכזי - מוצג כשהוידאו מושהה, ונעלם כשהוא מתנגן */}
          {!isPlaying && (
            <button
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/10"
            >
              <div className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform">
                <Play size={40} className="text-primary ml-1" fill="currentColor" />
              </div>
            </button>
          )}

          {/* כפתור Pause קטן בפינה כשהוידאו מתנגן */}
          {isPlaying && (
            <button
              onClick={togglePlay}
              className="absolute bottom-3 left-3 w-10 h-10 bg-white/80 backdrop-blur rounded-full shadow-md flex items-center justify-center hover:bg-white transition-colors"
            >
              <Pause size={18} className="text-primary" fill="currentColor" />
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
          <button onClick={handleNext} className="px-8 py-4 bg-primary text-black rounded-full shadow-lg font-bold text-lg hover:bg-green-600 transition-colors flex items-center gap-2">
            {currentSlide < slides.length - 1 ? (
              <><span>הבא</span><ChevronLeft size={24} /></>
            ) : (
              <><span>בואו נתחיל!</span><span className="text-2xl"></span></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}