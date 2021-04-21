export const obfuscate = (secret: string | undefined) => {
  if (!secret || secret.length < 10) {
    return secret;
  }

  const first = secret.substring(0, 6);
  const last = secret.substring(secret.length - 4, secret.length);

  return `${first}...${last}`;
};
