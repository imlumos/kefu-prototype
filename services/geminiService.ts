
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface AnalysisResult {
  conclusion: string;
  summary: string;
}

export const analyzeTranscript = async (content: string, keywords: string[]): Promise<AnalysisResult> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a professional customer service quality inspector. 
      Analyze the following transcript. 
      Keywords detected by the system: ${keywords.join(', ')}.
      
      Please provide:
      1. A professional conclusion on the quality of service (Professionalism, adherence to rules, issues).
      2. A concise summary of the conversation content.
      
      Transcript: "${content}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            conclusion: {
              type: Type.STRING,
              description: "The AI's verdict on the service quality.",
            },
            summary: {
              type: Type.STRING,
              description: "A brief summary of what happened in the call.",
            },
          },
          required: ["conclusion", "summary"],
        },
      },
    });

    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      conclusion: "获取 AI 结论失败。",
      summary: "获取内容总结失败。",
    };
  }
};
