import { plainToClass, Type } from 'class-transformer';
import { IsNotEmptyObject, validate, ValidateNested } from 'class-validator';
import { UserJson } from '../../../models/user.model';
import { getSpec } from '../../../pactum';
import { IsTrue } from '../../../utils/validation.utils';

export const me = getSpec.api<string, UserJson>('user/me', (spec) => async (token) => {
    const response = await spec.withHeaders('Authorization', `Bearer ${token}`).toss();

    const body = plainToClass(MeResponse, response.json);
    const errors = await validate(body);
    expect(errors.length).toEqual(0);
    expect(body.success).toEqual(true);

    return body.data;
});

class MeResponse {
    @IsTrue()
    success: true;

    @IsNotEmptyObject()
    @ValidateNested()
    @Type(() => UserJson)
    data: UserJson;
}
