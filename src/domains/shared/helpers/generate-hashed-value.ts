import forge from 'node-forge';

export function generateHashedValue(value: string) {
  return forge.md.sha256.create().update(value).digest().toHex();
}
