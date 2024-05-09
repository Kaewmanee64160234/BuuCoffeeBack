import { Module } from '@nestjs/common';
import { ProductTypesService } from './product-types.service';
import { ProductTypesController } from './product-types.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductType } from './entities/product-type.entity';
import { Product } from 'src/products/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductType, Product])],
  controllers: [ProductTypesController],
  providers: [ProductTypesService],
})
export class ProductTypesModule {}
