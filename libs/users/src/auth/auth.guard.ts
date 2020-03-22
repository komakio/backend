import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { AuthService } from './services/auth.service';
import { User } from '../users.model';
import { Request } from 'express';
import { Role } from 'utils/decorators';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly auth: AuthService
  ) {}

  public canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Set user in req if possible
    const req: Request & {
      user: User;
    } = context.switchToHttp().getRequest();

    const auth = req.headers.authorization;

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

    const isLoggedIn = this.reflector.get('isLoggedIn', context.getHandler());
    const roles = this.reflector.get<Role[]>('roles', context.getHandler());

    if ((isLoggedIn || (roles && roles.length)) && !req.user) {
      return false;
    }

    if (roles && roles.includes('admin') && !req.user.isAdmin) {
      return false;
    }

    return true;
  }
}
