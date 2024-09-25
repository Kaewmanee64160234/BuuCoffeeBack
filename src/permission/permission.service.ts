import { Injectable } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Permission } from './entities/permission.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}
  async create(createPermissionDto: CreatePermissionDto) {
    const permission = await this.permissionRepository.findOne({
      where: { name: createPermissionDto.name },
    });
    if (permission) {
      throw new Error(
        `Permission with name ${createPermissionDto.name} already exists`,
      );
    }
    const newPermission = this.permissionRepository.create({
      description: createPermissionDto.description,
      group: createPermissionDto.group,
      name: permission.name,
    });

    return this.permissionRepository.save(newPermission);
  }

  findAll() {
    return this.permissionRepository.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} permission`;
  }

  update(id: number, updatePermissionDto: UpdatePermissionDto) {
    return `This action updates a #${id} permission`;
  }

  remove(id: number) {
    return `This action removes a #${id} permission`;
  }
}
