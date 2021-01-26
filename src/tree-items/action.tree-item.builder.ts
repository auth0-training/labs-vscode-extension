import * as vscode from 'vscode';
import { Client } from "auth0";
import { ValueTreeItem } from "./value.tree-item";

export function buildRootChildren(action: any) {
  const children = [
    new ValueTreeItem(
      'Supported Trigger',
      action.supported_triggers[0].id,
      vscode.TreeItemCollapsibleState.None
    ),
  ];

  if (action.current_version) {
      children.push(
        new ValueTreeItem(
            'Node Version',
            action.current_version.runtime,
            vscode.TreeItemCollapsibleState.None
          ),
      );

      children.push(
        new ValueTreeItem(
            'Status',
            action.current_version.status,
            vscode.TreeItemCollapsibleState.None
          ),
      );
  }

  
  return children;
}
