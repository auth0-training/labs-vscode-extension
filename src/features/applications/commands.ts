/* eslint-disable @typescript-eslint/naming-convention */
import { Client } from 'auth0';
import * as vscode from 'vscode';
import { getClient } from '../../client';
import { ApplicationsViewDataProvider } from './provider';
import {
  ApplicationRootTreeItem,
  ApplicationTreeItem,
} from './views/application.tree-item';
import { ApplicationValueTreeItem } from './views/application-value.tree-item';

const registerCommand = vscode.commands.registerCommand;

const appTypes: { [key: string]: string } = {
  'Regular Web App': 'regular_web',
  'Single Page App': 'spa',
  'Machine to Machine': 'non_interactive',
  'Native': 'native',
};

const rotationTypes: { [key: string]: string } = {
  'Rotating': 'rotating',
  'Non Rotating': 'non-rotating',
};

export class ApplicationCommands {
  constructor(
    private subscriptions: { dispose(): any }[],
    private applicationViewDataProvider: ApplicationsViewDataProvider
  ) {
    subscriptions.push(
      ...[
        registerCommand('auth0.app.refresh', this.refresh),
        registerCommand('auth0.app.add', this.add),
        registerCommand('auth0.app.remove', this.remove),
        registerCommand('auth0.app.copyAsJson', this.copyAsJson),
        registerCommand('auth0.app.copyValue', this.copyValue),
        registerCommand('auth0.app.addCallbackUrl', this.addCallbackUrl),
        registerCommand('auth0.app.removeCallbackUrl', this.removeCallbackUrl),
        registerCommand('auth0.app.editRotationType', this.editRotationType),
        registerCommand('auth0.app.editTokenLifetime', this.editTokenLifetime),
        registerCommand('auth0.app.editLeeway', this.editLeeway),
      ]
    );
  }

  refresh = async (): Promise<void> => {
    console.log('auth0:apps:refresh');
    return this.applicationViewDataProvider.refresh();
  };

