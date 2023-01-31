import { Body, Controller, Get, Module, Query } from '@nestjs/common';
import { ControllerResponse } from './../core/controller.core';

@Controller('api')
export class AppControllerProvider {
    @Get('echo')
    async echo(
        @Query() query: unknown,
        @Body() body: unknown,
    ): Promise<
        ControllerResponse<
            {
                query: unknown;
                body: unknown;
            },
            'Content-Type'
        >
    > {
        return new ControllerResponse(
            {
                query: query && typeof query === 'object' ? JSON.stringify(query) : query,
                body: body && typeof body === 'object' ? JSON.stringify(body) : body,
            },
            {
                'Content-Type': 'application/json',
            },
        );
    }
}

@Module({
    controllers: [AppControllerProvider],
})
export class AppController {}
