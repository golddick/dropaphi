import { DropaphiConfig, DropaphiResponse } from '../types';
export declare class Files {
    private config;
    constructor(config: DropaphiConfig);
    upload(file: any, filename?: string, metadata?: Record<string, any>): Promise<DropaphiResponse>;
    list(params?: {
        page?: number;
        limit?: number;
    }): Promise<DropaphiResponse>;
}
