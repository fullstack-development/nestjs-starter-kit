import { RequestUser } from './../../core/controller.core';
import { Body, Controller, Get, Module, Post, UseGuards } from '@nestjs/common';
import { ApiResponses, processControllerError, User } from '../../core/controller.core';
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
    CR_CannotCreateUser,
    CR_CannotSendEmailConfirmation,
    CR_UserAlreadyExist,
    CR_EmailOrPasswordIncorrect,
    CR_EmailNotConfirmed,
    CR_CannotUpdateUser,
    CR_CannotFindUser,
    CR_ConfirmationNotFound,
    CR_EmailAlreadyConfirmed,
    CR_CannotCreateRefreshToken,
    CR_UpdateRefreshTokenSuccess,
    CR_CannotUpdateRefreshToken,
} from './auth.model';
import { isError } from '../../core/errors.core';
import { ApiTags } from '@nestjs/swagger';
import { AuthToken } from '../../services/auth/auth.model';
import JwtRefreshGuard from '../../services/auth/jwt-refresh.guard';

@ApiTags('api/auth')
@Controller('api/auth')
export class AuthControllerProvider {
    constructor(
        private authService: AuthServiceProvider,
        private errorsService: ErrorsServiceProvider,
    ) {}

    @Post('sign-up')
    @UseValidationPipe()
    @ApiResponses(CR_SignUpSuccess, [
        CR_CannotCreateUser,
        CR_CannotSendEmailConfirmation,
        CR_UserAlreadyExist,
    ])
    async signUp(@Body() body: SignUpInput) {
        const signUpResult = await this.authService.signUp(body);
        if (isError(signUpResult)) {
            return await processControllerError(signUpResult, this.errorsService);
        } else {
            return new CR_SignUpSuccess();
        }
    }

    @Post('sign-in')
    @UseValidationPipe()
    @ApiResponses(CR_SignInSuccess, [
        CR_CannotFindUser,
        CR_CannotUpdateRefreshToken,
        CR_CannotCreateRefreshToken,
        CR_EmailOrPasswordIncorrect,
        CR_EmailNotConfirmed,
    ])
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
    @ApiResponses(CR_ConfirmEmailSuccess, [
        CR_CannotFindUser,
        CR_CannotCreateRefreshToken,
        CR_CannotUpdateRefreshToken,
        CR_EmailAlreadyConfirmed,
        CR_ConfirmationNotFound,
        CR_CannotUpdateUser,
    ])
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
    @UseGuards(JwtRefreshGuard)
    @ApiResponses(CR_UpdateRefreshTokenSuccess, [
        CR_CannotFindUser,
        CR_CannotUpdateRefreshToken,
        CR_CannotCreateRefreshToken,
    ])
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
