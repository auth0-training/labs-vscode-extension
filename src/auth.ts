/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from 'vscode';
import { OIDC_CONFIG } from './auth.config';
import { Client, Issuer, TokenSet } from 'openid-client';
import { AbortController } from 'abort-controller';
import { getDomainFromToken } from './utils';
import axios from 'axios';
import { TokenSetParameters } from 'openid-client';

const SECRET_KEY_SERVICE_NAME = 'auth0-vsc-token-set';
const authStatusEventEmitter = new vscode.EventEmitter<TokenSet | undefined>();

export class Auth {
  public static onAuthStatusChanged = authStatusEventEmitter.event;

  private static issuer: Issuer<Client>;
  private static client: Client;
  private static storage: vscode.SecretStorage;

  public static useStorage(storage: vscode.SecretStorage): void {
    this.storage = storage;
  }

  private static async getClient(): Promise<Client> {
    console.log('auth0.auth.getClient');
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
    console.log('auth0.auth.getTokenSet');
    const secret = await this.storage.get(SECRET_KEY_SERVICE_NAME);

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
    console.log('auth0.auth.refreshTokenSet');
    const client = await this.getClient();
    const newTokenSet = await client.refresh(current);
    await this.storage.store(
      SECRET_KEY_SERVICE_NAME,
      JSON.stringify(newTokenSet)
    );

    authStatusEventEmitter.fire(newTokenSet);

    return newTokenSet;
  }

  public static async silentSignIn(): Promise<void> {
    console.log('auth0.auth.silentSignIn');
    const tokenSet = await this.getTokenSet();

    authStatusEventEmitter.fire(tokenSet);
  }

  public static async getTokensFromStorage(): Promise<TokenSet> {
    console.log("auth0.auth.getTokensFromStorage");
    try {
      const url = process.env.TOKEN_STORAGE_URL;
      if (!url) {
        throw new Error('missing TOKEN_STORAGE_URL');
      }
      const response = await axios.get(`${url}/token/${process.env.THEIA_CLOUD_SESSION_UID}`);

      console.log('data is', JSON.stringify(response.data, null, 2));
      console.log(response.data);

      const options: TokenSetParameters = {
        ...response.data,
        expires_at: Date.now() + 600000,
      };

      return new TokenSet(options);
    } catch (error) {
      console.error("Couldn't get tokens from storage", error.message);
      throw error;
    }
  }

  public static async signIn(): Promise<void> {
    console.log('auth0.auth.signIn');
    console.log('token storage URL: ', process.env.TOKEN_STORAGE_URL);
    console.log('token storage env: ', process.env);

    if (process.env.TOKEN_STORAGE_URL) {
      return vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "Getting Tokens from Storage: Please be patient...",
          cancellable: true,
        },
        async (progress, token) => {
          const tokenSet = await this.getTokensFromStorage();

          if (!tokenSet) {
            return;
          }

          await this.storage.store(
            SECRET_KEY_SERVICE_NAME,
            JSON.stringify(tokenSet)
          );

          authStatusEventEmitter.fire(tokenSet);
        }
      );
    }

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

        await this.storage.store(
          SECRET_KEY_SERVICE_NAME,
          JSON.stringify(tokenSet)
        );

        authStatusEventEmitter.fire(tokenSet);
      }
    );
  }

  public static async signOut(): Promise<void> {
    console.log('auth0.auth.signOut');
    await this.storage.delete(SECRET_KEY_SERVICE_NAME);

    authStatusEventEmitter.fire(undefined);
  }

  public static async isAuthenticated(): Promise<boolean> {
    console.log('auth0.auth.isAuthenticated');
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
