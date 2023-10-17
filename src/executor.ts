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

  createThreads(codeSnippet: CodeSnippet): Thread[] {
    return [];
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
