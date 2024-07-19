import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private usersService: UsersService,
  ) {}
  async Login(email: string, password: string): Promise<any> {
    try {
      console.log('Finding user by email:', email);
      const user = await this.usersService.findOneByEmail(email);
      if (!user) {
        console.error('User not found:', email);
        throw new NotFoundException('User not found');
      }

      console.log('Comparing passwords');
      const isMatch = await bcrypt.compare(password, user.userPassword);
      if (!isMatch) {
        console.error('Invalid credentials for user:', email);
        console.log(password);
        console.log(user.userPassword);
        throw new NotFoundException('Invalid credentials');
      }

      const { userPassword, ...result } = user;
      console.log('Login successful for user:', email);
      return result;
    } catch (error) {
      console.error('Error in login method:', error);
      throw new InternalServerErrorException('Internal server error');
    }
  }
}
