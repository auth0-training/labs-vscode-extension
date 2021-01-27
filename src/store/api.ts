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

export async function deployActionVersionsDraft(actionId: string) {
  const token = await getAccessToken();
  const domain = getDomainFromToken(token);
  const response = await axios.post(
    `https://${domain}/api/v2/actions/actions/${actionId}/versions/draft/deploy`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

export async function createAction(data: any) {
  const token = await getAccessToken();
  const domain = getDomainFromToken(token);
  const createResponse = await axios.post(
    `https://${domain}/api/v2/actions/actions`,
    {
      name: data.name,
      supported_triggers: [
        {
          id: data.triggerType,
          version: 'v1',
        },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  await upsertActionVersionsDraft(createResponse.data.id, {
    code: getCodeTemplate(data.codeTemplate),
    runtime: 'node12',
    dependencies: [],
    secrets: [],
  });

  return createResponse.data;
}

export function getCodeTemplate(templateId: string) {
  switch (templateId) {
    case 'credentials-exchange-template-1':
      return (
        `
/** @type {CredentialsExchangeAction} */
module.exports = async (event, context) => {
  return {};
};
          `.trim() + '\n'
      );
    case 'post-login-template-1':
      return (
        `
/** @type {PostLoginAction} */
module.exports = async (event, context) => {
  return {};
};
            `.trim() + '\n'
      );

    default:
      throw new Error(`Not implemented for ${templateId}`);
  }
}
