import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesModule } from './categories/categories.module';
import { Category } from './categories/entities/category.entity';
import { ProductsModule } from './products/products.module';
import { Product } from './products/entities/product.entity';
import { ProductTypesModule } from './product-types/product-types.module';
import { ToppingsModule } from './toppings/toppings.module';
import { ProductType } from './product-types/entities/product-type.entity';
import { Topping } from './toppings/entities/topping.entity';
import { ProductTypeToppingsModule } from './product-type-toppings/product-type-toppings.module';
import { ProductTypeTopping } from './product-type-toppings/entities/product-type-topping.entity';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';
import { CustomersModule } from './customers/customers.module';
import { Customer } from './customers/entities/customer.entity';
import { RecieptModule } from './reciept/reciept.module';
import { Reciept } from './reciept/entities/reciept.entity';
import { ReceiptItemModule } from './receipt-item/receipt-item.module';
import { ReceiptItem } from './receipt-item/entities/receipt-item.entity';
import { ReceiptPromotionsModule } from './receipt-promotions/receipt-promotions.module';
import { ReceiptPromotion } from './receipt-promotions/entities/receipt-promotion.entity';
import { IngredientsModule } from './ingredients/ingredients.module';
import { Ingredient } from './ingredients/entities/ingredient.entity';
import { RecipesModule } from './recipes/recipes.module';
import { Recipe } from './recipes/entities/recipe.entity';
import { ImportingredientsModule } from './importingredients/importingredients.module';
import { ImportingredientitemsModule } from './importingredientitems/importingredientitems.module';
import { Importingredient } from './importingredients/entities/importingredient.entity';
import { Importingredientitem } from './importingredientitems/entities/importingredientitem.entity';
import { CheckingredientsModule } from './checkingredients/checkingredients.module';
import { Checkingredient } from './checkingredients/entities/checkingredient.entity';
import { CheckingredientitemsModule } from './checkingredientitems/checkingredientitems.module';
import { Checkingredientitem } from './checkingredientitems/entities/checkingredientitem.entity';
import { PromotionsModule } from './promotions/promotions.module';
import { Promotion } from './promotions/entities/promotion.entity';
import { CashiersModule } from './cashiers/cashiers.module';
import { Cashier } from './cashiers/entities/cashier.entity';
import { AuthModule } from './auth/auth.module';
import { SubInventoriesCoffeeModule } from './sub-inventories-coffee/sub-inventories-coffee.module';
import { SubInventoriesRiceModule } from './sub-inventories-rice/sub-inventories-rice.module';
import { SubInventoriesCoffee } from './sub-inventories-coffee/entities/sub-inventories-coffee.entity';
import { SubInventoriesRice } from './sub-inventories-rice/entities/sub-inventories-rice.entity';
import { IngredientusagelogModule } from './ingredientusagelog/ingredientusagelog.module';
import { IngredientUsageLog } from './ingredientusagelog/entities/ingredientusagelog.entity';
import { SubIntventoriesCateringModule } from './sub-intventories-catering/sub-intventories-catering.module';
import { SubIntventoriesCatering } from './sub-intventories-catering/entities/sub-intventories-catering.entity';
import { RoleModule } from './role/role.module';
import { PermissionModule } from './permission/permission.module';
import { Role } from './role/entities/role.entity';
import { Permission } from './permission/entities/permission.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes ConfigModule available globally
    }),

    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'buucoffee',
      entities: [
        Category,
        Product,
        ProductType,
        Topping,
        ProductTypeTopping,
        User,
        Customer,
        Reciept,
        ReceiptItem,
        ReceiptPromotion,
        Ingredient,
        Recipe,
        Importingredientitem,
        Importingredient,
        Checkingredient,
        Checkingredientitem,
        Promotion,
        Cashier,
        SubInventoriesCoffee,
        SubInventoriesRice,
        IngredientUsageLog,
        SubIntventoriesCatering,
        Role,
        Permission,
      ],
      synchronize: true,
    }),
    CategoriesModule,
    ProductsModule,
    ProductTypesModule,
    ToppingsModule,
    ProductTypeToppingsModule,
    UsersModule,
    CustomersModule,
    RecieptModule,
    ReceiptItemModule,
    ReceiptPromotionsModule,
    IngredientsModule,
    RecipesModule,
    ImportingredientsModule,
    ImportingredientitemsModule,
    CheckingredientsModule,
    CheckingredientitemsModule,
    PromotionsModule,
    CashiersModule,
    AuthModule,
    SubInventoriesCoffeeModule,
    SubInventoriesRiceModule,
    IngredientusagelogModule,
    SubIntventoriesCateringModule,
    RoleModule,
    PermissionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
