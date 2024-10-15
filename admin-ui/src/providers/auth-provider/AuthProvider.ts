import { jwtDecode } from 'jwt-decode';
import { AuthProvider, HttpError } from 'react-admin';
import { api } from '../../api/api';
import { clearToken, getToken, setToken } from '../../token';

type LoginPayload = {
    username: string;
    password: string;
};

type TokenPayload = { email: string; exp: number };

const isTokenExpiredOrInvalid = (token?: string | null) => {
    if (!token) {
        return true;
    }

    try {
        const payload: TokenPayload = jwtDecode(token);
        if (payload.exp * 1000 < Date.now()) {
            return true;
        }
        return false;
    } catch {
        return true;
    }
};

const decodeToken = (token: string): TokenPayload => {
    return jwtDecode(token);
};

export const authProvider: AuthProvider = {
    login: async (params: LoginPayload) => {
        if (!params.username || !params.password) {
            return Promise.reject();
        }
        const { token } = await api.signIn({ email: params.username, password: params.password });
        setToken(token);
    },
    logout: async (): Promise<void | false | string> => {
        console.log('logout');
        clearToken();
    },
    checkAuth: async () => {
        const token = getToken();
        if (isTokenExpiredOrInvalid(token)) {
            throw new Error('Token expired');
        }
    },
    checkError: async (error: HttpError) => {
        const status = error.status;
        if (status === 401 || status === 403) {
            throw new Error('Unauthorized');
        }
    },
    getPermissions: () => {
        return Promise.resolve();
    },
    getIdentity: async () => {
        const token = getToken();
        if (!token) {
            throw new Error('Token not found');
        }
        const { email } = decodeToken(token);

        return { fullName: email, id: email };
    },
};
