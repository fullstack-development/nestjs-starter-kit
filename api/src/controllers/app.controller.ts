import { ControllerResponse } from './../core/controller.core';
import { Body, Controller, Get, Module, Query } from '@nestjs/common';

@Controller('api')
export class AppControllerProvider {
    @Get('echo')
    echo(@Query() query: unknown, @Body() body: unknown) {
        return ControllerResponse.Success({
            headers: {
                'Content-Type': 'application/json',
            },
            body: {
                query: query && typeof query === 'object' ? JSON.stringify(query) : query,
                body: body && typeof body === 'object' ? JSON.stringify(body) : body,
            },
        });
    }
}

@Module({
    controllers: [AppControllerProvider],
})
export class AppController {}
