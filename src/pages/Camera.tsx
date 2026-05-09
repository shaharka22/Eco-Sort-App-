import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Camera as CameraIcon, Home, Volume2, VolumeX, RefreshCw, AlertTriangle, ImageOff, ExternalLink, Image } from 'lucide-react';
import { useApp } from '@/context/AppContext';

const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=400&fit=crop',
];

type CameraState = 'loading' | 'ready' | 'permission' | 'iframe' | 'error';

export default function Camera() {
  const navigate = useNavigate();
  const { soundEnabled, toggleSound, setCurrentImage } = useApp();
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraState, setCameraState] = useState<CameraState>('loading');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const isInIframe = () => { try { return window.self !== window.top; } catch (e) { return true; } };

  const startCamera = async () => {
    setCameraState('loading');
    if (isInIframe()) { setCameraState('iframe'); return; }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { setCameraState('error'); return; }
    if (streamRef.current) streamRef.current.getTracks().forEach((track) => track.stop());
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); }
      setCameraState('ready');
    } catch (err) {
      if (err instanceof DOMException && (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError')) setCameraState('permission');
      else setCameraState('error');
    }
  };

  useEffect(() => {
    startCamera();
    return () => { if (streamRef.current) streamRef.current.getTracks().forEach((track) => track.stop()); };
  }, [facingMode]);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsCapturing(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setTimeout(() => { setCurrentImage(imageDataUrl); navigate('/analysis'); }, 300);
  };

  const handleUseSampleImage = () => {
    setIsCapturing(true);
    const randomImage = SAMPLE_IMAGES[Math.floor(Math.random() * SAMPLE_IMAGES.length)];
    setTimeout(() => { setCurrentImage(randomImage); navigate('/analysis'); }, 300);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col relative">
      <canvas ref={canvasRef} className="hidden" />
      <div className="absolute top-0 left-0 right-0 z-10 p-4 flex items-center justify-between">
        <button onClick={() => navigate('/')} className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
          <Home size={24} className="text-white" />
        </button>
        <button onClick={toggleSound} className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
          {soundEnabled ? <Volume2 size={24} className="text-white" /> : <VolumeX size={24} className="text-white" />}
        </button>
      </div>
      <div className="flex-1 relative overflow-hidden">
        <video ref={videoRef} autoPlay playsInline muted className={`absolute inset-0 w-full h-full object-cover ${cameraState !== 'ready' ? 'hidden' : ''}`} />
        {cameraState === 'loading' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="text-center px-6">
              <RefreshCw size={48} className="text-white animate-spin mx-auto mb-4" />
              <p className="text-white text-xl font-bold mb-2">מפעיל מצלמה...</p>
              <p className="text-white/70 text-sm">אם מופיעה בקשת הרשאה - יש ללחוץ "אפשר"</p>
            </div>
          </div>
        )}
        {cameraState === 'ready' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-64 relative">
              <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-primary rounded-tl-2xl" />
              <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-primary rounded-tr-2xl" />
              <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-primary rounded-bl-2xl" />
              <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-primary rounded-br-2xl" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 bg-primary rounded-full animate-ping" />
                <div className="absolute w-2 h-2 bg-primary rounded-full" />
              </div>
            </div>
          </div>
        )}
        {cameraState === 'ready' && (
          <div className="absolute top-1/4 left-0 right-0 text-center pointer-events-none">
            <p className="text-white/80 text-lg bg-black/30 backdrop-blur-sm inline-block px-4 py-2 rounded-full">מקמו את הפריט במרכז המסגרת</p>
          </div>
        )}
        {isCapturing && <div className="absolute inset-0 bg-white animate-pulse" />}
      </div>
      {cameraState === 'ready' && (
        <div className="absolute bottom-0 left-0 right-0 p-6 pb-10">
          <div className="flex items-center justify-center gap-6">
            <div className="w-14 h-14" />
            <button onClick={handleCapture} disabled={isCapturing}
              className={`w-24 h-24 rounded-full bg-gradient-to-b from-white to-gray-200 border-4 border-primary flex items-center justify-center shadow-lg shadow-primary/30 transition-all duration-200 ${isCapturing ? 'scale-90 opacity-50' : 'hover:scale-105 active:scale-95'}`}>
              <div className={`w-16 h-16 rounded-full bg-primary flex items-center justify-center ${!isCapturing && 'animate-pulse'}`}>
                <CameraIcon size={32} className="text-black" />
              </div>
            </button>
            <button onClick={() => setFacingMode((prev) => prev === 'user' ? 'environment' : 'user')}
              className="w-14 h-14 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors">
              <RefreshCw size={24} className="text-white" />
            </button>
          </div>
        </div>
      )}
      {cameraState === 'iframe' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm text-center shadow-2xl">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CameraIcon size={40} className="text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">המצלמה לא עובדת בתצוגה המקדימה</h3>
            <p className="text-muted-foreground mb-6">כדי להשתמש במצלמה האמיתית, פתחו את האפליקציה בכרטיסייה חדשה</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => window.open(window.location.href, '_blank')}
                className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-2">
                <ExternalLink size={20} /><span>פתח בכרטיסייה חדשה</span>
              </button>
              <button onClick={handleUseSampleImage} className="w-full py-4 bg-gray-100 text-foreground rounded-xl font-bold text-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                <Image size={20} /><span>המשך עם תמונה לדוגמה</span>
              </button>
              <button onClick={() => navigate('/')} className="w-full py-3 text-muted-foreground hover:text-foreground transition-colors">חזרה הביתה</button>
            </div>
          </div>
        </div>
      )}
      {(cameraState === 'permission' || cameraState === 'error') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm text-center shadow-2xl">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {cameraState === 'permission' ? <AlertTriangle size={40} className="text-yellow-600" /> : <ImageOff size={40} className="text-yellow-600" />}
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">{cameraState === 'permission' ? 'צריך אישור למצלמה' : 'לא הצלחנו להפעיל את המצלמה'}</h3>
            <p className="text-muted-foreground mb-4">{cameraState === 'permission' ? 'לחצו על כפתור "נסה שוב" ואז אשרו את הגישה למצלמה' : 'בואו ננסה שוב'}</p>
            <div className="flex flex-col gap-3">
              <button onClick={startCamera} className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-primary-dark transition-colors">נסה שוב</button>
              <button onClick={handleUseSampleImage} className="w-full py-3 bg-gray-100 text-foreground rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                <Image size={18} /><span>המשך עם תמונה לדוגמה</span>
              </button>
              <button onClick={() => navigate('/')} className="w-full py-3 text-muted-foreground hover:text-foreground transition-colors">חזרה הביתה</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}