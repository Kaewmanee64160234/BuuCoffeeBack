import { Module } from '@nestjs/common';
import { ProductTypeToppingsService } from './product-type-toppings.service';
import { ProductTypeToppingsController } from './product-type-toppings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductTypeTopping } from './entities/product-type-topping.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductTypeTopping])],
  controllers: [ProductTypeToppingsController],
  providers: [ProductTypeToppingsService],
})
export class ProductTypeToppingsModule {}
