import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.SCRAPEFORGE_OPENAI_API_KEY
});

export async function parseEmailFromText(text: string): Promise<{
  email: string | null;
  confidence: number;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are an email extraction expert. Extract email addresses from text, even if they are obfuscated or formatted unusually. Look for patterns like 'email at domain dot com', spaces in emails, or other creative ways people hide emails. Respond with JSON in this format: { 'email': 'found_email@domain.com' or null, 'confidence': number_between_0_and_1 }",
        },
        {
          role: "user",
          content: `Extract any email addresses from this text: ${text}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      email: result.email,
      confidence: Math.max(0, Math.min(1, result.confidence || 0)),
    };
  } catch (error) {
    console.error("OpenAI email parsing error:", error);
    return {
      email: null,
      confidence: 0,
    };
  }
}

export async function analyzeBioForEmailHints(bioText: string): Promise<{
  hasEmailHints: boolean;
  extractedEmail: string | null;
  confidence: number;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Analyze bio text for email addresses or strong hints about how to contact someone via email. Look for patterns like 'DM for business', 'email in bio', contact information, etc. Respond with JSON: { 'hasEmailHints': boolean, 'extractedEmail': string_or_null, 'confidence': number_between_0_and_1 }",
        },
        {
          role: "user",
          content: `Analyze this bio for email contact information: ${bioText}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      hasEmailHints: !!result.hasEmailHints,
      extractedEmail: result.extractedEmail,
      confidence: Math.max(0, Math.min(1, result.confidence || 0)),
    };
  } catch (error) {
    console.error("OpenAI bio analysis error:", error);
    return {
      hasEmailHints: false,
      extractedEmail: null,
      confidence: 0,
    };
  }
}
