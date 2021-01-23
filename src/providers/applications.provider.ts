import * as vscode from 'vscode';
import { obfuscate, sortAlphabetically } from './../utils';
import { ApplicationTreeItem } from '../tree-items/application.tree-item';
import { Client, ManagementClient } from 'auth0';
import { buildCallbackUrlsChildren, buildRefreshTokenChildren, buildRootChildren } from '../tree-items/application.tree-item.builder';

const TREE_ITEM_LABELS = {
  refreshTokens: 'Refresh Tokens',
  callbackUrls: 'Callback URLs'
}

export class ApplicationsTreeDataProvider
  implements vscode.TreeDataProvider<vscode.TreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    ApplicationTreeItem | undefined | void
  > = new vscode.EventEmitter<ApplicationTreeItem | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<
    ApplicationTreeItem | undefined | void
  > = this._onDidChangeTreeData.event;

  public _clients: Client[] = [];

  constructor(private _client: ManagementClient) { }

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

  private async getClients() {
    if (!this._clients || !this._clients.length) {
      const clients = await this._client.getClients();
      this._clients = clients.sort(
        sortAlphabetically<Client>((item) => item.name || '')
      );
    }

    return this._clients;
  }

  private getTreeItems(parent?: ApplicationTreeItem): vscode.TreeItem[] {

    if (!parent) {
      return this._clients.map((client) => ApplicationTreeItem.fromClient(client));
    }

    const client: any = parent && this._clients.find(({ client_id }) => client_id === parent.clientId)

    switch (parent.label) {
      case TREE_ITEM_LABELS.refreshTokens:
        return buildRefreshTokenChildren(client);
      case TREE_ITEM_LABELS.callbackUrls:
        return buildCallbackUrlsChildren(client);
      case client.name:
        return buildRootChildren(client);

      default:
        return []
    }
  }
}