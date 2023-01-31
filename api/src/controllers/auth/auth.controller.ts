import { Body, Controller, Get, Module, Post, UseGuards } from '@nestjs/common';
import { ControllerResponse, mapResponse, RequestUser, User } from '../../core/controller.core';
import { AuthService, AuthServiceProvider } from '../../services/auth/auth.service';
import { JwtUserRefreshGuard } from '../../services/auth/guards/jwt-user-refresh.guard';
import { UserType } from '../../services/token/token.model';
import { UseValidationPipe } from '../../utils/validation.utils';
import { TokenService, TokenServiceProvider } from './../../services/token/token.service';
import {
    ConfirmEmailInput,
    ConfirmEmailResponse,
    HandleRefreshTokenResponse,
    SignInInput,
    SignInResponse,
    SignUpInput,
    SignUpResponse,
} from './auth.model';

@Controller('api/auth')
export class AuthControllerProvider {
    constructor(
        private authService: AuthServiceProvider,
        private tokenService: TokenServiceProvider,
    ) {}

    @Post('sign-up')
    @UseValidationPipe()
    async signUp(@Body() body: SignUpInput): Promise<SignUpResponse> {
        return mapResponse(
            await this.authService.signUp(body),
            () => new ControllerResponse<never, never>(),
        );
    }

    @Post('sign-in')
    @UseValidationPipe()
    async signIn(@Body() body: SignInInput): Promise<SignInResponse> {
        return mapResponse(
            await this.authService.signIn(body),
            ({ accessToken, refreshCookie }) =>
                new ControllerResponse({ token: accessToken }, { 'Set-Cookie': refreshCookie }),
        );
    }

    @Post('confirm-email')
    @UseValidationPipe()
    async confirmEmail(@Body() { confirmUuid }: ConfirmEmailInput): Promise<ConfirmEmailResponse> {
        return mapResponse(
            await this.authService.confirmEmail(confirmUuid),
            ({ accessToken, refreshCookie }) =>
                new ControllerResponse({ token: accessToken }, { 'Set-Cookie': refreshCookie }),
        );
    }

    @Get('refresh')
    @UseGuards(JwtUserRefreshGuard)
    async handleRefreshToken(@User() user: RequestUser): Promise<HandleRefreshTokenResponse> {
        return mapResponse(
            await this.tokenService.generate(user.id, UserType.USER, user.email),
            ({ accessToken, refreshCookie }) =>
                new ControllerResponse({ token: accessToken }, { 'Set-Cookie': refreshCookie }),
        );
    }
}

@Module({
    imports: [AuthService, TokenService],
    controllers: [AuthControllerProvider],
})
export class AuthController {}
