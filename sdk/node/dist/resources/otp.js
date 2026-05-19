"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Otp = void 0;
class Otp {
    constructor(config) {
        this.config = config;
    }
    async send(options) {
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
    async verify(options) {
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
exports.Otp = Otp;
