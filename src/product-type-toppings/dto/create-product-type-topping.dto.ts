import { IsNotEmpty, IsNumber } from 'class-validator';
import { Topping } from 'src/toppings/entities/topping.entity';

export class CreateProductTypeToppingDto {
  @IsNotEmpty()
  @IsNumber()
  quantity: number;
  @IsNotEmpty()
  @IsNumber()
  productTypeId: number;
  @IsNotEmpty()
  @IsNumber()
  toppingId: number;
  topping: Topping;
}
