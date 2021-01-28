import * as vscode from 'vscode';
import { Client } from 'auth0';
import { ApplicationTreeItem } from './application.tree-item';
import { ApplicationValueTreeItem } from './application-value.tree-item';
import { obfuscate } from '../utils';

export function buildRootChildren(client: Client & { refresh_token: any }) {
  const children = [
    new ApplicationValueTreeItem(
      'Client ID',
      client.client_id,
      client.client_id,
      vscode.TreeItemCollapsibleState.None,
      client.client_id
    ),
    new ApplicationValueTreeItem(
      'Client Secret',
      obfuscate(client.client_secret),
      client.client_id,
      vscode.TreeItemCollapsibleState.None,
      client.client_secret
    ),
  ];

  if (client.refresh_token) {
    children.push(
      new ApplicationTreeItem(
        'Refresh Tokens',
        '',
        client.client_id,
        vscode.TreeItemCollapsibleState.Collapsed
      )
    );
  }
  if (client?.callbacks || client.app_type !== 'non_interactive') {
    children.push(
      new ApplicationTreeItem(
        'Callback URLs',
        '',
        client.client_id,
        vscode.TreeItemCollapsibleState.Collapsed,
        undefined,
        'ApplicationTreeItem:CallbackUrls'
      )
    );
  }
  return children;
}

export function buildCallbackUrlsChildren(client: Client | undefined) {
  return (
    client?.callbacks?.map(
      (callback) =>
        new ApplicationValueTreeItem(
          callback,
          '',
          client.client_id,
          vscode.TreeItemCollapsibleState.None,
          callback,
          'ApplicationValueTreeItem:CallbackUrl'
        )
    ) || []
  );
}

export function buildRefreshTokenChildren(client: Client & { refresh_token: any }) {
  const { rotation_type, token_lifetime, leeway } = client.refresh_token;
  const children = [];
  if (rotation_type !== undefined) {
    children.push(
      new ApplicationValueTreeItem(
        'Rotation Type',
        rotation_type,
        client.client_id,
        vscode.TreeItemCollapsibleState.None,
        rotation_type,
        'ApplicationValueTreeItem:RotationType'
      )
    );
  }
  if (token_lifetime !== undefined) {
    children.push(
      new ApplicationValueTreeItem(
        'Token Lifetime',
        `${token_lifetime}`,
        client.client_id,
        vscode.TreeItemCollapsibleState.None,
        token_lifetime,
        'ApplicationValueTreeItem:TokenLifetime'
      )
    );
  }
  if (leeway !== undefined) {
    children.push(
      new ApplicationValueTreeItem(
        'Leeway',
        `${leeway}`,
        client.client_id,
        vscode.TreeItemCollapsibleState.None,
        leeway,
        'ApplicationValueTreeItem:Leeway'
      )
    );
  }
  return children;
}
