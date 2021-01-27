import { Client } from 'auth0';
import * as vscode from 'vscode';

export class ActionTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string | undefined = '',
    public readonly actionId: string | undefined = '',
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly value?: any,
    public readonly contextValue = 'ActionTreeItem'
  ) {
    super(label, collapsibleState);

    this.tooltip = `${this.label}`;
  }
}

export class ActionRootTreeItem extends ActionTreeItem {
  constructor(
    public readonly label: string | undefined = '',
    public readonly actionId: string | undefined = '',
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly value?: any
  ) {
    super(label, actionId, collapsibleState);
  }

  contextValue = 'ActionRootTreeItem';

  static fromAction(action: any) {
    return new ActionRootTreeItem(
      action.name,
      action.id,
      vscode.TreeItemCollapsibleState.Collapsed,
      action
    );
  }
}
