class VircadiaService {
  constructor(apiKey) {
    this.apiKey = apiKey || process.env.REACT_APP_VIRCADIA_API_KEY;
    this.baseUrl = 'https://api.vircadia.com/v2';
  }

  async sendCommand(command, params = {}) {
    const response = await fetch(`${this.baseUrl}/commands/${command}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      throw new Error('Vircadia command failed');
    }

    return response.json();
  }
}

export default new VircadiaService();
