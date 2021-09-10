import { ManagementClient } from 'auth0';
import { getDomainFromToken } from '../utils';
import type { TokenSet } from 'openid-client';
import { Auth } from '../auth';

let managementClient: ManagementClient;
let tokenSet: TokenSet;

Auth.onAuthStatusChanged(async (newTokenSet) => {
  if (newTokenSet) {
    tokenSet = newTokenSet;
    createManagementClient(newTokenSet);
  }
});

function createManagementClient(tokenSet: TokenSet): ManagementClient {
  return (managementClient = new ManagementClient({
    token: tokenSet.access_token,
    domain: getDomainFromToken(tokenSet.access_token!),
  }));
}

export async function getClient(): Promise<ManagementClient> {
  if (!tokenSet || tokenSet?.expired()) {
    const newTokenSet = await Auth.getTokenSet();
    if (newTokenSet && newTokenSet.access_token) {
      tokenSet = newTokenSet;
      managementClient = createManagementClient(newTokenSet);
    }
  }
  return managementClient;
}
