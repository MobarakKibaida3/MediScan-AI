
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, ScanType, Language } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeHealthData = async (
  type: ScanType,
  data: string | any, 
  isImage: boolean,
  lang: Language
): Promise<AnalysisResult> => {
  const model = 'gemini-3-flash-preview';
  
  const systemInstruction = `
    You are an expert OCR and medical information simplified assistant.
    Your goal is to extract text and simplify it for a layperson.
    
    CRITICAL RULES:
    1. STRICTLY DETECT EMERGENCIES: If keywords like "chest pain", "unconscious", "stroke", "bleeding" appear, set urgency to "EMERGENCY".
    2. LAB READER: If type is "labs", extract values, reference ranges, and simplify what the test means. Use "status" (Normal/High/Low).
    3. DOSAGE SCHEDULE: If type is "prescription", generate a suggested "dosageSchedule" (e.g., Breakfast: 8:00 AM - Drug Name).
    4. NO DIAGNOSIS: Never say "You have X". Say "Results like these are often seen in X".
    5. Always conclude with a disclaimer.
  `;

  const prompt = isImage 
    ? `Analyze this ${type} image. Perform OCR. If it's a lab result, explain values. If it's a prescription, create a daily schedule.`
    : `Analyze symptoms: ${JSON.stringify(data)}. Check for emergencies first.`;

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
                duration: { type: Type.STRING },
                notes: { type: Type.STRING }
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
              uses: { type: Type.ARRAY, items: { type: Type.STRING } },
              warnings: { type: Type.ARRAY, items: { type: Type.STRING } },
              alternatives: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          },
          symptomInsights: {
            type: Type.OBJECT,
            properties: {
              possibilities: { type: Type.ARRAY, items: { type: Type.STRING } },
              advice: { type: Type.ARRAY, items: { type: Type.STRING } },
              urgency: { type: Type.STRING }
            }
          },
          details: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: { category: { type: Type.STRING }, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
              required: ["category", "items"]
            }
          },
          warnings: { type: Type.ARRAY, items: { type: Type.STRING } },
          recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
          disclaimer: { type: Type.STRING }
        },
        required: ["title", "summary", "details", "warnings", "recommendations", "disclaimer"]
      }
    }
  });

  return JSON.parse(response.text);
};
