import { IsNotEmpty, Length, IsNumber } from 'class-validator';
import { CreateProductTypeToppingDto } from 'src/product-type-toppings/dto/create-product-type-topping.dto';
import { ProductTypeTopping } from 'src/product-type-toppings/entities/product-type-topping.entity';
import { Product } from 'src/products/entities/product.entity';
export class CreateReceiptItemDto {
  @IsNotEmpty()
  receiptSubTotal: number;

  @IsNotEmpty()
  quantity: number;

  product: Product;

  receiptItemId: number;

  productTypeToppings: CreateProductTypeToppingDto[];
  sweetnessLevel: string;
}
