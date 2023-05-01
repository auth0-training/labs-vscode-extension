import * as vscode from 'vscode';
import { readUriContents } from '../../utils';
import { Resolver } from './resolver';

const openTextDocument = vscode.workspace.openTextDocument;
const fs = vscode.workspace.fs;

export class LabEnvWriter {
  constructor(private workspace: vscode.Uri) {}

  getExisting = async (uri: vscode.Uri) => {
    try {
      // will error if file does not exist
      const stat = await fs.stat(uri);

      // read and parse file into name/value pairs
      return await readUriContents(uri)
        .then((file) => file.split('\n'))
        .then((lines) =>
          lines.map((line) => {
            const pair = line.split('=');
            return { name: pair[0], value: pair[1] };
          })
        );
    } catch {
      // return an empty array if file does not exist
      return [];
    }
  };

  writeAll = async (resolvers: Resolver[]) => {
    for (const resolver of resolvers) {
      const uri = vscode.Uri.joinPath(
        this.workspace,
        resolver.getDirectory(),
        '.env'
      );

      const existingEnv = await this.getExisting(uri);
      const newEnv = resolver.resolveEnv(resolvers);
      const unique = [
        ...new Map(existingEnv.concat(newEnv).map((m) => [m.name, m])).values(),
      ];

      const env = unique.map((i) => `${i.name}=${i.value}`).join('\n');

      await fs.writeFile(uri, Buffer.from(env, 'utf8'));
    }
  };
}
