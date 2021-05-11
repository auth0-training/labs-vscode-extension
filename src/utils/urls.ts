export function getUrlForPort(port: number) {
  //if running in codespaces
  if (process.env['CODESPACES']) {
    return `https://${process.env.CLOUDENV_ENVIRONMENT_ID}-${port}.apps.codespaces.githubusercontent.com`;
  }
  // default to localhost
  return `http://localhost:${port}`;
}
