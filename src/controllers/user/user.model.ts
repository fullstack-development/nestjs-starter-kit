import { CR_200 } from '../../core/controller.core';

class User {
    email: string;
    emailConfirmed: boolean;
    created: Date;
}

export class CR_Me_Success extends CR_200<User> {
    override body: User;

    constructor(body: User) {
        super();
        this.body = body;
    }
}
