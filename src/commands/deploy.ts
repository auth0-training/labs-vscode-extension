import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { load } from 'js-yaml';
import * as tools from 'auth0-source-control-extension-tools';
import * as extTools from 'auth0-extension-tools';
import { getClient } from '../client';

const registerCommand = vscode.commands.registerCommand;

export class DeployCommands {
  constructor(private subscriptions: { dispose(): any }[]) {
    subscriptions.push(...[registerCommand('auth0.deploy', this.deploy)]);
  }

  deploy = async (e: vscode.Uri) => {
    console.log('auth0:deploy');
    const filePath = e.path;
    if (!filePath) {
      return;
    }
    const client = await getClient();
    vscode.window.showInformationMessage(
      'Deploying: ' + path.basename(filePath)
    );

    const assets = load(
      tools.keywordReplace(fs.readFileSync(filePath, 'utf8'), process.env)
    );
    const config = extTools.config();
    config.setProvider(() => null);
    await tools.deploy(assets, client, config);
    vscode.window.showInformationMessage(
      'Successfully deployed  ' + path.basename(filePath)
    );

    await vscode.commands.executeCommand('auth0.app.refresh');
    await vscode.commands.executeCommand('auth0.api.refresh');
  };
}
