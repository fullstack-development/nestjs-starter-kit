import * as crypto from 'crypto';

export const sha256 = (data: crypto.BinaryLike) =>
    crypto.createHash('sha256').update(data).digest('hex');
