import { execSync } from 'child_process';

export default class Node {
  constructor() {}

  execSync(command: string) {
    execSync('node');
  }
}
