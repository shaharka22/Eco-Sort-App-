// src/lib/identifyWaste.ts
//
// פונקציית עזר ב-React שקוראת ל-Edge Function ב-Supabase כדי לזהות קטגוריית פסולת מתמונה.
// לא צריך מפתח API כאן בכלל - המפתח חי רק בצד השרת.

import { supabase } from '@/supabaseClient';
import type { WasteCategory } from '@/types';

export interface IdentifyWasteResult {
  category: WasteCategory | null;
  confidence: 'high' | 'medium' | 'low';
}

/**
 * שולח תמונה (data URL כמו שיוצא מ-canvas.toDataURL) ל-Edge Function לזיהוי.
 * מחזיר category=null אם הזיהוי נכשל או שה-AI לא היה בטוח.
 */
export async function identifyWaste(imageDataUrl: string): Promise<IdentifyWasteResult> {
  try {
    // imageDataUrl נראה כך: "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
    // צריך להפריד את ה-media type מה-base64 הנקי
    const match = imageDataUrl.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!match) {
      console.error('identifyWaste: unexpected image data URL format');
      return { category: null, confidence: 'low' };
    }
    const [, mediaType, imageBase64] = match;

    const { data, error } = await supabase.functions.invoke('identify-waste', {
      body: { imageBase64, mediaType },
    });

    if (error) {
      console.error('identifyWaste: edge function error', error);
      return { category: null, confidence: 'low' };
    }

    return {
      category: data?.category ?? null,
      confidence: data?.confidence ?? 'low',
    };
  } catch (err) {
    console.error('identifyWaste: unexpected error', err);
    return { category: null, confidence: 'low' };
  }
}