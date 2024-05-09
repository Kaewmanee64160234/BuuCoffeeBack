import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateProductTypeDto } from './dto/create-product-type.dto';
import { UpdateProductTypeDto } from './dto/update-product-type.dto';
import { ProductType } from './entities/product-type.entity';
import { Product } from 'src/products/entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ProductTypesService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(ProductType)
    private productTypeRepository: Repository<ProductType>,
  ) {}
  async create(createProductTypeDto: CreateProductTypeDto) {
    try {
      const product = await this.productRepository.findOne({
        where: { productId: createProductTypeDto.productId },
      });
      const newProductType = new ProductType();
      newProductType.productTypeName = createProductTypeDto.productTypeName;
      newProductType.product = product;
      newProductType.productTypePrice = createProductTypeDto.productTypePrice;
      return this.productTypeRepository.save(newProductType);
    } catch (error) {
      throw new HttpException(
        'Failed to create product',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  findAll() {
    try {
      return this.productTypeRepository.find();
    } catch (error) {
      throw new HttpException(
        'Failed to fetch product types',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  findOne(id: number) {
    try {
      //find if not found throw error
      const productType = this.productTypeRepository.findOne({
        where: { productTypeId: id },
      });
      if (!productType) {
        throw new HttpException('Product type not found', HttpStatus.NOT_FOUND);
      }
      return productType;
    } catch (error) {
      throw new HttpException(
        'Failed to fetch product type',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  update(id: number, updateProductTypeDto: UpdateProductTypeDto) {
    try {
      const productType = this.productTypeRepository.findOne({
        where: { productTypeId: id },
      });
      if (!productType) {
        throw new HttpException('Product type not found', HttpStatus.NOT_FOUND);
      }
      const updatedProductType = this.productTypeRepository.save({
        ...productType,
        ...updateProductTypeDto,
      });
      return updatedProductType;
    } catch (error) {
      throw new HttpException(
        'Failed to update product type',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  remove(id: number) {
    try {
      const productType = this.productTypeRepository.findOne({
        where: { productTypeId: id },
      });
      if (!productType) {
        throw new HttpException('Product type not found', HttpStatus.NOT_FOUND);
      }
      return this.productTypeRepository.delete({ productTypeId: id });
    } catch (error) {
      throw new HttpException(
        'Failed to delete product type',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
