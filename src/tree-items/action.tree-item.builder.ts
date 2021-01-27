import * as vscode from 'vscode';
import { ActionTreeItem } from './action.tree-item';
import { ActionValueTreeItem } from './action-value.tree-item';

export function buildRootChildren(action: any) {
  const children = [
    new ActionValueTreeItem(
      'Supported Trigger',
      action.supported_triggers[0].id,
      vscode.TreeItemCollapsibleState.None
    ),
    new ActionValueTreeItem(
      'Node Version',
      action.current_version?.runtime || 'Unknown',
      vscode.TreeItemCollapsibleState.None
    ),
    new ActionValueTreeItem(
      'Status',
      action.current_version?.status || 'Unknown',
      vscode.TreeItemCollapsibleState.None
    ),
    new ActionTreeItem(
      'Dependencies',
      action.id,
      vscode.TreeItemCollapsibleState.Collapsed,
      action,
      'ActionTreeItem:Dependencies'
    ),
    new ActionTreeItem(
      'Secrets',
      action.id,
      vscode.TreeItemCollapsibleState.Collapsed,
      action,
      'ActionTreeItem:Secrets'
    ),
  ];

  return children;
}

export function buildDependenciesChildren(action: any) {
  return (
    action?.draft?.dependencies?.map(
      (dependency: any) =>
        new ActionValueTreeItem(
          dependency.name,
          dependency.version,
          vscode.TreeItemCollapsibleState.None,
          action,
          'ActionValueTreeItem:Dependency'
        )
    ) || []
  );
}

export function buildSecretsChildren(action: any) {
  return (
    action?.draft?.secrets?.map(
      (secret: any) =>
        new ActionValueTreeItem(
          secret.name,
          '',
          vscode.TreeItemCollapsibleState.None,
          action,
          'ActionValueTreeItem:Secret'
        )
    ) || []
  );
}
