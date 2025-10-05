/**
 * Ollama Service
 * Handles communication with the Ollama AI model server
 * Port: 2022 (updated from 2024)
 */

class OllamaService {
  constructor() {
    this.baseUrl = process.env.REACT_APP_OLLAMA_URL || 'http://localhost:2022';
    this.model = 'deepseek-r1:1.5b'; // Default model
  }

  /**
   * Generate a chat completion
   * @param {Array} messages - Array of message objects with role and content
   * @param {Object} options - Additional options
   * @returns {Promise<string>} - AI response
   */
  async chat(messages, options = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: options.model || this.model,
          messages: messages,
          stream: false,
          options: {
            temperature: options.temperature || 0.7,
            top_p: options.top_p || 0.9,
            ...options
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const data = await response.json();
      return data.message.content;
    } catch (error) {
      console.error('Ollama chat error:', error);
      throw error;
    }
  }

  /**
   * Generate a completion (non-chat mode)
   * @param {string} prompt - The prompt text
   * @param {Object} options - Additional options
   * @returns {Promise<string>} - AI response
   */
  async generate(prompt, options = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: options.model || this.model,
          prompt: prompt,
          stream: false,
          options: {
            temperature: options.temperature || 0.7,
            top_p: options.top_p || 0.9,
            ...options
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Ollama generate error:', error);
      throw error;
    }
  }

  /**
   * Stream a chat completion
   * @param {Array} messages - Array of message objects
   * @param {Function} onChunk - Callback for each chunk
   * @param {Object} options - Additional options
   */
  async streamChat(messages, onChunk, options = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: options.model || this.model,
          messages: messages,
          stream: true,
          options: {
            temperature: options.temperature || 0.7,
            top_p: options.top_p || 0.9,
            ...options
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.message && data.message.content) {
              onChunk(data.message.content);
            }
          } catch (e) {
            // Skip invalid JSON lines
          }
        }
      }
    } catch (error) {
      console.error('Ollama stream error:', error);
      throw error;
    }
  }

  /**
   * List available models
   * @returns {Promise<Array>} - List of models
   */
  async listModels() {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      
      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const data = await response.json();
      return data.models || [];
    } catch (error) {
      console.error('Ollama list models error:', error);
      throw error;
    }
  }

  /**
   * Check if Ollama is running
   * @returns {Promise<boolean>} - True if running
   */
  async isRunning() {
    try {
      const response = await fetch(`${this.baseUrl}/api/version`, {
        method: 'GET',
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get Ollama version
   * @returns {Promise<string>} - Version string
   */
  async getVersion() {
    try {
      const response = await fetch(`${this.baseUrl}/api/version`);
      
      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const data = await response.json();
      return data.version;
    } catch (error) {
      console.error('Ollama version error:', error);
      throw error;
    }
  }

  /**
   * Helper: Format messages for code assistance
   * @param {string} userMessage - User's message
   * @param {string} codeContext - Optional code context
   * @returns {Array} - Formatted messages
   */
  formatCodeAssistanceMessages(userMessage, codeContext = null) {
    const messages = [
      {
        role: 'system',
        content: 'You are Starry, an AI coding assistant integrated into Rica. You help developers write, debug, and improve code. Provide concise, accurate, and helpful responses. When suggesting code changes, use markdown code blocks with the appropriate language.'
      }
    ];

    if (codeContext) {
      messages.push({
        role: 'user',
        content: `Here is the current code context:\n\`\`\`\n${codeContext}\n\`\`\``
      });
    }

    messages.push({
      role: 'user',
      content: userMessage
    });

    return messages;
  }
}

// Export singleton instance
const ollamaService = new OllamaService();
export default ollamaService;
