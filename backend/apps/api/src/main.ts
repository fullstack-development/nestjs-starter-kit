import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { EnvConfig } from './config/config.model';

const enableCorsByEnv = (app: INestApplication<unknown>) => {
    if (process.env['NODE_ENV'] === 'development') {
        app.enableCors({ origin: '*' });
    }
};

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.use(cookieParser());

    enableCorsByEnv(app);
    const config = app.get(EnvConfig);

    await app.listen(config.PORT);
}
bootstrap();
