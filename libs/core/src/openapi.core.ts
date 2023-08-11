import { applyDecorators, HttpStatus, Type } from '@nestjs/common';
import {
    ApiExtraModels,
    ApiHeader,
    ApiHeaderOptions,
    ApiOkResponse,
    ApiResponse,
    getSchemaPath,
} from '@nestjs/swagger';
import {
    HeadersObject,
    SchemaObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { isNotEmpty } from './../utils/validation.utils';
import { ConflictError, NotFoundError, UnprocessableEntityError } from './errors.core';

type ApiDescribeOptions<T extends Type<unknown>, E extends Type<unknown>> = {
    ok?: { headers?: HeadersObject; body: T | Array<T>; isArray?: boolean };
    isPaginate?: boolean;
    hasValidationErrors?: boolean;
    isSecure?: boolean;
    errors?: Array<E>;
    headers?: Array<ApiHeaderOptions>;
};

class EmptyOk {}

type Schema = {
    kind: HttpStatus;
    body: { type: string; properties: { error: { type: string } } };
};

const getSchemaByCount = (errors: Array<Schema>) => {
    if (isNotEmpty(errors) && errors.length === 1) {
        return errors[0].body;
    }

    return { oneOf: errors.map((error) => error.body) };
};

const constructErrorApiResponses = (
    schemas: Array<Schema>,
): Array<MethodDecorator & ClassDecorator> => {
    const conflictErrors = schemas.filter((schema) => schema.kind === HttpStatus.CONFLICT);
    const entityErrors = schemas.filter(
        (schema) => schema.kind === HttpStatus.UNPROCESSABLE_ENTITY,
    );
    const isHasNotFoundError = schemas.some((schema) => schema.kind === HttpStatus.NOT_FOUND);

    const decorators: Array<MethodDecorator & ClassDecorator> = [];

    if (conflictErrors.length > 0) {
        decorators.push(
            ApiResponse({
                status: HttpStatus.CONFLICT,
                schema: getSchemaByCount(conflictErrors),
            }),
        );
    }

    if (entityErrors.length > 0) {
        decorators.push(
            ApiResponse({
                status: HttpStatus.UNPROCESSABLE_ENTITY,
                schema: getSchemaByCount(entityErrors),
            }),
        );
    }

    if (isHasNotFoundError) {
        decorators.push(
            ApiResponse({
                status: HttpStatus.NOT_FOUND,
                schema: schemas.filter((schema) => schema.kind === HttpStatus.NOT_FOUND)[0]
                    .body as SchemaObject,
            }),
        );
    }

    return decorators;
};

const constructPaginatedArraySchema = <T extends Type<unknown>>(body: Array<T>) => {
    return {
        schema: {
            type: 'object',
            properties: {
                page: {
                    type: 'number',
                },
                pageSize: {
                    type: 'number',
                },
                count: {
                    type: 'number',
                },
                result: {
                    type: 'array',
                    items: {
                        oneOf: body.map((val) => ({ $ref: getSchemaPath(val) })),
                    },
                },
            },
        },
    };
};

const constructOkSchema = <T extends Type<unknown>, E extends Type<unknown>>(
    options: ApiDescribeOptions<T, E>,
) => {
    if (!options.ok) {
        return { type: EmptyOk };
    }

    if (options.isPaginate) {
        if (Array.isArray(options.ok.body)) {
            return constructPaginatedArraySchema(options.ok.body);
        }
        return {
            schema: {
                type: 'object',
                properties: {
                    page: {
                        type: 'number',
                    },
                    pageSize: {
                        type: 'number',
                    },
                    count: {
                        type: 'number',
                    },
                    result: {
                        type: 'array',
                        items: { $ref: getSchemaPath(options.ok.body) },
                    },
                },
            },
        };
    }

    if (Array.isArray(options.ok.body)) {
        return {
            schema: {
                oneOf: options.ok.body.map((val) => ({ $ref: getSchemaPath(val) })),
            },
        };
    }

    if (options.ok.isArray) {
        return {
            schema: {
                type: 'object',
                properties: {
                    result: {
                        type: 'array',
                        items: { $ref: getSchemaPath(options.ok.body) },
                    },
                },
            },
        };
    }

    return { type: options.ok.body };
};

export const ApiDescribe = <T extends Type<unknown>, E extends Type<unknown>>(
    options: ApiDescribeOptions<T, E>,
) => {
    const decorators: Array<MethodDecorator & ClassDecorator> = [];
    const errors = options.errors || [];
    const errorSchemas = errors.map((Model) => {
        const instance = new Model();
        let error = '';
        let status: HttpStatus = HttpStatus.CONFLICT;

        if (
            !(instance instanceof ConflictError) &&
            !(instance instanceof NotFoundError) &&
            !(instance instanceof UnprocessableEntityError)
        ) {
            throw new Error(`Unknown error provided: ${Model}`);
        }

        if (instance instanceof ConflictError) {
            error = instance.error;
            status = HttpStatus.CONFLICT;
        }

        if (instance instanceof NotFoundError) {
            error = 'Not Found';
            status = HttpStatus.NOT_FOUND;
        }

        if (instance instanceof UnprocessableEntityError) {
            error = instance.error;
            status = HttpStatus.UNPROCESSABLE_ENTITY;
        }

        if (options.headers) {
            options.headers.forEach((header) => decorators.push(ApiHeader(header)));
        }

        return {
            kind: status,
            body: { type: 'object', properties: { error: { type: error } } },
        };
    });

    decorators.push(
        ApiResponse({
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            schema: { type: 'object', properties: { error: { type: 'string' } } },
        }),
    );

    if (options.hasValidationErrors) {
        decorators.push(
            ApiResponse({
                status: HttpStatus.BAD_REQUEST,
                schema: {
                    type: 'object',
                    properties: {
                        error: { type: 'Bad Request' },
                        message: { type: 'array', items: { type: 'string' } },
                    },
                },
            }),
        );
    }

    if (options.isSecure) {
        decorators.push(
            ApiResponse({
                status: HttpStatus.UNAUTHORIZED,
                schema: { type: 'object', properties: { message: { type: 'Unauthorized' } } },
            }),
        );

        decorators.push(
            ApiHeader({
                name: 'Authorization',
                description: 'Bearer tokenValue',
                required: true,
            }),
        );
    }

    if (options.ok) {
        if (Array.isArray(options.ok.body)) {
            decorators.push(ApiExtraModels(...options.ok.body));
        } else {
            decorators.push(ApiExtraModels(options.ok.body));
        }
    }

    decorators.push(
        ApiOkResponse({
            ...constructOkSchema(options),
            headers: options.ok?.headers || {},
        }),
    );

    return applyDecorators(...decorators, ...constructErrorApiResponses(errorSchemas));
};
