import { headers } from 'next/headers';

export async function getSubdomain(): Promise<string | null> {
  const headersList = await headers();
  const host = headersList.get('host') || '';
  
  // Remove port if present (for local development)
  const hostname = host.split(':')[0];
  
  // For local development, check for localhost patterns
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return null;
  }
  
  // Extract subdomain from hostname
  // Example: john-smith.tektonstable.com -> john-smith
  const parts = hostname.split('.');
  
  // If it's the main domain (tektonstable.com), return null
  if (parts.length <= 2) {
    return null;
  }
  
  // Return the subdomain (first part)
  return parts[0];
}

export function isMainDomain(subdomain: string | null): boolean {
  return subdomain === null || subdomain === 'www' || subdomain === 'app';
}
