import * as vscode from 'vscode';
import { stringToByteArray, sortAlphabetically } from './../utils';
import { ActionRootTreeItem, ActionTreeItem } from '../tree-items/action.tree-item';
import { getActions, getActionVersionsDraft, upsertActionVersionsDraft } from '../store/api';
import { fileSystemProvider } from '../filesystem';
import {
  buildRootChildren,
  buildDependenciesChildren,
  buildSecretsChildren,
} from '../tree-items/action.tree-item.builder';

const TREE_ITEM_LABELS = {
  dependencies: 'Dependencies',
  secrets: 'Secrets',
};

export class ActionsTreeDataProvider
  implements vscode.TreeDataProvider<vscode.TreeItem>, vscode.Disposable {
  private _disposables: vscode.Disposable[] = [];

  private _onDidChangeTreeData: vscode.EventEmitter<
    ActionTreeItem | undefined | void
  > = new vscode.EventEmitter<ActionTreeItem | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<ActionTreeItem | undefined | void> = this
    ._onDidChangeTreeData.event;

  public _actions: any[] | null = null;

  constructor() {
    this._disposables.push(
      fileSystemProvider.onDidChangeFile(async (events) => {
        for (const event of events) {
          const action = this._actions?.find((a: any) => {
            return a.uri.toString() === event.uri.toString();
          });

          vscode.window.withProgress(
            {
              location: vscode.ProgressLocation.Notification,
              title: `Saving changes`,
              cancellable: false,
            },
            async (progress) => {
              progress.report({ increment: 0 });

              const eventFile = await vscode.workspace.fs.readFile(event.uri);

              await upsertActionVersionsDraft(action.id, {
                code: eventFile.toString(),
                runtime: action.draft.runtime,
                dependencies: action.draft.dependencies,
                secrets: [],
              });

              progress.report({ increment: 100, message: `Done!` });
            }
          );
        }
      })
    );
  }

  async clear() {
    this._actions = [];
    this._onDidChangeTreeData.fire();
    this.dispose();
  }

  async refresh() {
    await this.getActions(true);
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: ActionTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: ActionTreeItem): Thenable<vscode.TreeItem[]> {
    return this.getActions(false).then(() => {
      if (element) {
        return this.getTreeItems(element);
      } else {
        return this.getTreeItems();
      }
    });
  }

  private async getActions(forceReload: boolean) {
    if (forceReload || !this._actions) {
      const { actions } = await getActions();
      const actionsWithDraft = await Promise.all(
        actions.map(async (action: any) => {
          const draft = await getActionVersionsDraft(action.id);
          return Object.assign({}, action, { draft });
        })
      );

      this._actions = actionsWithDraft.sort(sortAlphabetically<any>((item) => item.name || ''));

      for (const action of this._actions) {
        action.uri = vscode.Uri.parse(
          `auth0-actions://${action.id}/${encodeURIComponent(action.name)}.js`
        );
        await fileSystemProvider.writeFile(action.uri, stringToByteArray(action.draft.code), {
          create: true,
          overwrite: true,
          silent: true,
        });
      }
    }

    return this._actions;
  }

  private getTreeItems(parent?: ActionTreeItem): vscode.TreeItem[] {
    if (!this._actions) {
      return [];
    }

    if (!parent) {
      return this._actions.map((action) => ActionRootTreeItem.fromAction(action));
    }

    const action: any = this._actions.find(({ id }) => id === parent.actionId);

    switch (parent.label) {
      case TREE_ITEM_LABELS.dependencies:
        return buildDependenciesChildren(action);
      case TREE_ITEM_LABELS.secrets:
        return buildSecretsChildren(action);
      case action.name:
        return buildRootChildren(action);
    }

    return [];
  }

  dispose() {
    this._disposables.forEach((disposable) => disposable.dispose());
  }
}
