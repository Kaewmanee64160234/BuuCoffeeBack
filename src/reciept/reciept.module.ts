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
import { User } from 'src/users/entities/user.entity';
import { Customer } from 'src/customers/entities/customer.entity';
import { Ingredient } from 'src/ingredients/entities/ingredient.entity';
import { ReceiptPromotion } from 'src/receipt-promotions/entities/receipt-promotion.entity';
import { Importingredient } from 'src/importingredients/entities/importingredient.entity';
import { Recipe } from 'src/recipes/entities/recipe.entity';
import { Checkingredient } from 'src/checkingredients/entities/checkingredient.entity';
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
      User,
      Customer,
      Ingredient,
      Recipe,
      ReceiptPromotion,
      Importingredient,
      Checkingredient,
    ]),
    UsersModule,
  ],
  controllers: [RecieptController],
  providers: [RecieptService],
})
export class RecieptModule {}
