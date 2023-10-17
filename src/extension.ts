import * as vscode from 'vscode';

import path from 'path';

// Classes
import CodeSnippet from './codeSnippet';
import Executor from './executor';
import Node from './node';

// Constants
import { SNIPPET_FOLDER } from './constants';

// Types
import { EnvironmentToExtMapper } from './types';

export function activate(context: vscode.ExtensionContext) {
	const extension = new CodemoExtension();

	const disposable = vscode.commands.registerCommand('codemo.startPhase', async () => {
		await extension.run('node');
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}

class CodemoExtension {
  private _executor: Executor;
  private _codeSnippet: CodeSnippet;

	constructor() {}

	async run(environment: keyof EnvironmentToExtMapper) {
		// Watch selected text in a document
		const activeDocument = vscode.window.activeTextEditor;
		const selection = activeDocument?.selection;

		if (selection?.start.isEqual(selection?.end)) {
			console.log('No selection was made');
			return;
		}

		const range = new vscode.Range(selection?.start as vscode.Position, selection?.end as vscode.Position);
		const content = activeDocument?.document.getText(range);

		const pathToSnippetFolder = path.join(__dirname, '..', SNIPPET_FOLDER);

		// Create a code snippet instance
		this._codeSnippet = new CodeSnippet(environment);
		await this._codeSnippet.create(pathToSnippetFolder, content as string);

		// Create an executor instance
		switch (environment) {
      case 'node':
        this._executor = new Executor(new Node());
        break;
      default:
        vscode.window.showErrorMessage('[codemo] Cannot decide the programming language');
        break;
    }

		// Find all threads from the code snippet
		const threads = this._executor.createThreads(this._codeSnippet);

		// Execute the threads one by one
		// this._executor.executeCommand(threads);
	}
}
