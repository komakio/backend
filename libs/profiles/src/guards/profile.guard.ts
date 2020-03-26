import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ObjectID } from 'mongodb';
import { ProfilesService } from '../profiles.service';
import { User } from '@backend/users/users.model';

@Injectable()
export class ProfilesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly profiles: ProfilesService
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request & { user: User }>();
    const { profileId } = req.body;
    const { user } = req;
    return this.profiles.isOwnProfile({
      id: new ObjectID(profileId),
      userId: new ObjectID(user._id),
    });
  }
}
