import { Body, Controller, HttpStatus, Module, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { processControllerError } from '../../model/controller.model';
import { AuthService, AuthServiceProvider } from '../../services/auth/auth.service';
import { ErrorsService, ErrorsServiceProvider } from '../../services/errors/errors.service';
import { UseValidationPipe } from '../../utils/validation.utils';
import { ConfirmEmailInput, SignInInput, SignUpInput } from './auth.model';

@Controller('api/auth')
export class AuthControllerProvider {
    constructor(
        private authService: AuthServiceProvider,
        private errorsService: ErrorsServiceProvider,
    ) {}

    @Post('sign-up')
    @UseValidationPipe()
    async signUp(@Body() body: SignUpInput, @Res() response: Response) {
        const signUpResult = await this.authService.signUp(body);
        if (!signUpResult.success) {
            const error = await processControllerError(signUpResult, this.errorsService);
            response.status(error.code);
            response.send(error.body);
        } else {
            response.status(HttpStatus.OK);
            response.send({ status: true });
        }
    }

    @Post('sign-in')
    @UseValidationPipe()
    async signIn(@Body() body: SignInInput, @Res() response: Response) {
        const signInResult = await this.authService.signIn(body);
        if (!signInResult.success) {
            const error = await processControllerError(signInResult, this.errorsService);
            response.status(error.code);
            response.send(error.body);
        } else {
            response.status(HttpStatus.OK);
            response.send({ status: true, data: signInResult.data });
        }
    }

    @Post('confirm-email')
    @UseValidationPipe()
    async confirmEmail(@Body() { confirmUuid }: ConfirmEmailInput, @Res() response: Response) {
        const confirmEmailResult = await this.authService.confirmEmail(confirmUuid);
        if (!confirmEmailResult.success) {
            const error = await processControllerError(confirmEmailResult, this.errorsService);
            response.status(error.code);
            response.send(error.body);
        } else {
            response.status(HttpStatus.OK);
            response.send({ status: true, data: confirmEmailResult.data });
        }
    }
}

@Module({
    imports: [AuthService, ErrorsService],
    controllers: [AuthControllerProvider],
})
export class AuthController {}