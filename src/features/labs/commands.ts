import { window, commands, env, Uri, ProgressLocation } from 'vscode';
import * as path from 'path';
import { getLabEnvironment, getLabWorkspace } from './workspace';
import { LabResourceResolverBuilder } from './resolver';
import { LabEnvWriter } from './writer';
import { LocalEnvironment } from './models';
import { getFileUri } from '../../utils';

const registerCommand = commands.registerCommand;
const executeCommand = commands.executeCommand;
export class LabCommands {
  constructor(
    private subscriptions: { dispose(): any }[],
    private labDataResolver: LabResourceResolverBuilder
  ) {
    subscriptions.push(
      ...[
        registerCommand('auth0.lab.notification', this.checkLab),
        registerCommand('auth0.lab.configure', this.configureLab),
        registerCommand('auth0.lab.localConfigure', this.localConfigure),
        registerCommand('auth0.lab.openLocalEndpoint', this.openLocalEndpoint),
      ]
    );
  }

  openLocalEndpoint = async (e: Uri): Promise<boolean> => {
    console.log('auth0:labs:silentDeploy');
    if (e) {
      return env.openExternal(e);
    }
    return false;
  };

  checkLab = async (): Promise<void> => {
    console.log('auth0:labs:checkLab');
    const lab = await getLabEnvironment();
    if (lab !== undefined) {
      executeCommand('setContext', 'auth0:isLabWorkspace', true);
      window
        .showInformationMessage(
          'We detected an .auth0/lab folder. Would you like to configure the Auth0 lab?',
          ...['Configure', 'Cancel']
        )
        .then((selection) => {
          if (selection === 'Configure') {
            executeCommand('auth0.lab.configure');
          }
        });
    }
  };

  configureLab = async (): Promise<void> => {
    console.log('auth0:labs:configureLab');
    const workspace = getLabWorkspace();
    const labEnv = await getLabEnvironment();

    await window.withProgress(
      {
        location: ProgressLocation.Notification,
        title: `Configuring Lab Environment`,
        cancellable: true,
      },
      async (progress, token) => {
        token.onCancellationRequested(() => {
          console.log('auth0:labs:configureLab:canceled');
        });

        //deploy lab tenant resources
        progress.report({
          increment: 0,
        });
        if (
          workspace !== undefined &&
          labEnv !== undefined &&
          !token.isCancellationRequested
        ) {
          if (labEnv.resources) {
            const uri = getFileUri(
              `/.auth0/lab/${labEnv.resources}`,
              workspace.uri
            );
            progress.report({
              message: 'deploying ' + path.basename(uri.path),
              increment: 30,
            });
            await executeCommand('auth0.silentDeploy', uri);
          }

          //write local environments
          if (
            (labEnv.clients || labEnv.resourceServers) &&
            !token.isCancellationRequested
          ) {
            progress.report({
              message: 'writing local environment files',
              increment: 60,
            });
            await executeCommand('auth0.lab.localConfigure', labEnv);
          }

          //issue post command to kick off next process
          if (labEnv.postConfigureCommand && !token.isCancellationRequested) {
            progress.report({
              message: 'starting lab',
              increment: 4,
            });
            executeCommand(labEnv.postConfigureCommand);
          }

          progress.report({
            message: 'lab ready',
            increment: 100,
          });
        }
      }
    );
  };

  localConfigure = async (labEnv: LocalEnvironment): Promise<void> => {
    console.log('auth0:labs:localConfigure');
    const workspace = getLabWorkspace();
    const resolvers = await this.labDataResolver.build(labEnv);
    if (workspace) {
      new LabEnvWriter(workspace.uri).writeAll(resolvers);
    }
  };
}