import { Injectable, Module } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../../model/repository.model';
import { ErrorEntity } from './errors.entity';
import { CannotFindError, CannotRemoveError, CannotUpdateError } from './errors.model';

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
