// permissions.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermission = this.reflector.get<string>(
      'permission',
      context.getHandler(),
    );
    if (!requiredPermission) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Check if user's role or groups have the required permission
    return (
      user.role.permissions.some(
        (permission) => permission.name === requiredPermission,
      ) ||
      user.groupMemberships.some((groupMember) =>
        groupMember.group.permissions.some(
          (permission) => permission.name === requiredPermission,
        ),
      )
    );
  }
}
