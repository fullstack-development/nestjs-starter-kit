import { Injectable, Module } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../../model/repository.model';
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
    constructor(
        @InjectRepository(EmailConfirmEntity)
        private emailConfirmsRepository: Repository<EmailConfirmEntity>,
    ) {
        super(emailConfirmsRepository, {
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
