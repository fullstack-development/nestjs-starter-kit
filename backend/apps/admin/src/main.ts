import { CoreConfigService } from '@lib/core';
import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AdminModule } from './admin.module';
import { ConfigModel } from './config/config.model';

const enableCorsByEnv = (app: INestApplication<unknown>) => {
    if (process.env['NODE_ENV'] === 'development') {
        app.enableCors({ origin: '*' });
    }
};

async function bootstrap() {
    const app = await NestFactory.create(AdminModule);
    app.use(cookieParser());

    enableCorsByEnv(app);
    const config = app.get<CoreConfigService<ConfigModel>>(CoreConfigService);

    await app.listen(config.env.PORT);
}

bootstrap();
