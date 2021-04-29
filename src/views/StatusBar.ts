import * as vscode from 'vscode';
import type { TokenSet } from 'openid-client';
import { getDomainFromToken } from '../utils';

class StatusBarImpl implements vscode.Disposable {
  private readonly statusBarItem: vscode.StatusBarItem;

  constructor() {
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      100
    );
    this.statusBarItem.command = 'auth0.auth.switchTenant';
    this.statusBarItem.show();
  }

  dispose() {
    this.statusBarItem.dispose();
  }

  setTextFromTokenSet(tokenSet: TokenSet | undefined) {
    if (tokenSet && !tokenSet.expired() && tokenSet.access_token) {
      this.statusBarItem.text = `Auth0: ${getDomainFromToken(
        tokenSet.access_token
      )}`;
    } else {
      this.statusBarItem.text = 'Auth0: None';
    }
  }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const StatusBar = new StatusBarImpl();
