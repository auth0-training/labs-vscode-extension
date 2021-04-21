export function parseAccessToken(accessToken: string) {
  const tokenParts = accessToken.split('.');

  const buff = Buffer.from(tokenParts[1], 'base64');
  const text = buff.toString('ascii');
  return JSON.parse(text);
}
