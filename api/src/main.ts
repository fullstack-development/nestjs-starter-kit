import './patchBigInt';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app/app.module';
import { ConfigServiceProvider } from './services/config/config.service';
import { serve, setup } from 'swagger-ui-express';
import { load } from 'yamljs';
import { DatabaseServiceProvider } from './services/database/database.service';
import { ENVIRONMENT } from './services/config/config.model';
import { INestApplication } from '@nestjs/common';

const enableCorsByEnv = (app: INestApplication, config: ConfigServiceProvider) => {
    const baseCorsOptions = {
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        preflightContinue: false,
        optionsSuccessStatus: 204,
        credentials: true,
        allowedHeaders: [
            'Authorization',
            'Content-Type',
            'Access-Control-Allow-Credentials',
            'range',
            'Content-Range',
            'Access-Control-Expose-Headers',
        ].join(','),
    };

    switch (config.ENVIRONMENT) {
        case ENVIRONMENT.LOCAL: {
            const options = {
                ...baseCorsOptions,
                origin: [
                    'localhost:3001',
                    'localhost:3002',
                    'localhost:3000',
                    'localhost:3030',
                    'localhost',
                    'http://localhost:3001',
                    'https://localhost:3001',
                    'http://localhost:3002',
                    'https://localhost:3002',
                    'http://localhost:3000',
                    'http://localhost:3030',
                    'http://localhost',
                    'http://localhost:3000/',
                    'http://localhost:3030/',
                    'http://localhost/',
                ],
            };
            app.enableCors(options);
            return;
        }

        case ENVIRONMENT.STAGE: {
            return;
        }

        case ENVIRONMENT.PROD: {
            return;
        }

        default: {
            const _exhaustiveCheck: never = config.ENVIRONMENT;
            return _exhaustiveCheck;
        }
    }
};

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.use(cookieParser());

    const db = app.get(DatabaseServiceProvider);
    await db.init();

    const configService = app.get(ConfigServiceProvider);

    enableCorsByEnv(app, configService);

    const ENV = process.env['ENVIRONMENT'];
    if (ENV === ENVIRONMENT.STAGE || ENV === ENVIRONMENT.LOCAL) {
        const swaggerDoc = load('src/swagger.yaml');
        app.use(
            '/swagger',
            serve,
            setup(swaggerDoc, {
                swaggerOptions: {
                    defaultModelRendering: 'model',
                    defaultModelsExpandDepth: 0,
                    defaultModelExpandDepth: 10,
                },
            }),
        );
    }

    await app.listen(3000);
}
bootstrap();
