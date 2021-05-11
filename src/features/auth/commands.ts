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
    } catch (e) {
      console.log(e.message);
    }
  };

  signIn = async (): Promise<void> => {
    console.log('auth0:authCommands:signIn');
    try {
      await Auth.signIn();
    } catch (e) {
      vscode.window.showErrorMessage(e.message);
    }
  };

  switchTenant = async (): Promise<void> => {
    console.log('auth0:authCommands:switchTenant');
    const action =
      (await vscode.window.showQuickPick(['Sign Out', 'Switch Tenant'], {
        ignoreFocusOut: true,
      })) || '';

    await Auth.signOut();

    if (action === 'Switch Tenant') {
      vscode.commands.executeCommand('auth0.auth.signIn');
    }
  };

  signOut = async (): Promise<void> => {
    console.log('auth0:authCommands:signOut');
    await Auth.signOut();
  };
}
