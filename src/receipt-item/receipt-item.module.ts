import { Module } from '@nestjs/common';
import { ReceiptItemService } from './receipt-item.service';
import { ReceiptItemController } from './receipt-item.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReceiptItem } from './entities/receipt-item.entity';
import { Reciept } from 'src/reciept/entities/reciept.entity';
import { ProductType } from 'src/product-types/entities/product-type.entity';
import { Product } from 'src/products/entities/product.entity';
import { ProductTypeTopping } from 'src/product-type-toppings/entities/product-type-topping.entity';
import { Topping } from 'src/toppings/entities/topping.entity';
import { Category } from 'src/categories/entities/category.entity';
import { UsersModule } from 'src/users/users.module';

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
    UsersModule,
  ],
  controllers: [ReceiptItemController],
  providers: [ReceiptItemService],
})
export class ReceiptItemModule {}
