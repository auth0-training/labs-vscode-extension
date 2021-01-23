import { Client } from "auth0";
import * as vscode from "vscode";

export class ApplicationTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string | undefined = '',
    public readonly description: string | undefined = '',
    public readonly clientId: string | undefined = '',
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly value?: string
  ) {
    super(label, collapsibleState);

    this.tooltip = `${this.label}`;
  }

  contextValue = "auth0Item";

  static fromClient(client: Client) {
    const appTypes: { [key: string]: string } = {
      'regular_web': 'Regular Web App',
      'spa': 'Single Page App',
      'non_interactive': 'Machine to Machine',
      'native': 'Native'
    };
    return new ApplicationTreeItem(
      client.name || "",
      appTypes[client.app_type || ''],
      client.client_id || '',
      vscode.TreeItemCollapsibleState.Collapsed,
    );
  }
}