import { DropaphiConfig, DropaphiResponse, SendOTPOptions, VerifyOTPOptions } from '../types';

export class Otp {
  constructor(private config: DropaphiConfig) {}

  async send(options: SendOTPOptions): Promise<DropaphiResponse> {
    const response = await fetch(`${this.config.baseUrl}/otp/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.config.apiKey,
      },
      body: JSON.stringify(options),
    });
    return response.json();
  }

  async verify(options: VerifyOTPOptions): Promise<DropaphiResponse> {
    const response = await fetch(`${this.config.baseUrl}/otp/verify`, {
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
