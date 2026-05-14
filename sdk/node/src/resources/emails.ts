import { DropaphiConfig, DropaphiResponse, SendEmailOptions } from '../types';

export class Emails {
  constructor(private config: DropaphiConfig) {}

  async send(options: SendEmailOptions): Promise<DropaphiResponse> {
    const response = await fetch(`${this.config.baseUrl}/email/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.config.apiKey,
      },
      body: JSON.stringify(options),
    });
    return response.json();
  }
}
