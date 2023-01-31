import React from 'react';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import prism from 'react-syntax-highlighter/dist/esm/styles/prism/prism';
import { config } from './config';
import { LinkText } from './elements/Link/Link';
import {
    formatCode,
    renderFromString,
    renderToString,
    repositorySourceMapRegexp,
    sourceMapRegexp,
} from './utils';

export type ParsedType = {
    sourceMap: Record<string, string>;
    sourceMapLibsRepository: Record<string, string>;
    type: string;
};

export const getType = (uuid: string) => {
    return config.DOC_GENERATED.sourceMap[uuid].body;
};

export const parseTypeWithSourceMap = (type: string): ParsedType => {
    let out = type;

    const map: Record<string, string> = {};
    const mapRepo: Record<string, string> = {};
    const matches = out.matchAll(sourceMapRegexp());
    for (const match of matches) {
        const name = config.DOC_GENERATED.sourceMap[match[1]].name;
        out = out.replace(match[0], name);
        if (!map[name]) {
            map[name] = match[1];
        }
    }

    const repoMatches = out.matchAll(repositorySourceMapRegexp());
    for (const match of repoMatches) {
        const allNames = Object.keys(config.DOC_GENERATED.libs.repository);
        const name = allNames.find((n) => config.DOC_GENERATED.libs.repository[n].id === match[1]);
        if (name) {
            out = out.replace(match[0], name);
            if (!mapRepo[name]) {
                mapRepo[name] = match[1];
            }
        }
    }

    return { sourceMap: map, sourceMapLibsRepository: mapRepo, type: out };
};

export const renderType = ({ sourceMap, sourceMapLibsRepository, type }: ParsedType) => {
    let highlighted = renderToString(
        <SyntaxHighlighter
            customStyle={{ background: 'unset', borderRadius: 6, padding: 0, margin: 0 }}
            language="javascript"
            style={prism}
        >
            {formatCode(type || '')}
        </SyntaxHighlighter>,
    );
    for (const k of Object.keys(sourceMap)) {
        highlighted = highlighted.replaceAll(
            new RegExp(k, 'gm'),
            renderSourceMapLinkToString(sourceMap[k], 'source_map'),
        );
    }
    for (const k of Object.keys(sourceMapLibsRepository)) {
        highlighted = highlighted.replaceAll(
            new RegExp(k, 'gm'),
            renderSourceMapLinkToString(k, 'source_map_lib_repository'),
        );
    }
    return renderFromString('div', highlighted);
};

export const renderSourceMapLinkToString = (
    data: string,
    target: 'source_map' | 'source_map_lib_repository',
) => {
    const title = (() => {
        switch (target) {
            case 'source_map':
                return config.DOC_GENERATED.sourceMap[data].name;
            case 'source_map_lib_repository':
                return data;
        }
    })();
    return renderToString(<LinkText href={`#/modal/${target}/${data}`} title={title} />);
};
