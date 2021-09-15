import { Body, Controller, Module, Post } from '@nestjs/common';
import { ControllerResponse, Fail, processControllerError, Success } from '../controller.model';
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
    async signUp(@Body() body: SignUpInput): Promise<ControllerResponse> {
        const signUpResult = await this.authService.signUp(body);
        if (!signUpResult.success) {
            const error = await processControllerError(signUpResult, this.errorsService);
            return Fail(error.code, error.body);
        } else {
            return Success({ status: true });
        }
    }

    @Post('sign-in')
    @UseValidationPipe()
    async signIn(@Body() body: SignInInput): Promise<ControllerResponse> {
        const signInResult = await this.authService.signIn(body);
        if (!signInResult.success) {
            const error = await processControllerError(signInResult, this.errorsService);
            return Fail(error.code, error.body);
        } else {
            return Success({
                status: true,
                data: signInResult.data,
            });
        }
    }

    @Post('confirm-email')
    @UseValidationPipe()
    async confirmEmail(@Body() { confirmUuid }: ConfirmEmailInput): Promise<ControllerResponse> {
        const confirmEmailResult = await this.authService.confirmEmail(confirmUuid);
        if (!confirmEmailResult.success) {
            const error = await processControllerError(confirmEmailResult, this.errorsService);
            return Fail(error.code, error.body);
        } else {
            return Success({
                status: true,
                data: confirmEmailResult.data,
            });
        }
    }
}

@Module({
    imports: [AuthService, ErrorsService],
    controllers: [AuthControllerProvider],
})
export class AuthController {}
