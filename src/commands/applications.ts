import * as vscode from 'vscode';
import { Client } from 'auth0';
import { getTreeDataProviders } from '../providers';
import { getClientWithToken } from '../store/api';

export function registerApplicationCommands(): vscode.Disposable[] {
  return [
    vscode.commands.registerCommand('auth0.app.add', async () => {
      const { applicationsTreeDataProvider } = getTreeDataProviders();
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

      const managementClient = getClientWithToken();

      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: `Adding application`,
          cancellable: false,
        },
        async (progress) => {
          progress.report({ increment: 0 });

          await managementClient.createClient({
            name,
            app_type: appTypes[appType],
          });

          progress.report({ increment: 50 });

          await applicationsTreeDataProvider.refresh();

          progress.report({ increment: 100, message: `Done!` });
        }
      );
    }),

    vscode.commands.registerCommand('auth0.app.remove', async (e) => {
      const { applicationsTreeDataProvider } = getTreeDataProviders();
      const managementClient = getClientWithToken();

      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: `Removing application`,
          cancellable: false,
        },
        async (progress) => {
          progress.report({ increment: 0 });

          await managementClient.deleteClient({
            client_id: e.clientId,
          });

          progress.report({ increment: 50 });

          await applicationsTreeDataProvider.refresh();

          progress.report({ increment: 100, message: `Done!` });
        }
      );
    }),

    vscode.commands.registerCommand('auth0.app.addCallbackUrl', async (e) => {
      const { applicationsTreeDataProvider } = getTreeDataProviders();
      const client = applicationsTreeDataProvider._clients?.find((c) => c.client_id === e.clientId);
      const url = await vscode.window.showInputBox({
        placeHolder: 'http://localhost:3000',
        prompt: 'Enter a callback URL',
        ignoreFocusOut: true,
        validateInput: (text: string) =>
          text !== null && text !== undefined && text !== '' ? '' : 'Enter a callback URL',
      });
      const callbacks: string[] = [...(client?.callbacks || []), url || ''];
      const managementClient = getClientWithToken();
      await managementClient.updateClient(
        {
          client_id: client?.client_id || '',
        },
        { callbacks }
      );

      applicationsTreeDataProvider.refresh();
      vscode.window.showInformationMessage(`${url} added as a callback URL`);
    }),

    vscode.commands.registerCommand('auth0.app.removeCallbackUrl', async (e) => {
      const { applicationsTreeDataProvider } = getTreeDataProviders();
      const client = applicationsTreeDataProvider._clients?.find((c) => c.client_id === e.clientId);
      const url = e.label;
      const callbacks = (client?.callbacks || []).filter((cb) => cb !== url);
      const managementClient = getClientWithToken();
      await managementClient.updateClient(
        {
          client_id: client?.client_id || '',
        },
        { callbacks }
      );

      applicationsTreeDataProvider.refresh();
      vscode.window.showInformationMessage(`${url} removed as a callback URL`);
    }),

    vscode.commands.registerCommand('auth0.app.editRotationType', async (e) => {
      const { applicationsTreeDataProvider } = getTreeDataProviders();
      const client = applicationsTreeDataProvider._clients?.find(
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

      const managementClient = getClientWithToken();
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
          oidc_conformant:
            rotationTypes[rotationType] === 'rotating' ? true : client.oidc_conformant,
        }
      );

      applicationsTreeDataProvider.refresh();
      vscode.window.showInformationMessage(`Rotation Type set to ${rotationType}`);
    }),

    vscode.commands.registerCommand('auth0.app.editTokenLifetime', async (e) => {
      const { applicationsTreeDataProvider } = getTreeDataProviders();
      const client = applicationsTreeDataProvider._clients?.find(
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

      const managementClient = getClientWithToken();
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
    }),

    vscode.commands.registerCommand('auth0.app.editLeeway', async (e) => {
      const { applicationsTreeDataProvider } = getTreeDataProviders();
      const client = applicationsTreeDataProvider._clients?.find(
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

      const managementClient = getClientWithToken();
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
    }),

    vscode.commands.registerCommand('auth0.app.refresh', () => {
      const { applicationsTreeDataProvider } = getTreeDataProviders();
      applicationsTreeDataProvider.refresh();
    }),

    vscode.commands.registerCommand('auth0.copyAsJson', (e) => {
      const { applicationsTreeDataProvider } = getTreeDataProviders();
      const client = applicationsTreeDataProvider._clients?.find((c) => c.client_id === e.clientId);
      vscode.env.clipboard.writeText(JSON.stringify(client));
      vscode.window.showInformationMessage(`Copied Client as JSON to clipboard!`);
    }),
  ];
}
