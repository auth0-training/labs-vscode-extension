import * as vscode from 'vscode';
import { actionsTreeDataProvider } from '../providers';
import { removeAction } from '../store/api';

export async function registerActionCommands() {
  vscode.commands.registerCommand('auth0.actions.open', async (e) => {
    vscode.commands.executeCommand('vscode.open', e.value.uri, {
      preview: true,
      viewColumn: vscode.ViewColumn.Active,
    });
  });

  vscode.commands.registerCommand('auth0.actions.refresh', () => {
    actionsTreeDataProvider.refresh();
  });

  vscode.commands.registerCommand('auth0.actions.remove', async (e) => {
    console.log(e);

    await removeAction(e.value.id);

    actionsTreeDataProvider.refresh();
    vscode.window.showInformationMessage('Actions removed');
  });
}
