/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from 'vscode';
import * as path from 'path';
import { dump, deploy } from 'auth0-deploy-cli/';
import { getClient } from '../../client';
import { getDomainFromToken, getFileUri, readUriContents } from '../../utils';
import { ImportParams } from 'auth0-deploy-cli/lib/args';

const registerCommand = vscode.commands.registerCommand;

export class DeployCommands {
  constructor(private subscriptions: { dispose(): any }[]) {
    subscriptions.push(
      ...[
        registerCommand('auth0.exportTenant', this.exportTenant),
        registerCommand('auth0.deploy', this.deploy),
        registerCommand('auth0.silentDeploy', this.silentDeploy),
      ]
    );
  }

  exportTenant = async (e: vscode.Uri) => {
    console.log('auth0.exportTenant');
    const client = await getClient();
    const accessToken = await client.getAccessToken();
    const outputFolder =
      e?.fsPath || vscode.workspace.workspaceFolders![0].uri.fsPath;

    if (!outputFolder || !accessToken) {
      return;
    }
    try {
      vscode.window.showInformationMessage(
        `Exporting: ${getDomainFromToken(accessToken)} to ${outputFolder}`
      );

      await dump({
        output_folder: outputFolder,
        format: 'yaml',
        config: await this.mergeConfig(outputFolder, {
          AUTH0_DOMAIN: getDomainFromToken(accessToken),
          AUTH0_ACCESS_TOKEN: accessToken,
        }),
      });

      vscode.window.showInformationMessage(
        `Successfully exported ${getDomainFromToken(
          accessToken
        )} to ${outputFolder}`
      );
    } catch (e: any) {
      vscode.window.showErrorMessage(e.message);
    }
  };

  silentDeploy = async (e: vscode.Uri) => {
    console.log('auth0.silentDeploy');
    const filePath = e.path;
    const fileDir = path.dirname(filePath);
    const client = await getClient();
    const accessToken = await client.getAccessToken();

    if (!filePath || !accessToken) {
      return;
    }
    try {
      const opts: ImportParams = {
        input_file: filePath,
        config: await this.mergeConfig(fileDir, {
          AUTH0_ACCESS_TOKEN: accessToken,
          AUTH0_DOMAIN: getDomainFromToken(accessToken),
          AUTH0_CLIENT_ID: 'NEEDED FOR v7.17.0 Deploy CLI',
          AUTH0_ALLOW_DELETE: false,
        }),
      };
      await deploy(opts);
    } catch (e: any) {
      vscode.window.showErrorMessage(e.message);
    }

    await vscode.commands.executeCommand('auth0.app.refresh');
    await vscode.commands.executeCommand('auth0.api.refresh');
  };

  deploy = async (e: vscode.Uri) => {
    console.log('auth0.deploy');
    const filePath = e.path;
    if (!filePath) {
      return;
    }

    vscode.window.showInformationMessage(
      'Deploying: ' + path.basename(filePath)
    );
    try {
      await this.silentDeploy(e);
    } catch (e: any) {
      vscode.window.showErrorMessage(e.message);
    }

    vscode.window.showInformationMessage(
      `Successfully deployed  ${path.basename(filePath)}`
    );
  };

  mergeConfig = async (
    outputFolder: string,
    defaultConfig: any
  ): Promise<any> => {
    console.log('auth0.mergeConfig');

    try {
      const file = path.join(outputFolder, 'config.json');
      const uri = getFileUri(file);
      const data = await readUriContents(uri);
      const localConfig = JSON.parse(data);
      return { ...defaultConfig, ...localConfig };
    } catch (e: any) {
      return defaultConfig;
    }
  };
}
