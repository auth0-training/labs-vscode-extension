import * as vscode from 'vscode';
import { Auth } from '../../auth';
import * as utils from '../../utils';
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
        registerCommand('auth0.auth.logger', this.logger),
        StatusBar,
      ]
    );
  }

  silentSignIn = async (): Promise<void> => {
    utils.logger('SILENT_SIGNIN', 'Silent sign in registred');
    try {
      await Auth.silentSignIn();
    } catch (e: any) {
      utils.logger('ERROR', 'Silent sign in failed');
      //if silent sign in fails, clear any stored tokensets
      vscode.commands.executeCommand('auth0.auth.signOut');
    }
  };

  signIn = async (): Promise<void> => {
    utils.logger('SIGNIN', 'Sign in registred');
    try {
      await Auth.signIn();
    } catch (e: any) {
      utils.logger('ERROR', 'Sign in failed');
      vscode.window.showErrorMessage(e.message);
    }
  };

  /**  Step logger, allows to log individual steps; requires
    ```
    "commands": ["auth0.auth.logger"]
    ```
    in the first step of tour's `.tour`
  */
  logger = async (): Promise<void> => {
    utils.logger('STEP_REACHED', await utils.stepReached());
  };

  switchTenant = async (): Promise<void> => {
    utils.logger('SWITCH_TENANT', 'Switch tenant registred');
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
    utils.logger('SIGNOUT', 'Signout registered');
    await Auth.signOut();
  };
}
