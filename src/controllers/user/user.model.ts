import { ApiProperty } from '@nestjs/swagger';
import { CR_200, CR_200_Fail } from '../../core/controller.core';

class User {
    @ApiProperty()
    email: string;

    @ApiProperty()
    emailConfirmed: boolean;

    @ApiProperty()
    created: Date;
}

export class CR_Me_Success extends CR_200<User> {
    @ApiProperty()
    override body: User;

    constructor(body: User) {
        super();
        this.body = body;
    }
}

export class CR_Me_CannotFindUser extends CR_200_Fail<'cannotFindUser'> {
    @ApiProperty({ type: 'cannotFindUser' })
    error: 'cannotFindUser';
}
