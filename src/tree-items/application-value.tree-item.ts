import * as vscode from 'vscode';

export class ApplicationValueTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string | undefined = '',
    public readonly description: string | undefined = '',
    public readonly clientId: string | undefined = '',
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly value?: string,
    public readonly contextValue = 'ApplicationValueTreeItem'
  ) {
    super(label, collapsibleState);

    this.tooltip = `${this.label}`;
  }
}
