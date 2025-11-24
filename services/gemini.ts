import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateContentMetadata = async (title: string, type: string) => {
  if (!process.env.API_KEY) {
    console.warn("No API KEY provided");
    return null;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate metadata for the ${type} titled "${title}". 
      Provide a JSON response with:
      - synopsis (string, max 50 words)
      - cast (array of strings, top 3 actors)
      - genres (array of strings)
      - rating (string, e.g. '8.5')
      - releaseYear (string)
      - estimatedEpisodes (number, 0 if movie)
      
      Make it sound professional for a streaming service.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            synopsis: { type: Type.STRING },
            cast: { type: Type.ARRAY, items: { type: Type.STRING } },
            genres: { type: Type.ARRAY, items: { type: Type.STRING } },
            rating: { type: Type.STRING },
            releaseYear: { type: Type.STRING },
            estimatedEpisodes: { type: Type.NUMBER },
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return null;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
};