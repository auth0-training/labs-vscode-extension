import * as vscode from 'vscode';
import { Client } from "auth0";
import { ApplicationTreeItem } from "./application.tree-item";
import { ValueTreeItem } from "./value.tree-item";
import { obfuscate } from '../utils';

export function buildRootChildren(client: Client & { refresh_token : any }) {
  const children = [
    new ValueTreeItem(
      'Client ID',
      client.client_id,
      vscode.TreeItemCollapsibleState.None
    ),
    new ValueTreeItem(
      'Client Secret',
      obfuscate(client.client_secret),
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
  if (client?.callbacks && client?.callbacks.length) {
    children.push(
      new ApplicationTreeItem(
        'Callback URLs',
        '',
        client.client_id,
        vscode.TreeItemCollapsibleState.Collapsed,
      )
    );
  }
  return children;
}

export function buildCallbackUrlsChildren(client: Client | undefined) {
  return client?.callbacks?.map(callback => new ValueTreeItem(
    callback,
    '',
    vscode.TreeItemCollapsibleState.None
  )) || [];
}

export function buildRefreshTokenChildren(client: Client & { refresh_token: any }) {
  const { rotation_type, token_lifetime, leeway } = client.refresh_token;
  const children = [];
  if (rotation_type !== undefined) {
    children.push(
      new ApplicationTreeItem(
        'Rotation Type',
        rotation_type,
        client.client_id,
        vscode.TreeItemCollapsibleState.None,
      )
    );
  }
  if (token_lifetime !== undefined) {
    children.push(
      new ApplicationTreeItem(
        'Token Lifetime',
        `${token_lifetime}`,
        client.client_id,
        vscode.TreeItemCollapsibleState.None
      )
    );
  }
  if (leeway !== undefined) {
    children.push(
      new ApplicationTreeItem(
        'Leeway',
        `${leeway}`,
        client.client_id,
        vscode.TreeItemCollapsibleState.None
      )
    );
  }
  return children;
}