import { ApiDescribe, ContextUser, ControllerResponse, mapResponse, User } from '@lib/core';
import { UseValidationPipe } from '@lib/utils';
import { Body, Controller, Get, Module, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CannotSendEmailConfirmation } from '../../../services/auth/auth.model';
import { AuthService, AuthServiceProvider } from '../../../services/auth/auth.service';
import { JwtUserRefreshGuard } from '../../../services/auth/guards/jwt-user-refresh.guard';
import { UserType } from '../../../services/token/token.model';
import { UserAlreadyExist } from '../../../services/user/user.model';
import { PREFIX_URI } from '../../prefix';
import { TokenService, TokenServiceProvider } from './../../../services/token/token.service';
import {
    ConfirmEmailInput,
    ConfirmEmailResponse,
    HandleRefreshTokenResponse,
    SignInInput,
    SignInResponse,
    SignUpInput,
    SignUpResponse,
} from './auth.model';

@ApiTags(`${PREFIX_URI}/auth`)
@Controller(`${PREFIX_URI}/auth`)
export class AuthControllerProvider {
    constructor(
        private authService: AuthServiceProvider,
        private tokenService: TokenServiceProvider,
    ) {}

    @Post('sign-up')
    @UseValidationPipe()
    @ApiDescribe({
        hasValidationErrors: true,
        errors: [UserAlreadyExist, CannotSendEmailConfirmation],
    })
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
    async handleRefreshToken(@User() user: ContextUser): Promise<HandleRefreshTokenResponse> {
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
