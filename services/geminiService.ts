
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface QAItemScore {
  name: string;
  is_passed: boolean;
  description: string;
  is_critical: boolean;
}

export interface AnalysisResult {
  conclusion_summary: string;
  summary: string;
  scores: QAItemScore[];
}

export const analyzeTranscript = async (content: string, keywords: string[]): Promise<AnalysisResult> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a professional customer service quality inspector. 
      Analyze the following transcript. 
      Keywords detected by the system: ${keywords.join(', ')}.
      
      Please provide:
      1. A professional summary of the conversation.
      2. A general conclusion on the service.
      3. A detailed breakdown of scoring items based on common QA standards (Opening, Attitude, Problem Solving, Conclusion).
      
      For each scoring item, determine if it passed, give a brief reason why, and note if it is a critical requirement.
      
      Transcript: "${content}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            conclusion_summary: {
              type: Type.STRING,
              description: "General verdict summary.",
            },
            summary: {
              type: Type.STRING,
              description: "A brief summary of what happened.",
            },
            scores: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "Item name, e.g., 'Opening Greeting'" },
                  is_passed: { type: Type.BOOLEAN, description: "Whether the item passed." },
                  description: { type: Type.STRING, description: "Short explanation for the result." },
                  is_critical: { type: Type.BOOLEAN, description: "Whether it's a critical item." }
                },
                required: ["name", "is_passed", "description", "is_critical"]
              }
            }
          },
          required: ["conclusion_summary", "summary", "scores"],
        },
      },
    });

    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      conclusion_summary: "获取 AI 结论失败。",
      summary: "获取内容总结失败。",
      scores: []
    };
  }
};
