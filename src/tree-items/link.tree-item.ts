import * as vscode from 'vscode';

export class LinkTreeItem extends vscode.TreeItem {
  constructor(public readonly label: string | undefined = '', public readonly commandName: string) {
    super(label);

    this.tooltip = `${this.label}`;
    this.iconPath = new vscode.ThemeIcon('link-external');
    this.command = {
      command: commandName,
      title: commandName,
    };
  }

  contextValue = 'LinkTreeItem';
}
