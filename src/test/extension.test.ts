import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Test Suite', () => {
	test('activates the markdown copy button extension', async () => {
		const extensionId = 'barnim.markdown-code-copy-button';
		const extension = vscode.extensions.getExtension(extensionId);
		assert.ok(extension, `Extension ${extensionId} should be available`);

		await extension.activate();
		assert.strictEqual(extension.isActive, true, 'Extension should activate successfully');
	});
});
