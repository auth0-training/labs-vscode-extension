import * as vscode from 'vscode';
import { workspace } from 'vscode';
import { MemFS } from './memory';

export const fileSystemProvider = new MemFS();
export function registerFileSystemProvider(): vscode.Disposable[] {
  return [workspace.registerFileSystemProvider('auth0-actions', fileSystemProvider)];
}
