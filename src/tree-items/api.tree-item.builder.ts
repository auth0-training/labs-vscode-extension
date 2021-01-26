import * as vscode from 'vscode';
import { ResourceServer } from "auth0";
import { ApiTreeItem } from './api.tree-item';
import { ApiValueTreeItem } from './api-value.tree-item';

export function buildRootChildren(resourceServer: ResourceServer) {
  return [
    new ApiValueTreeItem(
      'Identifier',
      resourceServer.identifier,
      resourceServer.identifier,
      vscode.TreeItemCollapsibleState.None,
      resourceServer.identifier,
    ),
    new ApiValueTreeItem(
      'Allow Offline Access',
      `${resourceServer.allow_offline_access}`,
      resourceServer.identifier,
      vscode.TreeItemCollapsibleState.None,
      `${resourceServer.allow_offline_access}`,
      'ApiValueTreeItem:AllowOfflineAccess'
    ),
    new ApiValueTreeItem(
      'Token Lifetime',
      `${resourceServer.token_lifetime}`,
      resourceServer.identifier,
      vscode.TreeItemCollapsibleState.None,
      `${resourceServer.token_lifetime}`,
      'ApiValueTreeItem:TokenLifetime'
    ),
    new ApiValueTreeItem(
      'Token Lifetime (web)',
      `${resourceServer.token_lifetime_for_web}`,
      resourceServer.identifier,
      vscode.TreeItemCollapsibleState.None,
      `${resourceServer.token_lifetime_for_web}`,
      'ApiValueTreeItem:TokenLifetimeWeb'
    ),
  ];
}