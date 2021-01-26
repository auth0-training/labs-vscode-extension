// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { Client, ManagementClient } from "auth0";
import * as vscode from "vscode";
import { initializeAuth, getAccessToken, getDomainFromToken } from "./auth";
import { ApplicationsTreeDataProvider } from "./providers/applications.provider";
const tools = require('auth0-source-control-extension-tools')
const extTools = require('auth0-extension-tools');
import {load} from 'js-yaml';
import * as fs from 'fs';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
  // TODO: Check if already logged in, set correct state, view, etc
  let applicationsTreeDataProvider: ApplicationsTreeDataProvider;
  let managementClient: ManagementClient;
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
      managementClient = new ManagementClient({
        token: accessToken,
        domain: domain
      });

      applicationsTreeDataProvider = new ApplicationsTreeDataProvider(
        managementClient
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
    applicationsTreeDataProvider.refresh();
  });

  vscode.commands.registerCommand("auth0.addApp", async () => {
    const appTypes: { [key: string]: string } = {
      'Regular Web App': 'regular_web',
      'Single Page App': 'spa',
      'Machine to Machine': 'non_interactive',
      'Native': 'native'
    };

    const name = await vscode.window.showInputBox({
      placeHolder: "My App",
      prompt: "Enter an application name",
      ignoreFocusOut: true,
      validateInput: (text: string) =>
        text !== null && text !== undefined && text !== ""
          ? ""
          : "Enter an application name",
    });

    const appType = await vscode.window.showQuickPick(Object.keys(appTypes), {
      ignoreFocusOut: true
    }) || "";

    await managementClient.createClient({
      name,
      app_type: appTypes[appType]
    });
    
    applicationsTreeDataProvider.refresh();
  });

  vscode.commands.registerCommand("auth0.removeApp", async (e) => {
    await managementClient.deleteClient({
      client_id: e.clientId
    });
    
    applicationsTreeDataProvider.refresh();
    vscode.window.showInformationMessage("Client removed");
  });

  vscode.commands.registerCommand("auth0.addCallbackUrl", async (e) => {
    const client = applicationsTreeDataProvider._clients.find(c => c.client_id === e.clientId);
    const url = await vscode.window.showInputBox({
      placeHolder: "http://localhost:3000",
      prompt: "Enter a callback URL",
      ignoreFocusOut: true,
      validateInput: (text: string) =>
        text !== null && text !== undefined && text !== ""
          ? ""
          : "Enter a callback URL",
    });
    const callbacks: string[] = [
      ...(client?.callbacks || []),
      url || ""
    ];
    await managementClient.updateClient({
      client_id: client?.client_id || ''
    }, { callbacks });

    applicationsTreeDataProvider.refresh();
    vscode.window.showInformationMessage(`${url} added as a callback URL`);
  });

  vscode.commands.registerCommand("auth0.removeCallbackUrl", async (e) => {
    const client = applicationsTreeDataProvider._clients.find(c => c.client_id === e.clientId);
    const url = e.label;
    const callbacks = (client?.callbacks || []).filter(cb => cb !== url);
    await managementClient.updateClient({
      client_id: client?.client_id || ''
    }, { callbacks });

    applicationsTreeDataProvider.refresh();
    vscode.window.showInformationMessage(`${url} removed as a callback URL`);
  });

  vscode.commands.registerCommand("auth0.editRotationType", async (e) => {
    const client = applicationsTreeDataProvider._clients.find(c => c.client_id === e.clientId) as  Client & { refresh_token: any };
    const rotationTypes: { [key: string]: string } = {
      "Rotating": "rotating",
      "Non Rotating": "non-rotating"
    }
    const rotationType = await vscode.window.showQuickPick(Object.keys(rotationTypes), {
      ignoreFocusOut: true
    }) || "";

    await managementClient.updateClient({
      client_id: client?.client_id || ''
    }, {
      refresh_token: {
        ...client.refresh_token,
        rotation_type: rotationTypes[rotationType],
        // Well ... Enabling Refresh Token Rotation has some requirements ...
        expiration_type: rotationTypes[rotationType] === 'rotating' ? 'expiring' : client.refresh_token.expiration_type,
        infinite_token_lifetime: rotationTypes[rotationType] === 'rotating' ? false : client.refresh_token.infinite_token_lifetime,
        infinite_idle_token_lifetime: rotationTypes[rotationType] === 'rotating' ? false : client.refresh_token.infinite_idle_token_lifetime
      },
      oidc_conformant: rotationTypes[rotationType] === 'rotating' ? true : client.oidc_conformant
    });

    applicationsTreeDataProvider.refresh();
    vscode.window.showInformationMessage(`Rotation Type set to ${rotationType}`);
  });

  vscode.commands.registerCommand("auth0.editTokenLifetime", async (e) => {
    const client = applicationsTreeDataProvider._clients.find(c => c.client_id === e.clientId) as  Client & { refresh_token: any };
    
    const token_lifetime = await vscode.window.showInputBox({
      placeHolder: "2600000",
      prompt: "Enter the token liftetime",
      ignoreFocusOut: true,
      validateInput: (text: string) =>
        text !== null && text !== undefined && text !== "" && !isNaN(Number(text))
          ? ""
          : "Enter the token lifetime",
    });

    await managementClient.updateClient({
      client_id: client?.client_id || ''
    }, {
      refresh_token: {
        ...client.refresh_token,
        token_lifetime: Number(token_lifetime)
      }
    });

    applicationsTreeDataProvider.refresh();
    vscode.window.showInformationMessage(`Token Lifetime set to ${token_lifetime}`);
  });

  vscode.commands.registerCommand("auth0.editLeeway", async (e) => {
    const client = applicationsTreeDataProvider._clients.find(c => c.client_id === e.clientId) as  Client & { refresh_token: any };
    
    const leeway = await vscode.window.showInputBox({
      placeHolder: "0",
      prompt: "Enter the leeway",
      ignoreFocusOut: true,
      validateInput: (text: string) =>
        text !== null && text !== undefined && text !== "" && !isNaN(Number(text))
          ? ""
          : "Enter the leeway",
    });

    await managementClient.updateClient({
      client_id: client?.client_id || ''
    }, {
      refresh_token: {
        ...client.refresh_token,
        leeway: Number(leeway)
      }
    });

    applicationsTreeDataProvider.refresh();
    vscode.window.showInformationMessage(`Leeway set to ${leeway}`);
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

  vscode.commands.registerCommand("auth0.deploy", async (e) => {
    const filePath = e.path;
    vscode.window.showInformationMessage('deploying' + filePath);

    // assets = parsed yaml
    try {
      // TODO: use safeLoad instead
      const assets = load(fs.readFileSync(filePath, 'utf8'))
      const config = extTools.config();
      config.setProvider(() => null);
      await tools.deploy(assets, managementClient, config);
    } catch (err) {
      console.log(err);
    }
  });

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
