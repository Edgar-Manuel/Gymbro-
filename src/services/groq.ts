/**
 * Servicio de IA usando Groq
 * Groq es una plataforma gratuita y rápida para modelos open source como Llama
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GroqResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

class GroqService {
  private apiKey: string;
  private model: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_GROQ_API_KEY || '';
    this.model = import.meta.env.VITE_GROQ_MODEL || 'llama-3.3-70b-versatile';
  }

  /**
   * Verifica si el servicio está configurado correctamente
   */
  isConfigured(): boolean {
    return this.apiKey !== '' && this.apiKey !== 'your_groq_api_key_here';
  }

  /**
   * Realiza una consulta a Groq
   */
  async chat(messages: GroqMessage[], temperature = 0.7, maxTokens = 2048): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('Groq API key no configurada. Por favor, añade tu API key en el archivo .env');
    }

    try {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature,
          max_tokens: maxTokens,
          top_p: 1,
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Groq API error: ${response.status} ${response.statusText}. ${
            errorData.error?.message || ''
          }`
        );
      }

      const data: GroqResponse = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Error en Groq Service:', error);
      throw error;
    }
  }

  /**
   * Realiza una consulta con streaming (para respuestas en tiempo real)
   */
  async *chatStream(messages: GroqMessage[], temperature = 0.7, maxTokens = 2048): AsyncGenerator<string> {
    if (!this.isConfigured()) {
      throw new Error('Groq API key no configurada. Por favor, añade tu API key en el archivo .env');
    }

    try {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature,
          max_tokens: maxTokens,
          top_p: 1,
          stream: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Groq API error: ${response.status} ${response.statusText}. ${
            errorData.error?.message || ''
          }`
        );
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No se pudo obtener el reader del stream');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content;
              if (content) {
                yield content;
              }
            } catch (e) {
              // Ignorar errores de parseo de líneas individuales
            }
          }
        }
      }
    } catch (error) {
      console.error('Error en Groq Stream:', error);
      throw error;
    }
  }
}

export const groqService = new GroqService();
