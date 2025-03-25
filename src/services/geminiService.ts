import { toast } from "sonner";

// Interface para os parâmetros da solicitação
interface GeminiRequestParams {
  prompt: string;
  type: 'improve' | 'generate';
}

// Interface para a solicitação de dicas
interface GeminiTipsRequestParams {
  category?: 'constraints' | 'guidelines' | 'output' | 'examples';
  count?: number;
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

    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + API_KEY, {
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

export const getGeminiTips = async ({ category, count = 3 }: GeminiTipsRequestParams): Promise<any[]> => {
  try {
    let systemPrompt = "Você é um especialista em prompts para IAs. Gere dicas úteis para melhorar prompts.";
    
    let promptText = "Gere exatamente " + count + " dicas originais e úteis para melhorar prompts de IA";
    
    if (category) {
      const categoryMap = {
        'constraints': 'restrições e limitações',
        'guidelines': 'diretrizes e abordagens',
        'output': 'formatação e estilo de saída',
        'examples': 'exemplos de conversas'
      };
      
      promptText += ` focadas em ${categoryMap[category]}`;
    }
    
    promptText += ". Retorne no formato JSON como um array de objetos, cada um com as propriedades: 'text' (o texto da dica), 'category' (uma das seguintes: 'constraints', 'guidelines', 'output', 'examples'), 'tags' (array de 2-3 palavras-chave relacionadas). NÃO inclua explicações adicionais, apenas retorne o JSON válido.";

    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + API_KEY, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: systemPrompt + "\n\n" + promptText }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.8,
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
      
      // Extrair apenas o JSON da resposta
      const jsonMatch = generatedText.match(/\[\s*\{.*\}\s*\]/s);
      if (jsonMatch) {
        try {
          const jsonStr = jsonMatch[0];
          const tips = JSON.parse(jsonStr);
          
          // Adicionar IDs e valores padrão
          return tips.map((tip: any, index: number) => ({
            id: `gemini-${Date.now()}-${index}`,
            text: tip.text,
            category: tip.category,
            tags: tip.tags || [],
            popularity: 4 + Math.random(), // Valor aleatório entre 4 e 5
            useCount: Math.floor(Math.random() * 300) + 100, // Valor aleatório entre 100 e 400
            isNew: true
          }));
        } catch (error) {
          console.error("Erro ao analisar JSON:", error);
          throw new Error("Formato de resposta inválido do Gemini");
        }
      } else {
        throw new Error("Não foi possível extrair o JSON da resposta do Gemini");
      }
    } else {
      throw new Error("Resposta inesperada da API do Gemini");
    }
  } catch (error) {
    console.error("Erro ao obter dicas do Gemini:", error);
    toast.error("Não foi possível gerar dicas. Tente novamente mais tarde.");
    return [];
  }
};
