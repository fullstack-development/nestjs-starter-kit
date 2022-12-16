import * as crypto from 'crypto';

export function hmac(algorithm: 'sha256' | 'sha1', key: string, data: crypto.BinaryLike) {
    return crypto.createHmac(algorithm, key).update(data).digest('hex');
}
