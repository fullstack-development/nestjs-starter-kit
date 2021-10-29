import { Body, Controller, Module, Post } from '@nestjs/common';
import { ApiResponses, processControllerError } from '../../core/controller.core';
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
} from './auth.model';
import { isError } from '../../core/errors.core';
import { ApiTags } from '@nestjs/swagger';

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
    @ApiResponses(CR_SignInSuccess, [CR_EmailOrPasswordIncorrect, CR_EmailNotConfirmed])
    async signIn(@Body() body: SignInInput) {
        const signInResult = await this.authService.signIn(body);
        if (isError(signInResult)) {
            return await processControllerError(signInResult, this.errorsService);
        } else {
            return new CR_SignInSuccess(signInResult);
        }
    }

    @Post('confirm-email')
    @UseValidationPipe()
    @ApiResponses(CR_ConfirmEmailSuccess, [
        CR_CannotFindUser,
        CR_EmailAlreadyConfirmed,
        CR_ConfirmationNotFound,
        CR_CannotUpdateUser,
    ])
    async confirmEmail(@Body() { confirmUuid }: ConfirmEmailInput) {
        const confirmEmailResult = await this.authService.confirmEmail(confirmUuid);
        if (isError(confirmEmailResult)) {
            return await processControllerError(confirmEmailResult, this.errorsService);
        } else {
            return new CR_ConfirmEmailSuccess(confirmEmailResult);
        }
    }
}

@Module({
    imports: [AuthService, ErrorsService],
    controllers: [AuthControllerProvider],
})
export class AuthController {}
