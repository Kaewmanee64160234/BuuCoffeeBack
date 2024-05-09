import { Module } from '@nestjs/common';
import { ProductTypeToppingsService } from './product-type-toppings.service';
import { ProductTypeToppingsController } from './product-type-toppings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductTypeTopping } from './entities/product-type-topping.entity';
import { Topping } from 'src/toppings/entities/topping.entity';
import { ProductType } from 'src/product-types/entities/product-type.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductTypeTopping, Topping, ProductType]),
  ],
  controllers: [ProductTypeToppingsController],
  providers: [ProductTypeToppingsService],
})
export class ProductTypeToppingsModule {}
