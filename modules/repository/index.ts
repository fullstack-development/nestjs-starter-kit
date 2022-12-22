import { PrismaClient } from '@prisma/client';
import type { Prisma, User, RefreshToken, EmailConfirm } from '@prisma/client';

export enum Repositories {
    User = 'user',
    RefreshToken = 'refreshToken',
    EmailConfirm = 'emailConfirm',
}

export { PrismaClient, Prisma, User, RefreshToken, EmailConfirm };
