import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private usersService: UsersService, // Inject UsersService here
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get required permissions from the route
    const requiredPermissions = this.reflector.get<string[]>(
      'permissions',
      context.getHandler(),
    );

    if (!requiredPermissions) {
      return true; // No specific permissions required for this route
    }

    const request = context.switchToHttp().getRequest();
    console.log('Request:', request);

    const user_ = request.user; // Extract user from the request (populated by JwtAuthGuard)

    // Fetch user from database to ensure fresh data
    const user = await this.usersService.findOneByEmail(user_.username);
    console.log('User info from request:', user.role.permissions);

    // Check if the user’s role has permissions
    if (
      !user.role ||
      !user.role.permissions ||
      user.role.permissions.length === 0
    ) {
      throw new ForbiddenException(
        'Your role does not have any permissions assigned',
      );
    }

    // Check if the user's role has at least one of the required permissions
    const hasPermission = user.role.permissions.some(
      (permission) => requiredPermissions.includes(permission.name), // Make sure to use the correct field name here
    );
    console.log('User permissions:', user);

    console.log('Required permissions:', requiredPermissions);

    console.log('Has permission:', hasPermission);

    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have the required permissions to access this route',
      );
    }

    return true; // User has the required permissions
  }
}
