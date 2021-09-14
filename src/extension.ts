import * as vscode from 'vscode';
import type { TokenSet } from 'openid-client';
import { Auth } from './auth';

/**
 * Import Features
 */
import {
  ApplicationCommands,
  ApplicationsViewDataProvider,
} from './features/applications';
import { ApiCommands, ApisViewDataProvider } from './features/apis';
import { LinkCommands, LinksViewDataProvider } from './features/links';
import { AuthCommands } from './features/auth';
import { DeployCommands } from './features/deploy';
import {
  LabCommands,
  LocalEndpointsViewDataProvider,
  LabResourceResolverBuilder,
} from './features/labs';

export async function activate(this: any, context: vscode.ExtensionContext) {
  /**
   * Register commands & views
   */
  const appViewDataProvider = new ApplicationsViewDataProvider();
  const apiViewDataProvider = new ApisViewDataProvider();
  const linkViewDataProvider = new LinksViewDataProvider();
  const localEndpointsViewDataProvider = new LocalEndpointsViewDataProvider();

  const subscriptions = context.subscriptions;
  const authCommands = new AuthCommands(subscriptions);
  const labCommands = new LabCommands(
    subscriptions,
    new LabResourceResolverBuilder(
      appViewDataProvider.getClients,
      apiViewDataProvider.getResourceServers
    )
  );
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

  vscode.window.createTreeView('localEndpointsView', {
    treeDataProvider: localEndpointsViewDataProvider,
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

    if (authenticated) {
      await appCommands.refresh();
      await apiCommands.refresh();
      await vscode.commands.executeCommand('auth0.lab.promptForConfiguration');
    } else {
      await vscode.commands.executeCommand('auth0.lab.promptForAuthentication');
    }
  };
  Auth.useStorage(context.secrets);
  Auth.onAuthStatusChanged(updateViews);

  await vscode.commands.executeCommand('auth0.auth.silentSignIn');
}

/**
 * Deactivate the extension. Due to uninstalling the
 * extension.
 */
export async function deactivate() {
  /**
   * Sign out and dispose of all tokensets
   */
  Auth.signOut();
  Auth.dispose();
}
