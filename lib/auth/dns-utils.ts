// lib/auth/dns-utils.ts
import 'server-only';
import dns from 'dns/promises';

/**
 * Robust DNS verification utility for Email Sender verification.
 */

export interface VerificationResult {
  valid: boolean;
  foundValue?: string;
  error?: string;
}

/**
 * Verifies the SPF record for a domain.
 * @param domain The domain to check.
 * @param expectedValue Optional value to match exactly or include.
 */
export async function checkSPFRecord(domain: string, expectedValue?: string): Promise<VerificationResult> {
  try {
    const records = await dns.resolveTxt(domain);
    const spfRecord = records.find(record => record.join('').includes('v=spf1'));
    
    if (!spfRecord) return { valid: false, error: 'SPF record not found' };
    
    const value = spfRecord.join('');
    if (expectedValue) {
      // Check if it includes our specific SPF directive
      const isValid = value.includes(expectedValue);
      return { valid: isValid, foundValue: value };
    }
    
    return { valid: true, foundValue: value };
  } catch (error: any) {
    return { valid: false, error: error.message };
  }
}

/**
 * Verifies the DKIM record for a domain.
 * @param domain The domain to check.
 * @param selector The DKIM selector (default is 'default').
 * @param expectedValue Optional exact value to match (usually the public key).
 */
export async function checkDKIMRecord(domain: string, selector: string = 'dropaphi', expectedValue?: string): Promise<VerificationResult> {
  try {
    // If we use CNAME for DKIM, we should check for CNAME record
    const host = `${selector}._domainkey.${domain}`;
    
    try {
      const cnameRecords = await dns.resolveCname(host);
      if (cnameRecords.length > 0) {
        const value = cnameRecords[0];
        if (expectedValue) {
          return { valid: value === expectedValue, foundValue: value };
        }
        return { valid: true, foundValue: value };
      }
    } catch (e) {
      // Not a CNAME, maybe it's a TXT record
    }

    const records = await dns.resolveTxt(host);
    if (records.length === 0) return { valid: false, error: 'DKIM record not found' };
    
    const value = records[0].join('');
    if (expectedValue) {
      // Clean up whitespace/newlines for comparison
      const cleanFound = value.replace(/\s/g, '');
      const cleanExpected = expectedValue.replace(/\s/g, '');
      const isValid = cleanFound.includes(cleanExpected);
      return { valid: isValid, foundValue: value };
    }
    
    return { valid: value.includes('v=DKIM1'), foundValue: value };
  } catch (error: any) {
    return { valid: false, error: error.message };
  }
}

/**
 * Verifies the DMARC record for a domain.
 * @param domain The domain to check.
 */
export async function checkDMARCRecord(domain: string): Promise<VerificationResult> {
  try {
    const records = await dns.resolveTxt(`_dmarc.${domain}`);
    const dmarcRecord = records.find(record => record.join('').includes('v=DMARC1'));
    
    if (!dmarcRecord) return { valid: false, error: 'DMARC record not found' };
    
    const value = dmarcRecord.join('');
    return { valid: true, foundValue: value };
  } catch (error: any) {
    return { valid: false, error: error.message };
  }
}

/**
 * Generates the expected DNS records for a user to add.
 * In a real app, 'dropaphi.xyz' and the DKIM public key should come from config.
 */
export function generateDNSRecords(domain: string) {
  const dkimSelector = 'dropaphi';
  const dkimPublicKey = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...'; // This should be your real public key

  return [
    {
      type: 'TXT',
      host: '@',
      value: 'v=spf1 include:_spf.dropaphi.xyz ~all',
      description: 'SPF Record',
      status_key: 'spf'
    },
    {
      type: 'CNAME',
      host: `dropaphi._domainkey`,
      value: `dkim.dropaphi.xyz`,
      description: 'DKIM Record (CNAME)',
      status_key: 'dkim'
    },
    {
      type: 'TXT',
      host: '_dmarc',
      value: `v=DMARC1; p=none; rua=mailto:dmarc-reports@${domain}`,
      description: 'DMARC Record',
      status_key: 'dmarc'
    }
  ];
}