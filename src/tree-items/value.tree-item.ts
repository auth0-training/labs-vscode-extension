import * as vscode from 'vscode';

export class ValueTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string | undefined = '',
    public readonly description: string | undefined = '',
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly value?: string
  ) {
    super(label, collapsibleState);

    this.tooltip = `${this.label}`;
  }

  contextValue = 'ValueTreeItem';
}
