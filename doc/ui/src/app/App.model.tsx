import { config, DocMethod } from '../config';

type MethodsGroup = Record<string, Array<DocMethod>>;

export const groupMethods = () => {
    const methods: MethodsGroup = {};
    config.DOC_GENERATED.methods.forEach((m) => {
        if (!methods[m.apiHost]) {
            methods[m.apiHost] = [m];
        } else {
            methods[m.apiHost].push(m);
        }
    });
    return methods;
};
