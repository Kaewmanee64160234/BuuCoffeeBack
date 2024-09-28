import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Reciept } from 'src/reciept/entities/reciept.entity';
import { ProductType } from 'src/product-types/entities/product-type.entity';
import { ReceiptItem } from 'src/receipt-item/entities/receipt-item.entity';
import { Product } from 'src/products/entities/product.entity';
import { ProductTypeTopping } from 'src/product-type-toppings/entities/product-type-topping.entity';
import { Topping } from 'src/toppings/entities/topping.entity';
import { RolesGuard } from 'src/guards/roles.guard';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Category,
      Reciept,
      ProductType,
      Product,
      ReceiptItem,
      ProductTypeTopping,
      Topping,
    ]),
    UsersModule,
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService, RolesGuard],
})
export class CategoriesModule {}
