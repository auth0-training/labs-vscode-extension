import * as vscode from 'vscode';
import { Auth } from '../../../auth';
import type { TokenSet } from 'openid-client';
import { getDomainFromToken } from '../../../utils';

const defaultStatus = 'Auth0: None';
class StatusBarImpl implements vscode.Disposable {
  private readonly statusBarItem: vscode.StatusBarItem;

  constructor() {
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      100
    );
    this.statusBarItem.command = 'auth0.auth.switchTenant';
    this.statusBarItem.show();

    Auth.onAuthStatusChanged(this.update, this);
  }

  update(tokenSet: TokenSet | undefined) {
    if (tokenSet && tokenSet.access_token) {
      this.statusBarItem.text = `Auth0: ${getDomainFromToken(
        tokenSet.access_token
      )}`;
    } else {
      this.statusBarItem.text = defaultStatus;
    }
  }

  dispose() {
    this.statusBarItem.dispose();
  }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const StatusBar = new StatusBarImpl();
