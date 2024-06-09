import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { CoreConfigService, isError } from '@lib/core';
import { RepositoryService } from '@lib/repository';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { ConfigServiceMock } from '../../../__mocks__/ConfigServiceMock';
import { getRepositoryServiceMock } from '../../../__mocks__/RepositoryServiceMock';
import { getUserStub } from '../../../__mocks__/stubs/user.stub';
import { ConfigModel } from '../../../config/config.model';
import { UserAlreadyExists } from '../../user/common/user.errors';
import { UserService } from '../../user/user.service';
import { AuthService } from '../auth.service';
import {
    CannotFindEmailConfirm,
    EmailAlreadyConfirmed,
    EmailNotConfirmed,
    EmailOrPasswordIncorrect,
} from '../common/auth.errors';
import { GetTokenResult } from '../common/auth.model';

describe('AuthService', () => {
    let rep: ReturnType<typeof getRepositoryServiceMock>;
    let user: ReturnType<typeof getUserStub>;
    let authService: AuthService;
    let configService: CoreConfigService<ConfigModel>;
    let userService: DeepMocked<UserService>;
    let jwt: JwtService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                AuthService,
                JwtService,
                { provide: CoreConfigService, useClass: ConfigServiceMock },
                {
                    provide: RepositoryService,
                    useValue: getRepositoryServiceMock(),
                },
                {
                    provide: UserService,
                    useValue: createMock<UserService>(),
                },
            ],
        }).compile();

        authService = module.get(AuthService);
        configService = module.get(CoreConfigService);
        rep = module.get(RepositoryService);
        userService = module.get(UserService);
        jwt = module.get(JwtService);

        user = getUserStub();
    });

    it('should be defined service and all deps', () => {
        expect(authService).toBeDefined();
        expect(configService).toBeDefined();
        expect(rep).toBeDefined();
        expect(userService).toBeDefined();
        expect(user).toBeDefined();
    });

    describe('signUp', () => {
        it('should correct sign-up', async () => {
            userService.createUser.mockResolvedValue(user);

            // TODO test sendConfirmEmail

            const createResult = await authService.signUp({
                email: user.email,
                password: 'password',
            });

            expect(isError(createResult)).toBeFalsy();
            expect(createResult).toEqual(undefined);
        });

        it('should return error if user already exist', async () => {
            userService.createUser.mockResolvedValue(new UserAlreadyExists(user.email));

            const createResult = await authService.signUp({
                email: user.email,
                password: 'password',
            });

            expect(isError(createResult)).toBeTruthy();
            expect(createResult).toBeInstanceOf(UserAlreadyExists);
        });
    });

    describe('sendConfirmEmail', () => {
        it('should return error if user email is already confirmed', async () => {
            const confirmResult = await authService.sendConfirmEmail({ ...user, emailConfirmed: true });

            expect(isError(confirmResult)).toBeTruthy();
            expect(confirmResult).toBeInstanceOf(EmailAlreadyConfirmed);
        });
    });

    describe('signIn', () => {
        it('should success sign-in with correct login and password', async () => {
            rep.user.findOne.mockResolvedValue({ ...user, id: 99, emailConfirmed: true });

            const signInResult = await authService.signIn({
                email: user.email,
                password: 'password',
            });

            expect(isError(signInResult)).toBeFalsy();
            expect(rep.user.save).toHaveBeenCalledTimes(1);
            expect(rep.user.save).toHaveBeenCalledWith({ id: 99, refreshTokenHash: expect.any(String) });
            expect(jwt.decode((signInResult as GetTokenResult).token)).toEqual({
                id: 99,
                date: expect.any(Number),
                exp: expect.any(Number),
                iat: expect.any(Number),
            });
        });

        it('should return error with incorrect login or password', async () => {
            rep.user.findOne.mockResolvedValue(null);

            const signInResult = await authService.signIn({
                email: '',
                password: '',
            });

            expect(isError(signInResult)).toBeTruthy();
            expect(signInResult).toBeInstanceOf(EmailOrPasswordIncorrect);
        });

        it('should return error if email not confirmed', async () => {
            rep.user.findOne.mockResolvedValue({ ...user, emailConfirmed: false });

            const signInResult = await authService.signIn({
                email: user.email,
                password: 'password',
            });

            expect(isError(signInResult)).toBeTruthy();
            expect(signInResult).toBeInstanceOf(EmailNotConfirmed);
        });
    });

    describe('confirmEmail', () => {
        it('should confirm email', async () => {
            rep.user.findOne.mockResolvedValue({ ...user, id: 77, emailConfirmed: false });

            const confirmResult = await authService.confirmEmail('token');

            expect(rep.user.findOne).toHaveBeenCalledWith({
                where: { emailConfirmed: false, emailConfirmToken: 'token' },
            });
            expect(isError(confirmResult)).toBeFalsy();
            expect(rep.user.save).toHaveBeenCalledTimes(1);
            expect(rep.user.save).toHaveBeenCalledWith({
                ...user,
                id: 77,
                emailConfirmed: true,
                refreshTokenHash: expect.any(String),
            });
            expect(jwt.decode((confirmResult as GetTokenResult).token)).toEqual({
                id: 77,
                date: expect.any(Number),
                exp: expect.any(Number),
                iat: expect.any(Number),
            });
        });

        it('should return error if email already confirmed', async () => {
            rep.user.findOne.mockResolvedValue(null);

            const confirmResult = await authService.confirmEmail('token');

            expect(isError(confirmResult)).toBeTruthy();
            expect(confirmResult).toBeInstanceOf(CannotFindEmailConfirm);
        });
    });

    describe('sign-out', () => {
        it('should delete refresh token from user on signOut', async () => {
            rep.user.findOne.mockResolvedValue(user);

            await authService.signOut(user.id);

            expect(rep.user.save).toHaveBeenCalledTimes(1);
            expect(rep.user.save).toHaveBeenCalledWith({ ...user, refreshTokenHash: null });
        });
    });
});
