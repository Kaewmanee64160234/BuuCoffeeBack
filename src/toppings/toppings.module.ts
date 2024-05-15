import { Module } from '@nestjs/common';
import { ToppingsService } from './toppings.service';
import { ToppingsController } from './toppings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Topping } from './entities/topping.entity';
import { Reciept } from 'src/reciept/entities/reciept.entity';
import { ProductType } from 'src/product-types/entities/product-type.entity';
import { Product } from 'src/products/entities/product.entity';
import { ReceiptItem } from 'src/receipt-item/entities/receipt-item.entity';
import { ProductTypeTopping } from 'src/product-type-toppings/entities/product-type-topping.entity';
import { Category } from 'src/categories/entities/category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Reciept,
      ProductType,
      Product,
      ReceiptItem,
      ProductTypeTopping,
      Topping,
      Category,
    ]),
  ],
  controllers: [ToppingsController],
  providers: [ToppingsService],
})
export class ToppingsModule {}
