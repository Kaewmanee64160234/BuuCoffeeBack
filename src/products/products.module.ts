import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Category } from 'src/categories/entities/category.entity';
import { ProductType } from 'src/product-types/entities/product-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Category, ProductType])],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
