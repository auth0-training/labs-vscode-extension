export function getUrlForPort(port: number) {
  //if running in codespaces
  if (process.env['CODESPACES']) {
    return `https://${process.env.CLOUDENV_ENVIRONMENT_ID}-${port}.apps.codespaces.githubusercontent.com`;
  }
  if (process.env['INSTANCE_ID']) {
    return `https://${port}-0-${process.env.INSTANCE_ID}.auth0-labs.appsembler.com`;
  }
  // default to localhost
  return `http://localhost:${port}`;
}
