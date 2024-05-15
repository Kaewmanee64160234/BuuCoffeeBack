import { IsNotEmpty, Length, IsPhoneNumber } from 'class-validator';
import { CreateReceiptItemDto } from 'src/receipt-item/dto/create-receipt-item.dto';
import { ReceiptItem } from 'src/receipt-item/entities/receipt-item.entity';
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
  receiptItems: CreateReceiptItemDto[];
}
