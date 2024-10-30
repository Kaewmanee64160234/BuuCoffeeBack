import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
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
    private jwtService: JwtService,
  ) {}
  async login(email: string, password: string): Promise<any> {
    try {
      const user = await this.usersService.findOneByEmail(email);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const isMatch = await bcrypt.compare(password, user.userPassword);
      if (!isMatch) {
        throw new NotFoundException('Invalid credentials');
      }

      const payload = { username: user.userEmail, sub: user.userId };
      const token = this.jwtService.sign(payload);

      console.log('Generated Token:', token); // Log the generated token

      return {
        user: user,
        access_token: token,
      };
    } catch (error) {
      console.log('Error:', error); // Log the error

      throw new InternalServerErrorException('Internal server error');
    }
  }
  async validateUser(userId: number): Promise<any> {
    // Fetch user along with group memberships and permissions
    const user = await this.usersService.findOne(userId);

    if (user) {
      return user; // user now has group memberships with permissions
    }
    return null;
  }
}
