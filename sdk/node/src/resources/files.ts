import { DropaphiConfig, DropaphiResponse } from '../types';

export class Files {
  constructor(private config: DropaphiConfig) {}

  async upload(file: any, filename?: string, metadata?: Record<string, any>): Promise<DropaphiResponse> {
    const formData = new FormData();
    formData.append('file', file, filename);
    
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }

    const response = await fetch(`${this.config.baseUrl}/files/upload`, {
      method: 'POST',
      headers: {
        'X-API-Key': this.config.apiKey,
        // FormData sets content-type automatically with boundary
      },
      body: formData,
    });
    return response.json();
  }

  async list(params: { page?: number; limit?: number } = {}): Promise<DropaphiResponse> {
    const query = new URLSearchParams(params as any).toString();
    const response = await fetch(`${this.config.baseUrl}/files?${query}`, {
      method: 'GET',
      headers: {
        'X-API-Key': this.config.apiKey,
      },
    });
    return response.json();
  }
}
