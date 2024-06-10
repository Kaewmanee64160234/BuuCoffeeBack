import { IsNumber, IsDate, IsNotEmpty, IsPositive } from 'class-validator';

export class CreateCashierDto {
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  cashierAmount: number;

  @IsDate()
  @IsNotEmpty()
  createdDate: Date;

  @IsNumber()
  @IsNotEmpty()
  userId: number;
}
