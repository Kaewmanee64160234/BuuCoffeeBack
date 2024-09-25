import {
  Injectable,
  CanActivate,
  ExecutionContext,
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

    // If no specific permissions are required, allow access
    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    console.log('Request:', request);

    const user = request.user; // Extract the user from the request (JWT should be decoded)

    console.log('User info from request:', user);

    // Check if the user has the required permissions
    const hasPermission = requiredPermissions.every((permission) =>
      user.role.permissions.some((p) => p.name === permission),
    );

    if (!hasPermission) {
      throw new UnauthorizedException('Access denied, missing permissions');
    }

    return hasPermission;
  }
}
