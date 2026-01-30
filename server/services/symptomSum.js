import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const summarizeSymptoms = async (patientText) => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `
You are a clinical symptom summarizer used in a telemedicine app.

The patient may write in any language.
Always understand it and output in English.

GOAL:
Convert patient text into a short, precise clinical summary for doctors.

STRICT RULES:
- Output ONLY valid JSON (no markdown, no extra text)
- No diagnosis or disease names
- No treatment suggestions
- Use neutral clinical wording
- Be factual, not interpretive
- Max 5 items per list
- If info is missing, do NOT guess
- If a section has nothing, return empty array []

JSON FORMAT:

{
  "symptoms": [],
  "notablePoints": [],
  "possibleConcerns": []
}

SECTION DEFINITIONS:

symptoms:
- Directly reported complaints
- Include duration/severity if mentioned

notablePoints:
- Unusual patterns
- Triggers, timing, or worsening factors

possibleConcerns:
- General clinical concerns only
- No disease names
- No definitive claims

PATIENT TEXT:
<<<
${patientText}
>>>
`,
    generationConfig: {
      temperature: 0.2,
      topP: 0.8,
    },
  });
  try {
    return JSON.parse(response.text.trim());
  } catch (err) {
    console.error("AI returned invalid JSON:", response.text);
    throw new Error("AI formatting error");
  }
};
