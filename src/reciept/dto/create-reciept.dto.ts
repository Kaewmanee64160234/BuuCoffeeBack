import { IsNotEmpty, Length, IsPhoneNumber } from 'class-validator';
import { CreateCustomerDto } from 'src/customers/dto/create-customer.dto';
import { CreateReceiptItemDto } from 'src/receipt-item/dto/create-receipt-item.dto';
import { ReceiptItem } from 'src/receipt-item/entities/receipt-item.entity';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { User } from 'src/users/entities/user.entity';
export class CreateRecieptDto {
  @IsNotEmpty()
  receiptTotalPrice: number;

  @IsNotEmpty()
  receiptTotalDiscount: number;

  @IsNotEmpty()
  receiptNetPrice: number;

  @IsNotEmpty()
  @Length(3, 64)
  receiptStatus: string;

  @IsNotEmpty()
  receiptType: string;

  @IsNotEmpty()
  receiptItems: CreateReceiptItemDto[];

  @IsNotEmpty()
  userId: number;
  @IsNotEmpty()
  customerId: number;
  @IsNotEmpty()
  paymentMethod: string;
}
