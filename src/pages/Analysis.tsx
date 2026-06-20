import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowRight, Camera, AlertCircle, Check, X, Trash2, ListChecks } from 'lucide-react';
import { ScanAnimation } from '@/components/ScanAnimation';
import { StarCounter } from '@/components/StarCounter';
import { useApp } from '@/context/AppContext';
import { WASTE_BINS, type WasteCategory } from '@/types';
import { supabase } from '@/supabaseClient';
import { identifyWaste } from '@/lib/identifyWaste';

type AnalysisStep = 'scanning' | 'confirm_identification' | 'select_bin' | 'not_identified';

export default function Analysis() {
  const navigate = useNavigate();
  const { currentImage, sortingSession, setIdentifiedCategory, confirmIdentification, selectBin, setCurrentImage } = useApp();
  const [step, setStep] = useState<AnalysisStep>('scanning');
  const [selectedBinLocal, setSelectedBinLocal] = useState<WasteCategory | null>(null);
  const [showBinError, setShowBinError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [notIdentifiedDescription, setNotIdentifiedDescription] = useState<string | null>(null);
  const [showManualPicker, setShowManualPicker] = useState(false);

  useEffect(() => { if (!currentImage) navigate('/camera'); }, [currentImage, navigate]);

  const handleScanComplete = async () => {
    if (!currentImage) return;
    const result = await identifyWaste(currentImage);
    if (!result.category) {
      setNotIdentifiedDescription(result.itemDescription);
      setShowManualPicker(false);
      setStep('not_identified');
    } else {
      setIdentifiedCategory(result.category);
      setStep('confirm_identification');
    }
  };

  const handleConfirmIdentification = (isCorrect: boolean) => {
    if (isCorrect) { confirmIdentification(); setStep('select_bin'); }
    else {
      setStep('scanning');
      setTimeout(() => { handleScanComplete(); }, 500);
    }
  };

  // בחירה ידנית של קטגוריה - למקרה שאין פריט פסולת אמיתי זמין לצילום, ממשיכים בדיוק כמו זיהוי אוטומטי
  const handleManualCategorySelect = (category: WasteCategory) => {
    setIdentifiedCategory(category);
    setShowManualPicker(false);
    setStep('confirm_identification');
  };

  const handleBinSelect = async (category: WasteCategory) => {
    if (isSuccess || showBinError) return;
    setSelectedBinLocal(category);
    const isCorrect = selectBin(category);
    if (isCorrect) {
      setIsSuccess(true);
      await supabase.from('sort_events').insert({
        item_name: identifiedBin?.labelHe,
        correct_bin: sortingSession.identifiedCategory,
        chosen_bin: category,
        is_correct: true,
      });
      setTimeout(() => navigate('/robot'), 1500);
    } else {
      setShowBinError(true);
      setTimeout(() => { setSelectedBinLocal(null); setShowBinError(false); }, 1500);
    }
  };

  const identifiedBin = sortingSession.identifiedCategory ? WASTE_BINS.find((b) => b.category === sortingSession.identifiedCategory) : null;

  if (!currentImage) return null;

  return (
    <div className="h-dvh bg-gradient-to-b from-green-50 to-blue-50 flex flex-col overflow-hidden">
      <div className="p-3 flex items-center justify-between shrink-0">
        <button onClick={() => navigate('/camera')} className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors">
          <ArrowRight size={20} className="text-gray-600" />
        </button>
        <StarCounter />
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col items-center p-4 gap-3">
        {step === 'scanning' && (
          <>
            <div className="text-center mb-1">
              <h2 className="text-xl font-bold text-foreground">סורק את הפריט...</h2>
              <p className="text-sm text-muted-foreground">ה-AI לומד לזהות את הפריט</p>
            </div>
            <ScanAnimation imageSrc={currentImage} onComplete={handleScanComplete} duration={3000} />
            <div className="flex gap-2 mt-2">
              <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
              <div className="w-3 h-3 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              <div className="w-3 h-3 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
          </>
        )}
        {step === 'not_identified' && (
          <div className="w-full max-w-sm">
            <div className="relative rounded-2xl overflow-hidden shadow-xl mb-3">
              <img src={currentImage} alt="פריט שצולם" className="w-full max-h-[40vh] aspect-square object-cover" />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="bg-white rounded-full p-3"><AlertCircle size={36} className="text-yellow-500" /></div>
              </div>
            </div>
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-4 text-center mb-3">
              <div className="text-3xl mb-2">🤔</div>
              {notIdentifiedDescription && notIdentifiedDescription !== 'לא ברור מהתמונה' ? (
                <>
                  <h3 className="text-lg font-bold text-yellow-800 mb-1">זיהיתי {notIdentifiedDescription}</h3>
                  <p className="text-sm text-yellow-700">זה לא נראה כמו פריט פסולת. נסו לצלם פריט אחר למיון</p>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-bold text-yellow-800 mb-1">לא הצלחתי לזהות את האובייקט</h3>
                  <p className="text-sm text-yellow-700">נסו לצלם שוב מזווית אחרת</p>
                </>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={() => { setCurrentImage(null); navigate('/camera'); }}
                className="w-full flex items-center justify-center border-2 border-black-300 gap-2 bg-primary text-black font-bold py-3 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95">
                <Camera size={20} /><span>צלם שוב</span>
              </button>
              <button onClick={() => setShowManualPicker(true)}
                className="w-full flex items-center justify-center gap-2 bg-white border-2 border-gray-200 text-foreground font-medium py-3 px-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 hover:border-primary">
                <ListChecks size={20} /><span>לא מצאתי פריט? בחר קטגוריה</span>
              </button>
            </div>
          </div>
        )}
        {step === 'confirm_identification' && identifiedBin && (
          <div className="w-full max-w-sm">
            <div className="relative rounded-2xl overflow-hidden shadow-xl mb-3">
              <img src={currentImage} alt="פריט שצולם" className="w-full max-h-[38vh] aspect-square object-cover" />
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-full">
                <span className="text-xs font-medium text-primary">✅ נסרק!</span>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-lg mb-3">
              <p className="text-sm text-muted-foreground text-center mb-2">זיהיתי את הפריט:</p>
              <div className="flex items-center justify-center gap-3 p-3 rounded-xl" style={{ backgroundColor: identifiedBin.bgColor }}>
                <span className="text-3xl">{identifiedBin.icon}</span>
                <span className="text-xl font-bold" style={{ color: identifiedBin.color }}>{identifiedBin.labelHe}</span>
              </div>
            </div>
            <div className="text-center mb-3">
              <h3 className="text-lg font-bold text-foreground">האם הזיהוי נכון?</h3>
            </div>
            <div className="flex gap-3">
              <button onClick={() => handleConfirmIdentification(true)}
                className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold text-lg py-3 px-4 rounded-2xl shadow-lg transition-all duration-300 hover:scale-105 active:scale-95">
                <Check size={22} /><span>כן</span>
              </button>
              <button onClick={() => handleConfirmIdentification(false)}
                className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold text-lg py-3 px-4 rounded-2xl shadow-lg transition-all duration-300 hover:scale-105 active:scale-95">
                <X size={22} /><span>לא</span>
              </button>
            </div>
          </div>
        )}
        {step === 'select_bin' && identifiedBin && (
          <div className="w-full max-w-md">
            {isSuccess && (
              <div className="fixed inset-0 z-50 bg-green-500/90 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-7xl mb-3 animate-bounce">🎉</div>
                  <h2 className="text-2xl font-black">מעולה!</h2>
                  <p className="text-lg mt-2">עוברים לרובוט...</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-md mb-4">
              <img src={currentImage} alt="פריט" className="w-20 h-20 rounded-xl object-cover" />
              <div>
                <p className="text-sm text-muted-foreground">זוהה:</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{identifiedBin.icon}</span>
                  <span className="font-bold text-lg" style={{ color: identifiedBin.color }}>{identifiedBin.labelHe}</span>
                </div>
              </div>
            </div>
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-foreground mb-1">לאיזה פח שולחים את הפריט?</h3>
              <p className="text-sm text-muted-foreground">בחרו את צבע הפח הנכון</p>
            </div>
            {showBinError && (
              <div className="bg-red-100 border-2 border-red-300 rounded-xl p-3 mb-3 text-center">
                <p className="text-red-700 font-bold text-sm">אופס! זה לא הצבע הנכון</p>
                <p className="text-red-600 text-xs">נסו שוב</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              {WASTE_BINS.map((bin) => {
                const isSelected = selectedBinLocal === bin.category;
                const isWrong = isSelected && showBinError;
                const isCorrectAnswer = isSelected && isSuccess;
                return (
                  <button key={bin.category} onClick={() => handleBinSelect(bin.category)} disabled={isSuccess || showBinError}
                    className={`relative p-6 rounded-2xl transition-all duration-300 flex items-center justify-center border-4 ${isWrong ? 'border-red-500 bg-red-100' : ''} ${isCorrectAnswer ? 'border-green-500 bg-green-100 scale-110' : ''} ${!isSelected ? 'hover:scale-105 active:scale-95' : ''}`}
                    style={{ backgroundColor: !isWrong && !isCorrectAnswer ? bin.bgColor : undefined, borderColor: !isWrong && !isCorrectAnswer ? bin.color : undefined }}>
                    <div className="w-24 h-24 rounded-xl flex items-center justify-center" style={{ backgroundColor: bin.color }}>
                      <Trash2 size={48} className="text-white" />
                    </div>
                    {isWrong && <div className="absolute -top-2 -right-2 w-9 h-9 rounded-full bg-red-500 flex items-center justify-center"><X size={20} className="text-white" /></div>}
                    {isCorrectAnswer && <div className="absolute -top-2 -right-2 w-9 h-9 rounded-full bg-green-500 flex items-center justify-center"><Check size={20} className="text-white" /></div>}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {showManualPicker && (
        // מודאל בחירת קטגוריה ידנית - צף מעל התוכן, לא תלוי במקום בעמוד
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowManualPicker(false)}
        >
          <div
            className="bg-white rounded-3xl p-5 w-full max-w-sm shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-base font-bold text-foreground text-center mb-4">בחרו באיזו קטגוריה לתרגל:</p>
            <div className="grid grid-cols-2 gap-3">
              {WASTE_BINS.map((bin) => (
                <button
                  key={bin.category}
                  onClick={() => handleManualCategorySelect(bin.category)}
                  className="flex flex-col items-center justify-center gap-1 p-4 rounded-xl transition-all hover:scale-105 active:scale-95"
                  style={{ backgroundColor: bin.bgColor }}
                >
                  <span className="text-3xl">{bin.icon}</span>
                  <span className="text-sm font-bold" style={{ color: bin.color }}>{bin.labelHe}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowManualPicker(false)}
              className="w-full mt-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ביטול
            </button>
          </div>
        </div>
      )}

      <style>{`@keyframes shake { 0%, 100% { transform: translateX(0) rotate(0deg); } 10%, 30%, 50%, 70%, 90% { transform: translateX(-4px) rotate(-1deg); } 20%, 40%, 60%, 80% { transform: translateX(4px) rotate(1deg); } } .animate-shake { animation: shake 0.5s ease-in-out; }`}</style>
    </div>
  );
}