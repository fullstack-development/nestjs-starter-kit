import { Injectable, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BaseRepository } from '../../core/repository.core';
import { EmailConfirmEntity } from './emailConfirm.entity';
import {
    CannotFindEmailConfirm,
    CannotRemoveEmailConfirm,
    CannotUpdateEmailConfirm,
} from './emailConfirm.model';

@Injectable()
export class EmailConfirmsRepositoryProvider extends BaseRepository<
    EmailConfirmEntity,
    CannotFindEmailConfirm,
    CannotUpdateEmailConfirm,
    CannotRemoveEmailConfirm
> {
    constructor() {
        super(EmailConfirmEntity, {
            findError: CannotFindEmailConfirm,
            updateError: CannotUpdateEmailConfirm,
            removeError: CannotRemoveEmailConfirm,
        });
    }
}

@Module({
    imports: [TypeOrmModule.forFeature([EmailConfirmEntity])],
    providers: [EmailConfirmsRepositoryProvider],
    exports: [EmailConfirmsRepositoryProvider],
})
export class EmailConfirmsRepository {}
