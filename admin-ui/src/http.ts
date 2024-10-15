import axios, { AxiosError, AxiosHeaders, AxiosHeaderValue, AxiosResponse } from 'axios';
import { environment } from './environment';
import { getToken } from './token';

export const axiosInstance = axios.create({
    baseURL: environment.apiUrl,
});

axiosInstance.interceptors.request.use(
    (req) => {
        const token = getToken();
        if (token) {
            req.withCredentials = true;
            req.headers.set('Authorization', `Bearer ${token}`);
        }
        return req;
    },
    (error) => Promise.reject(error),
);

type Headers = {
    [key: string]: AxiosHeaderValue;
};

type Options = {
    headers?: Headers;
};

const catchError = (response: AxiosResponse) => {
    console.log(response.status, response.data);
    if (response.status < 200 || response.status >= 300) {
        throw new AxiosError(response.data, response.statusText, response.config);
    }
};

export const http = {
    get: async <T>(url: string, options?: Options) => {
        const response = await axiosInstance.get(url, {
            headers: options?.headers && new AxiosHeaders(options.headers),
        });

        catchError(response);

        return response.data as T;
    },
    post: async <T>(url: string, body: Record<string, unknown>, options?: Options) => {
        const response = await axiosInstance.post(url, body, {
            headers: options?.headers && new AxiosHeaders(options.headers),
        });

        catchError(response);

        return response.data as T;
    },
};
