import * as vscode from 'vscode';

export class ActionValueTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string | undefined = '',
    public readonly description: string | undefined = '',
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly value?: string,
    public readonly contextValue = 'ActionValueTreeItem'
  ) {
    super(label, collapsibleState);

    this.tooltip = `${this.label}`;
  }
}
