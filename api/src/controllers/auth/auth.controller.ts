import { TokenService, TokenServiceProvider } from './../../services/token/token.service';
import { ControllerResponse, mapResponse, RequestUser } from '../../core/controller.core';
import { Body, Controller, Get, Module, Post, UseGuards } from '@nestjs/common';
import { User } from '../../core/controller.core';
import { AuthService, AuthServiceProvider } from '../../services/auth/auth.service';
import { UseValidationPipe } from '../../utils/validation.utils';
import { ConfirmEmailInput, SignInInput, SignUpInput } from './auth.model';
import { JwtUserRefreshGuard } from '../../services/auth/guards/jwt-user-refresh.guard';
import { UserType } from '../../services/token/token.model';

@Controller('api/auth')
export class AuthControllerProvider {
    constructor(
        private authService: AuthServiceProvider,
        private tokenService: TokenServiceProvider,
    ) {}

    @Post('sign-up')
    @UseValidationPipe()
    async signUp(@Body() body: SignUpInput) {
        return mapResponse(await this.authService.signUp(body))(() => ControllerResponse.Success());
    }

    @Post('sign-in')
    @UseValidationPipe()
    async signIn(@Body() body: SignInInput) {
        return mapResponse(await this.authService.signIn(body))(({ accessToken, refreshCookie }) =>
            ControllerResponse.Success({
                body: accessToken,
                headers: { 'Set-Cookie': refreshCookie },
            }),
        );
    }

    @Post('confirm-email')
    @UseValidationPipe()
    async confirmEmail(@Body() { confirmUuid }: ConfirmEmailInput) {
        return mapResponse(await this.authService.confirmEmail(confirmUuid))(
            ({ accessToken, refreshCookie }) =>
                ControllerResponse.Success({
                    body: accessToken,
                    headers: { 'Set-Cookie': refreshCookie },
                }),
        );
    }

    @Get('refresh')
    @UseGuards(JwtUserRefreshGuard)
    async handleRefreshToken(@User() user: RequestUser) {
        return mapResponse(await this.tokenService.generate(user.id, UserType.USER, user.email))(
            ({ accessToken, refreshCookie }) =>
                ControllerResponse.Success({
                    body: accessToken,
                    headers: { 'Set-Cookie': refreshCookie },
                }),
        );
    }
}

@Module({
    imports: [AuthService, TokenService],
    controllers: [AuthControllerProvider],
})
export class AuthController {}