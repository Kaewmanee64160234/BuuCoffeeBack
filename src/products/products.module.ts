import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Category } from 'src/categories/entities/category.entity';
import { ProductType } from 'src/product-types/entities/product-type.entity';
import { Reciept } from 'src/reciept/entities/reciept.entity';
import { ReceiptItem } from 'src/receipt-item/entities/receipt-item.entity';
import { ProductTypeTopping } from 'src/product-type-toppings/entities/product-type-topping.entity';
import { Topping } from 'src/toppings/entities/topping.entity';
import { Recipe } from 'src/recipes/entities/recipe.entity';
import { Ingredient } from 'src/ingredients/entities/ingredient.entity';
import { PermissionsGuard } from 'src/guards/roles.guard';
import { UsersModule } from 'src/users/users.module';
import { IngredientsService } from 'src/ingredients/ingredients.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      Category,
      Reciept,
      ProductType,
      ReceiptItem,
      ProductTypeTopping,
      Topping,
      Recipe,
      Ingredient,
    ]),
    UsersModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService, PermissionsGuard, IngredientsService],
})
export class ProductsModule {}
