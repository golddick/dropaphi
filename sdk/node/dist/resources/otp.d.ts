import { DropaphiConfig, DropaphiResponse, SendOTPOptions, VerifyOTPOptions } from '../types';
export declare class Otp {
    private config;
    constructor(config: DropaphiConfig);
    send(options: SendOTPOptions): Promise<DropaphiResponse>;
    verify(options: VerifyOTPOptions): Promise<DropaphiResponse>;
}
