import * as vscode from 'vscode';

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

export async function startTour(uri: vscode.Uri) {
  const ext = await getExtension();
  const api = ext.exports;
  try {
    api.startTourByUri(uri);
  } catch (e) {
    const confirm = await vscode.window.showErrorMessage(
      `Unable to start lab due to error: ${e.message}`
    );
  }
}
