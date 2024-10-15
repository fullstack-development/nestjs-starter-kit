/* eslint-disable @typescript-eslint/no-explicit-any */

import simpleRestProvider from 'ra-data-simple-rest';
import { fetchUtils, Options } from 'react-admin';
import { environment } from './environment';
import { getToken } from './token';

const httpClient = async (url: string, options: Options = {}) => {
    if (!options.headers) {
        options.headers = new Headers({ Accept: 'application/json' });
    }

    options.user = {
        authenticated: true,
        token: `Bearer ${getToken()}`,
    };

    return await fetchUtils.fetchJson(url, options).catch((e) => e);
};

export const dataProvider = simpleRestProvider(environment.dbRestUrl, httpClient);
