import { IsNotEmpty, Length, IsPhoneNumber } from 'class-validator';
import { CreateCustomerDto } from 'src/customers/dto/create-customer.dto';
import { Customer } from 'src/customers/entities/customer.entity';
import { CreateReceiptItemDto } from 'src/receipt-item/dto/create-receipt-item.dto';
import { ReceiptItem } from 'src/receipt-item/entities/receipt-item.entity';
import { ReceiptPromotion } from 'src/receipt-promotions/entities/receipt-promotion.entity';
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
  receiptPromotions: ReceiptPromotion[];

  @IsNotEmpty()
  userId: number;
  @IsNotEmpty()
  customer: Customer;

  @IsNotEmpty()
  paymentMethod: string;
  @IsNotEmpty()
  queueNumber: number;
}
