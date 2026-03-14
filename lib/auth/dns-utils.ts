// lib/auth/dns-utils.ts
import dns from 'dns/promises';

export async function checkSPFRecord(domain: string): Promise<boolean> {
  try {
    const records = await dns.resolveTxt(domain);
    return records.some(record => 
      record.join('').includes('v=spf1')
    );
  } catch {
    return false;
  }
}

export async function checkDKIMRecord(domain: string): Promise<boolean> {
  try {
    const records = await dns.resolveTxt(`default._domainkey.${domain}`);
    return records.length > 0;
  } catch {
    return false;
  }
}