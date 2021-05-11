import { ManagementClient } from 'auth0';
import { getDomainFromToken } from '../utils';
import type { TokenSet } from 'openid-client';
import { Auth } from '../auth';

let managementClient: ManagementClient;
let tokenSet: TokenSet;

export async function getClient(): Promise<ManagementClient> {
  if (!tokenSet || tokenSet?.expired()) {
    const newTokenSet = await Auth.getTokenSet();
    if (newTokenSet && newTokenSet.access_token) {
      tokenSet = newTokenSet;
      managementClient = new ManagementClient({
        token: newTokenSet.access_token,
        domain: getDomainFromToken(newTokenSet.access_token),
      });
    }
  }
  return managementClient;
}
