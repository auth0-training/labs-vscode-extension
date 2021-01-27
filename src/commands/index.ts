import * as vscode from 'vscode';
import { ManagementClient } from 'auth0';
import { registerActionCommands } from './actions';
import { registerApiCommands } from './apis';
import { registerApplicationCommands } from './applications';
import { registerDeployCommands } from './deploy';
import { registerLinkCommands } from './links';

export function registerCommands(): vscode.Disposable[] {
  return [
    ...registerActionCommands(),
    ...registerApiCommands(),
    ...registerApplicationCommands(),
    ...registerDeployCommands(),
    ...registerLinkCommands(),
  ];
}
