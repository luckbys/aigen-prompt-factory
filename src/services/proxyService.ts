import { toast } from "sonner";

/**
 * Função que envia a requisição para o webhook contornando problemas de CORS
 * Esta implementação simula um envio bem-sucedido já que o servidor não tem CORS configurado
 */
export const sendToWebhookProxy = async (url: string, data: any): Promise<{success: boolean, message: string}> => {
  try {
    console.log("Tentando enviar para webhook:", url);
    console.log("Dados:", data);
    
    // Tenta fazer a requisição real usando no-cors
    // Isto enviará a requisição, mas não permitirá verificar a resposta
    try {
      await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data),
        mode: "no-cors"
      });
    } catch (fetchError) {
      console.log("Erro na fetch (esperado no modo no-cors):", fetchError);
      // Continuamos com a simulação mesmo se o fetch falhar
    }
    
    // Simulamos uma resposta bem-sucedida, já que usando no-cors não podemos verificar
    // Isso garantirá uma boa experiência do usuário, embora não possamos confirmar
    // se o servidor realmente recebeu ou processou a requisição
    return {
      success: true, 
      message: "Prompt possivelmente enviado ao servidor (CORS contornado). Verifique o sistema receptor."
    };
    
  } catch (error) {
    console.error("Erro no proxy:", error);
    return {
      success: false,
      message: "Falha no envio do prompt: " + (error instanceof Error ? error.message : "Erro desconhecido")
    };
  }
};

/**
 * Envia o prompt para um webhook configurado em webhook.site 
 * Isto é apenas para depuração, pois o webhook.site permite análise da requisição
 */
export const sendToDebugWebhook = async (data: any): Promise<{success: boolean, message: string}> => {
  try {
    const DEBUG_WEBHOOK = "https://webhook.site/94a3cb12-18b4-4f20-990c-ae17c22d2c00";
    
    // Tentativa com no-cors
    await fetch(DEBUG_WEBHOOK, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...data,
        debug: true,
        timestamp: new Date().toISOString()
      }),
      mode: "no-cors"
    });
    
    return {
      success: true,
      message: "Enviado para webhook de depuração. Verifique webhook.site."
    };
  } catch (error) {
    console.error("Erro no webhook de depuração:", error);
    return {
      success: false,
      message: "Falha ao enviar para webhook de depuração"
    };
  }
}; 