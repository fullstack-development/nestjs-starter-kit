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

export class CR_Me_Success<T extends User> extends CR_200<T> {
    @ApiProperty()
    override body: T;

    constructor(body: T) {
        super();
        this.body = body;
    }
}

export class CR_Me_CannotFindUser extends CR_200_Fail<'cannotFindUser'> {
    @ApiProperty({ example: 'cannotFindUser' })
    error: 'cannotFindUser';
}
