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

let userId = 0;
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const newUser = new User();
      newUser.userId = userId++;
      newUser.userName = createUserDto.userName;
      newUser.userRole = createUserDto.userRole;
      newUser.userEmail = createUserDto.userEmail;
      newUser.userStatus = createUserDto.userStatus;
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
      return this.usersRepository.find();
    } catch (error) {
      throw new HttpException('Failed to fetch users', HttpStatus.BAD_REQUEST);
    }
  }

  async findOne(id: number) {
    try {
      const user = this.usersRepository.findOne({
        where: { userId: id },
      });
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      return user;
    } catch (error) {
      throw new HttpException('Failed to fetch user', HttpStatus.BAD_REQUEST);
    }
  }
  async findOneByEmail(email: string): Promise<User | undefined> {
    try {
      const user = await this.usersRepository.findOne({
        where: { userEmail: email },
      });
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
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
}
