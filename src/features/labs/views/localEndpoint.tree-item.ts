import * as vscode from 'vscode';

export class LocalEndpointTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string | undefined = '',
    public readonly command: vscode.Command
  ) {
    super(label);

    this.tooltip = `${this.label}`;
    this.iconPath = new vscode.ThemeIcon('link-external');
    this.command = command;
  }

  contextValue = 'LocalEndpointTreeItem';
}
