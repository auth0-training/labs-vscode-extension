import * as vscode from 'vscode';
import { getClientWithToken } from '../store/api';
import { ApisTreeDataProvider } from './apis.provider';
import { ApplicationsTreeDataProvider } from './applications.provider';

let applicationsTreeDataProvider: ApplicationsTreeDataProvider;
let apisTreeDataProvider: ApisTreeDataProvider;

export function registerTreeDataProviders() {
  const managementClient = getClientWithToken();
  applicationsTreeDataProvider = new ApplicationsTreeDataProvider(managementClient);
  apisTreeDataProvider = new ApisTreeDataProvider(managementClient);

  return [
    vscode.window.registerTreeDataProvider('auth0.app-explorer', applicationsTreeDataProvider),
    vscode.window.registerTreeDataProvider('auth0.api-explorer', apisTreeDataProvider),
  ];
}

export function getTreeDataProviders() {
  return {
    applicationsTreeDataProvider,
    apisTreeDataProvider,
  };
}
