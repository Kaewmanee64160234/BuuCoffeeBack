import { IsNotEmpty, Length, Matches, IsEmail } from 'class-validator';
import { CreateRecieptDto } from 'src/reciept/dto/create-reciept.dto';
import { Role } from 'src/role/entities/role.entity';
export class CreateUserDto {
  @IsNotEmpty()
  userId: number;

  @IsNotEmpty()
  @Length(3, 64)
  userName: string;

  @IsNotEmpty()
  @Length(6, 64)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  )
  userPassword: string;

  @IsNotEmpty()
  userRole: string;

  @IsNotEmpty()
  @Length(3, 64)
  @IsEmail()
  userEmail: string;

  @IsNotEmpty()
  @Length(3, 64)
  userStatus: string;

  @IsNotEmpty()
  reciept: CreateRecieptDto[];

  role: Role;
}
