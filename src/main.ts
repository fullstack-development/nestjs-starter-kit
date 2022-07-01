import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app/app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        logger: ['error', 'warn', 'log', 'verbose', 'debug'],
    });
    app.use(cookieParser());

    await app.listen(3000);
}
bootstrap();
