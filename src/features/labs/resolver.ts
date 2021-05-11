import type { Client, ResourceServer } from 'auth0';
import { LocalEnvironment, Resource } from './models';
import { isPresent } from 'ts-is-present';
import { getTenantDomain } from '../../auth';
import { getUrlForPort } from '../../utils';

type ClientFetch = () => Promise<Client[]>;
type ResourceServerFetch = () => Promise<ResourceServer[]>;

export class LabResourceResolverBuilder {
  constructor(
    private getClients: ClientFetch,
    private getResourceServers: ResourceServerFetch
  ) {}

  build = async (localEnvironment: LocalEnvironment): Promise<Resolver[]> => {
    return [
      ...(await this.resolveClients(localEnvironment)),
      ...(await this.resolveResourceServers(localEnvironment)),
    ];
  };

  resolveClients = async (
    localEnvironment: LocalEnvironment
  ): Promise<ClientResolver[]> => {
    const tenantDomain = await getTenantDomain();
    const resolvers = await Promise.all(
      localEnvironment.clients.map(async (resource) => {
        const client = await this.getClientByName(resource.name);
        if (client) {
          return new ClientResolver(tenantDomain, resource, client);
        }
      })
    );
    return resolvers.filter(isPresent);
  };

  resolveResourceServers = async (
    localEnvironment: LocalEnvironment
  ): Promise<ResourceServerResolver[]> => {
    const tenantDomain = await getTenantDomain();
    const resolvers = await Promise.all(
      localEnvironment.resourceServers.map(async (resource) => {
        const resourceServer = await this.getResourceServerByName(
          resource.name
        );
        if (resourceServer) {
          return new ResourceServerResolver(
            tenantDomain,
            resource,
            resourceServer
          );
        }
      })
    );

    return resolvers.filter(isPresent);
  };

  getClientByName = async (name: string): Promise<Client | undefined> => {
    const clients = await this.getClients();
    return clients.find((client) => {
      return client.name === name;
    });
  };

  getResourceServerByName = async (
    name: string
  ): Promise<ResourceServer | undefined> => {
    const resourceServers = await this.getResourceServers();
    return resourceServers.find((resourceServers) => {
      return resourceServers.name === name;
    });
  };
}

export class Resolver {
  constructor(
    protected tenantDomain: string | undefined,
    protected resource: Resource
  ) {}

  getProps(): [string, any][] {
    return [];
  }

  resolveEnv(resolvers: Resolver[]): { name: string; value: any }[] {
    return Object.entries(this.resource.env)
      .map(([key, reference]) => {
        switch (typeof reference) {
          case 'number' || 'boolean':
            return { name: key, value: reference };
          case 'string':
            return {
              name: key,
              value: this.resolveItemValue(key, reference as string, resolvers),
            };
        }
      })
      .filter(isPresent);
  }

  resolveItemValue(key: string, reference: string, resolvers: Resolver[]) {
    const props = this.getProps();
    if (key === 'AUTH0_DOMAIN') {
      return this.tenantDomain;
    } else if (key === 'ISSUER_BASE_URL') {
      return `https://${this.tenantDomain}`;
    } else if (reference.startsWith('$')) {
      const prop = props.find(([propName]) => propName === reference.substr(1));
      if (prop) {
        return prop[1];
      }
    } else if (key.endsWith('URL')) {
      const resolver = resolvers.find((r) => r.getName() === reference);
      if (resolver) {
        return resolver.getUrl();
      }
    } else {
      return reference;
    }
  }

  getName() {
    return this.resource.name;
  }

  getDirectory() {
    return this.resource.directory;
  }

  getUrl() {
    return getUrlForPort(this.resource.env['PORT'] as number);
  }
}

export class ClientResolver extends Resolver {
  constructor(
    tenantDomain: string | undefined,
    resource: Resource,
    private client: Client
  ) {
    super(tenantDomain, resource);
  }

  getProps(): [string, any][] {
    return Object.entries(this.client);
  }
}

export class ResourceServerResolver extends Resolver {
  constructor(
    tenantDomain: string | undefined,
    resource: Resource,
    private resourceServer: ResourceServer
  ) {
    super(tenantDomain, resource);
  }

  getProps(): [string, any][] {
    return Object.entries(this.resourceServer);
  }
}
