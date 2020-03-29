import { SetMetadata, applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

export type Role = 'admin' | 'super-admin';

export function Auth(roles?: Role | Role[], desactivate = false) {
  if (desactivate) {
    return applyDecorators();
  }
  const decorators: (ClassDecorator | MethodDecorator)[] = [
    SetMetadata('isLoggedIn', []),
    ApiBearerAuth(),
    ApiResponse({
      status: 403,
      description: 'Forbidden.',
    }),
  ];
  if (roles) {
    decorators.push(
      SetMetadata('roles', Array.isArray(roles) ? roles : [roles])
    );
  }
  return applyDecorators(...decorators);
}
