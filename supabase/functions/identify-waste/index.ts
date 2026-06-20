// supabase/functions/identify-waste/index.ts
//
// פונקציית Edge ב-Supabase שמקבלת תמונה (base64), שולחת אותה ל-Claude (Anthropic API)
// ומחזירה קטגוריית פסולת: plastic | paper | glass | organic, או null אם לא זוהה בבטחה.
//
// המפתח הסודי (ANTHROPIC_API_KEY) חי רק כאן בשרת - לעולם לא מגיע לדפדפן.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
const ANTHROPIC_VERSION = "2023-06-01";
const MODEL = "claude-sonnet-4-6";

// CORS - מאפשר לאפליקציית ה-React (מכל דומיין) לקרוא לפונקציה הזו
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type WasteCategory = "plastic" | "paper" | "glass" | "organic";
const VALID_CATEGORIES: WasteCategory[] = ["plastic", "paper", "glass", "organic"];

Deno.serve(async (req: Request) => {
  // בקשת preflight של הדפדפן
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ error: "ANTHROPIC_API_KEY not configured on server" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { imageBase64, mediaType } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "imageBase64 is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // הנחיה ל-Claude: לסווג בדיוק לאחת מ-4 הקטגוריות, או null אם לא בטוח, ותמיד לתאר מה נראה בתמונה
    const systemPrompt = `אתה עוזר לאפליקציה חינוכית למיון אשפה לילדים. תפקידך לזהות את הפריט בתמונה ולמיין אותו לאחת מהקטגוריות הבאות בלבד:
- plastic (בקבוקי פלסטיק, אריזות פלסטיק, שקיות פלסטיק)
- paper (נייר, קרטון, עיתונים)
- glass (בקבוקי זכוכית, צנצנות זכוכית)
- organic (שאריות מזון, קליפות פירות וירקות, עלים)

החזר תשובה בפורמט JSON בלבד, ללא טקסט נוסף, בדיוק במבנה הזה:
{"category": "plastic" | "paper" | "glass" | "organic" | null, "confidence": "high" | "medium" | "low", "itemDescription": "string"}

itemDescription: תיאור קצר בעברית (2-4 מילים) של מה שאתה רואה בתמונה, גם אם זה לא שייך לאף קטגוריה. לדוגמה: "עציץ עם צמח", "בקבוק מים", "כלב", "שולחן עץ".

אם הפריט לא שייך לאף אחת מ-4 הקטגוריות (כלומר זה לא פסולת לדוגמה: צמח, בעל חיים, רהיט, אדם), החזר category: null אך עדיין תאר מה ראית ב-itemDescription.
אם אינך בטוח כלל מה אתה רואה בתמונה (תמונה מטושטשת, חשוכה, או לא ברורה), החזר category: null ו-itemDescription: "לא ברור מהתמונה".`;

    const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 200,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: mediaType || "image/jpeg",
                  data: imageBase64,
                },
              },
              {
                type: "text",
                text: "מהי קטגוריית הפסולת של הפריט בתמונה? החזר JSON בלבד.",
              },
            ],
          },
        ],
      }),
    });

    if (!anthropicResponse.ok) {
      const errText = await anthropicResponse.text();
      console.error("Anthropic API error:", errText);
      return new Response(
        JSON.stringify({ error: "Anthropic API request failed", details: errText }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await anthropicResponse.json();
    const textBlock = data.content?.find((block: any) => block.type === "text");
    const rawText = textBlock?.text?.trim() ?? "";

    // מנקה גדרות markdown (```json ... ```) למקרה ש-Claude מוסיף אותן בכל זאת
    const cleanText = rawText.replace(/```json|```/g, "").trim();
    console.log("Claude raw response:", rawText);

    let parsed: { category: WasteCategory | null; confidence?: string; itemDescription?: string };
    try {
      parsed = JSON.parse(cleanText);
    } catch {
      console.error("Failed to parse Claude response as JSON:", rawText);
      return new Response(
        JSON.stringify({ category: null, confidence: "low", itemDescription: null }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ולידציה - מוודאים שהקטגוריה שחזרה היא אחת מ-4 הקטגוריות החוקיות
    const category = VALID_CATEGORIES.includes(parsed.category as WasteCategory)
      ? parsed.category
      : null;

    return new Response(
      JSON.stringify({
        category,
        confidence: parsed.confidence ?? "medium",
        itemDescription: parsed.itemDescription ?? null,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error", details: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});