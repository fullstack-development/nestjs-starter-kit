export class UserServiceFake {
    createUser = jest.fn();
    findVerifiedUser = jest.fn();
    confirmEmail = jest.fn();
    findUser = jest.fn();
}
