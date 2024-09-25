// guards/roles.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      'permissions',
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) {
      return true; // If no permissions are specified, access is granted
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    // Check if the user's role has the required permissions
    const hasPermission = requiredPermissions.every((permission) =>
      user.role.permissions.some(
        (userPermission) => userPermission.name === permission,
      ),
    );

    if (!hasPermission) {
      throw new UnauthorizedException(
        'You do not have the required permissions to access this resource',
      );
    }

    return hasPermission;
  }
}
