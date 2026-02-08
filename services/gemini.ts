
import { GoogleGenAI, Type } from "@google/genai";
import { Word } from "../types";

// Removed global initialization to ensure a fresh instance is created before each API call as per guidelines

export const extractVocabularyFromImages = async (imageUrls: string[]): Promise<Word[]> => {
  try {
    // Create instance right before making the call
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const parts = await Promise.all(imageUrls.map(async (url) => {
      const response = await fetch(url);
      const blob = await response.blob();
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
      return {
        inlineData: {
          data: base64.split(',')[1],
          mimeType: blob.type
        }
      };
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          ...parts,
          { text: "Extract all Spanish words and their Korean meanings from these vocabulary pages. Format as a JSON array of objects with keys: 'spanish', 'gender' (m, f, or null), and 'korean'. Do not include any text other than the JSON." }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              spanish: { type: Type.STRING },
              gender: { type: Type.STRING },
              korean: { type: Type.STRING }
            },
            required: ["spanish", "korean"]
          }
        }
      }
    });

    const words: Word[] = JSON.parse(response.text || '[]').map((w: any, index: number) => ({
      ...w,
      id: `w-${Date.now()}-${index}`,
      mastered: false,
      level: 0
    }));

    return words;
  } catch (error) {
    console.error("Error extracting vocabulary:", error);
    throw error;
  }
};

// Use direct environment variable as per guidelines
export const getGeminiInstance = () => new GoogleGenAI({ apiKey: process.env.API_KEY });
