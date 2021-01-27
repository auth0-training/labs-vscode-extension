import axios from 'axios';
import * as qs from 'qs';
import * as vscode from 'vscode';
import { keytar } from './secrets';

const SECRET_KEY_SERVICE_NAME = 'auth0-vsc-access-token';
const clientId = '2iZo3Uczt5LFHacKdM0zzgUO2eG2uDjT';
const audience = 'https://*.auth0.com/api/v2/';
let deviceCode = '';
let interval = 3000; // 3 seconds

async function setIntervalAsync(cb: () => unknown, interval: number) {
  return new Promise((resolve, reject) => {
    const i = setInterval(async () => {
      try {
        const data = await cb();

        if (data) {
          clearInterval(i);
          resolve(data);
        }
      } catch (err) {
        return reject(err);
      }
    }, interval);
  });
}

export async function initializeAuth(context: vscode.ExtensionContext) {
  const accessToken = await getAccessToken();

  if (accessToken && isTokenValid(accessToken)) {
    return;
  }

  const options = {
    method: 'POST',
    url: 'https://auth0.auth0.com/oauth/device/code',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    data: qs.stringify({
      client_id: clientId,
      scope:
        'openid read:roles read:client_grants read:clients read:client_keys read:connections create:resource_servers read:resource_servers update:resource_servers delete:resource_servers read:device_credentials read:rules read:actions update:actions delete:actions create:actions read:logs read:grants update:tenant_settings update:resource_servers create:clients update:clients delete:clients',
      audience: audience,
    }),
  };

  const response = await axios.request(options as any);

  if (!response) {
    return 'No data in the response';
  }

  deviceCode = response.data.device_code;
  interval = response.data.interval;

  console.log(response.data);

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: `Sign in: Your pairing code is ${response.data.user_code}`,
      cancellable: false,
    },
    async () => {
      vscode.commands.executeCommand(
        'vscode.open',
        vscode.Uri.parse(response.data.verification_uri_complete)
      );

      //TODO: To avoid errors due to network latency, we should start counting each interval after receipt of the last polling request's response.
      await setIntervalAsync(async () => {
        try {
          const response = await axios.request({
            method: 'POST',
            url: 'https://auth0.auth0.com/oauth/token',
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            data: qs.stringify({
              client_id: clientId,
              device_code: deviceCode,
              grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
            }),
          });
          console.log(response.data);

          await keytar.setPassword(
            SECRET_KEY_SERVICE_NAME,
            'access_token',
            response.data.access_token
          );

          context.globalState.update('extensionState', 'authenticated');

          return response.data;
        } catch (err) {
          return null;
        }
      }, interval * 1000);
    }
  );
}

export function parseAccessToken(accessToken: string) {
  const tokenParts = accessToken.split('.');

  const buff = Buffer.from(tokenParts[1], 'base64');
  const text = buff.toString('ascii');
  return JSON.parse(text);
}

export function isTokenValid(accessToken: string) {
  // TODO add any other validation necessary
  const data = parseAccessToken(accessToken);
  return data.exp > Math.floor(Date.now() / 1000);
}

export function getDomainFromToken(accessToken: string) {
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

export async function getAccessToken() {
  const accessToken = await keytar.getPassword(SECRET_KEY_SERVICE_NAME, 'access_token');

  if (!accessToken) {
    return '';
  }

  return accessToken;
}

export function clearAccessToken() {
  return keytar.deletePassword(SECRET_KEY_SERVICE_NAME, 'access_token');
}
