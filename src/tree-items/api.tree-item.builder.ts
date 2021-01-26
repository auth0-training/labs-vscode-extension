import * as vscode from 'vscode';
import { ResourceServer } from "auth0";
import { ApiValueTreeItem } from './api-value.tree-item';

export function buildRootChildren(resourceServer: ResourceServer & { is_system : boolean }) {
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
      !resourceServer.is_system ? 'ApiValueTreeItem:AllowOfflineAccess' : 'ApiValueTreeItem:AllowOfflineAccess:System'
    ),
    new ApiValueTreeItem(
      'Token Lifetime',
      `${resourceServer.token_lifetime}`,
      resourceServer.identifier,
      vscode.TreeItemCollapsibleState.None,
      `${resourceServer.token_lifetime}`,
      !resourceServer.is_system ? 'ApiValueTreeItem:TokenLifetime' : 'ApiValueTreeItem:TokenLifetime:System'
    ),
    new ApiValueTreeItem(
      'Token Lifetime (web)',
      `${resourceServer.token_lifetime_for_web}`,
      resourceServer.identifier,
      vscode.TreeItemCollapsibleState.None,
      `${resourceServer.token_lifetime_for_web}`,
      !resourceServer.is_system ? 'ApiValueTreeItem:TokenLifetimeWeb' : 'ApiValueTreeItem:TokenLifetimeWeb:System'
    ),
  ];
}