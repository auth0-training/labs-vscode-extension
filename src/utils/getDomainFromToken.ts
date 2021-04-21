import * as vscode from 'vscode';
import { parseAccessToken } from './parseAccessToken';

export function getDomainFromToken(accessToken: string): string {
  const data = parseAccessToken(accessToken);
  let domain = null;

  for (const aud of data.aud) {
    if (aud.endsWith('/api/v2/')) {
      const audUrl = vscode.Uri.parse(aud);
      domain = audUrl.authority;
      break;
    }
  }

  if (!domain) {
    throw new Error('Audience not found');
  }

  return domain;
}
