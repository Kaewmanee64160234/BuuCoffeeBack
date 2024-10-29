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
  async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    const permission = new Permission();
    permission.name = createPermissionDto.name;
    permission.description = createPermissionDto.description;
    return await this.permissionRepository.save(permission);
  }

  async editPermission(id: number, updatePermissionDto: UpdatePermissionDto) {
    const permission = await this.permissionRepository.findOne({
      where: { id: id },
    });
    if (!permission) {
      throw new Error('Permission not found');
    }
    permission.name = updatePermissionDto.name;
    permission.description = updatePermissionDto.description;
    return await this.permissionRepository.save(permission);
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
