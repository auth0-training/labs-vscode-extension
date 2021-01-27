import * as vscode from 'vscode';
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
  ];

  return children;
}
