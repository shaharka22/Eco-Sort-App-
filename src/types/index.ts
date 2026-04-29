export type UserLevel = 'kindergarten' | 'elementary' | 'teacher';

export type WasteCategory = 'plastic' | 'paper' | 'glass' | 'organic';

export interface WasteBin {
  category: WasteCategory;
  color: string;
  bgColor: string;
  icon: string;
  labelHe: string;
}

export const WASTE_BINS: WasteBin[] = [
  { category: 'plastic', color: '#F97316', bgColor: '#FED7AA', icon: '🧴', labelHe: 'פלסטיק' },
  { category: 'paper', color: '#3B82F6', bgColor: '#BFDBFE', icon: '📄', labelHe: 'נייר' },
  { category: 'glass', color: '#8B5CF6', bgColor: '#DDD6FE', icon: '🫙', labelHe: 'זכוכית' },
  { category: 'organic', color: '#92400E', bgColor: '#FDE68A', icon: '🍎', labelHe: 'אורגני' },
];

export const MOTIVATION_MESSAGES: Record<WasteCategory, string> = {
  paper: 'מחזור נייר עוזר לשמור על היערות והטבע',
  plastic: 'מחזור פלסטיק מפחית זיהום ושומר על הסביבה',
  glass: 'מחזור זכוכית חוסך אנרגיה ושומר על כדור הארץ',
  organic: 'הפרדת פסולת אורגנית מאפשרת יצירת קומפוסט ושמירה על הסביבה',
};

export interface SortingSession {
  identifiedCategory: WasteCategory | null;
  identificationConfirmed: boolean;
  selectedBinCategory: WasteCategory | null;
  binSelectionCorrect: boolean;
  robotTargetBin: WasteCategory | null;
  robotActionCompleted: boolean;
  isFullSuccess: boolean;
}

export interface SortingResult {
  category: WasteCategory;
  timestamp: Date;
  success: boolean;
}

export interface SessionStats {
  totalItems: number;
  successfulSorts: number;
  plasticCount: number;
  paperCount: number;
  glassCount: number;
  organicCount: number;
}
