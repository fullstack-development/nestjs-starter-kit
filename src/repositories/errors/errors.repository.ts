import { Injectable, Module } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../../model/repository.model';
import { ErrorEntity } from './errors.entity';
import {
    CannotFindError,
    CannotRemoveError,
    CannotUpdateError,
    cannotFindError,
    cannotRemoveError,
    cannotUpdateError,
} from './errors.model';

@Injectable()
export class ErrorsRepositoryProvider extends BaseRepository<
    ErrorEntity,
    CannotFindError,
    CannotUpdateError,
    CannotRemoveError
> {
    constructor(
        @InjectRepository(ErrorEntity)
        private errorsRepository: Repository<ErrorEntity>,
    ) {
        super(errorsRepository, {
            findError: cannotFindError,
            updateError: cannotUpdateError,
            removeError: cannotRemoveError,
        });
    }
}

@Module({
    imports: [TypeOrmModule.forFeature([ErrorEntity])],
    providers: [ErrorsRepositoryProvider],
    exports: [ErrorsRepositoryProvider],
})
export class ErrorsRepository {}
