import { TextEncoder } from "util";

export const stringToByteArray = (value: string) => {
  return new TextEncoder().encode(value);
};

export const sortAlphabetically = <TItem>(
  projection: (item: TItem) => string,
  mode: 'asc' | 'desc' = 'asc'
) => (a: TItem, b: TItem) => {
  const textA = projection(a).toLowerCase();
  const textB = projection(b).toLowerCase();
  const factor = mode === 'asc' ? 1 : -1;
  return textA < textB ? -1 * factor : textA > textB ? 1 * factor : 0;
};

export const obfuscate = (secret: string | undefined) => {
  if (!secret || secret.length < 10) {
    return secret;
  }

  const first = secret.substring(0, 6);
  const last = secret.substring(secret.length - 4, secret.length);

  return `${first}...${last}`;
};
