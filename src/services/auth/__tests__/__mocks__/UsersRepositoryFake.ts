export class UsersRepositoryFake {
    public findOne = jest.fn();

    public findOneRelations = jest.fn();

    public updateOne = jest.fn();

    public create = jest.fn();

    public insert = jest.fn();

    get nativeRepository() {
        return this;
    }
}
