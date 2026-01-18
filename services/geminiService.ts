
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, ScanType, Language } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeHealthData = async (
  type: ScanType,
  data: string | any, 
  isImage: boolean,
  lang: Language,
  context?: string
): Promise<AnalysisResult> => {
  const model = 'gemini-3-flash-preview';
  
  const systemInstruction = `
    You are MediScan AI, a world-class clinical intelligence system.
    Goal: High-precision OCR for medical documents and safety-first analysis.
    
    PATIENT CONTEXT: ${context || 'General'}
    
    CORE PROTOCOLS:
    1. OCR: Extract drug names, strengths (e.g. 500mg), and precise dosage instructions.
    2. INTERACTION CHECK: If multiple drugs are detected, check for harmful interactions.
    3. DUPLICATION CHECK: Alert if two drugs have the same active ingredient.
    4. EMERGENCY FILTER: If symptoms/labs indicate a life-threatening state, set symptomInsights.urgency to "EMERGENCY".
    5. GENERICS: List common alternative brand names for the same active ingredient.
    
    RESPONSE RULES:
    - Never give a final diagnosis. Always use cautious language.
    - If OCR is unclear, add a warning about potential misreading.
    - OUTPUT MUST BE IN ${lang === 'ar' ? 'Arabic' : 'English'}.
  `;

  let prompt = "";
  if (isImage) {
    prompt = `Analyze this ${type} document image. Perform precision OCR. Highlight dosages, generic names, and any safety warnings.`;
  } else {
    prompt = `Patient query for ${type}: ${JSON.stringify(data)}. Focus on immediate safety steps and clinical clarity.`;
  }

  const response = await ai.models.generateContent({
    model,
    contents: isImage 
      ? [{ parts: [{ inlineData: { mimeType: 'image/jpeg', data } }, { text: prompt }] }]
      : [{ parts: [{ text: prompt }] }],
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          summary: { type: Type.STRING },
          prescriptionData: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                dosage: { type: Type.STRING },
                frequency: { type: Type.STRING },
                duration: { type: Type.STRING }
              }
            }
          },
          dosageSchedule: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                time: { type: Type.STRING },
                medicine: { type: Type.STRING },
                instruction: { type: Type.STRING }
              }
            }
          },
          labAnalysis: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                testName: { type: Type.STRING },
                value: { type: Type.STRING },
                referenceRange: { type: Type.STRING },
                status: { type: Type.STRING },
                simplifiedExplanation: { type: Type.STRING }
              }
            }
          },
          medicationInfo: {
            type: Type.OBJECT,
            properties: {
              brandName: { type: Type.STRING },
              activeIngredient: { type: Type.STRING },
              alternatives: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          },
          symptomInsights: {
            type: Type.OBJECT,
            properties: {
              urgency: { type: Type.STRING },
              advice: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          },
          warnings: { type: Type.ARRAY, items: { type: Type.STRING } },
          recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
          disclaimer: { type: Type.STRING }
        },
        required: ["title", "summary", "warnings", "recommendations", "disclaimer"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
};
