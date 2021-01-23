// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { ManagementClient } from "auth0";
import * as vscode from "vscode";
import { ApplicationsTreeDataProvider } from "./providers/applications.provider";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
  let domain: string | undefined;

  const client = new ManagementClient({
    clientId: '',
    clientSecret: '',
    domain: ''
  });

  const applicationsTreeDataProvider = new ApplicationsTreeDataProvider(
    client
  );

  vscode.window.registerTreeDataProvider(
    "auth0-app-explorer",
    applicationsTreeDataProvider
  );

  let disposable = vscode.commands.registerCommand(
    "auth0.authenticate",
    async () => {
      // The code you place here will be executed every time your command is executed
      if (!domain) {
        domain = await vscode.window.showInputBox({
          placeHolder: "your-domain.us.auth0.com",
          prompt: "Enter your Auth0 domain",
          value: domain,
          validateInput: (text: string) =>
            text !== null && text !== undefined && text !== ""
              ? ""
              : "Enter your Auth0 domain",
        });
      }



      if (domain) {
        // Store basic auth details in global state
        context.globalState.update("extensionState", { domain });
        console.log(domain);
      }
    }
  );

  vscode.commands.registerCommand("auth0.refreshApps", () => {
    console.log('refresh apps');
  });



  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
