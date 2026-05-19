import { DropaphiConfig, DropaphiResponse, SendEmailOptions } from '../types';
export declare class Emails {
    private config;
    constructor(config: DropaphiConfig);
    send(options: SendEmailOptions): Promise<DropaphiResponse>;
}
