import * as vscode from 'vscode';
import { Client, ManagementClient } from 'auth0';
import { getClient } from '../../client';
import { sortAlphabetically } from '../../utils';
import {
  ApplicationRootTreeItem,
  ApplicationTreeItem,
} from './application.tree-item';

import {
  buildCallbackUrlsChildren,
  buildRefreshTokenChildren,
  buildRootChildren,
} from './application.tree-item.builder';

const TREE_ITEM_LABELS = {
  refreshTokens: 'Refresh Tokens',
  callbackUrls: 'Callback URLs',
};

export class ApplicationsViewDataProvider
  implements vscode.TreeDataProvider<vscode.TreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    ApplicationTreeItem | undefined | void
  > = new vscode.EventEmitter<ApplicationTreeItem | undefined | void>();

  readonly onDidChangeTreeData: vscode.Event<
    ApplicationTreeItem | undefined | void
  > = this._onDidChangeTreeData.event;

  public _clients: Client[] | null = null;

  getTreeItem(element: ApplicationTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: ApplicationTreeItem): Thenable<vscode.TreeItem[]> {
    return this.getClients().then(() => {
      if (element) {
        return this.getTreeItems(element);
      } else {
        return this.getTreeItems();
      }
    });
  }

  async refresh() {
    const client = await getClient();
    const clients = await client.getClients();
    this._clients = clients
      .filter((c: any) => !c.global)
      .sort(sortAlphabetically<Client>((item) => item.name || ''));
    this._onDidChangeTreeData.fire();
  }

  async clear() {
    this._clients = [];
    this._onDidChangeTreeData.fire();
  }

  private async getClients() {
    if (!this._clients) {
      const client = await getClient();
      const clients = await client.getClients();
      this._clients = clients
        .filter((c: any) => !c.global)
        .sort(sortAlphabetically<Client>((item) => item.name || ''));
    }

    return this._clients;
  }

  private getTreeItems(parent?: ApplicationTreeItem): vscode.TreeItem[] {
    if (!this._clients) {
      return [];
    }

    if (!parent) {
      return this._clients.map((client) =>
        ApplicationRootTreeItem.fromClient(client)
      );
    }

    const client: any =
      parent &&
      // eslint-disable-next-line @typescript-eslint/naming-convention
      this._clients.find(({ client_id }) => client_id === parent.clientId);

    switch (parent.label) {
      case TREE_ITEM_LABELS.refreshTokens:
        return buildRefreshTokenChildren(client);
      case TREE_ITEM_LABELS.callbackUrls:
        return buildCallbackUrlsChildren(client);
      case client.name:
        return buildRootChildren(client);
      default:
        return [];
    }
  }
}
