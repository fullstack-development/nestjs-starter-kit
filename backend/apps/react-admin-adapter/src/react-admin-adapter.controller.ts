import { UseValidationPipe } from '@lib/core';
import { BaseEntity } from '@lib/repository';
import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { FindManyOptions } from 'typeorm';
import { GetQuery, parseQueryFilter } from './react-admin-adapter.model';
import { ReactAdminAdapterService } from './react-admin-adapter.service';

@Controller('/api/admin/db')
export class ReactAdminAdapterController {
    constructor(private readonly service: ReactAdminAdapterService) {}

    @Get(':entity')
    @UseValidationPipe()
    public async get(@Param('entity') entityName: string, @Query() query: GetQuery, @Res() res: Response) {
        const entity = this.service.getEntity(entityName);
        if (!entity) {
            res.status(404);
            res.send();
            return;
        }

        const filter: FindManyOptions<BaseEntity> = {
            where: query.filter && parseQueryFilter(query.filter),
        };

        const count = await this.service.getEntityManager().count(entity.entityClass, filter);

        if (query.sort) {
            filter.order = { [query.sort[0]]: query.sort[1] };
        }

        if (query.range) {
            filter.skip = query.range[0];
            filter.take = query.range[1] - query.range[0];
        }

        const relations = entity.meta.relations.map((r) => r.propertyName);
        const data = await this.service.getEntityManager().find(entity.entityClass, { ...filter, relations });

        if (query.range) {
            res.header('Access-Control-Expose-Headers', 'Content-Range');
            res.header('Content-Range', `${query.range[0]}-${query.range[1]}/${count}`);
        }
        res.json(data);
    }
}
