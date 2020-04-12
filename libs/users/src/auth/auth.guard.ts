import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { AuthService } from './services/auth.service';
import { User } from '../users.model';
import { Request } from 'express';
import { Role } from '@utils/decorators';
import { ConfigService } from '@backend/config';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly auth: AuthService,
    private readonly config: ConfigService
  ) {}

  public canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Set user in req if possible
    const req: Request & {
      user: User;
    } = context.switchToHttp().getRequest();

    const auth = req.headers.authorization;
    const isLoggedIn = this.reflector.get('isLoggedIn', context.getHandler());
    const roles = this.reflector.get<Role[]>('roles', context.getHandler());

    if (roles?.includes('admin')) {
      return auth === this.config.adminApiToken;
    }

    const accessToken =
      auth?.indexOf('Bearer ') === 0
        ? auth.split('Bearer ')[1]
        : req?.cookies?.accessTokenKey;

    if (accessToken) {
      const token = this.auth.validateAccessToken(accessToken);
      if (token !== false) {
        req.user = new User(token.user);
      }
    }

    if ((isLoggedIn || (roles && roles.length)) && !req.user) {
      return false;
    }

    if (
      (!roles?.length || !roles.includes('anonymous')) &&
      req.user?.isAnonymous
    ) {
      return false;
    }

    return true;
  }
}
