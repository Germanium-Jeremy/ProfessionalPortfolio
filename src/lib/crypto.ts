import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

if (!ENCRYPTION_KEY || Buffer.from(ENCRYPTION_KEY, 'base64').length !== 32) {
  throw new Error('ENCRYPTION_KEY environment variable must be set to a 32-byte base64 string.');
}

const keyBuffer = Buffer.from(ENCRYPTION_KEY, 'base64');

export function encrypt(plaintext: string): { ciphertext: Uint8Array; iv: Uint8Array; tag: Uint8Array } {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', keyBuffer, iv);
  
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  
  return { ciphertext, iv, tag };
}

export function decrypt(input: { ciphertext: Uint8Array; iv: Uint8Array; tag: Uint8Array }): string {
  const decipher = crypto.createDecipheriv('aes-256-gcm', keyBuffer, Buffer.from(input.iv));
  decipher.setAuthTag(Buffer.from(input.tag));
  
  const decrypted = Buffer.concat([decipher.update(Buffer.from(input.ciphertext)), decipher.final()]);
  return decrypted.toString('utf8');
}

export function encryptString(plaintext: string): string {
  const { ciphertext, iv, tag } = encrypt(plaintext);
  return `v1:${Buffer.from(iv).toString('base64url')}:${Buffer.from(tag).toString('base64url')}:${Buffer.from(ciphertext).toString('base64url')}`;
}

export function decryptString(packed: string): string {
  const parts = packed.split(':');
  if (parts.length !== 4 || parts[0] !== 'v1') {
    throw new Error('Invalid encrypted string format or unsupported version');
  }
  
  const [, iv64, tag64, ct64] = parts;
  const iv = Buffer.from(iv64, 'base64url');
  const tag = Buffer.from(tag64, 'base64url');
  const ciphertext = Buffer.from(ct64, 'base64url');
  
  return decrypt({ ciphertext, iv, tag });
}

export function blindIndex(value: string): string {
  return crypto.createHmac('sha256', keyBuffer).update(value).digest('hex');
}
