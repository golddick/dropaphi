import { Emails } from './resources/emails';
import { Newsletter } from './resources/newsletter';
import { Otp } from './resources/otp';
import { Files } from './resources/files';
export declare class Dropaphi {
    emails: Emails;
    newsletter: Newsletter;
    otp: Otp;
    files: Files;
    constructor(apiKey: string, baseUrl?: string);
}
export * from './types';
