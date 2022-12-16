import * as crypto from 'crypto';

export function sha256(data: crypto.BinaryLike) {
    return crypto.createHash('sha256').update(data).digest('hex');
}

export function hmac(algorithm: 'sha256' | 'sha1', key: string, data: crypto.BinaryLike) {
    return crypto.createHmac(algorithm, key).update(data).digest('hex');
}
