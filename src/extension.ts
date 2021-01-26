// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as fs from 'fs';
import * as path from 'path';
import { Client, ManagementClient } from 'auth0';
import * as vscode from 'vscode';
import * as tools from 'auth0-source-control-extension-tools';
import * as extTools from 'auth0-extension-tools';
import { initializeAuth, getAccessToken } from './auth';
import { ApplicationsTreeDataProvider } from './providers/applications.provider';
import { ApisTreeDataProvider } from './providers/apis.provider';
import { load } from 'js-yaml';
import { registerTreeDataProviders } from './providers';
import { registerCommands } from './commands';
import { registerFileSystemProvider } from './filesystem';
import { getClientWithToken } from './store/api';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
  // TODO: Check if already logged in, set correct state, view, etc
  let applicationsTreeDataProvider: ApplicationsTreeDataProvider;
  let apisTreeDataProvider: ApisTreeDataProvider;
  let managementClient: ManagementClient;

  const disposable = vscode.commands.registerCommand('auth0.signIn', async () => {
    await initializeAuth(context);

    const accessToken = await getAccessToken();

    if (!accessToken) {
      // TODO correctly handle error
      throw new Error('Missing access token');
    }

    managementClient = await getClientWithToken(accessToken);

    applicationsTreeDataProvider = new ApplicationsTreeDataProvider(managementClient);
    apisTreeDataProvider = new ApisTreeDataProvider(managementClient);

    vscode.window.registerTreeDataProvider('auth0.app-explorer', applicationsTreeDataProvider);

    vscode.window.registerTreeDataProvider('auth0.api-explorer', apisTreeDataProvider);

    registerFileSystemProvider();
    registerTreeDataProviders();
    registerCommands(context);
  });

  vscode.commands.registerCommand('auth0.helloAuziros', async () => {
    vscode.window.showInformationMessage('🚀 🚀 🚀 🚀');
  });

  vscode.commands.registerCommand('auth0.refreshApps', () => {
    applicationsTreeDataProvider.refresh();
  });

  vscode.commands.registerCommand('auth0.app.add', async () => {
    const appTypes: { [key: string]: string } = {
      'Regular Web App': 'regular_web',
      'Single Page App': 'spa',
      'Machine to Machine': 'non_interactive',
      'Native': 'native',
    };

    const name = await vscode.window.showInputBox({
      placeHolder: 'My App',
      prompt: 'Enter an application name',
      ignoreFocusOut: true,
      validateInput: (text: string) =>
        text !== null && text !== undefined && text !== '' ? '' : 'Enter an application name',
    });

    const appType =
      (await vscode.window.showQuickPick(Object.keys(appTypes), {
        ignoreFocusOut: true,
      })) || '';

    await managementClient.createClient({
      name,
      app_type: appTypes[appType],
    });

    applicationsTreeDataProvider.refresh();
  });

  vscode.commands.registerCommand('auth0.app.remove', async (e) => {
    await managementClient.deleteClient({
      client_id: e.clientId,
    });

    applicationsTreeDataProvider.refresh();
    vscode.window.showInformationMessage('Client removed');
  });

  vscode.commands.registerCommand('auth0.app.addCallbackUrl', async (e) => {
    const client = applicationsTreeDataProvider._clients.find((c) => c.client_id === e.clientId);
    const url = await vscode.window.showInputBox({
      placeHolder: 'http://localhost:3000',
      prompt: 'Enter a callback URL',
      ignoreFocusOut: true,
      validateInput: (text: string) =>
        text !== null && text !== undefined && text !== '' ? '' : 'Enter a callback URL',
    });
    const callbacks: string[] = [...(client?.callbacks || []), url || ''];
    await managementClient.updateClient(
      {
        client_id: client?.client_id || '',
      },
      { callbacks }
    );

    applicationsTreeDataProvider.refresh();
    vscode.window.showInformationMessage(`${url} added as a callback URL`);
  });

  vscode.commands.registerCommand('auth0.app.removeCallbackUrl', async (e) => {
    const client = applicationsTreeDataProvider._clients.find((c) => c.client_id === e.clientId);
    const url = e.label;
    const callbacks = (client?.callbacks || []).filter((cb) => cb !== url);
    await managementClient.updateClient(
      {
        client_id: client?.client_id || '',
      },
      { callbacks }
    );

    applicationsTreeDataProvider.refresh();
    vscode.window.showInformationMessage(`${url} removed as a callback URL`);
  });

  vscode.commands.registerCommand('auth0.app.editRotationType', async (e) => {
    const client = applicationsTreeDataProvider._clients.find(
      (c) => c.client_id === e.clientId
    ) as Client & { refresh_token: any };
    const rotationTypes: { [key: string]: string } = {
      'Rotating': 'rotating',
      'Non Rotating': 'non-rotating',
    };
    const rotationType =
      (await vscode.window.showQuickPick(Object.keys(rotationTypes), {
        ignoreFocusOut: true,
      })) || '';

    await managementClient.updateClient(
      {
        client_id: client?.client_id || '',
      },
      {
        refresh_token: {
          ...client.refresh_token,
          rotation_type: rotationTypes[rotationType],
          // Well ... Enabling Refresh Token Rotation has some requirements ...
          expiration_type:
            rotationTypes[rotationType] === 'rotating'
              ? 'expiring'
              : client.refresh_token.expiration_type,
          infinite_token_lifetime:
            rotationTypes[rotationType] === 'rotating'
              ? false
              : client.refresh_token.infinite_token_lifetime,
          infinite_idle_token_lifetime:
            rotationTypes[rotationType] === 'rotating'
              ? false
              : client.refresh_token.infinite_idle_token_lifetime,
        },
        oidc_conformant: rotationTypes[rotationType] === 'rotating' ? true : client.oidc_conformant,
      }
    );

    applicationsTreeDataProvider.refresh();
    vscode.window.showInformationMessage(`Rotation Type set to ${rotationType}`);
  });

  vscode.commands.registerCommand('auth0.app.editTokenLifetime', async (e) => {
    const client = applicationsTreeDataProvider._clients.find(
      (c) => c.client_id === e.clientId
    ) as Client & { refresh_token: any };

    const token_lifetime = await vscode.window.showInputBox({
      placeHolder: '2600000',
      prompt: 'Enter the token liftetime',
      ignoreFocusOut: true,
      validateInput: (text: string) =>
        text !== null && text !== undefined && text !== '' && !isNaN(Number(text))
          ? ''
          : 'Enter the token lifetime',
    });

    await managementClient.updateClient(
      {
        client_id: client?.client_id || '',
      },
      {
        refresh_token: {
          ...client.refresh_token,
          token_lifetime: Number(token_lifetime),
        },
      }
    );

    applicationsTreeDataProvider.refresh();
    vscode.window.showInformationMessage(`Token Lifetime set to ${token_lifetime}`);
  });

  vscode.commands.registerCommand('auth0.app.editLeeway', async (e) => {
    const client = applicationsTreeDataProvider._clients.find(
      (c) => c.client_id === e.clientId
    ) as Client & { refresh_token: any };

    const leeway = await vscode.window.showInputBox({
      placeHolder: '0',
      prompt: 'Enter the leeway',
      ignoreFocusOut: true,
      validateInput: (text: string) =>
        text !== null && text !== undefined && text !== '' && !isNaN(Number(text))
          ? ''
          : 'Enter the leeway',
    });

    await managementClient.updateClient(
      {
        client_id: client?.client_id || '',
      },
      {
        refresh_token: {
          ...client.refresh_token,
          leeway: Number(leeway),
        },
      }
    );

    applicationsTreeDataProvider.refresh();
    vscode.window.showInformationMessage(`Leeway set to ${leeway}`);
  });

  vscode.commands.registerCommand('auth0.copyValue', (e) => {
    vscode.env.clipboard.writeText(e.value);
    vscode.window.showInformationMessage(`${e.label} copied to clipboard!`);
  });

  vscode.commands.registerCommand('auth0.copyAsJson', (e) => {
    const client = applicationsTreeDataProvider._clients.find((c) => c.client_id === e.clientId);
    vscode.env.clipboard.writeText(JSON.stringify(client));
    vscode.window.showInformationMessage(`Copied Client as JSON to clipboard!`);
  });

  vscode.commands.registerCommand('auth0.api.refresh', () => {
    apisTreeDataProvider.refresh();
  });

  vscode.commands.registerCommand('auth0.api.add', async () => {
    const name = await vscode.window.showInputBox({
      placeHolder: 'My Api',
      prompt: 'Enter an API name',
      ignoreFocusOut: true,
      validateInput: (text: string) =>
        text !== null && text !== undefined && text !== '' ? '' : 'Enter an API name',
    });

    const identifier =
      (await vscode.window.showInputBox({
        placeHolder: 'http://my-api',
        prompt: 'Enter an API identifier',
        ignoreFocusOut: true,
        validateInput: (text: string) =>
          text !== null && text !== undefined && text !== '' ? '' : 'Enter an API identifier',
      })) || '';

    await managementClient.createResourceServer({
      name,
      identifier,
    });

    apisTreeDataProvider.refresh();
  });

  vscode.commands.registerCommand('auth0.api.remove', async (e) => {
    const resourceServer = apisTreeDataProvider._resourceServers.find(
      (c) => c.identifier === e.identifier
    );

    if (!resourceServer || !resourceServer.id) {
      return;
    }

    await managementClient.deleteResourceServer({
      id: resourceServer?.id,
    });

    apisTreeDataProvider.refresh();
    vscode.window.showInformationMessage('Api removed');
  });

  vscode.commands.registerCommand('auth0.api.copyAsJson', (e) => {
    const resourceServer = apisTreeDataProvider._resourceServers.find(
      (r) => r.identifier === e.identifier
    );
    vscode.env.clipboard.writeText(JSON.stringify(resourceServer));
    vscode.window.showInformationMessage(`Copied API as JSON to clipboard!`);
  });

  vscode.commands.registerCommand('auth0.api.editAllowOfflineAccess', async (e) => {
    const resourceServer = apisTreeDataProvider._resourceServers.find(
      ({ identifier }) => identifier === e.identifier
    );
    const allowOfflineAccess =
      (await vscode.window.showQuickPick(['Yes', 'No'], {
        ignoreFocusOut: true,
      })) || '';

    if (!resourceServer || !resourceServer.id) {
      return;
    }

    await managementClient.updateResourceServer(
      {
        id: resourceServer.id,
      },
      {
        allow_offline_access: allowOfflineAccess === 'Yes' ? true : false,
      }
    );

    apisTreeDataProvider.refresh();
    vscode.window.showInformationMessage(`Allow Offline Access set to ${allowOfflineAccess}`);
  });

  vscode.commands.registerCommand('auth0.api.editTokenLifetime', async (e) => {
    const resourceServer = apisTreeDataProvider._resourceServers.find(
      ({ identifier }) => identifier === e.identifier
    );

    if (!resourceServer || !resourceServer.id) {
      return;
    }

    const tokenLifetime = await vscode.window.showInputBox({
      placeHolder: `${resourceServer?.token_lifetime}`,
      prompt: 'Enter the token liftetime',
      ignoreFocusOut: true,
      validateInput: (text: string) =>
        text !== null && text !== undefined && text !== '' && !isNaN(Number(text))
          ? ''
          : 'Enter the token lifetime',
    });

    await managementClient.updateResourceServer(
      {
        id: resourceServer.id,
      },
      {
        token_lifetime: Number(tokenLifetime),
      }
    );

    apisTreeDataProvider.refresh();
    vscode.window.showInformationMessage(`Token Lifetime set to ${tokenLifetime}`);
  });

  vscode.commands.registerCommand('auth0.api.editTokenLifetimeWeb', async (e) => {
    const resourceServer = apisTreeDataProvider._resourceServers.find(
      ({ identifier }) => identifier === e.identifier
    );

    if (!resourceServer || !resourceServer.id) {
      return;
    }

    const tokenLifetime = await vscode.window.showInputBox({
      placeHolder: `${resourceServer?.token_lifetime_for_web}`,
      prompt: 'Enter the token liftetime',
      ignoreFocusOut: true,
      validateInput: (text: string) =>
        text !== null && text !== undefined && text !== '' && !isNaN(Number(text))
          ? ''
          : 'Enter the token lifetime',
    });

    await managementClient.updateResourceServer(
      {
        id: resourceServer.id,
      },
      {
        token_lifetime_for_web: Number(tokenLifetime),
      }
    );

    apisTreeDataProvider.refresh();
    vscode.window.showInformationMessage(`Token Lifetime (Web) set to ${tokenLifetime}`);
  });

  vscode.commands.registerCommand('auth0.deploy', async (e) => {
    if (managementClient) {
      try {
        const filePath = e.path;
        vscode.window.showInformationMessage('Deploying: ' + path.basename(filePath));
        // TODO: use safeLoad instead
        const assets = load(fs.readFileSync(filePath, 'utf8'));
        const config = extTools.config();
        config.setProvider(() => null);
        await tools.deploy(assets, managementClient, config);
        vscode.window.showInformationMessage('Successfully deployed  ' + path.basename(filePath));
      } catch (err) {
        console.log(err);
        vscode.window.showErrorMessage('Deploy failed. Error: ' + err.message);
      }
    } else {
      vscode.window.showWarningMessage('You must first authenticate with Auth0');
    }
  });

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
  // noop
}
