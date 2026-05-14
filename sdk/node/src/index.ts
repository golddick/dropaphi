import { Emails } from './resources/emails';
import { Newsletter } from './resources/newsletter';
import { Otp } from './resources/otp';
import { Files } from './resources/files';
import { DropaphiConfig } from './types';

export class Dropaphi {
  public emails: Emails;
  public newsletter: Newsletter;
  public otp: Otp;
  public files: Files;

  constructor(apiKey: string, baseUrl: string = 'https://dropaphi.xyz/api/v1') {
    const config: DropaphiConfig = { apiKey, baseUrl };
    
    this.emails = new Emails(config);
    this.newsletter = new Newsletter(config);
    this.otp = new Otp(config);
    this.files = new Files(config);
  }
}

export * from './types';
