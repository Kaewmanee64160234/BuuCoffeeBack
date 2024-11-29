import {
  IsDecimal,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Product } from 'src/products/entities/product.entity';
import { ReceiptItem } from 'src/receipt-item/entities/receipt-item.entity';

export class CreateMealProductDto {
  @IsNotEmpty()
  mealId: number;
  @IsNotEmpty()
  productId: number;
  @IsNotEmpty()
  @IsNumber()
  quantity: number;
  @IsNotEmpty()
  product: Product;

  @IsNotEmpty()
  @IsDecimal({ decimal_digits: '0,2' })
  totalPrice: number;
  @IsNotEmpty()
  @IsString()
  type: string; // (warehouse, riceShop, coffeeShop)
  @IsOptional()
  productName?: string;
  @IsOptional()
  createdDate?: Date;
  @IsOptional()
  updatedDate?: Date;

  @IsOptional()
  receiptItems: ReceiptItem[];
  // receiptItemIds
  @IsOptional()
  receiptItemIds: number[];

  @IsOptional()
  productNames: string;

  @IsOptional()
  productPrice: number;
}
