// permissions.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.get<string[]>(
      'permissions',
      context.getHandler(),
    );

    if (!requiredPermissions) {
      return true; // Allow access if no permissions are required
    }

    const { user } = context.switchToHttp().getRequest();

    const hasPermission = requiredPermissions.every((permission) =>
      user.role.permissions.some((p) => p.name === permission),
    );

    if (!hasPermission) {
      throw new UnauthorizedException('Access denied, missing permissions');
    }

    return hasPermission;
  }
}
