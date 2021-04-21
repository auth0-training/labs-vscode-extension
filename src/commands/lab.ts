import * as vscode from 'vscode';

const registerCommand = vscode.commands.registerCommand;

export class LabCommands {
  constructor(private subscriptions: { dispose(): any }[]) {
    subscriptions.push(
      ...[
        registerCommand('auth0.lab.notification', this.checkLab),
        registerCommand('auth0.lab.configure', this.configureLab),
      ]
    );
  }

  checkLab = async (): Promise<void> => {
    if (vscode.workspace.workspaceFolders !== undefined) {
      const uri = vscode.Uri.file(
        vscode.workspace.workspaceFolders[0].uri.path + '/.auth0/lab'
      );
      vscode.workspace.fs.readDirectory(uri).then(
        (files) => {
          vscode.window
            .showInformationMessage(
              'We detected an .auth0/lab folder. Would you like to configure the Auth0 lab?',
              ...['Configure', 'Cancel']
            )
            .then((selection) => {
              if (selection === 'Configure') {
                vscode.commands.executeCommand(
                  'setContext',
                  'auth0:isLabWorkspace',
                  true
                );
                vscode.commands.executeCommand('auth0.lab.configure');
              }
            });
        },
        (err) => {
          console.log('No .auth0/lab folder detected in the workspace');
        }
      );
    }
  };

  configureLab = async (): Promise<void> => {
    vscode.window.showInformationMessage('TODO: Configure Lab');
    // read environment.json file
    // Check the resources property for a tenant yml configuration file.
    // If found execute the auth0.tenantConfigure command passing the file path.
    // Check the clients and resourceServers properties for items.
    // If found execute the auth0.localConfigure command
  };
}
