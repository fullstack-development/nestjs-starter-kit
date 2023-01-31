import * as fs from 'fs';
import * as path from 'path';
import * as tsm from 'ts-morph';
import { v4 } from 'uuid';

export function generateRepository() {
    const project = new tsm.Project({
        tsConfigFilePath: '../../libs/repository/tsconfig.json',
        libFolderPath: '../../libs/repository/node_modules',
    });
    const prismaSource = project.getSourceFileOrThrow(
        '../../libs/repository/node_modules/.prisma/client/index.d.ts',
    );

    const schema = fs
        .readFileSync(path.resolve(__dirname, '../../../../libs/repository/schema.prisma'))
        .toString();
    const reg = schema.matchAll(/model (.*) {/g);
    const repositories: string[] = [];
    for (const group of reg) {
        repositories.push(group[1]);
    }
    if (repositories.length === 0) {
        throw 'Cannot find repositories in schema.prisma';
    }

    const typeAliases: tsm.TypeAliasDeclaration[] = [];
    for (const type of prismaSource.getTypeAliases()) {
        if (repositories.includes(type.getName())) {
            typeAliases.push(type);
        }
    }
    if (typeAliases.length !== repositories.length) {
        throw 'typeAliases.length !== repositories.length';
    }

    const records: Record<string, Record<string, any>> = {};
    for (const type of typeAliases) {
        const result = type.getText().match(/{\s([\S\s]*)\s}/g);
        if (!result) {
            throw 'Cannot parse repository object ' + type.getName();
        }
        const objectString = result[0]
            .replace(/ *(.*): *(.*) *\s/g, '"$1": "$2",')
            .replace('",}', '"}');
        records[type.getName()] = { body: result[0], id: v4() };
    }

    if (Object.keys(records).length !== typeAliases.length) {
        throw 'records.length !== typeAliases.length';
    }

    return records;
}
