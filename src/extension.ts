// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { ManagementClient } from "auth0";
import * as vscode from "vscode";
import { initializeAuth, getAccessToken, getDomainFromToken } from "./auth";
import { ApplicationsTreeDataProvider } from "./providers/applications.provider";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
  // TODO: Check if already logged in, set correct state, view, etc
  let applicationsTreeDataProvider: { _clients: any[]; };

  let disposable = vscode.commands.registerCommand(
    "auth0.signIn",
    async () => {
      await initializeAuth(context);

      const accessToken = await getAccessToken();

      if (!accessToken) {
        // TODO correctly handle error
        throw new Error('Missing access token');
      }

      const domain = getDomainFromToken(accessToken);
      const client = new ManagementClient({
        token: accessToken,
        domain: domain
      });

      const applicationsTreeDataProvider = new ApplicationsTreeDataProvider(
        client
      );

      vscode.window.registerTreeDataProvider(
        "auth0.app-explorer",
        applicationsTreeDataProvider
      );
    }
  );

  vscode.commands.registerCommand('auth0.helloAuziros', async () => {
    vscode.window.showInformationMessage('🚀 🚀 🚀 🚀');
  });

  vscode.commands.registerCommand("auth0.refreshApps", () => {
    console.log('refresh apps');
  });

  vscode.commands.registerCommand("auth0.copyValue", (e) => {
    vscode.env.clipboard.writeText(e.value);
    vscode.window.showInformationMessage(`${e.label} copied to clipboard!`);
  });

  vscode.commands.registerCommand("auth0.copyAsJson", (e) => {
    const client = applicationsTreeDataProvider._clients.find(c => c.client_id === e.clientId);
    vscode.env.clipboard.writeText(JSON.stringify(client));
    vscode.window.showInformationMessage(`Copied Client as JSON to clipboard!`);
  });

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
