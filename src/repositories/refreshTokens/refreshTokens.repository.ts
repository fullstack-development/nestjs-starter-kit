import {
    CannotFindRefreshToken,
    CannotUpdateRefreshToken,
    CannotRemoveRefreshToken,
} from './refreshTokens.model';
import { RefreshTokenEntity } from './refreshTokens.entity';
import { Injectable, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BaseRepository } from '../../core/repository.core';
@Injectable()
export class RefreshTokensRepositoryProvider extends BaseRepository<
    RefreshTokenEntity,
    CannotFindRefreshToken,
    CannotUpdateRefreshToken,
    CannotRemoveRefreshToken
> {
    constructor() {
        super(RefreshTokenEntity, {
            findError: CannotFindRefreshToken,
            updateError: CannotUpdateRefreshToken,
            removeError: CannotRemoveRefreshToken,
        });
    }
}

@Module({
    imports: [TypeOrmModule.forFeature([RefreshTokenEntity])],
    providers: [RefreshTokensRepositoryProvider],
    exports: [RefreshTokensRepositoryProvider],
})
export class RefreshTokensRepository {}
