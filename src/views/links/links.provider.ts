import * as vscode from 'vscode';
import { LinkTreeItem } from './link.tree-item';

export class LinksViewDataProvider
  implements vscode.TreeDataProvider<vscode.TreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    LinkTreeItem | undefined | void
  > = new vscode.EventEmitter<LinkTreeItem | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<
    LinkTreeItem | undefined | void
  > = this._onDidChangeTreeData.event;

  getTreeItem(element: LinkTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: LinkTreeItem): Thenable<vscode.TreeItem[]> {
    return Promise.resolve(this.getTreeItems(element));
  }

  private getTreeItems(parent?: LinkTreeItem): vscode.TreeItem[] {
    return [
      new LinkTreeItem('Open Manage dashboard', 'auth0.links.openManage'),
      new LinkTreeItem('Open Community site', 'auth0.links.openCommunity'),
      new LinkTreeItem('Open Docs', 'auth0.links.openDocs'),
      new LinkTreeItem('Open Quickstarts', 'auth0.links.openQuickstarts'),
      new LinkTreeItem('Open Support Center', 'auth0.links.openSupport'),
      new LinkTreeItem(
        'Open Professional Services',
        'auth0.links.openProServices'
      ),
    ];
  }
}
