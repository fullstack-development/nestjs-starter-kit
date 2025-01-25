import { RepositoryModule } from '@lib/repository';
import { Module } from '@nestjs/common';
import { DbController } from './db.controller';
import { DbService } from './db.service';

@Module({
    imports: [RepositoryModule],
    providers: [DbService],
    exports: [DbService],
    controllers: [DbController],
})
export class DbModule {
    constructor() {}
}
