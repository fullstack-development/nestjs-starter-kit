import * as fs from 'fs';
import * as path from 'path';
import * as R from 'ramda';
import * as tsm from 'ts-morph';
import * as ts from 'typescript';
import { v4 } from 'uuid';
import { generateRepository } from './libs/repository';

type Method = {
    name: string;
    apiHost: string;
    address: string;
    return: string;
    controllerMethod: string;
    guard?: Array<string>;
    bodyInput?: string;
    queryInput?: string;
    paramInput?: Array<{ param?: string; body: string }>;
};

type Declaration = {
    kind: 'class' | 'typeAlias' | 'interface' | 'enum';
    name: string;
    id: string;
    body: string;
};

type Import = { specifiers: Array<{ alias?: string; name: string }>; path: string };

const tsconfig = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, '../../../api/tsconfig.json')).toString(),
);

function getControllers(dir: string) {
    const dirents = fs.readdirSync(dir, {
        withFileTypes: true,
    });
    let controllers: string[] = [];
    for (const dirent of dirents) {
        const res = path.resolve(dir, dirent.name);
        if (dirent.isDirectory()) {
            controllers = controllers.concat(getControllers(res));
        } else {
            if (new RegExp(/^.*\.controller\.ts$/g).test(dirent.name)) {
                controllers.push(res);
            }
        }
    }
    return controllers;
}

function getControllerMethod(md: tsm.MethodDeclaration) {
    return (
        md.getDecorator('Get') ||
        md.getDecorator('Post') ||
        md.getDecorator('Put') ||
        md.getDecorator('Delete') ||
        md.getDecorator('Patch') ||
        md.getDecorator('Options') ||
        md.getDecorator('Head') ||
        md.getDecorator('All')
    );
}

