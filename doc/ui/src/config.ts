export type NestedDocDescriptions = {
    [x: string]: string | { [y: string]: NestedDocDescriptions };
};
export type DocDescriptions = {
    description: string;
    methods: NestedDocDescriptions;
    entities: NestedDocDescriptions;
    guards: { [x: string]: string };
};

export type MethodParamInput = { param?: string; body?: string };

export type DocMethod = {
    apiHost: string;
    address: string;
    name: string;
    return: string;
    guard?: Array<string>;
    bodyInput?: string;
    queryInput?: string;
    controllerMethod: string;
    paramInput?: Array<MethodParamInput>;
};

export type DocGenerated = {
    sourceMap: { [key: string]: { kind: string; name: string; body: string } };
    methods: Array<DocMethod>;
    libs: {
        repository: { [name: string]: { body: string; id: string } };
    };
};

export const config = (() => {
    if (!process.env['DOC_DESCRIPTIONS_STRING']) {
        throw 'Cannot find DOC_DESCRIPTIONS_STRING';
    }
    if (!process.env['DOC_GENERATED_STRING']) {
        throw 'Cannot find DOC_GENERATED_STRING';
    }

    return {
        DOC_DESCRIPTIONS: process.env['DOC_DESCRIPTIONS_STRING'] as unknown as DocDescriptions,
        DOC_GENERATED: process.env['DOC_GENERATED_STRING'] as unknown as DocGenerated,
    };
})();
