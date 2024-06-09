import { createMock } from '@golevelup/ts-jest';
import { CoreConfigService } from '@lib/core';
import { RepositoryService } from '@lib/repository';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { ConfigServiceMock } from '../../../__mocks__/ConfigServiceMock';
import { getRepositoryServiceMock } from '../../../__mocks__/RepositoryServiceMock';
import { getUserStub } from '../../../__mocks__/stubs/user.stub';
import { ConfigModel } from '../../../config/config.model';
import { UserService } from '../../user/user.service';
import { AuthService } from '../auth.service';

describe('AuthService', () => {
    let rep: ReturnType<typeof getRepositoryServiceMock>;
    let user: ReturnType<typeof getUserStub>;
    let authService: AuthService;
    let configService: CoreConfigService<ConfigModel>;
    let userService: UserService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                AuthService,
                JwtService,
                { provide: CoreConfigService, useClass: ConfigServiceMock },
                {
                    provide: RepositoryService,
                    useValue: getRepositoryServiceMock(),
                },
                {
                    provide: UserService,
                    useValue: createMock<UserService>(),
                },
            ],
        }).compile();

        authService = module.get(AuthService);
        configService = module.get(CoreConfigService);
        rep = module.get(RepositoryService);
        userService = module.get(UserService);

        user = getUserStub();
    });

    it('should be defined service and all deps', () => {
        expect(authService).toBeDefined();
        expect(configService).toBeDefined();
        expect(rep).toBeDefined();
        expect(userService).toBeDefined();
        expect(user).toBeDefined();
    });
});
