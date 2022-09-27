import { Body, Controller, Get, Module, Query, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller('api')
export class AppControllerProvider {
    @Get('echo')
    echo(@Query() query: unknown, @Body() body: unknown, @Res() res: Response) {
        res.setHeader('Content-Type', 'application/json');
        return {
            query: query && typeof query === 'object' ? JSON.stringify(query) : query,
            body: body && typeof body === 'object' ? JSON.stringify(body) : body,
        };
    }
}

@Module({
    controllers: [AppControllerProvider],
})
export class AppController {}
