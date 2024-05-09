import { Module } from '@nestjs/common';
import { ProductTypeToppingsService } from './product-type-toppings.service';
import { ProductTypeToppingsController } from './product-type-toppings.controller';

@Module({
  controllers: [ProductTypeToppingsController],
  providers: [ProductTypeToppingsService]
})
export class ProductTypeToppingsModule {}
