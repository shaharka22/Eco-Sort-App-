import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { Home, Play, RotateCcw, Pause, Trophy, X, Check, Volume2, VolumeX } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { WASTE_BINS, WasteCategory } from '@/types';
import { supabase } from '@/supabaseClient';

import binOrange from '@/assets/uploads/bin-orange.svg';
import binBlue from '@/assets/uploads/bin-blue.svg';
import binPurple from '@/assets/uploads/bin-purple.svg';
import binBrown from '@/assets/uploads/bin-brown.svg';

import plasticDetergentOrange from '@/assets/uploads/plastic-detergent-orange.png';
import plasticBagGreen from '@/assets/uploads/plastic-bag-green.png';
import plasticDetergentBlue from '@/assets/uploads/plastic-detergent-blue.png';
import plasticCupSmall from '@/assets/uploads/plastic-cup-small.png';
import plasticCupTall from '@/assets/uploads/plastic-cup-tall.png';
import plasticBagBlue from '@/assets/uploads/plastic-bag-blue.png';
import plasticChipsBag from '@/assets/uploads/plastic-chips-bag.png';
import plasticCupClear from '@/assets/uploads/plastic-cup-clear.png';
import plasticShampooYellow from '@/assets/uploads/plastic-shampoo-yellow.png';

import paperNotebook from '@/assets/uploads/paper-notebook.png';
import paperBag from '@/assets/uploads/paper-bag.png';
import paperCardboardFlat from '@/assets/uploads/paper-cardboard-flat.png';
import paperNewspaper from '@/assets/uploads/paper-newspaper.png';
import paperCardboardBox from '@/assets/uploads/paper-cardboard-box.png';
import paperFolder from '@/assets/uploads/paper-folder.png';

import organicEggshells from '@/assets/uploads/organic-eggshells.png';
import organicTomato from '@/assets/uploads/organic-tomato.png';
import organicBananaPeel from '@/assets/uploads/organic-banana-peel.png';
import organicFishBones from '@/assets/uploads/organic-fish-bones.png';
import organicCucumber from '@/assets/uploads/organic-cucumber.png';

import glassPerfume from '@/assets/uploads/glass-perfume.png';
import glassPickles from '@/assets/uploads/glass-pickles.png';
import glassJam from '@/assets/uploads/glass-jam.png';
import glassSoapBottle from '@/assets/uploads/glass-soap-bottle.png';

const BIN_IMAGES: Record<WasteCategory, string> = { plastic: binOrange, paper: binBlue, glass: binPurple, organic: binBrown };

const GAME_DURATION = 90;
const MAX_MISSES = 3;
const INITIAL_FALL_SPEED = 0.8;
const SPEED_INCREMENT = 0.15;
const SPEED_INCREASE_INTERVAL = 30;
const INITIAL_SPAWN_INTERVAL = 5000;
const MIN_SPAWN_INTERVAL = 3000;
const BIN_WIDTH = 100;
const ITEM_SIZE = 90;

