import { IsNotEmpty, Length, IsNumber } from 'class-validator';
import { CreateProductTypeToppingDto } from 'src/product-type-toppings/dto/create-product-type-topping.dto';
import { ProductTypeTopping } from 'src/product-type-toppings/entities/product-type-topping.entity';
import { ProductType } from 'src/product-types/entities/product-type.entity';
import { Product } from 'src/products/entities/product.entity';
export class CreateReceiptItemDto {
  @IsNotEmpty()
  receiptSubTotal: number;

  @IsNotEmpty()
  quantity: number;

  product: Product;
  productType: ProductType;
  receiptItemId: number;

  productTypeToppings: CreateProductTypeToppingDto[];
  sweetnessLevel: string;
}
