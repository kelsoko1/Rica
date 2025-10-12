class ActivepiecesService {
  constructor(apiKey) {
    this.apiKey = apiKey || process.env.REACT_APP_ACTIVEPIECES_API_KEY;
    this.baseUrl = 'https://cloud.activepieces.com/api/v1';
  }

  async listWorkflows() {
    const response = await fetch(`${this.baseUrl}/workflows`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to list workflows');
    }

    return response.json();
  }

  async runWorkflow(workflowId, inputs) {
    const response = await fetch(`${this.baseUrl}/workflows/${workflowId}/runs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({ inputs })
    });

    if (!response.ok) {
      throw new Error('Failed to run workflow');
    }

    return response.json();
  }
}

export default new ActivepiecesService();
