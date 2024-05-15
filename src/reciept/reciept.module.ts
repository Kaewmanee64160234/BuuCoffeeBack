import { Module } from '@nestjs/common';
import { RecieptService } from './reciept.service';
import { RecieptController } from './reciept.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reciept } from './entities/reciept.entity';
import { ProductType } from 'src/product-types/entities/product-type.entity';
import { Product } from 'src/products/entities/product.entity';
import { ReceiptItem } from 'src/receipt-item/entities/receipt-item.entity';
import { ProductTypeTopping } from 'src/product-type-toppings/entities/product-type-topping.entity';
import { Topping } from 'src/toppings/entities/topping.entity';
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
  controllers: [RecieptController],
  providers: [RecieptService],
})
export class RecieptModule {}
