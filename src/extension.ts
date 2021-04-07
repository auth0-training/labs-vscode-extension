// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below

import * as vscode from 'vscode';
import {
  initializeAuth,
  getAccessToken,
  getDomainFromToken,
  clearAccessToken,
  isTokenValid,
} from './auth';

import { LinksTreeDataProvider } from './providers/links.provider';
import { getTreeDataProviders, registerTreeDataProviders } from './providers';
import { registerCommands } from './commands';
import { registerFileSystemProvider } from './filesystem';
import { createClientWithToken } from './store/api';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
  let statusBarItem: vscode.StatusBarItem;

  async function logOut() {
    await clearAccessToken();

    const { apisTreeDataProvider, applicationsTreeDataProvider } = getTreeDataProviders();

    apisTreeDataProvider.clear();
    applicationsTreeDataProvider.clear();

    statusBarItem.text = '';
    statusBarItem.dispose();

    vscode.commands.executeCommand('setContext', 'auth0:isAuthenticated', false);
  }

  async function logIn() {
    await initializeAuth(context);

    const accessToken = await getAccessToken();

    if (!accessToken) {
      // TODO correctly handle error
      throw new Error('Missing access token');
    }

    vscode.commands.executeCommand('setContext', 'auth0:isAuthenticated', true);

    await createClientWithToken(accessToken);

    context.subscriptions.push(...registerTreeDataProviders());

    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBarItem.command = 'auth0.switchTenant';
    context.subscriptions.push(statusBarItem);
    statusBarItem.text = 'Auth0: ' + getDomainFromToken(accessToken);
    statusBarItem.show();
  }

  const disposable = vscode.commands.registerCommand('auth0.signIn', async () => {
    await logIn();
  });

  vscode.commands.registerCommand('auth0.switchTenant', async () => {
    const action =
      (await vscode.window.showQuickPick(['Logout', 'Switch Tenant'], {
        ignoreFocusOut: true,
      })) || '';

    await logOut();

    if (action === 'Switch Tenant') {
      vscode.commands.executeCommand('auth0.signIn');
    }
  });

  vscode.commands.registerCommand('auth0.copyValue', (e) => {
    vscode.env.clipboard.writeText(e.value);
    vscode.window.showInformationMessage(`${e.label} copied to clipboard!`);
  });

  context.subscriptions.push(...registerFileSystemProvider());

  context.subscriptions.push(...registerCommands());

  vscode.window.registerTreeDataProvider('auth0.help-view', new LinksTreeDataProvider());

  context.subscriptions.push(disposable);

  const accessToken = await getAccessToken();

  if (accessToken && isTokenValid(accessToken)) {
    await logIn();
  }
}

// this method is called when your extension is deactivated
export function deactivate() {
  // noop
}
