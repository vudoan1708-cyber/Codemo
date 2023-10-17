import * as vscode from 'vscode';

// Classes
import Node from './node';
import CodeSnippet from './codeSnippet';

// Types
import { Thread } from './types';

export default class Executor {
  // Node | PHP | ... many more to come
  constructor(private _instance: Node) {
    
  }

  async createThreads(codeSnippet: CodeSnippet): Promise<Thread[]> {
    const result = await codeSnippet.findThreadables();

    if (result.exception !== null) {
      vscode.window.showErrorMessage(`[codemo] ${result.exception.detail}`);
      return [];
    }

    return result.threads;
  }

  /**
   * This function executes threadable operation and returns the result
   * @param commandThread Executable thread
   */
  executeCommand(commandThread: Thread) {

  }

  executeCommands(commandThreads: Thread[]) {
    commandThreads.forEach((thread) => {
      this.executeCommand(thread);
    });
  }
}
