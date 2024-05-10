import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateToppingDto {
  @IsNotEmpty()
  @IsString()
  toppingName: string;

  @IsNotEmpty()
  @IsNumber()
  toppingPrice: number;
}
