import { Injectable, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BaseRepository } from '../../model/repository.model';
import { EmailConfirmEntity } from './emailConfirm.entity';
import {
    CannotFindEmailConfirm,
    CannotRemoveEmailConfirm,
    CannotUpdateEmailConfirm,
    cannotFindEmailConfirm,
    cannotRemoveEmailConfirm,
    cannotUpdateEmailConfirm,
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
            findError: cannotFindEmailConfirm,
            updateError: cannotUpdateEmailConfirm,
            removeError: cannotRemoveEmailConfirm,
        });
    }
}

@Module({
    imports: [TypeOrmModule.forFeature([EmailConfirmEntity])],
    providers: [EmailConfirmsRepositoryProvider],
    exports: [EmailConfirmsRepositoryProvider],
})
export class EmailConfirmsRepository {}
