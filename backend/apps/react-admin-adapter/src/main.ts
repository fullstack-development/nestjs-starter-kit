import { CoreConfigService } from '@lib/core';
import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { ConfigModel } from './config/config.model';
import { ReactAdminAdapterModule } from './react-admin-adapter.module';

const enableCorsByEnv = (app: INestApplication<unknown>) => {
    if (process.env['NODE_ENV'] === 'development') {
        app.enableCors({ origin: '*' });
    }
};

async function bootstrap() {
    const app = await NestFactory.create(ReactAdminAdapterModule);
    app.use(cookieParser());

    enableCorsByEnv(app);
    const config = app.get<CoreConfigService<ConfigModel>>(CoreConfigService);

    await app.listen(config.env.PORT);
}
bootstrap();
