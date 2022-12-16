import { mockRepository, MockRepository } from './../../../utils/tests.utils';
import { Test } from '@nestjs/testing';
import { User } from '@prisma/client';
import { UserPayload } from './../../auth/auth.model';
import { UserServiceProvider } from './../user.service';
import { isError } from '../../../core/errors.core';
import { UsersRepositoryProvider } from '../../../repositories/users/users.repository';
import { getUserStub } from '../../../__mocks__/user.stub';
import { EmailOrPasswordIncorrect, UserAlreadyExist } from '../user.model';
import { CannotFindUser } from '../../../repositories/repositoryErrors.model';

describe('UserService', () => {
    let userService: UserServiceProvider;

    let usersRepository: MockRepository<UsersRepositoryProvider>;
    let user: User;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                UserServiceProvider,
                {
                    provide: UsersRepositoryProvider,
                    useValue: mockRepository<UsersRepositoryProvider>(),
                },
            ],
        }).compile();

        userService = module.get(UserServiceProvider);
        usersRepository = module.get(UsersRepositoryProvider);
        user = getUserStub();
    });

    it('should be defined service and repository', () => {
        expect(userService).toBeDefined();
        expect(usersRepository).toBeDefined();
    });

    describe('create user', () => {
        it('should return userAlreadyExist error', async () => {
            usersRepository.Dao.findFirst.mockResolvedValueOnce(user);
            const createPayload: UserPayload = { email: user.email, password: 'test password' };

            const userResult = await userService.createUser(createPayload);

            expect(isError(userResult)).toBeTruthy();
            expect(userResult).toBeInstanceOf(UserAlreadyExist);
        });

        it('should return created user', async () => {
            usersRepository.Dao.findFirst.mockResolvedValueOnce(null);
            usersRepository.Dao.create.mockResolvedValueOnce(user);
            const createPayload: UserPayload = { email: user.email, password: 'test password' };

            const userResult = await userService.createUser(createPayload);

            expect(isError(userResult)).toBeFalsy();
            expect(userResult).toEqual(user);
        });
    });

    describe('findVerifiedUser', () => {
        describe('should return EmailOrPasswordIncorrect error', () => {
            it('on user is null', async () => {
                usersRepository.Dao.findFirst.mockResolvedValueOnce(null);

                const result = await userService.findVerifiedUser({
                    email: 'test@axample.com',
                    password: 'password',
                });

                expect(isError(result)).toBeTruthy();
                expect(result).toBeInstanceOf(EmailOrPasswordIncorrect);
            });

            it('on hash not valid', async () => {
                usersRepository.Dao.findFirst.mockResolvedValueOnce(user);

                const result = await userService.findVerifiedUser({
                    email: 'test@axample.com',
                    password: '12345678',
                });

                expect(isError(result)).toBeTruthy();
                expect(result).toBeInstanceOf(EmailOrPasswordIncorrect);
            });
        });

        it('should return user on success', async () => {
            usersRepository.Dao.findFirst.mockResolvedValueOnce(user);

            const result = await userService.findVerifiedUser({
                email: 'test@axample.com',
                password: 'password',
            });

            expect(isError(result)).toBeFalsy();
            expect(result).toEqual(user);
        });
    });

    describe('confirmEmail', () => {
        it('should return CannotFindUser error', async () => {
            usersRepository.Dao.findFirst.mockResolvedValueOnce(null);

            const result = await userService.confirmEmail({ id: user.id });

            expect(isError(result)).toBeTruthy();
            expect(result).toBeInstanceOf(CannotFindUser);
        });

        it('should undefined true on success', async () => {
            usersRepository.Dao.findFirst.mockResolvedValueOnce(user);
            usersRepository.Dao.update.mockResolvedValueOnce({ ...user, emailConfirmed: true });

            const result = await userService.confirmEmail({ id: user.id });

            expect(isError(result)).toBeFalsy();
            expect(result).toEqual(undefined);
        });
    });

    describe('findUser', () => {
        it('should return CannotFindUser error', async () => {
            usersRepository.Dao.findFirst.mockResolvedValueOnce(null);

            const result = await userService.findUser({ id: user.id });

            expect(isError(result)).toBeTruthy();
            expect(result).toBeInstanceOf(CannotFindUser);
        });

        it('should return user on success', async () => {
            usersRepository.Dao.findFirst.mockResolvedValueOnce(user);

            const result = await userService.findUser({ id: user.id });

            expect(isError(result)).toBeFalsy();
            expect(result).toEqual(user);
        });
    });
});
