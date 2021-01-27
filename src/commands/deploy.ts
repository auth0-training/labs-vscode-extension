import * as vscode from 'vscode';
import * as tools from 'auth0-source-control-extension-tools';
import * as extTools from 'auth0-extension-tools';
import * as path from 'path';
import * as fs from 'fs';
import { load } from 'js-yaml';
import { getTreeDataProviders } from '../providers';
import { getClientWithToken } from '../store/api';

export function registerDeployCommands(): vscode.Disposable[] {
  return [
    vscode.commands.registerCommand('auth0.deploy', async (e) => {
      const managementClient = getClientWithToken();
      const { applicationsTreeDataProvider, apisTreeDataProvider } = getTreeDataProviders();
      if (managementClient) {
        try {
          const filePath = e.path;
          vscode.window.showInformationMessage('Deploying: ' + path.basename(filePath));
          // TODO: use safeLoad instead
          const assets = load(fs.readFileSync(filePath, 'utf8'));
          const config = extTools.config();
          config.setProvider(() => null);
          await tools.deploy(assets, managementClient, config);
          vscode.window.showInformationMessage('Successfully deployed  ' + path.basename(filePath));

          await Promise.all([
            apisTreeDataProvider.refresh(),
            applicationsTreeDataProvider.refresh(),
          ]);
        } catch (err) {
          console.log(err);
          vscode.window.showErrorMessage('Deploy failed. Error: ' + err.message);
        }
      } else {
        vscode.window.showWarningMessage('You must first authenticate with Auth0');
      }
    }),
  ];
}
