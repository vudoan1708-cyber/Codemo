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
  private _rulesOfThreadableOperation = {
    node: {
      functionDeclaration: /(function).*({)|(const).*(() => {)/g,
      functionInvocation: /[a-zA-z0-9].*(\()[a-zA-Z0-9]?.*\)/g,
      classDeclaration: /(class).*({)/g,
      classInvocation: /(new).*[a-zA-Z0-9](\()/g,
    },
    browser: {
      functionDeclaration: null,
      functionInvocation: null,
      classDeclaration: null,
      classInvocation: null,
    },
    php: {
      functionDeclaration: null,
      functionInvocation: null,
      classDeclaration: null,
      classInvocation: null,
    },
  };

  public fileContent: string | NodeJS.ArrayBufferView;
  public pathToTheCodeSnippetFile: string;
  public previousThread: Thread;
  public currentThread: Thread;

  constructor(public environment: keyof EnvironmentToExtMapper = 'node') {
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

  async findThreadables(): Promise<{ threads: Thread[], exception: Exception | null }> {
    // Dynamically import the code snippet to test its sanity
    try {
      // Dynamic variable path import does not work so have to hard code it for now
      // @ts-ignore
      const imported = await import('../snippet/temp.js');
      const module = imported.default || imported;

      if (!module) {
        return {
          threads: [],
          exception: {
            detail: 'Module not found or is malformed',
          },
        };
      }

      // Check against the rules of threadable operation
      const match = (this.fileContent as string).match(this._rulesOfThreadableOperation[this.environment].classDeclaration as RegExp);
      const match2 = (this.fileContent as string).match(this._rulesOfThreadableOperation[this.environment].functionDeclaration as RegExp);
      const match3 = (this.fileContent as string).match(this._rulesOfThreadableOperation[this.environment].classInvocation as RegExp);
      const match4 = (this.fileContent as string).match(this._rulesOfThreadableOperation[this.environment].functionInvocation as RegExp);

      console.warn(match, match2, match3, match4);
    } catch (ex: any) {
      console.warn('ex', ex);
      return {
        threads: [],
        exception: {
          detail: ex.message,
        },
      };
    }

    return {
      threads: [],
      exception: null,
    };
  }
}
