import { signIn } from './endpoints/auth.controller.endpoints';
import { me } from './endpoints/user.controller.endpoints';


describe('User Controller', () => {
    describe('GET api/user/me', () => {
        it('should return 401 on invalid creds', async () => {
            me.spec().expectStatus(401).toss();
        });

        it('should success return user', async () => {
            const tokens = await signIn.send({email: 'test@example.com', password: '12345678'})
            await me.send(tokens.accessToken);
        });
    });
});
