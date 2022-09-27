import * as crypto from 'crypto';

export function sha256(data: crypto.BinaryLike) {
    return crypto.createHash('sha256').update(data).digest('hex');
}
