import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtUserRefreshGuard extends AuthGuard('jwt-user-refresh') {}
