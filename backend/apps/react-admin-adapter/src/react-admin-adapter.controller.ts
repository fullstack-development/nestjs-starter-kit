import { UseValidationPipe } from '@lib/core';
import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { GetQuery } from './react-admin-adapter.model';
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
            return;
        }

        const data = await this.service.getEntityManager().find(entity.entityClass, {
            where: query.filter,
            order: query.sort ? { [query.sort[0]]: query.sort[1] } : undefined,
        });

        return data;
    }
}
