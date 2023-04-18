export function getUrlForPort(port: number) {
  //if running in codespaces
  if (process.env['CODESPACES']) {
    return `https://${process.env.CODESPACE_NAME}-${port}.${process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}`;
  }
  if (process.env['INSTANCE_ID']) {
    return `https://${port}-0-${process.env.INSTANCE_ID}.auth0-labs.appsembler.com`;
  }
  // default to localhost
  return `http://localhost:${port}`;
}
