import { IsNotEmpty, IsString } from 'class-validator';

export class CreateToppingDto {
  @IsNotEmpty()
  @IsString()
  toppingName: string;

  @IsNotEmpty()
  @IsString()
  toppingPrice: number;
}
