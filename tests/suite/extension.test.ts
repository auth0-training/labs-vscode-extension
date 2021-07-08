import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
// import * as myExtension from '../../extension';

suite('Extension', () => {
  vscode.window.showInformationMessage('Start all tests.');

  test('should start extension auth0.vscode-labs', async () => {
    const started = vscode.extensions.getExtension('auth0.vscode-labs');
    assert.notStrictEqual(started, undefined);
    if (started) {
      await started.activate();
      assert.strictEqual(started && started.isActive, true);
    }
  });
});
