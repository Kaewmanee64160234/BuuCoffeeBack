import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { emit } from 'process';
import { User } from './entities/user.entity';

const users: User[] = [
  {
    id: 1,
    name: 'addmin',
    password: 'pass@123',
    role: 'rice shop employee',
    email: 'pornchitar@gmail.com',
  },
  {
    id: 2,
    name: 'user1',
    password: 'pass@123',
    role: 'coffee shop employee',
    email: 'pp@gmail.com',
  },
];
let userId = 0;
@Injectable()
export class UsersService {
  create(createUserDto: CreateUserDto) {
    const newUser = new User();
    newUser.id = userId++;
    newUser.name = createUserDto.name;
    newUser.password = createUserDto.password;
    newUser.role = createUserDto.role;
    newUser.email = createUserDto.email;
    users.push(newUser);
    return newUser;
  }

  findAll() {
    return users;
  }

  findOne(id: number) {
    const index = users.findIndex((user) => {
      return user.id === id;
    });
    if (index < 0) {
      throw new NotFoundException();
    }
    return users[index];
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    const index = users.findIndex((user) => {
      return user.id === id;
    });
    if (index < 0) {
      throw new NotFoundException();
    }
    const updateUser: User = {
      ...users[index],
      ...updateUserDto,
    };
    users[index] = updateUser;
    return users[index];
  }

  remove(id: number) {
    const index = users.findIndex((user) => {
      return user.id === id;
    });
    if (index < 0) {
      throw new NotFoundException();
    }
    const deleteUser = users[index];
    users.splice(index, 1);
    return deleteUser;
  }
}
