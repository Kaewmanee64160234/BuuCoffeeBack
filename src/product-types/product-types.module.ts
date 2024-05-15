import { Module } from '@nestjs/common';
import { ProductTypesService } from './product-types.service';
import { ProductTypesController } from './product-types.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductType } from './entities/product-type.entity';
import { Product } from 'src/products/entities/product.entity';
import { Reciept } from 'src/reciept/entities/reciept.entity';
import { ReceiptItem } from 'src/receipt-item/entities/receipt-item.entity';
import { ProductTypeTopping } from 'src/product-type-toppings/entities/product-type-topping.entity';
import { Topping } from 'src/toppings/entities/topping.entity';
import { Category } from 'src/categories/entities/category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductType,
      Product,
      Reciept,
      ReceiptItem,
      ProductTypeTopping,
      Topping,
      Category,
    ]),
  ],
  controllers: [ProductTypesController],
  providers: [ProductTypesService],
})
export class ProductTypesModule {}
