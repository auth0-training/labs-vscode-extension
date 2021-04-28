export interface LocalEnvironment {
  name: string;
  version: string;
  resources: string | null;
  postConfigureCommand: string | null;
  clients: Array<any> | null;
  resourceServers: Array<any> | null;
}
