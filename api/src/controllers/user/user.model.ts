import { ControllerResponse } from '@lib/core';
import { EmailConfirm, RefreshToken, User } from '@lib/repository';
import { plainToClass, Transform, Type } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';
import { CompareDateQuery, CompareNumberQuery, IsSafeInteger } from '../../utils/validation.utils';
import { CannotFindUser as CFU } from './../../services/user/user.model';

export class QueryParams {
    @IsOptional()
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            return plainToClass(CompareNumberQuery, JSON.parse(value));
        }

        return value;
    })
    @ValidateNested()
    @Type(() => CompareNumberQuery)
    id?: CompareNumberQuery;

    @IsOptional()
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            return plainToClass(CompareDateQuery, JSON.parse(value));
        }

        return value;
    })
    @ValidateNested()
    @Type(() => CompareDateQuery)
    created?: CompareDateQuery;

    @IsOptional()
    @Type(() => Number)
    @Transform(({ value }) => {
        if (Number.isInteger(value)) {
            return value <= 0 ? 1 : value;
        }
        return value;
    })
    @IsSafeInteger()
    page = 1;

    @IsOptional()
    @Type(() => Number)
    @Transform(({ value }) => {
        if (Number.isInteger(value)) {
            return value <= 0 ? 50 : value;
        }
        return value;
    })
    @IsSafeInteger()
    pageSize = 50;
}

export type MeResponse =
    | CFU
    | ControllerResponse<
          Omit<
              User & {
                  refreshToken: RefreshToken | null;
                  emailConfirm: EmailConfirm | null;
              },
              'refreshToken' | 'emailConfirm' | 'hash'
          >,
          never
      >;
