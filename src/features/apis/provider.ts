import * as vscode from 'vscode';
import { ResourceServer } from 'auth0';
import { sortAlphabetically } from '../../utils';
import { getClient } from '../../client';
import { ApiRootTreeItem, ApiTreeItem } from './views/api.tree-item';
import { buildRootChildren } from './views/api.tree-item.builder';

export class ApisViewDataProvider
  implements vscode.TreeDataProvider<vscode.TreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    ApiTreeItem | undefined | void
  > = new vscode.EventEmitter<ApiTreeItem | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<
    ApiTreeItem | undefined | void
  > = this._onDidChangeTreeData.event;

  public _resourceServers: ResourceServer[] | null = null;

  getTreeItem(element: ApiTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: ApiTreeItem): Thenable<vscode.TreeItem[]> {
    return this.getResourceServers().then(() => this.getTreeItems(element));
  }

  async clear() {
    this._resourceServers = [];
    this._onDidChangeTreeData.fire();
  }

  async refresh() {
    await this.getResourceServers();
    this._onDidChangeTreeData.fire();
  }

  async getResourceServers() {
    if (!this._resourceServers) {
      const client = await getClient();
      const resourceServers = await client.resourceServers.getAll();
      this._resourceServers = resourceServers.data.sort(
        sortAlphabetically<ResourceServer>((item) => item.name || '')
      );
    }

    return this._resourceServers;
  }

  private getTreeItems(parent?: ApiTreeItem): vscode.TreeItem[] {
    if (!this._resourceServers) {
      return [];
    }

    if (!parent) {
      return this._resourceServers.map((resourceServer) =>
        ApiRootTreeItem.fromResourceServer(
          // eslint-disable-next-line @typescript-eslint/naming-convention
          resourceServer as ResourceServer & { is_system: boolean }
        )
      );
    }

    const resourceServer = this._resourceServers.find(
      ({ identifier }) => identifier === parent.identifier
      // eslint-disable-next-line @typescript-eslint/naming-convention
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
