import { IsNotEmpty, Length, Matches, IsEmail } from 'class-validator';
export class CreateUserDto {
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
}
