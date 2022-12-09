import { EmailConfirm, RefreshToken, User } from "@prisma/client";

export function getUserStub(): User & {
    refreshToken: RefreshToken | null;
    emailConfirm: EmailConfirm | null;
} {
    return {
        id: 0,
        email: 'test@example.com',
        hash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
        emailConfirmed: false,
        created: new Date().toISOString() as unknown as Date,
        refreshToken: null,
        emailConfirm: null,
    };
}