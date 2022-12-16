/* eslint-disable @typescript-eslint/no-explicit-any */

import { spec } from 'pactum';
import Spec from 'pactum/src/models/Spec';
import { getConfig } from './config';

type HostKind = 'api';

const getBaseUrlFromConfig = (host: HostKind) => {
    const config = getConfig();
    switch (host) {
        case 'api':
            return `http://${config.env.API_ADDRESS}:${config.env.API_PORT}/api/`;
    }
};

const postSpecFactory = (host: HostKind) => {
    const baseUrl = getBaseUrlFromConfig(host);
    return <T, P = unknown>(url: string, send: (spec: Spec) => (data: T) => Promise<P>) => {
        const rootSpec = () => spec().post(baseUrl + url);
        return {
            spec: rootSpec,
            send: (data: T) => send(rootSpec())(data), // always return new spec for every request
        };
    };
};

const putSpecFactory = (host: HostKind) => {
    const baseUrl = getBaseUrlFromConfig(host);
    return <T, P = unknown>(url: string, send: (spec: Spec) => (data: T) => Promise<P>) => {
        const rootSpec = () => spec().put(baseUrl + url);
        return {
            spec: rootSpec,
            send: (data: T) => send(rootSpec())(data), // always return new spec for every request
        };
    };
};

const deleteSpecFactory = (host: HostKind) => {
    const baseUrl = getBaseUrlFromConfig(host);
    return <T, P = unknown>(url: string, send: (spec: Spec) => (data: T) => Promise<P>) => {
        const rootSpec = () => spec().delete(baseUrl + url);
        return {
            spec: rootSpec,
            send: (data: T) => send(rootSpec())(data), // always return new spec for every request
        };
    };
};

const getSpecFactory = (host: HostKind) => {
    const baseUrl = getBaseUrlFromConfig(host);
    return <T, P = unknown>(url: string, send: (spec: Spec) => (data: T) => Promise<P>) => {
        const rootSpec = () => spec().get(baseUrl + url);
        return {
            spec: rootSpec,
            send: (data: T) => send(rootSpec())(data), // always return new spec for every request
        };
    };
};

export const postSpec = {
    api: postSpecFactory('api'),
};
export const getSpec = {
    api: getSpecFactory('api'),
};
export const putSpec = {
    api: putSpecFactory('api'),
};
export const deleteSpec = {
    api: deleteSpecFactory('api'),
};
