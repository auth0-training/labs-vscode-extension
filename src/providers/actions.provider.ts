import * as vscode from 'vscode';
import { stringToByteArray, sortAlphabetically } from './../utils';
import { ActionRootTreeItem, ActionTreeItem } from '../tree-items/action.tree-item';
import { getActions, getActionVersionsDraft, upsertActionVersionsDraft } from '../store/api';
import { fileSystemProvider } from '../filesystem';
import { buildRootChildren } from '../tree-items/action.tree-item.builder';
import { store } from '../store';

export class ActionsTreeDataProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    ActionTreeItem | undefined | void
  > = new vscode.EventEmitter<ActionTreeItem | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<ActionTreeItem | undefined | void> = this
    ._onDidChangeTreeData.event;

  public _actions: any[] = [];

  constructor() {
    fileSystemProvider.onDidChangeFile(async (events) => {
      for (const event of events) {
        const action = store.actions.find((a: any) => {
          return a.uri.toString() === event.uri.toString();
        });
        const eventFile = await vscode.workspace.fs.readFile(event.uri);
        await upsertActionVersionsDraft(action.id, {
          code: eventFile.toString(),
          runtime: action.draft.runtime,
          dependencies: action.draft.dependencies,
          secrets: [],
        });
      }
    });
  }

  async refresh() {
    await this.getActions(true);
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: ActionTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: ActionTreeItem): Thenable<vscode.TreeItem[]> {
    return this.getActions(true).then(() => {
      if (element) {
        return this.getTreeItems(element);
      } else {
        return this.getTreeItems();
      }
    });
  }

  private async getActions(forceReload: boolean) {
    if (forceReload || !this._actions || !this._actions.length) {
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

    store.actions = this._actions;
    return this._actions;
  }

  private getTreeItems(parent?: ActionTreeItem): vscode.TreeItem[] {
    if (!parent) {
      return this._actions.map((action) => ActionRootTreeItem.fromAction(action));
    }

    const action: any = this._actions.find(({ id }) => id === parent.actionId);

    switch (parent.label) {
      case action.name:
        return buildRootChildren(action);
    }

    return [];
  }
}
