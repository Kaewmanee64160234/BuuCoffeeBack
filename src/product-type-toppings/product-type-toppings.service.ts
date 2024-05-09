import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateProductTypeToppingDto } from './dto/create-product-type-topping.dto';
import { UpdateProductTypeToppingDto } from './dto/update-product-type-topping.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductTypeTopping } from './entities/product-type-topping.entity';
import { ProductType } from 'src/product-types/entities/product-type.entity';
import { Topping } from 'src/toppings/entities/topping.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProductTypeToppingsService {
  constructor(
    @InjectRepository(ProductType)
    private productTypeRepository: Repository<ProductType>,
    @InjectRepository(Topping)
    private toppingRepository: Repository<Topping>,
    @InjectRepository(ProductTypeTopping)
    private productTypeToppingRepository: Repository<ProductTypeTopping>,
  ) {}
  async create(createProductTypeToppingDto: CreateProductTypeToppingDto) {
    try {
      const productType = await this.productTypeRepository.findOne({
        where: { productTypeId: createProductTypeToppingDto.productTypeId },
      });
      const topping = await this.toppingRepository.findOne({
        where: { toppingId: createProductTypeToppingDto.toppingId },
      });

      if (!productType || !topping) {
        throw new HttpException(
          'Product, product type or topping not found',
          HttpStatus.NOT_FOUND,
        );
      }
      const newProductTypeTopping = new ProductTypeTopping();

      newProductTypeTopping.productType = productType;
      newProductTypeTopping.topping = topping;
      newProductTypeTopping.quantity = createProductTypeToppingDto.quantity;

      return this.productTypeToppingRepository.save(newProductTypeTopping);
    } catch (error) {
      throw new HttpException(
        'Failed to create product type topping',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  findAll() {
    try {
      return this.productTypeToppingRepository.find();
    } catch (error) {
      throw new HttpException(
        'Failed to fetch product type toppings',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findOne(id: number) {
    try {
      //find if not found throw error
      const productTypeTopping =
        await this.productTypeToppingRepository.findOne({
          where: { productTypeToppingId: id },
        });
      if (!productTypeTopping) {
        throw new HttpException(
          'Product type topping not found',
          HttpStatus.NOT_FOUND,
        );
      }
      return productTypeTopping;
    } catch (error) {
      throw new HttpException(
        'Failed to fetch product type topping',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async update(
    id: number,
    updateProductTypeToppingDto: UpdateProductTypeToppingDto,
  ) {
    try {
      const productTypeTopping =
        await this.productTypeToppingRepository.findOne({
          where: { productTypeToppingId: id },
        });
      if (!productTypeTopping) {
        throw new HttpException(
          'Product type topping not found',
          HttpStatus.NOT_FOUND,
        );
      }
      const updatedProductTypeTopping =
        await this.productTypeToppingRepository.save({
          ...productTypeTopping,
          ...updateProductTypeToppingDto,
        });
      return updatedProductTypeTopping;
    } catch (error) {
      throw new HttpException(
        'Failed to update product type topping',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async remove(id: number) {
    try {
      const productTypeTopping =
        await this.productTypeToppingRepository.findOne({
          where: { productTypeToppingId: id },
        });
      if (!productTypeTopping) {
        throw new HttpException(
          'Product type topping not found',
          HttpStatus.NOT_FOUND,
        );
      }
      return this.productTypeToppingRepository.delete({
        productTypeToppingId: id,
      });
    } catch (error) {
      throw new HttpException(
        'Failed to delete product type topping',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
