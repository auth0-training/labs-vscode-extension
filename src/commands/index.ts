import { ExtensionContext } from 'vscode';
import { registerActionCommands } from './actions';

export function registerCommands(context: ExtensionContext) {
  registerActionCommands(context);
}
