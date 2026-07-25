import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const sanitizeJsonResponse = (text = "") => {
  return text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
};

const validateSummary = (data) => {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid AI response structure");
  }

  return {
    symptoms: Array.isArray(data.symptoms) ? data.symptoms.slice(0, 5) : [],

    notablePoints: Array.isArray(data.notablePoints)
      ? data.notablePoints.slice(0, 5)
      : [],

    possibleConcerns: Array.isArray(data.possibleConcerns)
      ? data.possibleConcerns.slice(0, 5)
      : [],
  };
};

export const summarizeSymptoms = async (patientText) => {
  if (
    !patientText ||
    typeof patientText !== "string" ||
    patientText.trim().length < 5
  ) {
    throw new Error("Invalid patient symptoms");
  }

  const trimmedText = patientText.trim().slice(0, 3000);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",

      contents: `
You are a clinical symptom summarizer used inside a telemedicine application.

The patient may describe symptoms in any language.
Understand the meaning and always output the summary in English.


ROLE:
Convert patient-described symptoms into a structured summary for a doctor.


IMPORTANT SAFETY RULES:

- You are only summarizing patient information.
- You are NOT diagnosing.
- Do NOT mention diseases.
- Do NOT suggest medicines or treatment.
- Do NOT assume missing information.
- Do NOT add information not provided by the patient.


OUTPUT RULES:

- Return ONLY valid JSON.
- No markdown.
- No code blocks.
- No explanation text.
- Maximum 5 items in every array.
- If information is unavailable, return an empty array [].



JSON FORMAT:

{
  "symptoms": [],
  "notablePoints": [],
  "possibleConcerns": []
}



SECTION DEFINITIONS:


symptoms:
- Directly reported complaints from the patient.
- Include duration, frequency, or severity only when mentioned.
- Do not add interpretation.


notablePoints:
- Important patterns from the patient's description.
- Include timing, triggers, worsening factors, or unusual observations.
- Do not infer causes.


possibleConcerns:
- Broad clinical areas that may need attention.
- Use general wording only.
- No disease names.
- No diagnosis.
- No definitive claims.



PATIENT TEXT:

<<<
${trimmedText}
>>>

`,

      generationConfig: {
        temperature: 0.1,

        topP: 0.8,

        responseMimeType: "application/json",
      },
    });

    if (!response?.text) {
      throw new Error("Empty AI response");
    }

    const cleanedResponse = sanitizeJsonResponse(response.text);

    const parsedResponse = JSON.parse(cleanedResponse);

    return validateSummary(parsedResponse);
  } catch (error) {
    console.error("Symptom summarization failed:", error.message);

    throw new Error("Symptom summarization service failed");
  }
};
