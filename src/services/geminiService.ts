
import { toast } from "sonner";

// Interface para os parâmetros da solicitação
interface GeminiRequestParams {
  prompt: string;
  type: 'improve' | 'generate';
}

// Interface para a resposta
interface GeminiResponse {
  text: string;
}

const API_KEY = "AIzaSyCb02UOLsV2yiZNq9FK-zZcIdp9KCn91AA"; // Substitua por seu próprio API_KEY ao usar

export const getGeminiSuggestion = async ({ prompt, type }: GeminiRequestParams): Promise<string> => {
  try {
    // Preparar o prompt baseado no tipo da solicitação
    let systemPrompt = "";
    
    if (type === 'improve') {
      systemPrompt = "Você é um especialista em prompts para IAs. Melhore o seguinte prompt de sistema, mantendo a mesma estrutura e em português. Adicione nuances, detalhes e clareza:";
    } else {
      systemPrompt = "Você é um especialista em prompts para IAs. Com base nos campos fornecidos, crie um prompt de sistema completo e bem estruturado em português:";
    }

    const response = await fetch("https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=" + API_KEY, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: systemPrompt + "\n\n" + prompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Erro na API do Gemini: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const generatedText = data.candidates[0].content.parts[0].text;
      return generatedText;
    } else {
      throw new Error("Resposta inesperada da API do Gemini");
    }
  } catch (error) {
    console.error("Erro ao obter sugestão do Gemini:", error);
    toast.error("Não foi possível gerar a sugestão. Tente novamente mais tarde.");
    return "";
  }
};