const WASTE_ITEMS = [
  { id: 'detergent-orange', category: 'plastic' as WasteCategory, name: 'מיכל חומר ניקוי', image: plasticDetergentOrange },
  { id: 'bag-green', category: 'plastic' as WasteCategory, name: 'שקית ניילון', image: plasticBagGreen },
  { id: 'detergent-blue', category: 'plastic' as WasteCategory, name: 'בקבוק חומר ניקוי', image: plasticDetergentBlue },
  { id: 'cup-small', category: 'plastic' as WasteCategory, name: 'כוס פלסטיק', image: plasticCupSmall },
  { id: 'cup-tall', category: 'plastic' as WasteCategory, name: 'כוס גבוהה', image: plasticCupTall },
  { id: 'bag-blue', category: 'plastic' as WasteCategory, name: 'שקית כחולה', image: plasticBagBlue },
  { id: 'chips-bag', category: 'plastic' as WasteCategory, name: 'שקית חטיפים', image: plasticChipsBag },
  { id: 'cup-clear', category: 'plastic' as WasteCategory, name: 'כוס שקופה', image: plasticCupClear },
  { id: 'shampoo-yellow', category: 'plastic' as WasteCategory, name: 'בקבוק שמפו', image: plasticShampooYellow },
  { id: 'perfume-bottle', category: 'glass' as WasteCategory, name: 'בקבוק בושם', image: glassPerfume },
  { id: 'pickle-jar', category: 'glass' as WasteCategory, name: 'צנצנת חמוצים', image: glassPickles },
  { id: 'jam-jar', category: 'glass' as WasteCategory, name: 'צנצנת ריבה', image: glassJam },
  { id: 'soap-bottle', category: 'glass' as WasteCategory, name: 'בקבוק סבון', image: glassSoapBottle },
  { id: 'eggshells', category: 'organic' as WasteCategory, name: 'קליפות ביצים', image: organicEggshells },
  { id: 'tomato', category: 'organic' as WasteCategory, name: 'עגבנייה', image: organicTomato },
  { id: 'banana-peel', category: 'organic' as WasteCategory, name: 'קליפת בננה', image: organicBananaPeel },
  { id: 'fish-bones', category: 'organic' as WasteCategory, name: 'עצמות דג', image: organicFishBones },
  { id: 'cucumber', category: 'organic' as WasteCategory, name: 'מלפפון', image: organicCucumber },
  { id: 'notebook', category: 'paper' as WasteCategory, name: 'מחברת', image: paperNotebook },
  { id: 'paper-bag', category: 'paper' as WasteCategory, name: 'שקית נייר', image: paperBag },
  { id: 'cardboard-flat', category: 'paper' as WasteCategory, name: 'קרטון שטוח', image: paperCardboardFlat },
  { id: 'newspaper', category: 'paper' as WasteCategory, name: 'עיתון', image: paperNewspaper },
  { id: 'cardboard-box', category: 'paper' as WasteCategory, name: 'קופסת קרטון', image: paperCardboardBox },
  { id: 'folder', category: 'paper' as WasteCategory, name: 'תיקייה', image: paperFolder },
];

interface FallingItem { id: number; itemType: typeof WASTE_ITEMS[number]; x: number; y: number; speed: number; }
interface GameFeedback { type: 'success' | 'wrong' | 'miss'; x: number; y: number; id: number; }
type GameState = 'start' | 'playing' | 'paused' | 'gameover';

export default function Game() {
  const navigate = useNavigate();
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastSpawnTimeRef = useRef<number>(0);
  const itemIdCounterRef = useRef<number>(0);
  const feedbackIdRef = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [gameState, setGameState] = useState<GameState>('start');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [misses, setMisses] = useState(0);
  const [correctCatches, setCorrectCatches] = useState(0);
  const [wrongCatches, setWrongCatches] = useState(0);
  const [selectedBin, setSelectedBin] = useState<WasteCategory>('plastic');
  const [binX, setBinX] = useState(50);
  const [fallingItems, setFallingItems] = useState<FallingItem[]>([]);
  const [feedbacks, setFeedbacks] = useState<GameFeedback[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [fallSpeed, setFallSpeed] = useState(INITIAL_FALL_SPEED);
  const gameOverCalledRef = useRef(false);
  const [spawnInterval, setSpawnInterval] = useState(INITIAL_SPAWN_INTERVAL);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/music.m4a');
      audioRef.current.volume = 0.3;
    }
    const audio = audioRef.current;
    if (gameState === 'playing' && soundEnabled) audio.play().catch(() => {});
    else audio.pause();
    return () => { audio.pause(); };
  }, [gameState, soundEnabled]);

  useEffect(() => {
    return () => { if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; } };
  }, []);

  const getGameAreaDimensions = useCallback(() => {
    if (!gameAreaRef.current) return { width: 400, height: 600 };
    return { width: gameAreaRef.current.clientWidth, height: gameAreaRef.current.clientHeight };
  }, []);

  const spawnItem = useCallback(() => {
    const { width } = getGameAreaDimensions();
    const randomItem = WASTE_ITEMS[Math.floor(Math.random() * WASTE_ITEMS.length)];
    const padding = ITEM_SIZE;
    const x = padding + Math.random() * (width - padding * 2);
    setFallingItems((prev) => [...prev, { id: itemIdCounterRef.current++, itemType: randomItem, x, y: -ITEM_SIZE, speed: fallSpeed + Math.random() * 0.5 }]);
  }, [fallSpeed, getGameAreaDimensions]);

  const checkCollision = useCallback((item: FallingItem): boolean => {
    const { width, height } = getGameAreaDimensions();
    const binXPixels = binX / 100 * width;
    const binY = height - 200;
    if (item.y + ITEM_SIZE >= binY && item.y <= binY + 60) {
      const itemCenter = item.x + ITEM_SIZE / 2;
      return itemCenter >= binXPixels - BIN_WIDTH / 2 && itemCenter <= binXPixels + BIN_WIDTH / 2;
    }
    return false;
  }, [binX, getGameAreaDimensions]);

  const addFeedback = useCallback((type: 'success' | 'wrong' | 'miss', x: number, y: number) => {
    const feedback: GameFeedback = { type, x, y, id: feedbackIdRef.current++ };
    setFeedbacks((prev) => [...prev, feedback]);
    setTimeout(() => { setFeedbacks((prev) => prev.filter((f) => f.id !== feedback.id)); }, 1000);
  }, []);

  const getStars = useCallback((correct: number, wrong: number, missCount: number) => {
    const accuracy = correct + wrong > 0 ? correct / (correct + wrong) * 100 : 0;
    if (accuracy >= 90 && missCount === 0) return 3;
    if (accuracy >= 70) return 2;
    if (accuracy >= 50) return 1;
    return 0;
  }, []);

