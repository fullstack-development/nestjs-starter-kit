import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthenticationGuardUser extends AuthGuard('jwt-user') {}
