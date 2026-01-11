/**
 * OpenAI Configuration
 */

export const OPENAI_CONFIG = {
  apiKey: process.env.OPENAI_API_KEY || "",
  model: process.env.OPENAI_MODEL || "gpt-4o-mini",
};

/**
 * Validate OpenAI configuration
 */
export function validateOpenAIConfig(): void {
  if (!OPENAI_CONFIG.apiKey) {
    console.warn(
      "⚠️  OPENAI_API_KEY no está configurada. El asistente no funcionará."
    );
  } else {
    console.log(`✅ OpenAI configurado con modelo: ${OPENAI_CONFIG.model}`);
  }
}
