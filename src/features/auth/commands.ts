import * as vscode from 'vscode';
import { Auth } from '../../auth';
import { StatusBar } from './views/StatusBar';

const registerCommand = vscode.commands.registerCommand;
export class AuthCommands {
  constructor(private subscriptions: { dispose(): any }[]) {
    subscriptions.push(
      ...[
        registerCommand('auth0.auth.silentSignIn', this.silentSignIn),
        registerCommand('auth0.auth.signIn', this.signIn),
        registerCommand('auth0.auth.switchTenant', this.switchTenant),
        registerCommand('auth0.auth.signOut', this.signOut),
        StatusBar,
      ]
    );
  }

  silentSignIn = async (): Promise<void> => {
    console.log('auth0:authCommands:silentSignIn');
    try {
      await Auth.silentSignIn();
    } catch (e: any) {
      console.log(e.message);
    }
  };

  signIn = async (): Promise<void> => {
    console.log('auth0:authCommands:signIn');
    try {
      await Auth.signIn();
    } catch (e: any) {
      vscode.window.showErrorMessage(e.message);
    }
  };

  switchTenant = async (): Promise<void> => {
    console.log('auth0:authCommands:switchTenant');
    const actions = (await Auth.isAuthenticated())
      ? ['Sign Out', 'Switch Tenant']
      : ['Sign In'];
    const action =
      (await vscode.window.showQuickPick(actions, {
        ignoreFocusOut: true,
      })) || '';

    await Auth.signOut();

    if (action === 'Switch Tenant' || action === 'Sign In') {
      vscode.commands.executeCommand('auth0.auth.signIn');
    }
  };

  signOut = async (): Promise<void> => {
    console.log('auth0:authCommands:signOut');
    await Auth.signOut();
  };
}
