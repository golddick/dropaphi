"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Files = void 0;
class Files {
    constructor(config) {
        this.config = config;
    }
    async upload(file, filename, metadata) {
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
    async list(params = {}) {
        const query = new URLSearchParams(params).toString();
        const response = await fetch(`${this.config.baseUrl}/files?${query}`, {
            method: 'GET',
            headers: {
                'X-API-Key': this.config.apiKey,
            },
        });
        return response.json();
    }
}
exports.Files = Files;
