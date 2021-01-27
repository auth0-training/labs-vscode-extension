import axios from 'axios';
import { ManagementClient } from 'auth0';
import { getAccessToken, getDomainFromToken } from '../auth';

export async function getClientWithToken(accessToken: string) {
  return new ManagementClient({
    token: accessToken,
    domain: getDomainFromToken(accessToken),
  });
}

export async function getClient() {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    // TODO correctly handle error
    throw new Error('Missing access token');
  }

  return new ManagementClient({
    token: accessToken,
    domain: getDomainFromToken(accessToken),
  });
}

export async function getActions() {
  const token = await getAccessToken();
  const domain = getDomainFromToken(token);
  const response = await axios.get(`https://${domain}/api/v2/actions/actions`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function getActionVersionsDraft(actionId: string) {
  const token = await getAccessToken();
  const domain = getDomainFromToken(token);
  const response = await axios.get(
    `https://${domain}/api/v2/actions/actions/${actionId}/versions/draft`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

export async function upsertActionVersionsDraft(
  actionId: string,
  payload: { code: string; dependencies: any; runtime: string; secrets: any }
) {
  const token = await getAccessToken();
  const domain = getDomainFromToken(token);
  const response = await axios.patch(
    `https://${domain}/api/v2/actions/actions/${actionId}/versions/draft`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

export async function removeAction(actionId: string) {
  const token = await getAccessToken();
  const domain = getDomainFromToken(token);
  return await axios.delete(`https://${domain}/api/v2/actions/actions/${actionId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
