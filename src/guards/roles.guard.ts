// permissions.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GroupPermission } from 'src/groups/entities/group.entity';
import { Permission } from 'src/permission/entities/permission.entity';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.get<string>(
      'permission',
      context.getHandler(),
    );
    console.log('requiredPermission', requiredPermission);

    if (!requiredPermission) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Check for the permission in the user's role and groups
    const hasPermission = user.user.groups?.some((group: GroupPermission) =>
      group.permissions.some(
        (permission: Permission) => permission.name === requiredPermission,
      ),
    );

    console.log('hasPermission', hasPermission);

    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have permission to access this resource.',
      );
    }

    return true;
  }
}
