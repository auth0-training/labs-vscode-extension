import { Client } from 'auth0';
import * as vscode from 'vscode';

export class ApplicationTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string | undefined = '',
    public readonly description: string | undefined = '',
    public readonly clientId: string | undefined = '',
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly value?: string,
    public readonly contextValue = 'ApplicationTreeItem'
  ) {
    super(label, collapsibleState);

    this.tooltip = `${this.label}`;
  }
}

export class ApplicationRootTreeItem extends ApplicationTreeItem {
  constructor(
    public readonly label: string | undefined = '',
    public readonly description: string | undefined = '',
    public readonly clientId: string | undefined = '',
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly value?: string
  ) {
    super(label, description, clientId, collapsibleState, value);
  }

  contextValue = 'ApplicationRootTreeItem';

  static fromClient(client: Client) {
    const appTypes: { [key: string]: string } = {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      regular_web: 'Regular Web App',
      spa: 'Single Page App',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      non_interactive: 'Machine to Machine',
      native: 'Native',
    };
    return new ApplicationRootTreeItem(
      client.name || '',
      appTypes[client.app_type || ''],
      client.client_id || '',
      vscode.TreeItemCollapsibleState.Collapsed
    );
  }
}
