import { UserEntity } from '@lib/repository/entities/user.entity';
import { pick } from 'ramda';

export const meToBody = (user: UserEntity) => pick(['id', 'email', 'createdAt', 'emailConfirmed'], user);
