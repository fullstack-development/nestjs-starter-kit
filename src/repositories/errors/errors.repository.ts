import { Injectable, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BaseRepository } from '../../core/repository.core';
import { ErrorEntity } from './errors.entity';
import { CannotFindError, CannotRemoveError, CannotUpdateError } from './errors.model';

@Injectable()
export class ErrorsRepositoryProvider extends BaseRepository<
    ErrorEntity,
    CannotFindError,
    CannotUpdateError,
    CannotRemoveError
> {
    constructor() {
        super(ErrorEntity, {
            findError: CannotFindError,
            updateError: CannotUpdateError,
            removeError: CannotRemoveError,
        });
    }
}

@Module({
    imports: [TypeOrmModule.forFeature([ErrorEntity])],
    providers: [ErrorsRepositoryProvider],
    exports: [ErrorsRepositoryProvider],
})
export class ErrorsRepository {}
