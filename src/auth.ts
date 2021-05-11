/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from 'vscode';
import { keytar } from './secrets';
import { OIDC_CONFIG } from './auth.config';
import { Client, Issuer, TokenSet } from 'openid-client';
import { AbortController } from 'abort-controller';
import { getDomainFromToken } from './utils';

const SECRET_KEY_SERVICE_NAME = 'auth0-vsc-token-set';

const authStatusEventEmitter = new vscode.EventEmitter<TokenSet | undefined>();

export class Auth {
  public static onAuthStatusChanged = authStatusEventEmitter.event;

  private static issuer: Issuer<Client>;
  private static client: Client;

  private static async getClient(): Promise<Client> {
    console.log('auth0:auth:getClient');
    if (this.client) {
      return this.client;
    }
    this.issuer = await Issuer.discover(OIDC_CONFIG.ISSUER);
    this.client = new this.issuer.Client({
      client_id: OIDC_CONFIG.CLIENT_ID,
      redirect_uris: [],
      response_types: [],
      token_endpoint_auth_method: 'none',
    });
    return this.getClient();
  }

  public static async getTokenSet(): Promise<TokenSet | undefined> {
    console.log('auth0:auth:getTokenSet');
    const secret = await keytar.getPassword(
      SECRET_KEY_SERVICE_NAME,
      'token_set'
    );

    if (secret) {
      const tokenSet = new TokenSet(JSON.parse(secret));
      if (tokenSet.expired()) {
        return this.refreshTokenSet(tokenSet);
      }
      return tokenSet;
    }
    return undefined;
  }

  private static async refreshTokenSet(current: TokenSet): Promise<TokenSet> {
    console.log('auth0:auth:refreshTokenSet');
    const client = await this.getClient();
    const newTokenSet = await client.refresh(current);
    await keytar.setPassword(
      SECRET_KEY_SERVICE_NAME,
      'token_set',
      JSON.stringify(newTokenSet)
    );

    authStatusEventEmitter.fire(newTokenSet);

    return newTokenSet;
  }

  public static async silentSignIn(): Promise<void> {
    console.log('auth0:auth:silentSignIn');
    const tokenSet = await this.getTokenSet();

    authStatusEventEmitter.fire(tokenSet);
  }

  public static async signIn(): Promise<void> {
    console.log('auth0:auth:signIn');
    const client = await this.getClient();
    const handle = await client.deviceAuthorization({
      audience: OIDC_CONFIG.AUDIENCE,
      scope: OIDC_CONFIG.SCOPE,
    });

    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `Sign in: Your pairing code is ${handle.user_code}`,
        cancellable: true,
      },
      async (progress, token) => {
        vscode.commands.executeCommand(
          'vscode.open',
          vscode.Uri.parse(handle.verification_uri_complete)
        );

        const abort = new AbortController();
        token.onCancellationRequested(() => {
          abort.abort();
        });

        const tokenSet = await handle.poll(abort);

        if (!tokenSet) {
          return;
        }

        await keytar.setPassword(
          SECRET_KEY_SERVICE_NAME,
          'token_set',
          JSON.stringify(tokenSet)
        );

        authStatusEventEmitter.fire(tokenSet);
      }
    );
  }

  public static async signOut(): Promise<void> {
    console.log('auth0:auth:signOut');
    await keytar.deletePassword(SECRET_KEY_SERVICE_NAME, 'token_set');
    authStatusEventEmitter.fire(undefined);
  }

  public static async isAuthenticated(): Promise<boolean> {
    console.log('auth0:auth:isAuthenticated');
    const tokenSet = await this.getTokenSet();
    if (tokenSet) {
      return !tokenSet.expired();
    }
    return false;
  }

  public static dispose(): void {
    authStatusEventEmitter.dispose();
  }
}

export async function getTenantDomain() {
  const tokenSet = await Auth.getTokenSet();
  if (tokenSet && tokenSet.access_token) {
    return getDomainFromToken(tokenSet.access_token);
  }
}
