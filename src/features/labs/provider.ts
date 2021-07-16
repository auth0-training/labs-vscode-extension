import * as vscode from 'vscode';
import { LocalEnvironment, Resource } from './models';
import { getLabEnvironment } from './workspace';
import { getUrlForPort } from '../../utils';
import { LocalEndpointTreeItem } from './views/localEndpoint.tree-item';

export class LocalEndpointsViewDataProvider
  implements vscode.TreeDataProvider<vscode.TreeItem>
{
  private _onDidChangeTreeData: vscode.EventEmitter<
    LocalEndpointTreeItem | undefined | void
  > = new vscode.EventEmitter<LocalEndpointTreeItem | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<
    LocalEndpointTreeItem | undefined | void
  > = this._onDidChangeTreeData.event;

  public _environment: LocalEnvironment | null = null;

  getTreeItem(element: LocalEndpointTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: LocalEndpointTreeItem): Thenable<vscode.TreeItem[]> {
    return this.getEnvironment().then(() => this.getTreeItems(element));
  }

  buildTreeItem(resource: Resource) {
    const uri = vscode.Uri.parse(getUrlForPort(resource.env['PORT'] as number));
    return new LocalEndpointTreeItem(resource.name, {
      command: 'auth0.lab.openLocalEndpoint',
      title: '',
      arguments: [uri],
    });
  }

  private getTreeItems(parent?: LocalEndpointTreeItem): vscode.TreeItem[] {
    if (this._environment) {
      return [
        ...this._environment.clients.map(this.buildTreeItem),
        ...this._environment.resourceServers.map(this.buildTreeItem),
      ];
    }
    return [];
  }

  async getEnvironment() {
    if (!this._environment) {
      return (this._environment = (await getLabEnvironment()) || null);
    }
  }
}
