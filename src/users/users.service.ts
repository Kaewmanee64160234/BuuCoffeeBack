import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Like, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Role } from 'src/role/entities/role.entity';

let userId = 0;
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Role) private rolesRepository: Repository<Role>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const newUser = new User();
      const role = await this.rolesRepository.findOne({
        where: { id: createUserDto.role.id },
      });
      if (!role) {
        throw new NotFoundException('Role not found');
      }

      newUser.userId = userId++;
      newUser.userName = createUserDto.userName;
      newUser.userRole = createUserDto.userRole;
      newUser.userEmail = createUserDto.userEmail;
      newUser.userStatus = createUserDto.userStatus;
      newUser.role = role;
      // Hash the password before saving the user
      const salt = await bcrypt.genSalt();
      newUser.userPassword = await bcrypt.hash(
        createUserDto.userPassword,
        salt,
      );

      return this.usersRepository.save(newUser);
    } catch (error) {
      throw new HttpException('Failed to create user', HttpStatus.BAD_REQUEST);
    }
  }

  findAll() {
    try {
      return this.usersRepository.find({
        relations: ['role', 'role.permissions'],
      });
    } catch (error) {
      throw new HttpException('Failed to fetch users', HttpStatus.BAD_REQUEST);
    }
  }

  async findOne(id: number) {
    try {
      const user = this.usersRepository.findOne({
        where: { userId: id },
        relations: [
          'role',
          'role.permissions',
          'groupMemberships',
          'groupMemberships.group',
          'groupMemberships.group.permissions',
        ],
      });
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      return user;
    } catch (error) {
      throw new HttpException('Failed to fetch user', HttpStatus.BAD_REQUEST);
    }
  }
  async findOneByEmail(email: string): Promise<User> {
    try {
      console.log(email);

      const user = await this.usersRepository.findOne({
        where: { userEmail: email },
        relations: [
          'role',
          'role.permissions',
          'groupMemberships',
          'groupMemberships.group',
          'groupMemberships.group.permissions',
        ],
      });

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      console.log(user);

      return user;
    } catch (error) {
      console.error('Error finding user by email:', email, error);
      throw new InternalServerErrorException('Error finding user by email');
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.usersRepository.findOne({
        where: { userId: id },
      });
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      await this.usersRepository.update(id, updateUserDto);
      console.log(this.usersRepository.findOne({ where: { userId: id } }));
      return this.usersRepository.findOne({ where: { userId: id } }); // Return updated user
    } catch (error) {
      console.log(error);
      throw new HttpException('Failed to update user', HttpStatus.BAD_REQUEST);
    }
  }
  async assignRoleToUser(userId: number, roleId: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { userId: userId },
      relations: ['roles'],
    });
    const role = await this.rolesRepository.findOne({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    user.role = role;
    return this.usersRepository.save(user);
  }

  async getUserWithRoles(userId: number): Promise<User> {
    return this.usersRepository.findOne({
      where: { userId: userId },
      relations: ['roles', 'roles.permissions'],
    });
  }

  remove(id: number) {
    try {
      const user = this.usersRepository.findOne({
        where: { userId: id },
      });
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      return this.usersRepository.delete(id);
    } catch (error) {
      throw new HttpException('Failed to update user', HttpStatus.BAD_REQUEST);
    }
  }

  findUserByName(name: string) {
    try {
      const user = this.usersRepository.findOne({
        where: { userName: name },
        relations: ['user'],
        order: { userName: 'ASC' },
      });
      return user;
    } catch (e) {
      console.log(e);
    }
  }

  async confirmWithPassword(createUserDto: CreateUserDto) {
    const user = await this.usersRepository.findOne({
      where: { userPassword: createUserDto.userPassword },
    });
    const isMatch = await bcrypt.compare(
      createUserDto.userPassword,
      user.userPassword,
    );
    if (isMatch) {
      return {
        status: true,
      };
    } else {
      throw new NotFoundException('Your password is not matches');
    }
  }
  // user.service.ts
  async findOneWithPermissions(userId: number): Promise<User> {
    return this.usersRepository.findOne({
      where: { userId: userId },
      relations: ['roles', 'roles.permissions'],
    });
  }

  async getUsers(
    page: number,
    limit: number,
    search: string,
  ): Promise<{ data: User[]; total: number }> {
    const whereCondition = search ? { userName: Like(`%${search}%`) } : {};

    const [data, total] = await this.usersRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      where: whereCondition,
      relations: ['users'],
    });

    return { data, total };
  }
  async findByIdWithRelations(userId: number): Promise<User> {
    return this.usersRepository.findOne({
      where: { userId: userId },
      relations: [
        'role',
        'role.permissions',
        'groupMemberships',
        'groupMemberships.group',
        'groupMemberships.group.permissions',
      ],
    });
  }
}
