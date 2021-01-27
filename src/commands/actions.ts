import * as vscode from 'vscode';
import { actionsTreeDataProvider } from '../providers';
import {
  removeAction,
  deployActionVersionsDraft,
  upsertActionVersionsDraft,
  createAction,
} from '../store/api';
import { MultiStepInput } from '../utils/multi-step-pick';

export async function registerActionCommands() {
  vscode.commands.registerCommand('auth0.actions.open', async (e) => {
    vscode.commands.executeCommand('vscode.open', e.value.uri, {
      preview: true,
      viewColumn: vscode.ViewColumn.Active,
    });
  });

  vscode.commands.registerCommand('auth0.actions.refresh', () => {
    actionsTreeDataProvider.refresh();
  });

  vscode.commands.registerCommand('auth0.actions.remove', async (e) => {
    vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `Removing action`,
        cancellable: false,
      },
      async (progress) => {
        progress.report({ increment: 0 });

        await removeAction(e.value.id);

        progress.report({ increment: 50 });

        await actionsTreeDataProvider.refresh();

        progress.report({ increment: 100, message: `Done!` });
      }
    );
  });

  vscode.commands.registerCommand('auth0.actions.deploy', async (e) => {
    vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `Deploying action`,
        cancellable: false,
      },
      async (progress) => {
        progress.report({ increment: 0 });

        await deployActionVersionsDraft(e.value.id);

        progress.report({ increment: 50 });

        await actionsTreeDataProvider.refresh();

        progress.report({ increment: 100, message: `Done!` });
      }
    );
  });

  vscode.commands.registerCommand('auth0.actions.removeDependency', async (e) => {
    vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `Removing dependency: ${e.label}@${e.description}`,
        cancellable: false,
      },
      async (progress) => {
        progress.report({ increment: 0 });

        await upsertActionVersionsDraft(e.value.id, {
          code: e.value.draft.code,
          runtime: e.value.draft.runtime,
          dependencies: e.value.draft.dependencies.filter((d: any) => d.name !== e.label),
          secrets: e.value.draft.secrets,
        });

        progress.report({ increment: 50 });

        await actionsTreeDataProvider.refresh();

        progress.report({ increment: 100, message: `Done!` });
      }
    );
  });

  vscode.commands.registerCommand('auth0.actions.removeSecret', async (e) => {
    vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `Removing secret: ${e.label}`,
        cancellable: false,
      },
      async (progress) => {
        progress.report({ increment: 0 });

        await upsertActionVersionsDraft(e.value.id, {
          code: e.value.draft.code,
          runtime: e.value.draft.runtime,
          dependencies: e.value.draft.dependencies,
          secrets: e.value.draft.secrets.filter((s: any) => s.name !== e.label),
        });

        progress.report({ increment: 50 });

        await actionsTreeDataProvider.refresh();

        progress.report({ increment: 100, message: `Done!` });
      }
    );
  });

  vscode.commands.registerCommand('auth0.actions.addDependency', async (e) => {
    interface State {
      title: string;
      step: number;
      totalSteps: number;

      name: string;
      version: string;
    }

    async function collectInputs() {
      const state = {} as Partial<State>;
      await MultiStepInput.run((input) => inputDependencyName(input, state));
      return state as State;
    }

    const title = 'Add Dependency';

    async function inputDependencyName(input: MultiStepInput, state: Partial<State>) {
      state.name = await input.showInputBox({
        title,
        step: 1,
        totalSteps: 2,
        value: state.name || '',
        prompt: 'Enter module name',
        validate: async (name: string) => {
          return name === '' ? 'Dependency name required' : undefined;
        },
        shouldResume: () =>
          new Promise<boolean>((resolve, reject) => {
            // noop
          }),
      });
      return (input: MultiStepInput) => inputDependencyVersion(input, state);
    }

    async function inputDependencyVersion(input: MultiStepInput, state: Partial<State>) {
      state.version = await input.showInputBox({
        title,
        step: 2,
        totalSteps: 2,
        value: state.version || 'latest',
        prompt: 'Enter module version',
        validate: async (version: string) => {
          return version === '' ? 'Dependency version required' : undefined;
        },
        shouldResume: () =>
          new Promise<boolean>((resolve, reject) => {
            // noop
          }),
      });
    }

    const state = await collectInputs();

    vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `Adding dependency: ${state.name}@${state.version}`,
        cancellable: false,
      },
      async (progress) => {
        progress.report({ increment: 0 });

        await upsertActionVersionsDraft(e.value.id, {
          code: e.value.draft.code,
          runtime: e.value.draft.runtime,
          dependencies: e.value.draft.dependencies.concat([
            { name: state.name, version: state.version },
          ]),
          secrets: e.value.draft.secrets,
        });

        progress.report({ increment: 50 });

        await actionsTreeDataProvider.refresh();

        progress.report({ increment: 100, message: `Done!` });
      }
    );
  });

  vscode.commands.registerCommand('auth0.actions.addSecret', async (e) => {
    interface State {
      title: string;
      step: number;
      totalSteps: number;

      key: string;
      value: string;
    }

    async function collectInputs() {
      const state = {} as Partial<State>;
      await MultiStepInput.run((input) => inputSecretKey(input, state));
      return state as State;
    }

    const title = 'Add Secret';

    async function inputSecretKey(input: MultiStepInput, state: Partial<State>) {
      state.key = await input.showInputBox({
        title,
        step: 1,
        totalSteps: 2,
        value: state.key || '',
        prompt: 'Enter secret key',
        validate: async (name: string) => {
          return name === '' ? 'Secret key required' : undefined;
        },
        shouldResume: () =>
          new Promise<boolean>((resolve, reject) => {
            // noop
          }),
      });
      return (input: MultiStepInput) => inputSecretValue(input, state);
    }

    async function inputSecretValue(input: MultiStepInput, state: Partial<State>) {
      state.value = await input.showInputBox({
        title,
        step: 2,
        totalSteps: 2,
        value: state.value || '',
        prompt: 'Enter secret value',
        validate: async (version: string) => {
          return version === '' ? 'Secret value required' : undefined;
        },
        shouldResume: () =>
          new Promise<boolean>((resolve, reject) => {
            // noop
          }),
      });
    }

    const state = await collectInputs();

    vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `Adding secret: ${state.key}`,
        cancellable: false,
      },
      async (progress) => {
        progress.report({ increment: 0 });

        await upsertActionVersionsDraft(e.value.id, {
          code: e.value.draft.code,
          runtime: e.value.draft.runtime,
          dependencies: e.value.draft.dependencies,
          secrets: (e.value.draft.secrets || []).concat([{ name: state.key, value: state.value }]),
        });

        progress.report({ increment: 50 });

        await actionsTreeDataProvider.refresh();

        progress.report({ increment: 100, message: `Done!` });
      }
    );
  });

  vscode.commands.registerCommand('auth0.actions.add', async () => {
    const TRIGGER_LABEL_TYPES: any = {
      'post-login': 'Login / Post Login',
      'credentials-exchange': 'M2M / Client-Credentials',
    };

    const triggerTypes: vscode.QuickPickItem[] = [
      'post-login',
      'credentials-exchange',
    ].map((id) => ({ id, label: TRIGGER_LABEL_TYPES[id] }));

    interface State {
      title: string;
      step: number;
      totalSteps: number;

      name: string;
      triggerType: vscode.QuickPickItem & { id?: string };
    }

    async function collectInputs() {
      const state = {} as Partial<State>;
      await MultiStepInput.run((input) => inputName(input, state));
      return state as State;
    }

    const title = 'Create Action';

    async function inputName(input: MultiStepInput, state: Partial<State>) {
      state.name = await input.showInputBox({
        title,
        step: 1,
        totalSteps: 2,
        value: state.name || '',
        prompt: 'Enter action name',
        validate: async (name: string) => {
          return name === '' ? 'Action name required' : undefined;
        },
        shouldResume: () =>
          new Promise<boolean>((resolve, reject) => {
            // noop
          }),
      });
      return (input: MultiStepInput) => pickTriggerType(input, state);
    }

    async function pickTriggerType(input: MultiStepInput, state: Partial<State>) {
      state.triggerType = await input.showQuickPick({
        title,
        step: 1,
        totalSteps: 2,
        placeholder: 'Choose trigger type',
        items: triggerTypes,
        activeItem: typeof state.triggerType !== 'string' ? state.triggerType : undefined,
        buttons: [],
        shouldResume: () =>
          new Promise<boolean>((resolve, reject) => {
            // noop
          }),
      });
    }

    const state = await collectInputs();

    vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `Creating action`,
        cancellable: false,
      },
      async (progress) => {
        progress.report({ increment: 0 });

        await createAction({
          name: state.name,
          triggerType: state.triggerType.id as string,
        });

        progress.report({ increment: 50 });

        await actionsTreeDataProvider.refresh();

        progress.report({ increment: 100, message: `Done!` });
      }
    );
  });
}
