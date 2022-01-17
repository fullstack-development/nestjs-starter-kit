import { CannotFindUser } from './../../../repositories/users/user.model';
import { UserPayload } from './../../auth/auth.model';
import { getUserStub } from './__mocks__/user.stub';
import { Test } from '@nestjs/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { UserEntity } from '../../../repositories/users/user.entity';
import { UserServiceProvider } from './../user.service';
import { BasicError, isError } from '../../../core/errors.core';
import { UsersRepositoryProvider } from '../../../repositories/users/users.repository';

describe('UserService', () => {
    let userService: UserServiceProvider;
    let usersRepository: DeepMocked<UsersRepositoryProvider>;
    let user: UserEntity;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                UserServiceProvider,
                {
                    provide: UsersRepositoryProvider,
                    useValue: createMock<UsersRepositoryProvider>(),
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
        it('should success create', async () => {
            usersRepository.findOne
                .mockResolvedValueOnce(new BasicError('cannotFindUser'))
                .mockResolvedValueOnce(user);
            usersRepository.create.mockResolvedValue(user.id);
            const createPayload: UserPayload = { email: user.email, password: 'test password' };

            const userResult = await userService.createUser(createPayload);

            expect(isError(userResult)).toBeFalsy();
        });

        it('should return userAlreadyExist error', async () => {
            usersRepository.findOne.mockResolvedValueOnce(user);
            const createPayload: UserPayload = { email: user.email, password: 'test password' };

            const userResult = await userService.createUser(createPayload);

            expect(isError(userResult)).toBeTruthy();
            expect(userResult).toEqual(expect.objectContaining({ error: 'userAlreadyExist' }));
        });

        it('should return cannotCreateUser error', async () => {
            usersRepository.findOne.mockResolvedValue(new BasicError('cannotFindUser'));
            const createPayload: UserPayload = { email: user.email, password: 'test password' };

            const userResult = await userService.createUser(createPayload);

            expect(isError(userResult)).toBeTruthy();
            expect(userResult).toEqual(expect.objectContaining({ error: 'cannotCreateUser' }));
        });
    });

    describe('find verified user', () => {
        it('should success return user by correct email and password', async () => {
            usersRepository.findOne.mockResolvedValue({
                ...user,
                hash: 'ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f',
            });

            const result = await userService.findVerifiedUser({
                email: 'test@axample.com',
                password: '12345678',
            });

            expect(isError(result)).toBeFalsy();
        });

        it('should return error by incorrect email', async () => {
            usersRepository.findOne.mockResolvedValue(new CannotFindUser());

            const result = await userService.findVerifiedUser({
                email: 'test@axample.com',
                password: '12345678',
            });

            expect(isError(result)).toBeTruthy();
        });

        it('should return error by incorrect password', async () => {
            usersRepository.findOne.mockResolvedValue({
                ...user,
                hash: 'ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f',
            });

            const result = await userService.findVerifiedUser({
                email: 'test@axample.com',
                password: '1234567',
            });

            expect(isError(result)).toBeTruthy();
        });
    });

    describe('confirm email', () => {
        it('should success confirm email', async () => {
            usersRepository.findOne.mockResolvedValue(user);
            usersRepository.updateOne.mockResolvedValue(undefined);

            const confirmResult = await userService.confirmEmail({ id: user.id });

            expect(isError(confirmResult)).toBeFalsy();
        });

        it('should return error if user not found', async () => {
            usersRepository.findOne.mockResolvedValue(new BasicError('cannotFindUser'));
            const confirmResult = await userService.confirmEmail({ id: user.id });

            expect(isError(confirmResult)).toBeTruthy();
            expect(confirmResult).toEqual(expect.objectContaining({ error: 'cannotFindUser' }));
        });

        it('should return error if user not updated', async () => {
            usersRepository.findOne.mockResolvedValue(user);
            usersRepository.updateOne.mockResolvedValue(new BasicError('cannotUpdateUser'));
            const confirmResult = await userService.confirmEmail({ id: user.id });

            expect(isError(confirmResult)).toBeTruthy();
            expect(confirmResult).toEqual(expect.objectContaining({ error: 'cannotUpdateUser' }));
        });
    });

    describe('find user', () => {
        it('should return user', async () => {
            usersRepository.findOne.mockResolvedValue(user);
            const userResult = await userService.findUser({ id: user.id });

            expect(isError(userResult)).toBeFalsy();
        });

        it('should return error', async () => {
            usersRepository.findOne.mockResolvedValue(new BasicError('cannotFindUser'));
            const userResult = await userService.findUser({ id: user.id });

            expect(isError(userResult)).toBeTruthy();
            expect(userResult).toEqual(expect.objectContaining({ error: 'cannotFindUser' }));
        });
    });
});
