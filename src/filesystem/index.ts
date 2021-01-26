import { workspace } from 'vscode';
import { MemFS } from './memory';

export const fileSystemProvider = new MemFS();
export function registerFileSystemProvider() {
  workspace.registerFileSystemProvider('auth0-actions', fileSystemProvider);
}
