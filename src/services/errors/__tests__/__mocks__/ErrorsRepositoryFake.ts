export class ErrorsRepositoryFake {
    public findOne = jest.fn();

    public insert = jest.fn();

    get nativeRepository() {
        return this;
    }
}