const handleGameOver = useCallback(async (finalScore: number, correct: number, wrong: number, missCount: number) => {
  if (gameOverCalledRef.current) return;
  gameOverCalledRef.current = true;
  setGameState('gameover');
  await supabase.from('game_scores').insert({
    score: finalScore,
    correct_catches: correct,
    wrong_catches: wrong,
    misses: missCount,
    stars: getStars(correct, wrong, missCount),
  });
}, [getStars]);

  useEffect(() => {
    if (gameState !== 'playing') return;
    let lastTime = performance.now();
    const gameLoop = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 16.67;
      lastTime = currentTime;
      const { height } = getGameAreaDimensions();
      if (currentTime - lastSpawnTimeRef.current > spawnInterval) { spawnItem(); lastSpawnTimeRef.current = currentTime; }
      setFallingItems((prev) => {
        const updated: FallingItem[] = [];
        for (const item of prev) {
          const newY = item.y + item.speed * deltaTime;
          if (checkCollision({ ...item, y: newY })) {
            if (item.itemType.category === selectedBin) { setScore((s) => s + 10); setCorrectCatches((c) => c + 1); addFeedback('success', item.x, newY); }
            else { setScore((s) => Math.max(0, s - 5)); setWrongCatches((c) => c + 1); addFeedback('wrong', item.x, newY); }
            continue;
          }
          if (newY > height) {
            setMisses((m) => {
              const newMisses = m + 1;
              if (newMisses >= MAX_MISSES) {
                setScore((s) => {
                  setCorrectCatches((c) => {
                    setWrongCatches((w) => {
                      handleGameOver(Math.max(0, s - 2), c, w, newMisses);
                      return w;
                    });
                    return c;
                  });
                  return s;
                });
              }
              return newMisses;
            });
            setScore((s) => Math.max(0, s - 2));
            addFeedback('miss', item.x, height - 50);
            continue;
          }
          updated.push({ ...item, y: newY });
        }
        return updated;
      });
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };
    animationFrameRef.current = requestAnimationFrame(gameLoop);
    return () => { if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current); };
  }, [gameState, selectedBin, spawnInterval, spawnItem, checkCollision, addFeedback, getGameAreaDimensions, handleGameOver]);

  useEffect(() => {
    if (gameState !== 'playing') return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setScore((s) => {
            setCorrectCatches((c) => {
              setWrongCatches((w) => {
                setMisses((m) => {
                  handleGameOver(s, c, w, m);
                  return m;
                });
                return w;
              });
              return c;
            });
            return s;
          });
          return 0;
        }
        const elapsed = GAME_DURATION - prev + 1;
        if (elapsed % SPEED_INCREASE_INTERVAL === 0) { setFallSpeed((s) => s + SPEED_INCREMENT); setSpawnInterval((i) => Math.max(MIN_SPAWN_INTERVAL, i - 200)); }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState, handleGameOver]);

  useEffect(() => {
    if (gameState !== 'playing') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft': setBinX((x) => Math.max(10, x - 5)); break;
        case 'ArrowRight': setBinX((x) => Math.min(90, x + 5)); break;
        case '1': setSelectedBin('plastic'); break;
        case '2': setSelectedBin('paper'); break;
        case '3': setSelectedBin('glass'); break;
        case '4': setSelectedBin('organic'); break;
        case 'Escape': setGameState('paused'); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  const lastMoveTime = useRef(0);
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (gameState !== 'playing') return;
    const now = Date.now();
    if (now - lastMoveTime.current < 16) return;
    lastMoveTime.current = now;
    const rect = gameAreaRef.current?.getBoundingClientRect();
    if (!rect) return;
    setBinX(Math.max(10, Math.min(90, (e.clientX - rect.left) / rect.width * 100)));
  }, [gameState]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (gameState !== 'playing') return;
    e.preventDefault();
    const touch = e.touches[0];
    const rect = gameAreaRef.current?.getBoundingClientRect();
    if (!rect || !touch) return;
    setBinX(Math.max(10, Math.min(90, (touch.clientX - rect.left) / rect.width * 100)));
  }, [gameState]);

  const startGame = () => {
    gameOverCalledRef.current = false;
    setGameState('playing'); setScore(0); setTimeLeft(GAME_DURATION); setMisses(0);
    setCorrectCatches(0); setWrongCatches(0); setFallingItems([]); setFallSpeed(INITIAL_FALL_SPEED);
    setSpawnInterval(INITIAL_SPAWN_INTERVAL); setBinX(50); lastSpawnTimeRef.current = 0;
  };

  const currentBin = WASTE_BINS.find((b) => b.category === selectedBin)!;
  const stars = getStars(correctCatches, wrongCatches, misses);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-200 via-sky-100 to-green-100 flex flex-col">
      {gameState === 'start' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-8">
          <Logo size="md" />
          <div className="text-center">
            <h1 className="text-4xl font-black text-primary mb-2">🎮 תפוס את הפסולת!</h1>
            <p className="text-lg text-muted-foreground">תפסו את הפריטים הנופלים עם הפח הנכון</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg max-w-sm w-full">
            <h3 className="font-bold text-lg mb-4 text-center">איך משחקים?</h3>
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex items-center gap-3"><span className="text-2xl">👆</span><span>הזיזו את הפח ימינה ושמאלה</span></div>
              <div className="flex items-center gap-3"><span className="text-2xl">🔄</span><span>החליפו פח בלחיצה על הצבע</span></div>
              <div className="flex items-center gap-3"><span className="text-2xl">✅</span><span>תפסו פריט בפח הנכון = +10 נקודות</span></div>
              <div className="flex items-center gap-3"><span className="text-2xl">❌</span><span>3 פספוסים = סוף המשחק</span></div>
            </div>
          </div>
          <div className="flex gap-4">
            {WASTE_BINS.map((bin) => (
              <div key={bin.category} className="flex flex-col items-center gap-1">
                <img src={BIN_IMAGES[bin.category]} alt={bin.labelHe} className="w-14 h-16 object-contain" />
                <span className="text-xs font-medium">{bin.labelHe}</span>
              </div>
            ))}
          </div>
          <button onClick={startGame} className="flex items-center gap-3 bg-gradient-to-r color from-green-300 to-green-500 from-primary-light-500 to-primary-dark-600 text-white text-2xl font-bold py-5 px-10 rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-transform">
            <Play size={32} fill="white" /><span>התחל לשחק !</span>
          </button>
          <button onClick={() => navigate('/')} className="text-muted-foreground hover:text-foreground transition-colors">חזרה לתפריט</button>
        </div>
      )}

      {(gameState === 'playing' || gameState === 'paused') && (
        <>
          <div className="p-4 flex items-center justify-between bg-white/80 backdrop-blur-sm shadow-sm">
            <button onClick={() => setGameState('paused')} className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"><Pause size={20} /></button>
            <div className="flex items-center gap-6">
              <div className="text-center"><p className="text-2xl font-black text-primary">{score}</p><p className="text-xs text-muted-foreground">נקודות</p></div>
              <div className="text-center">
                <p className={`text-2xl font-black ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-foreground'}`}>
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </p>
                <p className="text-xs text-muted-foreground">זמן</p>
              </div>
              <div className="flex gap-1">
                {[...Array(MAX_MISSES)].map((_, i) => (
                  <div key={i} className={`w-6 h-6 rounded-full ${i < MAX_MISSES - misses ? 'bg-red-500' : 'bg-gray-300'}`} />
                ))}
              </div>
            </div>
            <button onClick={() => setSoundEnabled(!soundEnabled)} className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
          </div>

          <div ref={gameAreaRef} className="flex-1 relative overflow-hidden cursor-none" onPointerMove={handlePointerMove} onTouchMove={handleTouchMove} style={{ touchAction: 'none' }}>
            {fallingItems.map((item) => (
              <div key={item.id} className="absolute transition-none" style={{ left: item.x, top: item.y, width: ITEM_SIZE, height: ITEM_SIZE }}>
                <div className="w-full h-full bg-white rounded-2xl shadow-lg flex items-center justify-center overflow-hidden">
                  <img src={item.itemType.image} alt={item.itemType.name} className="w-20 h-20 object-contain" />
                </div>
              </div>
            ))}
            {feedbacks.map((fb) => (
              <div key={fb.id} className="absolute pointer-events-none animate-ping" style={{ left: fb.x, top: fb.y }}>
                {fb.type === 'success' && <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center"><Check size={32} className="text-white" /></div>}
                {fb.type === 'wrong' && <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center"><X size={32} className="text-white" /></div>}
                {fb.type === 'miss' && <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold">-2</div>}
              </div>
            ))}
            <div className="absolute bottom-24" style={{ left: `${binX}%`, transform: 'translateX(-50%)' }}>
              <img src={BIN_IMAGES[selectedBin]} alt={currentBin.labelHe} className="w-24 h-28 object-contain drop-shadow-2xl" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-white/90 backdrop-blur-sm">
              <div className="flex justify-center gap-3">
                {WASTE_BINS.map((bin, index) => (
                  <button key={bin.category} onClick={() => setSelectedBin(bin.category)}
                    className={`relative w-16 h-20 rounded-xl flex items-center justify-center transition-all ${selectedBin === bin.category ? 'scale-110 ring-4 ring-offset-2 ring-primary' : 'opacity-60 hover:opacity-100'}`}>
                    <img src={BIN_IMAGES[bin.category]} alt={bin.labelHe} className="w-14 object-contain" />
                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-gray-800 text-white text-xs rounded-full flex items-center justify-center font-bold">{index + 1}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {gameState === 'paused' && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
                <h2 className="text-3xl font-black text-foreground mb-6">⏸️ הפסק משחק</h2>
                <div className="flex flex-col gap-3">
                  <button onClick={() => setGameState('playing')} className="w-full bg-gray-200 py-4 bg-primary text rounded-xl font-bold text-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-2">
                    <Play size={24} />המשך לשחק
                  </button>
                  <button onClick={startGame} className="w-full py-4 bg-gray-200 text-foreground rounded-xl font-bold text-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 from-primary-light to-primary-dark">
                    <RotateCcw size={24} />התחל מחדש
                  </button>
                  <button onClick={() => navigate('/')} className="w-full py-3 text-muted-foreground hover:text-foreground transition-colors">יציאה לתפריט</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {gameState === 'gameover' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
          <div className="text-center">
            <div className="text-6xl mb-4">{stars === 3 ? '🏆' : stars >= 1 ? '⭐' : '😢'}</div>
            <h1 className="text-4xl font-black text-foreground mb-2">{misses >= MAX_MISSES ? 'נגמרו הניסיונות!' : 'נגמר הזמן!'}</h1>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3].map((star) => (
              <div key={star} className={`text-5xl transition-all duration-500 ${star <= stars ? 'scale-100' : 'scale-75 opacity-30'}`}>⭐</div>
            ))}
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg max-w-sm w-full">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Trophy size={32} className="text-yellow-500" />
              <p className="text-4xl font-black text-primary">{score}</p>
              <span className="text-lg text-muted-foreground">נקודות</span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div><p className="text-2xl font-bold text-green-600">{correctCatches}</p><p className="text-xs text-muted-foreground">תפיסות נכונות</p></div>
              <div><p className="text-2xl font-bold text-red-500">{wrongCatches}</p><p className="text-xs text-muted-foreground">טעויות</p></div>
              <div><p className="text-2xl font-bold text-yellow-600">{misses}</p><p className="text-xs text-muted-foreground">פספוסים</p></div>
            </div>
          </div>
          <div className="flex flex-col gap-3 w-full max-w-sm">
            <button onClick={startGame} className="flex items-center justify-center gap-3 bg-gradient-to-r from-primary to-primary-dark text-white text-xl font-bold py-5 px-8 rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-transform">
              <RotateCcw size={28} /><span>שחק שוב</span>
            </button>
            <button onClick={() => navigate('/')} className="flex items-center justify-center gap-3 bg-white border-2 border-gray-200 text-foreground text-lg font-medium py-4 px-8 rounded-2xl shadow-md hover:border-primary transition-colors">
              <Home size={24} /><span>חזרה לתפריט</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}