import { DropaphiConfig, DropaphiResponse, SubscribeOptions } from '../types';
export declare class Newsletter {
    private config;
    constructor(config: DropaphiConfig);
    subscribe(options: SubscribeOptions): Promise<DropaphiResponse>;
    listSubscribers(params?: {
        page?: number;
        limit?: number;
        status?: string;
    }): Promise<DropaphiResponse>;
}
