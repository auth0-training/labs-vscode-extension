import * as vscode from 'vscode';
import { getClientWithToken } from '../store/api';
import { ActionsTreeDataProvider } from './actions.provider';
import { ApisTreeDataProvider } from './apis.provider';
import { ApplicationsTreeDataProvider } from './applications.provider';

let actionsTreeDataProvider: ActionsTreeDataProvider;
let applicationsTreeDataProvider: ApplicationsTreeDataProvider;
let apisTreeDataProvider: ApisTreeDataProvider;

export function registerTreeDataProviders() {
  const managementClient = getClientWithToken();
  actionsTreeDataProvider = new ActionsTreeDataProvider();
  applicationsTreeDataProvider = new ApplicationsTreeDataProvider(managementClient);
  apisTreeDataProvider = new ApisTreeDataProvider(managementClient);

  return [
    vscode.window.registerTreeDataProvider('auth0.actions-explorer', actionsTreeDataProvider),
    vscode.window.registerTreeDataProvider('auth0.app-explorer', applicationsTreeDataProvider),
    vscode.window.registerTreeDataProvider('auth0.api-explorer', apisTreeDataProvider),
  ];
}

export function getTreeDataProviders() {
  return {
    actionsTreeDataProvider,
    applicationsTreeDataProvider,
    apisTreeDataProvider,
  };
}
