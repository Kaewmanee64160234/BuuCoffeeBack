import { IsNumber, IsDate, IsNotEmpty, IsPositive } from 'class-validator';

export class CreateCashierDto {
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  cashierAmount: number;

  @IsNumber()
  @IsNotEmpty()
  userId: number;
}
