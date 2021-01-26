import { ResourceServer } from "auth0";
import * as vscode from "vscode";

export class ApiTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string | undefined = '',
    public readonly description: string | undefined = '',
    public readonly identifier: string | undefined = '',
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly value?: string
  ) {
    super(label, collapsibleState);

    this.tooltip = `${this.label}`;
  }

  contextValue = "ApiTreeItem";
}

export class ApiRootTreeItem extends ApiTreeItem {
  constructor(
    public readonly label: string | undefined = '',
    public readonly description: string | undefined = '',
    public readonly identifier: string | undefined = '',
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly contextValue = "ApiRootTreeItem"
  ) {
    super(label, description, identifier, collapsibleState, '');
  }

  static fromResourceServer(resourceServer: ResourceServer & { is_system: boolean }) {
    return new ApiRootTreeItem(
      resourceServer.name || "",
      "",
      resourceServer.identifier || '',
      vscode.TreeItemCollapsibleState.Collapsed,
      !resourceServer.is_system ? "ApiRootTreeItem" : "ApiRootTreeItem:System"
    );
  }
}