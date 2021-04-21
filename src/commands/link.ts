import * as vscode from 'vscode';
import { LinksViewDataProvider } from '../views';

const registerCommand = vscode.commands.registerCommand;

export class LinkCommands {
  constructor(
    private subscriptions: { dispose(): any }[],
    linksViewDataProvider: LinksViewDataProvider
  ) {
    subscriptions.push(
      ...[
        registerCommand('auth0.links.openManage', () => {
          return vscode.env.openExternal(
            vscode.Uri.parse('https://manage.auth0.com')
          );
        }),
        registerCommand('auth0.links.openCommunity', () => {
          return vscode.env.openExternal(
            vscode.Uri.parse('https://community.auth0.com')
          );
        }),
        vscode.commands.registerCommand('auth0.links.openDocs', () => {
          return vscode.env.openExternal(
            vscode.Uri.parse('https://auth0.com/docs')
          );
        }),
        registerCommand('auth0.links.openQuickstarts', () => {
          return vscode.env.openExternal(
            vscode.Uri.parse('https://auth0.com/docs/quickstarts')
          );
        }),
        registerCommand('auth0.links.openSupport', () => {
          return vscode.env.openExternal(
            vscode.Uri.parse('https://support.auth0.com')
          );
        }),
        registerCommand('auth0.links.openProServices', () => {
          return vscode.env.openExternal(
            vscode.Uri.parse('https://auth0.com/professional-services')
          );
        }),
      ]
    );
  }
}
