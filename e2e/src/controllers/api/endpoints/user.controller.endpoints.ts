import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { UserJson } from '../../../models/user.model';
import { getSpec } from '../../../pactum';

export const me = getSpec.api<string, UserJson>('user/me', (spec) => async (token) => {
    const response = await spec.withHeaders('Authorization', `Bearer ${token}`).toss();

    const body = plainToClass(UserJson, response.json);
    const errors = await validate(body);

    expect(errors.length).toEqual(0);

    return body;
});
