import { LoggerService } from '@lib/logger';
import { OpenobserveService } from '@lib/logger/modules/openobserve/openobserve.service';
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
    const app = await NestFactory.create(AppModule, { bufferLogs: true });
    app.use(cookieParser());
    app.useLogger(new LoggerService(app.get(OpenobserveService)));

    enableCorsByEnv(app);
    const config = app.get(EnvConfig);

    await app.listen(config.PORT);
}
bootstrap();
