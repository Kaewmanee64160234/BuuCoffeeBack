// role.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { Permission } from 'src/permission/entities/permission.entity';
import { CreatePermissionDto } from 'src/permission/dto/create-permission.dto';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  // Create a new role with a set of permissions
  async createRole(name: string, permissions: string[]) {
    // // Check if role already exists
    // const existingRole = await this.roleRepository.findOne({ where: { name } });
    // if (existingRole) {
    //   throw new Error(`Role with name ${name} already exists`);
    // }

    // // Find permissions by looping over each permission name
    // const permissionEntities: Permission[] = [];
    // for (const permissionName of permissions) {
    //   const permission = await this.permissionRepository.findOne({
    //     where: { name: permissionName },
    //   });
    //   if (!permission) {
    //     throw new Error(`Permission ${permissionName} not found`);
    //   }
    //   permissionEntities.push(permission); // Ensure to push each permission into the array
    // }

    // const savedRole = await this.roleRepository.save(role);

    // return this.roleRepository.findOne({
    //   where: { id: savedRole.id },
    //   relations: ['permissions'],
    // });
    return 'role';
  }

  // Assign a set of permissions to an existing role
  async assignPermissionsToRole(
    roleId: number,
    permissions: CreatePermissionDto[],
  ) {
    console.log(roleId);

    // Fetch the role along with its existing permissions
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: ['permissions'], // Fetch current permissions
    });

    if (!role) {
      throw new Error('Role not found');
    }

    // Extract permission names from CreatePermissionDto[] (assuming it has a 'name' property)
    const permissionNames = permissions.map((permission) => permission.name);

    // Find permission entities based on names
    const permissionEntities = await this.permissionRepository.findBy({
      name: In(permissionNames),
    });

    // Save the updated role with the new permissions
    return this.roleRepository.save(role);
  }

  // Get a role by its ID along with its permissions
  async getRole(roleId: number): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: ['permissions'],
    });

    if (!role) {
      throw new Error('Role not found');
    }

    return role;
  }

  // Get all roles
  async getAllRoles(): Promise<Role[]> {
    return this.roleRepository.find({ relations: ['permissions'] });
  }

  // update all roles
}
