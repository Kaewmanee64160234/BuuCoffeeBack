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

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'buucoffee',
      entities: [Category, Product, ProductType, Topping],
      synchronize: true,
    }),
    CategoriesModule,
    ProductsModule,
    ProductTypesModule,
    ToppingsModule,
    ProductTypeToppingsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
