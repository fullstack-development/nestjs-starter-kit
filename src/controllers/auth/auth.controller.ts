import { RequestUser } from './../../core/controller.core';
import { Body, Controller, Get, Module, Post, UseGuards } from '@nestjs/common';
import { processControllerError, User } from '../../core/controller.core';
import { AuthService, AuthServiceProvider } from '../../services/auth/auth.service';
import { ErrorsService, ErrorsServiceProvider } from '../../services/errors/errors.service';
import { UseValidationPipe } from '../../utils/validation.utils';
import {
    ConfirmEmailInput,
    SignInInput,
    SignUpInput,
    CR_SignUpSuccess,
    CR_SignInSuccess,
    CR_ConfirmEmailSuccess,
    CR_UpdateRefreshTokenSuccess,
} from './auth.model';
import { isError } from '../../core/errors.core';
import { AuthToken } from '../../services/auth/auth.model';
import { JwtUserRefreshGuard } from '../../services/auth/jwt-user-refresh.guard';

@Controller('api/auth')
export class AuthControllerProvider {
    constructor(
        private authService: AuthServiceProvider,
        private errorsService: ErrorsServiceProvider,
    ) {}

    @Post('sign-up')
    @UseValidationPipe()
    async signUp(@Body() body: SignUpInput) {
        console.log('inside controller', body);
        const signUpResult = await this.authService.signUp(body);
        if (isError(signUpResult)) {
            return await processControllerError(signUpResult, this.errorsService);
        } else {
            return new CR_SignUpSuccess();
        }
    }

    @Post('sign-in')
    @UseValidationPipe()
    async signIn(@Body() body: SignInInput) {
        const signInResult = await this.authService.signIn(body);
        if (isError(signInResult)) {
            return await processControllerError(signInResult, this.errorsService);
        } else {
            return new CR_SignInSuccess({
                body: new AuthToken(signInResult.accessToken),
                headers: { 'Set-Cookie': signInResult.refreshCookie },
            });
        }
    }

    @Post('confirm-email')
    @UseValidationPipe()
    async confirmEmail(@Body() { confirmUuid }: ConfirmEmailInput) {
        const confirmEmailResult = await this.authService.confirmEmail(confirmUuid);
        if (isError(confirmEmailResult)) {
            return await processControllerError(confirmEmailResult, this.errorsService);
        } else {
            return new CR_ConfirmEmailSuccess({
                body: new AuthToken(confirmEmailResult.accessToken),
                headers: { 'Set-Cookie': confirmEmailResult.refreshCookie },
            });
        }
    }

    @Get('refresh')
    @UseGuards(JwtUserRefreshGuard)
    async handleRefreshToken(@User() user: RequestUser) {
        const result = await this.authService.generateTokensWithCookie(user.id, user.email);

        if (isError(result)) {
            return await processControllerError(result, this.errorsService);
        } else {
            return new CR_UpdateRefreshTokenSuccess({
                body: new AuthToken(result.accessToken),
                headers: { 'Set-Cookie': result.refreshCookie },
            });
        }
    }
}

@Module({
    imports: [AuthService, ErrorsService],
    controllers: [AuthControllerProvider],
})
export class AuthController {}
