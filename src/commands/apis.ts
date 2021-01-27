import * as vscode from 'vscode';
import { getTreeDataProviders } from '../providers';
import { getClientWithToken } from '../store/api';

export function registerApiCommands(): vscode.Disposable[] {
  return [
    vscode.commands.registerCommand('auth0.api.refresh', () => {
      const { apisTreeDataProvider } = getTreeDataProviders();
      apisTreeDataProvider.refresh();
    }),

    vscode.commands.registerCommand('auth0.api.add', async () => {
      const { apisTreeDataProvider } = getTreeDataProviders();
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

      const managementClient = getClientWithToken();

      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: `Adding API`,
          cancellable: false,
        },
        async (progress) => {
          progress.report({ increment: 0 });

          await managementClient.createResourceServer({
            name,
            identifier,
          });

          progress.report({ increment: 50 });

          await apisTreeDataProvider.refresh();

          progress.report({ increment: 100, message: `Done!` });
        }
      );
    }),

    vscode.commands.registerCommand('auth0.api.remove', async (e) => {
      const { apisTreeDataProvider } = getTreeDataProviders();
      const resourceServer = apisTreeDataProvider._resourceServers?.find(
        (c) => c.identifier === e.identifier
      );

      if (!resourceServer || !resourceServer.id) {
        return;
      }

      const id = resourceServer.id as string;

      const managementClient = getClientWithToken();

      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: `Removing API`,
          cancellable: false,
        },
        async (progress) => {
          progress.report({ increment: 0 });

          await managementClient.deleteResourceServer({
            id,
          });

          progress.report({ increment: 50 });

          await apisTreeDataProvider.refresh();

          progress.report({ increment: 100, message: `Done!` });
        }
      );
    }),

    vscode.commands.registerCommand('auth0.api.copyAsJson', (e) => {
      const { apisTreeDataProvider } = getTreeDataProviders();
      const resourceServer = apisTreeDataProvider._resourceServers?.find(
        (r) => r.identifier === e.identifier
      );
      vscode.env.clipboard.writeText(JSON.stringify(resourceServer));
      vscode.window.showInformationMessage(`Copied API as JSON to clipboard!`);
    }),

    vscode.commands.registerCommand('auth0.api.editAllowOfflineAccess', async (e) => {
      const { apisTreeDataProvider } = getTreeDataProviders();
      const resourceServer = apisTreeDataProvider._resourceServers?.find(
        ({ identifier }) => identifier === e.identifier
      );
      const allowOfflineAccess =
        (await vscode.window.showQuickPick(['Yes', 'No'], {
          ignoreFocusOut: true,
        })) || '';

      if (!resourceServer || !resourceServer.id) {
        return;
      }

      const managementClient = getClientWithToken();
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
    }),

    vscode.commands.registerCommand('auth0.api.editTokenLifetime', async (e) => {
      const { apisTreeDataProvider } = getTreeDataProviders();
      const resourceServer = apisTreeDataProvider._resourceServers?.find(
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

      const managementClient = getClientWithToken();
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
    }),

    vscode.commands.registerCommand('auth0.api.editTokenLifetimeWeb', async (e) => {
      const { apisTreeDataProvider } = getTreeDataProviders();
      const resourceServer = apisTreeDataProvider._resourceServers?.find(
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

      const managementClient = getClientWithToken();
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
    }),
  ];
}
