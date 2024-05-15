import { Module } from '@nestjs/common';
import { ProductTypeToppingsService } from './product-type-toppings.service';
import { ProductTypeToppingsController } from './product-type-toppings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductTypeTopping } from './entities/product-type-topping.entity';
import { Topping } from 'src/toppings/entities/topping.entity';
import { ProductType } from 'src/product-types/entities/product-type.entity';
import { Reciept } from 'src/reciept/entities/reciept.entity';
import { Product } from 'src/products/entities/product.entity';
import { ReceiptItem } from 'src/receipt-item/entities/receipt-item.entity';
import { Category } from 'src/categories/entities/category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductTypeTopping,
      Topping,
      ProductType,
      Reciept,
      Product,
      ReceiptItem,
      Category,
    ]),
  ],
  controllers: [ProductTypeToppingsController],
  providers: [ProductTypeToppingsService],
})
export class ProductTypeToppingsModule {}
