import * as vscode from 'vscode';

import fs from 'fs';
import path from 'path';

// Types
import { Thread, EnvironmentToExtMapper, Exception } from './types';

export default class CodeSnippet {
  private _environmentsToExtensionMapper: EnvironmentToExtMapper = {
    node: 'js',
    browser: 'js',
    php: 'php',
  };
  private _fileExtension = 'js';
  private _fileName = 'temp';

  public fileContent: string | NodeJS.ArrayBufferView;
  public pathToTheCodeSnippetFile: string;
  public previousThread: Thread;
  public currentThread: Thread;

  constructor(environment: keyof EnvironmentToExtMapper = 'node') {
    this._fileExtension = this._environmentsToExtensionMapper[environment];
  }

  /**
   * Create a file out of a given content
   * @param pathToSnippetFolder The absolute path to the output folder
   * @param content The file content to be written to a file in the output folder
   */
  create(pathToSnippetFolder: string, content: string | NodeJS.ArrayBufferView): void {
    if (!fs.existsSync(pathToSnippetFolder)) {
			fs.mkdirSync(pathToSnippetFolder);
		}
    console.warn('content', content);

    const fullFileName = `${this._fileName}.${this._fileExtension}`;
    this.pathToTheCodeSnippetFile = path.join(pathToSnippetFolder, fullFileName);
    this.fileContent = content;

    try {
      fs.writeFileSync(this.pathToTheCodeSnippetFile, content, 'utf-8');
      // fs.createReadStream(vscode.Uri.file(path.join(pathToSnippetFolder, fullFileName)));
    } catch (ex: any) {
      vscode.window.showErrorMessage(ex.detail);
    }
  }

  async findThreadables(): Promise<Thread[] | Exception> {
    // Dynamically import the code snippet
    try {
      const module = await import(this.pathToTheCodeSnippetFile);

      if (!module) {
        return {
          detail: '[codemo] Module not found or is malformed',
        };
      }
    } catch (ex: any) {
      return {
        message: ex.message,
        detail: `[codemo] ${ex.detail}`,
      };
    }

    return [];
  }
}
