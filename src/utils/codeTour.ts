import * as vscode from 'vscode';
import { logger } from './logger';

async function getExtension(): Promise<vscode.Extension<any>> {
  const ext = vscode.extensions.getExtension('vsls-contrib.codetour');
  if (ext && !ext?.isActive) {
    await ext?.activate();
  }

  if (!ext) {
    throw new Error('Cannot load CodeTour extension');
  }

  return ext;
}

export async function stepReached(): Promise<any> {
  const ext = await getExtension();
  const api = ext.exports;
  try {
    // passes the current tour and step to the logger; Doesn't fire on tour start, at least not on the first step of the first tour in the Lab
    return api.onDidStartTour(
      ([tour, stepNumber]: [tour: string, stepNumber: number]) => {
        logger('STEP_REACHED', { tour, stepNumber });
      }
    );
  } catch (e: any) {
    logger('ERROR', e.message || e);
  }
}

export async function startTour(uri: vscode.Uri) {
  const ext = await getExtension();
  const api = ext.exports;
  try {
    // passes the current tour and step to the logger; Seems to also fire on step change
    api.onDidStartTour(
      ([tour, stepNumber]: [tour: string, stepNumber: number]) => {
        logger('STEP_REACHED', { tour, stepNumber });
      }
    );
    api.startTourByUri(uri);
  } catch (e: any) {
    const confirm = await vscode.window.showErrorMessage(
      `Unable to start lab due to error: ${e.message}`
    );
  }
}