  add = async (): Promise<void> => {
    console.log('auth0:apps:add');
    const name = await promptForName();
    if (!name) {
      return;
    }
    const appType = await promptForType();
    if (!appType) {
      return;
    }
    vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `Adding application`,
        cancellable: false,
      },
      async (progress) => {
        progress.report({ increment: 0 });

        const client = await getClient();

        await client.createClient({
          name,
          app_type: appTypes[appType],
        });

        progress.report({ increment: 50 });

        await this.refresh();

        progress.report({ increment: 100, message: `Done!` });
      }
    );
  };

  remove = async (e: ApplicationRootTreeItem): Promise<void> => {
    console.log('auth0:apps:remove');

    const confirm = await vscode.window.showWarningMessage(
      `Do you want to permanently delete ${e.label}?`,
      ...['Yes', 'No']
    );
    if (confirm === 'No') {
      return;
    }

    vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `Removing application`,
        cancellable: false,
      },
      async (progress) => {
        if (e.clientId === undefined) {
          return;
        }

        progress.report({ increment: 0 });

        const client = await getClient();

        await client.deleteClient({
          client_id: e.clientId,
        });

        progress.report({ increment: 50 });

        await this.refresh();

        progress.report({ increment: 100, message: `Done!` });
      }
    );
  };

  copyAsJson = (e: ApplicationRootTreeItem): void => {
    console.log('auth0:apps:copyAsJson');
    const client = this.applicationViewDataProvider._clients?.find(
      (c) => c.client_id === e.clientId
    );
    vscode.env.clipboard.writeText(JSON.stringify(client, null, 2));
    vscode.window.showInformationMessage(`Copied Client as JSON to clipboard!`);
  };

  copyValue = (e: ApplicationValueTreeItem): void => {
    console.log('auth0:apps:copyValue');
    if (e.value) {
      vscode.env.clipboard.writeText(e.value);
      vscode.window.showInformationMessage(`${e.label} copied to clipboard!`);
    }
  };

  addCallbackUrl = async (e: ApplicationTreeItem): Promise<void> => {
    console.log('auth0:apps:addCallbackUrl');
    const client = this.applicationViewDataProvider._clients?.find(
      (c: Client) => c.client_id === e.clientId
    );
    const url = await promptForUrl();
    if (!url) {
      return;
    }
    const callbacks: string[] = [...(client?.callbacks || []), url || ''];
    const managementClient = await getClient();
    await managementClient.updateClient(
      {
        client_id: client?.client_id || '',
      },
      { callbacks }
    );

    await this.refresh();
    vscode.window.showInformationMessage(`${url} added as a callback URL`);
  };

  removeCallbackUrl = async (e: ApplicationValueTreeItem): Promise<void> => {
    console.log('auth0:apps:removeCallbackUrl');
    const client = this.applicationViewDataProvider._clients?.find(
      (c: Client) => c.client_id === e.clientId
    );
    const url = e.label;
    const callbacks = (client?.callbacks || []).filter((cb) => cb !== url);
    const managementClient = await getClient();
    await managementClient.updateClient(
      {
        client_id: client?.client_id || '',
      },
      { callbacks }
    );

    await this.refresh();
    vscode.window.showInformationMessage(`${url} removed as a callback URL`);
  };

  editRotationType = async (e: ApplicationValueTreeItem): Promise<void> => {
    console.log('auth0:apps:editRotationType');
    const client = this.applicationViewDataProvider._clients?.find(
      (c) => c.client_id === e.clientId
    ) as Client & { refresh_token: any };
    const rotationType = (await promptForRotationType()) || '';
    const managementClient = await getClient();
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
          rotationTypes[rotationType] === 'rotating'
            ? true
            : client.oidc_conformant,
      }
    );
    await this.refresh();
    vscode.window.showInformationMessage(
      `Rotation Type set to ${rotationType}`
    );
  };

  editTokenLifetime = async (e: ApplicationValueTreeItem): Promise<void> => {
    console.log('auth0:apps:editTokenLifetime');
    const client = this.applicationViewDataProvider._clients?.find(
      (c) => c.client_id === e.clientId
    ) as Client & { refresh_token: any };
    const token_lifetime = await promptForTokenLifetime();
    const managementClient = await getClient();
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

    await this.refresh();
    vscode.window.showInformationMessage(
      `Token Lifetime set to ${token_lifetime}`
    );
  };

  editLeeway = async (e: ApplicationValueTreeItem): Promise<void> => {
    console.log('auth0:apps:editLeeway');
    const client = this.applicationViewDataProvider._clients?.find(
      (c) => c.client_id === e.clientId
    ) as Client & { refresh_token: any };
    const leeway = await promptForLeeway();
    const managementClient = await getClient();
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

    await this.refresh();
    vscode.window.showInformationMessage(`Leeway set to ${leeway}`);
  };
}

async function promptForName(): Promise<string | undefined> {
  return vscode.window.showInputBox({
    placeHolder: 'My App',
    prompt: 'Enter an application name',
    ignoreFocusOut: true,
    validateInput: (text: string) =>
      text !== null && text !== undefined && text !== ''
        ? ''
        : 'Enter an application name',
  });
}

async function promptForType(): Promise<string | undefined> {
  return vscode.window.showQuickPick(Object.keys(appTypes), {
    ignoreFocusOut: true,
  });
}

async function promptForUrl(): Promise<string | undefined> {
  return vscode.window.showInputBox({
    placeHolder: 'http://localhost:3000',
    prompt: 'Enter a callback URL',
    ignoreFocusOut: true,
    validateInput: (text: string) =>
      text !== null && text !== undefined && text !== ''
        ? ''
        : 'Enter a callback URL',
  });
}

async function promptForRotationType(): Promise<string | undefined> {
  return vscode.window.showQuickPick(Object.keys(rotationTypes), {
    ignoreFocusOut: true,
  });
}

async function promptForTokenLifetime(): Promise<string | undefined> {
  return vscode.window.showInputBox({
    placeHolder: '2600000',
    prompt: 'Enter the token liftetime',
    ignoreFocusOut: true,
    validateInput: (text: string) =>
      text !== null && text !== undefined && text !== '' && !isNaN(Number(text))
        ? ''
        : 'Enter the token lifetime',
  });
}

async function promptForLeeway(): Promise<string | undefined> {
  return vscode.window.showInputBox({
    placeHolder: '0',
    prompt: 'Enter the leeway',
    ignoreFocusOut: true,
    validateInput: (text: string) =>
      text !== null && text !== undefined && text !== '' && !isNaN(Number(text))
        ? ''
        : 'Enter the leeway',
  });
}
