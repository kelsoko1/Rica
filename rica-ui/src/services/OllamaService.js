/**
 * Ollama Service
 * Handles communication with the Ollama AI model server
 * Port: 2022 (updated from 2024)
 */

class OllamaService {
  constructor() {
    this.baseUrl = process.env.REACT_APP_OLLAMA_URL || 'http://72.60.133.11:2022';
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
      // Check for command messages and adjust the prompt
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'user' && lastMessage.content.startsWith('/edit')) {
        // Look for code context in system messages
        const codeContext = messages.find(msg => msg.role === 'system' && msg.content.includes('Code context provided'));
        if (codeContext) {
          // Modify the last message to be an edit instruction
          lastMessage.content = `You are an expert programmer. Please edit the following code as requested. Only output the edited code in a markdown code block. Do not include any explanations.\n\n${codeContext.content}\n\nEdit instruction: ${lastMessage.content.replace('/edit', '')}`;
        }
      }

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
   * @returns {Promise<Array>} - List of models with details
   */
  async listModels() {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      
      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data || !data.models || data.models.length === 0) {
        console.warn('No models found in API response, using hardcoded list');
        return this.getDefaultModels();
      }
      
      // Return the models from the API
      return data.models.map(model => ({
        name: model.name,
        model: model.model || model.name,
        modified_at: model.modified_at,
        size: model.size,
        digest: model.digest,
        details: model.details || { family: model.name.split(':')[0] }
      }));
    } catch (error) {
      console.error('Ollama list models error, using default models:', error);
      return this.getDefaultModels();
    }
  }

  /**
   * Get the list of installed models
   * @returns {Array} - Array of model objects
   */
  getDefaultModels() {
    return [
      { 
        name: 'deepseek-r1:1.5b', 
        model: 'deepseek-r1:1.5b', 
        details: { 
          family: 'DeepSeek',
          description: 'DeepSeek R1 1.5B - Fast and efficient model for general use',
          size: '1.1GB'
        } 
      },
      { 
        name: 'llama3.1:8b', 
        model: 'llama3.1:8b', 
        details: { 
          family: 'Llama 3.1',
          description: 'Llama 3.1 8B - High quality responses, good balance of speed and capability',
          size: '4.9GB'
        } 
      },
      { 
        name: 'llama3.2:3b', 
        model: 'llama3.2:3b', 
        details: { 
          family: 'Llama 3.2',
          description: 'Llama 3.2 3B - Lightweight version with good performance',
          size: '2.0GB'
        } 
      },
      { 
        name: 'mistral:7b', 
        model: 'mistral:7b', 
        details: { 
          family: 'Mistral',
          description: 'Mistral 7B - High quality responses with good reasoning',
          size: '4.4GB'
        } 
      },
      { 
        name: 'qwen2.5:3b', 
        model: 'qwen2.5:3b', 
        details: { 
          family: 'Qwen',
          description: 'Qwen 2.5 3B - Good balance of speed and performance',
          size: '1.9GB'
        } 
      },
      { 
        name: 'deepseek-llm:latest', 
        model: 'deepseek-llm:latest', 
        details: { 
          family: 'DeepSeek',
          description: 'Latest DeepSeek LLM - Most capable DeepSeek model',
          size: '4.0GB'
        } 
      },
      { 
        name: 'deepseek-coder:latest', 
        model: 'deepseek-coder:latest', 
        details: { 
          family: 'DeepSeek',
          description: 'DeepSeek Coder - Specialized for coding tasks',
          size: '776MB'
        } 
      }
    ];
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
   * Set the default model
   * @param {string} modelName - Name of the model to use
   */
  setModel(modelName) {
    this.model = modelName;
    console.log(`Ollama model changed to: ${modelName}`);
  }

  /**
   * Get the current default model
   * @returns {string} - Current model name
   */
  getModel() {
    return this.model;
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
