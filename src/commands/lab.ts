import { window, workspace, commands, WorkspaceFolder, Uri } from 'vscode';
import { existsSync } from 'fs';
import { LocalEnvironment } from '../models';
import { getFileUri, readUriContents } from '../utils';

const registerCommand = commands.registerCommand;
const executeCommand = commands.executeCommand;
const workspaceFolders = workspace.workspaceFolders;

export class LabCommands {
  constructor(private subscriptions: { dispose(): any }[]) {
    subscriptions.push(
      ...[
        registerCommand('auth0.lab.notification', this.checkLab),
        registerCommand('auth0.lab.configure', this.configureLab),
      ]
    );
  }

  getLabWorkspace = (): WorkspaceFolder | undefined => {
    if (workspaceFolders === undefined) {
      return undefined;
    }
    const folders = workspaceFolders.filter((workspace: WorkspaceFolder) => {
      const uri = Uri.joinPath(workspace.uri, '.auth0/lab');
      return existsSync(uri.path);
    });

    return folders[0];
  };

  discoverLabEnvironment = async (
    workspace: WorkspaceFolder
  ): Promise<LocalEnvironment | undefined> => {
    const uri = getFileUri('/.auth0/lab/environment.json', workspace.uri);
    const data = await readUriContents(uri);
    const env: LocalEnvironment = JSON.parse(data);
    return env;
  };

  getLabEnvironment = async (): Promise<LocalEnvironment | undefined> => {
    const labWorkspace = this.getLabWorkspace();
    if (labWorkspace !== undefined) {
      return await this.discoverLabEnvironment(labWorkspace);
    }
  };

  checkLab = async (): Promise<void> => {
    const lab = await this.getLabEnvironment();
    if (lab !== undefined) {
      window
        .showInformationMessage(
          'We detected an .auth0/lab folder. Would you like to configure the Auth0 lab?',
          ...['Configure', 'Cancel']
        )
        .then((selection) => {
          if (selection === 'Configure') {
            executeCommand('setContext', 'auth0:isLabWorkspace', true);
            executeCommand('auth0.lab.configure');
          }
        });
    }
  };

  configureLab = async (): Promise<void> => {
    const workspace = this.getLabWorkspace();
    const labEnv = await this.getLabEnvironment();
    if (workspace !== undefined && labEnv !== undefined) {
      if (labEnv.resources) {
        const uri = getFileUri(
          `/.auth0/lab/${labEnv.resources}`,
          workspace.uri
        );
        await executeCommand('auth0.deploy', uri);
      }

      if (labEnv.clients || labEnv.resourceServers) {
        await executeCommand('auth0.lab.localConfigure', labEnv);
      }
    }
  };
}
