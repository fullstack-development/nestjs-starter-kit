import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { serve, setup } from 'swagger-ui-express';
import * as Yaml from 'yamljs';
import { AppModule } from './app/app.module';
import { ConfigProvider } from './core/config/config.core';
import { ENVIRONMENT } from './core/config/config.model';
import './patchBigInt';

const enableCorsByEnv = (app: INestApplication, config: ConfigProvider) => {
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

    const configService = app.get(ConfigProvider);

    enableCorsByEnv(app, configService);

    const ENV = configService.ENVIRONMENT;
    if (ENV === ENVIRONMENT.STAGE || ENV === ENVIRONMENT.LOCAL) {
        const swaggerDoc = Yaml.load('src/swagger.yaml');
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
