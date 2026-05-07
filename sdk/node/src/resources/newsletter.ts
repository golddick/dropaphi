import { DropaphiConfig, DropaphiResponse, SubscribeOptions } from '../types';

export class Newsletter {
  constructor(private config: DropaphiConfig) {}

  async subscribe(options: SubscribeOptions): Promise<DropaphiResponse> {
    const response = await fetch(`${this.config.baseUrl}/newsletter/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.config.apiKey,
      },
      body: JSON.stringify(options),
    });
    return response.json();
  }

  async listSubscribers(params: { page?: number; limit?: number; status?: string } = {}): Promise<DropaphiResponse> {
    const query = new URLSearchParams(params as any).toString();
    const response = await fetch(`${this.config.baseUrl}/newsletter/subscribers?${query}`, {
      method: 'GET',
      headers: {
        'X-API-Key': this.config.apiKey,
      },
    });
    return response.json();
  }
}
