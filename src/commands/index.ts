import * as vscode from 'vscode';
import { registerApiCommands } from './apis';
import { registerApplicationCommands } from './applications';
import { registerDeployCommands } from './deploy';
import { registerLinkCommands } from './links';

export function registerCommands(): vscode.Disposable[] {
  return [
    ...registerApiCommands(),
    ...registerApplicationCommands(),
    ...registerDeployCommands(),
    ...registerLinkCommands(),
  ];
}
