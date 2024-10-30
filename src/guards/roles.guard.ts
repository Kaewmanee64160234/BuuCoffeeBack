// permissions.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GroupMember } from 'src/group-members/entities/group-member.entity';
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

    // If no specific permission is required, allow access
    if (!requiredPermission) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    console.log('user', user); // Ensure user object has groupMemberships and permissions

    // Check if the user has the required permission through their group memberships
    const hasPermission = user.user.groupMemberships.some(
      (groupMember: GroupMember) =>
        groupMember.group.permissions.some(
          (permission: Permission) => permission.name === requiredPermission,
        ),
    );
    console.log('hasPermission', hasPermission);

    // If the user lacks permission, throw a 403 Forbidden exception
    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have permission to access this resource.',
      );
    }

    return true;
  }
}
