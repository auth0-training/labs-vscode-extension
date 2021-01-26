import * as vscode from "vscode";
import { ActionsTreeDataProvider } from "./actions.provider";

export let actionsTreeDataProvider: ActionsTreeDataProvider;

export function registerTreeDataProviders() {
  actionsTreeDataProvider = new ActionsTreeDataProvider();

  vscode.window.registerTreeDataProvider(
    "auth0.actions-explorer",
    actionsTreeDataProvider
  );
}
