import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension', () => {
  test('should start extension auth0.vscode', async () => {
    const started = vscode.extensions.getExtension('auth0.vscode');
    assert.notStrictEqual(started, undefined);
    if (started) {
      await started.activate();
      assert.strictEqual(started && started.isActive, true);
    }
  });
});
