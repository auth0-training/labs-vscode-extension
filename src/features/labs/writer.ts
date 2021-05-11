import * as vscode from 'vscode';
import { Resolver } from './resolver';

const openTextDocument = vscode.workspace.openTextDocument;
const fs = vscode.workspace.fs;

export class LabEnvWriter {
  constructor(private worspace: vscode.Uri) {}

  writeAll = async (resolvers: Resolver[]) => {
    resolvers.forEach(async (resolver) => {
      const uri = vscode.Uri.joinPath(
        this.worspace,
        resolver.getDirectory(),
        '.env'
      );
      const env = resolver
        .resolveEnv(resolvers)
        .map((i) => `${i.name}=${i.value}`)
        .join('\n');
      await fs.writeFile(uri, Buffer.from(env, 'utf8'));
    });
  };
}
