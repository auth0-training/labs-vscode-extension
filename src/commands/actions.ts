import * as vscode from 'vscode';
import { ExtensionContext } from 'vscode';
import { actionsTreeDataProvider } from '../providers';

export async function registerActionCommands(context: ExtensionContext) {
  vscode.commands.registerCommand('auth0.openAction', async (e) => {
    vscode.commands.executeCommand('vscode.open', e.value.uri, {
      preview: true,
      viewColumn: vscode.ViewColumn.Active,
    });
  });

  vscode.commands.registerCommand("auth0.refreshActions", () => {
    actionsTreeDataProvider.refresh();
  });

}