function precleanDeclaration(decl: string) {
    let result = decl;

    const implementsReg = new RegExp(/(.*)(implements.*)({)/);
    if (implementsReg.test(result)) {
        result = result.replace(implementsReg, '$1$3');
    }

    const exportReg = new RegExp(/export (.*[{=])/);
    if (exportReg.test(result)) {
        result = result.replace(exportReg, '$1');
    }

    return result.replace(new RegExp(/\s+/, 'g'), ' ').trim();
}

function parseMethod(c: tsm.ClassDeclaration, md: tsm.MethodDeclaration): Method {
    const typeStringMatch = md
        .getReturnType()
        .getText(undefined, ts.TypeFormatFlags.NoTypeReduction)
        .match(/^Promise<(.*)>$/);
    if (!typeStringMatch) {
        throw 'Method return type should be Promise. Name: ' + md.getName();
    }
    const typeString = typeStringMatch[1];

    const apiHost = c
        .getDecoratorOrThrow('Controller')
        .getArguments()[0]
        ?.getText()
        .replace(new RegExp(/['"]/g), '');

    if (!apiHost) {
        throw 'Cannot find host address in class Controller decorator';
    }

    const controllerMethod = getControllerMethod(md);
    if (!controllerMethod) {
        throw 'Cannot find controller method';
    }

    const address = controllerMethod?.getArguments()[0]?.getText().replace(new RegExp(/['"]/g), '');
    if (!address) {
        throw 'Cannot find address in controller method decorator';
    }

    const bodyInput = (() => {
        for (const param of md.getParameters()) {
            const decorators = param.getDecorators();
            const bodyDecorator = decorators.find((d) => d.getName() === 'Body');
            if (!!bodyDecorator) {
                return param.getType().getText(undefined, ts.TypeFormatFlags.NoTypeReduction);
            }
        }
    })();

    const queryInput = (() => {
        for (const param of md.getParameters()) {
            const decorators = param.getDecorators();
            const queryDecorator = decorators.find((d) => d.getName() === 'Query');
            if (!!queryDecorator) {
                return param.getType().getText(undefined, ts.TypeFormatFlags.NoTypeReduction);
            }
        }
    })();

    const paramInput = (() => {
        let input: Method['paramInput'] | undefined;

        for (const param of md.getParameters()) {
            const decorators = param.getDecorators();
            const paramDecorator = decorators.find((d) => d.getName() === 'Param');

            if (!!paramDecorator) {
                if (!input) {
                    input = [];
                }

                const arg = paramDecorator.getArguments()[0];
                input.push({
                    param: arg?.getText(),
                    body: param.getType().getText(undefined, ts.TypeFormatFlags.NoTypeReduction),
                });
            }
        }

        return input;
    })();

    const guard = (() => {
        const guardOut: Array<string> = [];
        const decorators = md.getDecorators();
        for (const d of decorators) {
            if (d.getName() === 'UseGuards') {
                guardOut.push(d.getArguments()[0]?.getText());
            }
        }
        return guardOut;
    })();

    return {
        apiHost,
        address,
        name: md.getName(),
        return: typeString,
        guard,
        bodyInput,
        queryInput,
        paramInput,
        controllerMethod: controllerMethod.getName(),
    };
}

function cleanClass(cl: tsm.ClassDeclaration) {
    cl.getDecorators().forEach((d) => {
        if (d.getName() !== 'Controller') {
            d.remove();
        }
    });

    cl.getProperties().forEach((p) => {
        p.getDecorators().forEach((d) => {
            d.remove();
        });
    });

    return cl;
}

export function generateApi() {
    const sourceMap: Record<string, Omit<Declaration, 'id'>> = {};

    const repository = generateRepository();
    const project = new tsm.Project({
        tsConfigFilePath: '../../api/tsconfig.json',
        libFolderPath: '../../api/node_modules',
    });

    const sourceFiles = project.getSourceFiles();
    const typeDeclarations: Record<
        string, //key is path
        Array<Declaration>
    > = {};

    sourceFiles.forEach((sf) => {
        const path = sf.getFilePath();
        const content: Array<Declaration> = [];

        sf.getClasses().forEach((c) => {
            content.push({
                kind: 'class',
                name: c.getNameOrThrow(),
                id: v4(),
                body: precleanDeclaration(cleanClass(c).getText()),
            });
        });

        sf.getTypeAliases().forEach((tp) => {
            content.push({
                kind: 'typeAlias',
                name: tp.getName(),
                id: v4(),
                body: precleanDeclaration(tp.getText()),
            });
        });

        sf.getInterfaces().forEach((i) => {
            content.push({
                kind: 'interface',
                name: i.getName(),
                id: v4(),
                body: precleanDeclaration(i.getText()),
            });
        });

        sf.getEnums().forEach((en) => {
            content.push({
                kind: 'enum',
                name: en.getName(),
                id: v4(),
                body: precleanDeclaration(en.getText()),
            });
        });

        typeDeclarations[path] = content;
    });

    const importDeclarations: Record<
        string, //key is path
        Array<Import>
    > = {};
    sourceFiles.forEach((sf) => {
        const arr = sf
            .getImportDeclarations()
            .filter((i) => !!i.getModuleSpecifierSourceFile())
            .map((i) => {
                return {
                    specifiers: i.getNamedImports().map((n) => ({
                        alias: n.getAliasNode()?.getText(),
                        name: n.getName(),
                    })),
                    path: i.getModuleSpecifierSourceFileOrThrow().getFilePath(),
                };
            });
        importDeclarations[sf.getFilePath()] = arr;
    });

    const methodsTypes: Record<
        string, //key is path
        Array<Method>
    > = {};
    const controllers = getControllers(path.resolve(__dirname, '../../../api/src'));
    for (const controllerSourcePath of controllers) {
        const source = project.getSourceFileOrThrow(controllerSourcePath);
        const classes = source.getClasses();
        const controllerClass = classes.find((c) => !!c.getDecorator('Controller'));
        if (controllerClass) {
            const allMethods = controllerClass.getMethods();
            for (const method of allMethods) {
                if (!!getControllerMethod(method)) {
                    const parsed = parseMethod(controllerClass, method);
                    const methods = methodsTypes[controllerSourcePath];
                    if (!!methods) {
                        methods.push(parsed);
                    } else {
                        methodsTypes[controllerSourcePath] = [parsed];
                    }
                }
            }
        }
    }

    const typeDeclarationsKeys = Object.keys(typeDeclarations);
    typeDeclarationsKeys.forEach((parentKey) => {
        const declarations = typeDeclarations[parentKey];
        declarations.forEach((decl) => {
            const parentDecl = decl;
            const name = decl.name;
            const id = decl.id;
            typeDeclarationsKeys.forEach((descendedKey) => {
                const imports = importDeclarations[descendedKey];
                const declarations = typeDeclarations[descendedKey];
                declarations.forEach((decl) => {
                    if (decl.name !== name) {
                        const reg = new RegExp(`([^a-zA-Z0-9_.]?)(${name})([^a-zA-Z0-9_]?)`, 'gm');
                        if (reg.test(decl.body)) {
                            decl.body = decl.body.replace(reg, `$1source_map(${id})$3`);
                        }
                    }

                    imports.forEach((i) => {
                        i.specifiers.forEach((spec) => {
                            const importedTypeDeclaration = typeDeclarations[i.path];
                            if (importedTypeDeclaration) {
                                const importedType = importedTypeDeclaration.find(
                                    (td) => td.name === spec.name,
                                );
                                if (importedType) {
                                    const reg = new RegExp(
                                        `([^a-zA-Z0-9_.]?)(${
                                            spec.alias ? spec.alias : spec.name
                                        })([^a-zA-Z0-9_]?)`,
                                        'gm',
                                    );
                                    if (reg.test(decl.body)) {
                                        decl.body = decl.body.replace(
                                            reg,
                                            `$1source_map(${importedType.id})$3`,
                                        );
                                    }
                                }
                            }
                        });
                    });

                    const repositoryKeys = Object.keys(repository);
                    repositoryKeys.forEach((rk) => {
                        const reg = new RegExp(`(\\b)(${rk.trim()})(\\b)`, 'gm');
                        if (reg.test(decl.body)) {
                            decl.body = decl.body.replace(
                                reg,
                                `$1source_map_lib_repository(${repository[rk].id})$3`,
                            );
                        }
                    });

                    const methodKeys = Object.keys(methodsTypes);
                    methodKeys.forEach((mk) => {
                        methodsTypes[mk].forEach((m) => {
                            const reg = new RegExp(
                                `([^a-zA-Z0-9_.]?)(${name})([^a-zA-Z0-9_]?)`,
                                'gm',
                            );

                            let idWasUsed = false;

                            if (reg.test(m.return)) {
                                m.return = m.return.replace(reg, `$1source_map(${id})$3`);
                                idWasUsed = true;
                            }

                            if (m.bodyInput && reg.test(m.bodyInput)) {
                                m.bodyInput = m.bodyInput.replace(reg, `$1source_map(${id})$3`);
                                idWasUsed = true;
                            }

                            if (m.queryInput && reg.test(m.queryInput)) {
                                m.queryInput = m.queryInput.replace(reg, `$1source_map(${id})$3`);
                                idWasUsed = true;
                            }

                            if (m.paramInput && m.paramInput.length > 0) {
                                m.paramInput.forEach((pi) => {
                                    if (reg.test(pi.body)) {
                                        pi.body = pi.body.replace(reg, `$1source_map(${id})$3`);
                                        idWasUsed = true;
                                    }
                                });
                            }

                            if (idWasUsed === true) {
                                if (!sourceMap[id]) {
                                    sourceMap[id] = R.omit(['id'], parentDecl);
                                }
                            }
                        });
                    });
                });
            });
        });
    });

    function fillSourceMap(): boolean {
        let isFound = false;

        const sourceMapKeys = Object.keys(sourceMap);
        for (const k of sourceMapKeys) {
            const typeDeclarationsKeys = Object.keys(typeDeclarations);
            const reg = new RegExp(
                /source_map\(([0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12})\)/gm,
            );
            const matches = sourceMap[k].body.matchAll(reg);
            for (const match of matches) {
                const id = match[1];
                if (id) {
                    for (const declKey of typeDeclarationsKeys) {
                        const declarations = typeDeclarations[declKey];
                        for (const decl of declarations) {
                            if (decl.id === id && !Object.keys(sourceMap).includes(id)) {
                                sourceMap[id] = R.omit(['id'], decl);
                                isFound = true;
                                break;
                            }
                        }
                        if (isFound) {
                            break;
                        }
                    }
                    if (isFound) {
                        break;
                    }
                }
            }
            if (isFound) {
                break;
            }
        }

        return isFound;
    }

    while (fillSourceMap() === true) {}

    const result = {
        sourceMap,
        methods: (() => {
            let methods: Array<Method> = [];
            Object.keys(methodsTypes).forEach((k) => {
                methods = methods.concat(methodsTypes[k]);
            });
            return methods;
        })(),
        libs: {
            repository,
        },
    };

    fs.writeFileSync(
        path.resolve(__dirname, '../../generated.json'),
        JSON.stringify(result, null, 4),
    );
}
