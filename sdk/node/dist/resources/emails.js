"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Emails = void 0;
class Emails {
    constructor(config) {
        this.config = config;
    }
    async send(options) {
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
exports.Emails = Emails;
