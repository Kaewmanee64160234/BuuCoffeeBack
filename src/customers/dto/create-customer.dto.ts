import { IsNotEmpty, Length, IsPhoneNumber } from 'class-validator';
export class CreateCustomerDto {
  @IsNotEmpty()
  @Length(3, 64)
  customerName: string;
  @IsNotEmpty()
  customerNumberOfStamp: number;
  @IsNotEmpty()
  @IsPhoneNumber('TH')
  customerPhone: string;
}
