"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Newsletter = void 0;
class Newsletter {
    constructor(config) {
        this.config = config;
    }
    async subscribe(options) {
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
    async listSubscribers(params = {}) {
        const query = new URLSearchParams(params).toString();
        const response = await fetch(`${this.config.baseUrl}/newsletter/subscribers?${query}`, {
            method: 'GET',
            headers: {
                'X-API-Key': this.config.apiKey,
            },
        });
        return response.json();
    }
}
exports.Newsletter = Newsletter;
