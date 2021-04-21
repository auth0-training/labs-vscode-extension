/* eslint-disable @typescript-eslint/naming-convention */
// https://code.visualstudio.com/api/advanced-topics/remote-extensions#persisting-secrets

// Ignoring this import because this module is built in to VSCode, so we don't
// need to install the package ourselves - but TS complains.
// @ts-ignore
import * as keytarType from 'keytar';
import { env } from 'vscode';

declare const __webpack_require__: typeof require;
declare const __non_webpack_require__: typeof require;

export function getNodeModule<T>(moduleName: string): T {
  const r = typeof __webpack_require__ === 'function' ? __non_webpack_require__ : require;
  try {
    return r(`${env.appRoot}/node_modules.asar/${moduleName}`);
  } catch (err) {
    // Not in ASAR.

    try {
      return r(`${env.appRoot}/node_modules/${moduleName}`);
    } catch (err) {
      // Not available.
      throw err;
    }

    throw err;
  }
}

export const keytar = getNodeModule<typeof keytarType>('keytar');
