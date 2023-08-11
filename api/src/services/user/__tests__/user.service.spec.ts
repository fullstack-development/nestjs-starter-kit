import { isError } from '@lib/core';
import { DatabaseProvider, User } from '@lib/repository';
import { DatabaseRepositoriesMock, mockDatabaseRepositories } from '@lib/testing';
import { Test } from '@nestjs/testing';
import { getUserStub } from '../../../__mocks__/user.stub';
import { CannotFindUser, EmailOrPasswordIncorrect, UserAlreadyExist } from '../user.model';
import { UserPayload } from './../../auth/auth.model';
import { UserServiceProvider } from './../user.service';

describe('UserService', () => {
    let userService: UserServiceProvider;

    let db: DatabaseRepositoriesMock;
    let user: User;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                UserServiceProvider,
                {
                    provide: DatabaseProvider,
                    useValue: mockDatabaseRepositories(),
                },
            ],
        }).compile();

        userService = module.get(UserServiceProvider);
        db = module.get(DatabaseProvider);
        user = getUserStub();
    });

    it('should be defined service and repository', () => {
        expect(userService).toBeDefined();
        expect(db).toBeDefined();
    });

    describe('create user', () => {
        it('should return userAlreadyExist error', async () => {
            db.user.findFirst.mockResolvedValueOnce(user);
            const createPayload: UserPayload = { email: user.email, password: 'test password' };

            const userResult = await userService.createUser(createPayload);

            expect(isError(userResult)).toBeTruthy();
            expect(userResult).toBeInstanceOf(UserAlreadyExist);
        });

        it('should return created user', async () => {
            db.user.findFirst.mockResolvedValueOnce(null);
            db.user.create.mockResolvedValueOnce(user);
            const createPayload: UserPayload = { email: user.email, password: 'test password' };

            const userResult = await userService.createUser(createPayload);

            expect(isError(userResult)).toBeFalsy();
            expect(userResult).toEqual(user);
        });
    });

    describe('findVerifiedUser', () => {
        describe('should return EmailOrPasswordIncorrect error', () => {
            it('on user is null', async () => {
                db.user.findFirst.mockResolvedValueOnce(null);

                const result = await userService.findVerifiedUser({
                    email: 'test@axample.com',
                    password: 'password',
                });

                expect(isError(result)).toBeTruthy();
                expect(result).toBeInstanceOf(EmailOrPasswordIncorrect);
            });

            it('on hash not valid', async () => {
                db.user.findFirst.mockResolvedValueOnce(user);

                const result = await userService.findVerifiedUser({
                    email: 'test@axample.com',
                    password: '12345678',
                });

                expect(isError(result)).toBeTruthy();
                expect(result).toBeInstanceOf(EmailOrPasswordIncorrect);
            });
        });

        it('should return user on success', async () => {
            db.user.findFirst.mockResolvedValueOnce(user);

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
            db.user.findFirst.mockResolvedValueOnce(null);

            const result = await userService.confirmEmail({ id: user.id });

            expect(isError(result)).toBeTruthy();
            expect(result).toBeInstanceOf(CannotFindUser);
        });

        it('should undefined true on success', async () => {
            db.user.findFirst.mockResolvedValueOnce(user);
            db.user.update.mockResolvedValueOnce({ ...user, emailConfirmed: true });

            const result = await userService.confirmEmail({ id: user.id });

            expect(isError(result)).toBeFalsy();
            expect(result).toEqual(undefined);
        });
    });

    describe('findUser', () => {
        it('should return CannotFindUser error', async () => {
            db.user.findFirst.mockResolvedValueOnce(null);

            const result = await userService.findUser({ id: user.id });

            expect(isError(result)).toBeTruthy();
            expect(result).toBeInstanceOf(CannotFindUser);
        });

        it('should return user on success', async () => {
            db.user.findFirst.mockResolvedValueOnce(user);

            const result = await userService.findUser({ id: user.id });

            expect(isError(result)).toBeFalsy();
            expect(result).toEqual(user);
        });
    });
});
