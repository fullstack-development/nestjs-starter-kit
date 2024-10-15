import { UseValidationPipe } from '@lib/core/utils';
import { Body, Controller, Post } from '@nestjs/common';
import { makeAdminResponse } from '../../app.model';
import { AuthService } from './auth.service';
import { SignInBody } from './dto/sign-in.dto';

@Controller('api/admin/auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('sign-in')
    @UseValidationPipe()
    async signIn(@Body() body: SignInBody) {
        const result = await this.authService.signIn(body);
        return makeAdminResponse(result, (token) => ({ token }));
    }
}
