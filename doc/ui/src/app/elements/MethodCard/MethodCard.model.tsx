import React from 'react';
import { config, DocMethod, MethodParamInput } from '../../../config';
import { CodeCard } from '../../../elements/CodeCard/CodeCard';
import { LinkText } from '../../../elements/Link/Link';
import { List } from '../../../elements/List/List';
import { getType, parseTypeWithSourceMap, renderType } from '../../../parser';
import { fullSourceMapRegexp, sourceMapRegexp } from '../../../utils';

export const getMethodDescription = (method: DocMethod) => {
    const desc = config.DOC_DESCRIPTIONS.methods[method.apiHost];
    if (typeof desc === 'object') {
        return atob(config.DOC_DESCRIPTIONS.methods[method.apiHost][method.address]);
    }
    return atob(desc);
};

export const renderParamInputs = (paramInput: Array<MethodParamInput>) => {
    return `${JSON.stringify(paramInput)}`;
};

export const renderQueryInput = (queryInput: string) => {
    let data = queryInput;
    const fullMatch = fullSourceMapRegexp().exec(queryInput);
    if (fullMatch) {
        data = getType(fullMatch[1]);
    }
    return <CodeCard>{renderType(parseTypeWithSourceMap(data))}</CodeCard>;
};

export const renderBodyInput = (bodyInput: string) => {
    let data = bodyInput;
    const fullMatch = fullSourceMapRegexp().exec(bodyInput);
    if (fullMatch) {
        data = getType(fullMatch[1]);
    }
    return <CodeCard>{renderType(parseTypeWithSourceMap(data))}</CodeCard>;
};

export const renderGuards = (guards: Array<string>) => {
    return (
        <div
            style={{
                background: 'rgba(0,0,0,0.02)',
                padding: 8,
                borderRadius: 6,
            }}
        >
            <List
                items={guards.map((g) => (
                    <LinkText href={`#/modal/guard/${g}`} title={g} />
                ))}
            />
        </div>
    );
};

const kinds: Record<string, number> = {
    UnprocessableEntityError: 422,
    ConflictError: 409,
    InternalServerError: 500,
};

export const renderErrors = (returnType: string) => {
    const error: Record<number, Array<string>> = {};
    const findSourceMap = (str: string) => {
        const maps = str.matchAll(sourceMapRegexp());
        for (const m of maps) {
            const uuid = m[1];
            const type = config.DOC_GENERATED.sourceMap[uuid];
            const kind = kinds[type.name];
            if (kind) {
                const reg = new RegExp(
                    sourceMapRegexp().source + new RegExp("\\<\\'(.*)\\'\\> {", 'gm').source,
                );
                const eMatch = str.match(reg);
                if (eMatch) {
                    if (error[kind]) {
                        error[kind].push(eMatch[2]);
                    } else {
                        error[kind] = [eMatch[2]];
                    }
                }
            }
            findSourceMap(type.body);
        }
    };

    findSourceMap(returnType);

    return error;
};

const controllerResponseRegexp = () => new RegExp(/ControllerResponse<(.*), (.*)>/, 'gm');
export const renderResponse = (response: string) => {
    let data = response;
    const fullMatch = fullSourceMapRegexp().exec(response);
    if (fullMatch) {
        data = getType(fullMatch[1]);
    }

    const parsed = parseTypeWithSourceMap(data);
    data = parsed.type;
    const crMatch = controllerResponseRegexp().exec(data);
    console.log(data, crMatch);
    if (crMatch === null) {
        return <></>;
    }

    parsed.type = crMatch[1];

    return (
        <div>
            <CodeCard>{renderType(parsed)}</CodeCard>
            {crMatch[2].trim() !== 'never' && (
                <CodeCard style={{ marginTop: 12 }} title="Headers">
                    {crMatch[2].replaceAll(new RegExp(/['"`]/gm), '')}
                </CodeCard>
            )}
        </div>
    );
};
