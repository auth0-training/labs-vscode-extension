/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from 'vscode';
import { getClient } from '../../client';
import { ApisViewDataProvider } from './provider';
import { ApiRootTreeItem } from './views/api.tree-item';
import { ApiValueTreeItem } from './views/api-value.tree-item';

const registerCommand = vscode.commands.registerCommand;

export class ApiCommands {
  constructor(
    private subscriptions: { dispose(): any }[],
    private apiViewDataProvider: ApisViewDataProvider
  ) {
    subscriptions.push(
      ...[
        registerCommand('auth0.api.refresh', this.refresh),
        registerCommand('auth0.api.add', this.add),
        registerCommand('auth0.api.remove', this.remove),
        registerCommand('auth0.api.copyAsJson', this.copyAsJson),
        registerCommand('auth0.api.copyValue', this.copyValue),
        registerCommand(
          'auth0.api.editAllowOfflineAccess',
          this.editAllowOfflineAccess
        ),
        registerCommand('auth0.api.editTokenLifetime', this.editTokenLifetime),
        registerCommand(
          'auth0.api.editTokenLifetimeWeb',
          this.editTokenLifetimeWeb
        ),
      ]
    );
  }

  refresh = async (): Promise<void> => {
    console.log('auth0:apis:refresh');
    return this.apiViewDataProvider.refresh();
  };

  add = async (): Promise<void> => {
    console.log('auth0:apis:add');
    const name = await promptForName();
    if (!name) {
      return;
    }
    const identifier = await promptForIdentifier();
    if (!identifier) {
      return;
    }

    vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `Adding API`,
        cancellable: false,
      },
      async (progress) => {
        progress.report({ increment: 0 });

        const client = await getClient();
        await client.createResourceServer({
          name,
          identifier,
        });

        progress.report({ increment: 50 });

        await this.refresh();

        progress.report({ increment: 100, message: `Done!` });
      }
    );
  };

  remove = async (e: ApiRootTreeItem): Promise<void> => {
    console.log('auth0:apis:remove');
    const resourceServer = this.apiViewDataProvider._resourceServers?.find(
      (c) => c.identifier === e.identifier
    );

    if (!resourceServer || !resourceServer.id) {
      return;
    }

    const id = resourceServer.id as string;

    const client = await getClient();
    vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `Removing API`,
        cancellable: false,
      },
      async (progress) => {
        progress.report({ increment: 0 });

        await client.deleteResourceServer({
          id,
        });

        progress.report({ increment: 50 });

        await this.refresh();

        progress.report({ increment: 100, message: `Done!` });
      }
    );
  };

  copyAsJson = async (e: ApiRootTreeItem): Promise<void> => {
    console.log('auth0:apis:copyAsJson');
    const resourceServer = this.apiViewDataProvider._resourceServers?.find(
      (r) => r.identifier === e.identifier
    );
    vscode.env.clipboard.writeText(JSON.stringify(resourceServer));
    vscode.window.showInformationMessage(`Copied API as JSON to clipboard!`);
  };

  copyValue = async (e: ApiValueTreeItem): Promise<void> => {
    console.log('auth0:apis:copyValue');
    if (e.value) {
      vscode.env.clipboard.writeText(e.value);
      vscode.window.showInformationMessage(`${e.label} copied to clipboard!`);
    }
  };

  editAllowOfflineAccess = async (e: ApiValueTreeItem): Promise<void> => {
    console.log('auth0:apis:editAllowOfflineAccess');
    const resourceServer = this.apiViewDataProvider._resourceServers?.find(
      ({ identifier }) => identifier === e.identifier
    );
    const allowOfflineAccess = await promptForAllowOfflineAccess();

    if (!allowOfflineAccess || !resourceServer || !resourceServer.id) {
      return;
    }

    const client = await getClient();
    await (await client).updateResourceServer(
      {
        id: resourceServer.id,
      },
      {
        allow_offline_access: allowOfflineAccess === 'Yes' ? true : false,
      }
    );

    this.refresh();
    vscode.window.showInformationMessage(
      `Allow Offline Access set to ${allowOfflineAccess}`
    );
  };

  editTokenLifetime = async (e: ApiValueTreeItem): Promise<void> => {
    console.log('auth0:apis:editTokenLifetime');
    const resourceServer = this.apiViewDataProvider._resourceServers?.find(
      ({ identifier }) => identifier === e.identifier
    );
    const tokenLifetime = await promptForTokenLifetime(
      resourceServer?.token_lifetime
    );

    if (!tokenLifetime || !resourceServer || !resourceServer.id) {
      return;
    }

    const client = await getClient();
    await client.updateResourceServer(
      {
        id: resourceServer.id,
      },
      {
        token_lifetime: Number(tokenLifetime),
      }
    );

    await this.refresh();
    vscode.window.showInformationMessage(
      `Token Lifetime set to ${tokenLifetime}`
    );
  };

  editTokenLifetimeWeb = async (e: ApiValueTreeItem): Promise<void> => {
    console.log('auth0:apis:editTokenLifetimeWeb');
    const resourceServer = this.apiViewDataProvider._resourceServers?.find(
      ({ identifier }) => identifier === e.identifier
    );
    const tokenLifetime = await promptForTokenLifetime(
      resourceServer?.token_lifetime_for_web
    );

    if (!tokenLifetime || !resourceServer || !resourceServer.id) {
      return;
    }

    const client = await getClient();
    await client.updateResourceServer(
      {
        id: resourceServer.id,
      },
      {
        token_lifetime_for_web: Number(tokenLifetime),
      }
    );

    await this.refresh();
    vscode.window.showInformationMessage(
      `Token Lifetime (Web) set to ${tokenLifetime}`
    );
  };
}

async function promptForName(): Promise<string | undefined> {
  return vscode.window.showInputBox({
    placeHolder: 'My Api',
    prompt: 'Enter an API name',
    ignoreFocusOut: true,
    validateInput: (text: string) =>
      text !== null && text !== undefined && text !== ''
        ? ''
        : 'Enter an API name',
  });
}

async function promptForIdentifier(): Promise<string | undefined> {
  return vscode.window.showInputBox({
    placeHolder: 'http://my-api',
    prompt: 'Enter an API identifier',
    ignoreFocusOut: true,
    validateInput: (text: string) =>
      text !== null && text !== undefined && text !== ''
        ? ''
        : 'Enter an API identifier',
  });
}

async function promptForAllowOfflineAccess(): Promise<string | undefined> {
  return vscode.window.showQuickPick(['Yes', 'No'], {
    ignoreFocusOut: true,
  });
}

async function promptForTokenLifetime(
  token_lifetime: number | undefined
): Promise<string | undefined> {
  return vscode.window.showInputBox({
    placeHolder: `${token_lifetime}`,
    prompt: 'Enter the token liftetime',
    ignoreFocusOut: true,
    validateInput: (text: string) =>
      text !== null && text !== undefined && text !== '' && !isNaN(Number(text))
        ? ''
        : 'Enter the token lifetime',
  });
}
