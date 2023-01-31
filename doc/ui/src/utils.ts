import parserTypeScript from 'prettier/parser-typescript';
import prettier from 'prettier/standalone';
import React from 'react';
import * as domServer from 'react-dom/server';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { SynchronousPromise } from 'synchronous-promise';
import * as ts from 'typescript';
import fmt from 'typescript-formatter';

export const controllerMethodColor = (method: string) => {
    switch (method) {
        case 'Patch':
            return '#D38042';
        case 'Delete':
            return '#A41E22';
        case 'Get':
            return '#0F6AB4';
        case 'Post':
            return '#10A44A';
        case 'Put':
            return '#C4852A';
        case 'Head':
            return '#FED10E';
        default:
            'unset';
    }
};

export const sourceMapRegexp = () =>
    new RegExp(
        /source_map\(([0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12})\)/,
        'gm',
    );

export const fullSourceMapRegexp = () =>
    new RegExp(
        /^source_map\(([0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12})\)$/,
        'gm',
    );

export const repositorySourceMapRegexp = () =>
    new RegExp(
        /source_map_lib_repository\(([0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12})\)/,
        'gm',
    );

export const formatCode = (code: string) =>
    prettier.format(code, {
        parser: 'typescript',
        plugins: [parserTypeScript],
    });

export const highlightCode = (code: string) =>
    React.createElement(SyntaxHighlighter, {
        language: 'typescript',
        style: oneLight,
        children: code,
    });

export const renderToString = (element: React.ReactElement) => domServer.renderToString(element);

export const renderFromString = (element: 'div' | 'span', data: string) =>
    React.createElement(element, { dangerouslySetInnerHTML: { __html: data } });
