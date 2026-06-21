import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits, recommandé pour GCM
const AUTH_TAG_LENGTH = 16; // 128 bits
const KEY_LENGTH = 32; // 256 bits

/**
 * Service de chiffrement symétrique AES-256-GCM.
 *
 * Utilisé pour chiffrer le ticket Alfresco avant son stockage en base afin
 * qu'il n'apparaisse jamais en clair dans PostgreSQL. Le format de sortie est
 * `iv:authTag:ciphertext`, chaque segment encodé en hexadécimal.
 */
export class EncryptionService {
  private readonly key: Buffer;

  /**
   * @param rawKey Clé fournie via variable d'environnement. Acceptée au format
   *   hexadécimal (64 caractères) ou base64, devant correspondre à 32 octets.
   */
  constructor(rawKey: string) {
    this.key = EncryptionService.parseKey(rawKey);
  }

  private static parseKey(rawKey: string): Buffer {
    const trimmed = rawKey.trim();

    if (/^[0-9a-fA-F]{64}$/.test(trimmed)) {
      return Buffer.from(trimmed, 'hex');
    }

    try {
      const decoded = Buffer.from(trimmed, 'base64');
      if (decoded.length === KEY_LENGTH) {
        return decoded;
      }
    } catch {
      // ignore et tombe sur l'erreur ci-dessous
    }

    throw new Error(
      "SESSION_ENCRYPTION_KEY invalide: une clé de 32 octets est requise (ex: `openssl rand -hex 32`).",
    );
  }

  encrypt(plaintext: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, this.key, iv);

    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
  }

  decrypt(payload: string): string {
    const segments = payload.split(':');
    if (segments.length !== 3) {
      throw new Error('Format de données chiffrées invalide');
    }

    const [ivHex, authTagHex, dataHex] = segments;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const data = Buffer.from(dataHex, 'hex');

    if (iv.length !== IV_LENGTH || authTag.length !== AUTH_TAG_LENGTH) {
      throw new Error('Format de données chiffrées invalide');
    }

    const decipher = crypto.createDecipheriv(ALGORITHM, this.key, iv);
    decipher.setAuthTag(authTag);

    return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
  }
}
