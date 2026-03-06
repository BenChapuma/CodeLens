import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface CodeExplanation {
  lineByLine: {
    line: string;
    explanation: string;
  }[];
  summary: string;
}

export async function explainCode(code: string, language?: string): Promise<CodeExplanation> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Explain the following code snippet in plain English. Provide a line-by-line breakdown and a short summary.
    
    Code:
    ${code}
    
    ${language ? `Language: ${language}` : ""}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          lineByLine: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                line: { type: Type.STRING, description: "The original line of code" },
                explanation: { type: Type.STRING, description: "A plain-English explanation of what this line does" }
              },
              required: ["line", "explanation"]
            }
          },
          summary: { type: Type.STRING, description: "A high-level summary of the code snippet" }
        },
        required: ["lineByLine", "summary"]
      }
    }
  });

  try {
    return JSON.parse(response.text || "{}") as CodeExplanation;
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    throw new Error("Could not explain code. Please try again.");
  }
}
