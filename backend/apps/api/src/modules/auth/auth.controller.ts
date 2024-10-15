import { ContextUser, UseValidationPipe, User, makeResponse } from '@lib/core';
import { Transactional } from '@nestjs-cls/transactional';
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { identity } from 'ramda';
import { AuthService } from './auth.service';
import { ConfirmEmailBody, SignInBody, SignUpBody } from './common/auth.dto';
import {
    confirmEmailToBody,
    confirmEmailToCookie,
    refreshToBody,
    refreshToCookie,
    signInToBody,
    signInToCookie,
} from './common/auth.model';
import { JwtUserRefreshGuard } from './guards/jwt-user-refresh.guard';
import { JwtUserGuard } from './guards/jwt-user.guard';

@Controller('/api/auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('/sign-up')
    @UseValidationPipe()
    @Transactional()
    async signUp(@Body() body: SignUpBody) {
        return makeResponse(await this.authService.signUp(body), identity);
    }

    @Post('/sign-in')
    @UseValidationPipe()
    @Transactional()
    async signIn(@Body() body: SignInBody) {
        return makeResponse(await this.authService.signIn(body), signInToBody, signInToCookie);
    }

    @Post('/sign-out')
    @UseValidationPipe()
    @UseGuards(JwtUserGuard)
    @Transactional()
    async signOut(@User() user: ContextUser) {
        return makeResponse(await this.authService.signOut(user.id), identity);
    }

    @Post('/confirm-email')
    @UseValidationPipe()
    @Transactional()
    async confirmEmail(@Body() body: ConfirmEmailBody) {
        return makeResponse(await this.authService.confirmEmail(body.token), confirmEmailToBody, confirmEmailToCookie);
    }

    @Get('/refresh')
    @UseValidationPipe()
    @UseGuards(JwtUserRefreshGuard)
    @Transactional()
    async refresh(@User() user: ContextUser) {
        return makeResponse(await this.authService.refresh(user.id), refreshToBody, refreshToCookie);
    }
}
