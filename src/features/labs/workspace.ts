import { workspace, WorkspaceFolder, Uri } from 'vscode';
import { existsSync } from 'fs';
import { LocalEnvironment } from './models';
import { getFileUri, readUriContents } from '../../utils';

const workspaceFolders = workspace.workspaceFolders;

export const getLabWorkspace = (): WorkspaceFolder | undefined => {
  if (workspaceFolders === undefined) {
    return undefined;
  }
  const folders = workspaceFolders.filter((workspace: WorkspaceFolder) => {
    const uri = Uri.joinPath(workspace.uri, '.auth0/lab');
    return existsSync(uri.path);
  });

  return folders[0];
};

export const discoverLabEnvironment = async (
  workspace: WorkspaceFolder
): Promise<LocalEnvironment | undefined> => {
  const uri = getFileUri('/.auth0/lab/environment.json', workspace.uri);
  const data = await readUriContents(uri);
  const env: LocalEnvironment = JSON.parse(data);
  return env;
};

export const getLabEnvironment = async (): Promise<
  LocalEnvironment | undefined
> => {
  const labWorkspace = getLabWorkspace();
  if (labWorkspace !== undefined) {
    return await discoverLabEnvironment(labWorkspace);
  }
};
