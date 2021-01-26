import * as vscode from 'vscode';
import { sortAlphabetically } from './../utils';
import { ApplicationTreeItem } from '../tree-items/application.tree-item';
import { Client, ManagementClient, ResourceServer } from 'auth0';
import { ApiRootTreeItem, ApiTreeItem } from '../tree-items/api.tree-item';
import { buildRootChildren } from '../tree-items/api.tree-item.builder';

export class ApisTreeDataProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    ApplicationTreeItem | undefined | void
  > = new vscode.EventEmitter<ApplicationTreeItem | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<ApplicationTreeItem | undefined | void> = this
    ._onDidChangeTreeData.event;

  public _resourceServers: ResourceServer[] = [];

  constructor(private _client: ManagementClient) {
    // noop
  }

  getTreeItem(element: ApiTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: ApiTreeItem): Thenable<vscode.TreeItem[]> {
    return this.getResourceServers().then(() => this.getTreeItems(element));
  }

  async refresh() {
    const resourceServers = await this._client.getResourceServers();
    this._resourceServers = resourceServers.sort(
      sortAlphabetically<Client>((item) => item.name || '')
    );
    this._onDidChangeTreeData.fire();
  }

  private async getResourceServers() {
    if (!this._resourceServers || !this._resourceServers.length) {
      const resourceServers = await this._client.getResourceServers();
      this._resourceServers = resourceServers.sort(
        sortAlphabetically<Client>((item) => item.name || '')
      );
    }

    return this._resourceServers;
  }

  private getTreeItems(parent?: ApiTreeItem): vscode.TreeItem[] {
    if (!parent) {
      return this._resourceServers.map((resourceServer) =>
        ApiRootTreeItem.fromResourceServer(
          resourceServer as ResourceServer & { is_system: boolean }
        )
      );
    }

    const resourceServer = this._resourceServers.find(
      ({ identifier }) => identifier === parent.identifier
    ) as ResourceServer & { is_system: boolean };

    if (!resourceServer) {
      return [];
    }

    switch (parent.label) {
      case resourceServer.name:
        return buildRootChildren(resourceServer);
      default:
        return [];
    }
  }
}
