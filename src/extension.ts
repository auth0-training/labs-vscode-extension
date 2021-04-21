import * as vscode from 'vscode';
import { Auth } from './auth';
import { TokenSet } from 'openid-client';
import {
  ApplicationsViewDataProvider,
  ApisViewDataProvider,
  LinksViewDataProvider,
} from './views';
import {
  AuthCommands,
  LabCommands,
  ApplicationCommands,
  ApiCommands,
  LinkCommands,
  DeployCommands,
} from './commands';

let activeExtension: Extension;
let _context: vscode.ExtensionContext;
export class Extension {
  activate = async () => {
    /**
     * Register commands & views
     */
    const appViewDataProvider = new ApplicationsViewDataProvider();
    const apiViewDataProvider = new ApisViewDataProvider();
    const linkViewDataProvider = new LinksViewDataProvider();

    const subscriptions = _context.subscriptions;
    const authCommands = new AuthCommands(subscriptions);
    const labCommands = new LabCommands(subscriptions);
    const deployCommands = new DeployCommands(subscriptions);
    const appCommands = new ApplicationCommands(
      subscriptions,
      appViewDataProvider
    );
    const apiCommands = new ApiCommands(subscriptions, apiViewDataProvider);
    const linkCommands = new LinkCommands(subscriptions, linkViewDataProvider);

    /**
     * Register tree views within activity bar
     */
    vscode.window.createTreeView('appsView', {
      treeDataProvider: appViewDataProvider,
      showCollapseAll: false,
    });

    vscode.window.createTreeView('apisView', {
      treeDataProvider: apiViewDataProvider,
      showCollapseAll: false,
    });

    vscode.window.createTreeView('linksView', {
      treeDataProvider: linkViewDataProvider,
      showCollapseAll: false,
    });

    /**
     * Register changes in authentication to update views
     */
    const updateViews = async (tokenSet: TokenSet | undefined) => {
      /**
       * Set a global context item `auth0:authenticated`. This
       * setting is used to determine what commands/views/etc are
       * available to the user. The access token is also used
       * when making requests from the Management API.
       */
      const authenticated = tokenSet && !tokenSet.expired();
      await vscode.commands.executeCommand(
        'setContext',
        'auth0:authenticated',
        authenticated
      );
      authCommands.updateStatus(tokenSet);
      await appCommands.refresh();
      if (authenticated) {
        await vscode.commands.executeCommand('auth0.lab.notification');
      }
    };
    Auth.onAuthStatusChanged(updateViews);

    await vscode.commands.executeCommand('auth0.auth.silentSignIn');
  };

  /**
   * Deactivate the extension. Due to uninstalling the
   * extension.
   */
  deactivate = async () => {
    /**
     * Sign out and dispose of all credentials
     */
    Auth.signOut();
    Auth.dispose();
  };
}

/**
 * Activates the extension in VS Code and registers commands available
 * in the command palette
 * @param context - Context the extension is being run in
 */
export async function activate(this: any, context: vscode.ExtensionContext) {
  _context = context;
  activeExtension = new Extension();
  activeExtension.activate();
}

/**
 * Deactivates the extension in VS Code
 */
export async function deactivate() {
  if (activeExtension) {
    await activeExtension.deactivate();
  }
}
