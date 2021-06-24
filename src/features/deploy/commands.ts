import * as vscode from 'vscode';
import * as path from 'path';
import { load } from 'js-yaml';
import { tools } from 'auth0-deploy-cli';
import { getClient } from '../../client';
const registerCommand = vscode.commands.registerCommand;

export class DeployCommands {
  constructor(private subscriptions: { dispose(): any }[]) {
    subscriptions.push(...[registerCommand('auth0.deploy', this.deploy)]);
    subscriptions.push(
      ...[registerCommand('auth0.silentDeploy', this.silentDeploy)]
    );
  }

  silentDeploy = async (e: vscode.Uri) => {
    console.log('auth0:silentDeploy');
    const filePath = e.path;
    if (!filePath) {
      return;
    }
    const client = await getClient();
    const assets = load(tools.loadFile(filePath, process.env));
    await tools.deploy(assets, client, () => null);
    await vscode.commands.executeCommand('auth0.app.refresh');
    await vscode.commands.executeCommand('auth0.api.refresh');
  };

  deploy = async (e: vscode.Uri) => {
    console.log('auth0:deploy');
    const filePath = e.path;
    if (!filePath) {
      return;
    }

    vscode.window.showInformationMessage(
      'Deploying: ' + path.basename(filePath)
    );

    await this.silentDeploy(e);

    vscode.window.showInformationMessage(
      'Successfully deployed  ' + path.basename(filePath)
    );
  };
}
