export interface LocalEnvironment {
  name: string;
  version: string;
  resources: string | null;
  postConfigureCommand: string | null;
  clients: Array<Resource>;
  resourceServers: Array<Resource>;
}

export interface Resource {
  name: string;
  directory: string;
  env: Hash;
}

export interface Hash {
  [indexer: string]: string | number | boolean;
}
