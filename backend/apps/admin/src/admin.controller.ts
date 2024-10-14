import { ParseParamIntPipe, UseValidationPipe } from '@lib/core';
import { BaseEntity } from '@lib/repository';
import { Transactional } from '@nestjs-cls/transactional';
import { Body, Controller, Delete, Get, Param, Post, Put, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { omit } from 'ramda';
import { FindManyOptions } from 'typeorm';
import { GetQuery, parseQueryFilter } from './admin.model';
import { AdminService } from './admin.service';

@Controller('/api/admin/db')
export class AdminController {
    constructor(private readonly service: AdminService) {}

    @Get(':entity')
    @UseValidationPipe()
    public async get(@Param('entity') entityName: string, @Query() query: GetQuery, @Res() res: Response) {
        const entity = this.service.getEntity(entityName);
        if (!entity) {
            res.status(404).send();
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
        res.status(200).json(data);
    }

    @Get(':entity/:id')
    @UseValidationPipe()
    public async getOne(
        @Param('entity') entityName: string,
        @Param('id', new ParseParamIntPipe()) id: number,
        @Res() res: Response,
    ) {
        const entity = this.service.getEntity(entityName);
        if (!entity) {
            res.status(404).send();
            return;
        }

        const relations = entity.meta.relations.map((r) => r.propertyName);
        const data = await this.service.getEntityManager().findOne(entity.entityClass, { where: { id }, relations });

        res.status(200).json(data);
    }

    @Put(':entity/:id')
    @UseValidationPipe()
    @Transactional()
    public async updateOne(
        @Param('entity') entityName: string,
        @Param('id', new ParseParamIntPipe()) id: number,
        @Body() body: Record<string, unknown>,
        @Res() res: Response,
    ) {
        const entity = this.service.getEntity(entityName);
        if (!entity) {
            res.status(404).send();
            return;
        }

        const manager = this.service.getEntityManager();
        const relations = entity.meta.relations.map((r) => r.propertyName);
        const payload = omit(relations, body);

        await manager.update(entity.entityClass, id, payload);
        const data = await manager.findOne(entity.entityClass, { where: { id }, relations });

        res.status(200).json(data);
    }

    @Post(':entity')
    @UseValidationPipe()
    @Transactional()
    public async createOne(
        @Param('entity') entityName: string,
        @Body() body: Record<string, unknown>,
        @Res() res: Response,
    ) {
        const entity = this.service.getEntity(entityName);
        if (!entity) {
            res.status(404).send();
            return;
        }

        const manager = this.service.getEntityManager();
        const relations = entity.meta.relations.map((r) => r.propertyName);

        const instance = manager.create(entity.entityClass, body);
        await manager.save(entity.entityClass, instance);
        const data = await manager.findOne(entity.entityClass, { where: { id: instance.id }, relations });

        res.status(200).json(data);
    }

    @Delete(':entity/:id')
    @UseValidationPipe()
    @Transactional()
    public async deleteOne(
        @Param('entity') entityName: string,
        @Param('id', new ParseParamIntPipe()) id: number,
        @Res() res: Response,
    ) {
        const entity = this.service.getEntity(entityName);
        if (!entity) {
            res.status(404).send();
            return;
        }

        const manager = this.service.getEntityManager();
        const relations = entity.meta.relations.map((r) => r.propertyName);

        const data = await manager.findOne(entity.entityClass, { where: { id }, relations });

        await manager.delete(entity.entityClass, id);

        res.status(200).json(data);
    }
}
