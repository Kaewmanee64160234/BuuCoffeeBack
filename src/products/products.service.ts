import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Category } from 'src/categories/entities/category.entity';
import { ProductType } from 'src/product-types/entities/product-type.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(ProductType)
    private productTypeRepository: Repository<ProductType>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      // Find category by id
      const category = await this.categoryRepository.findOne({
        where: { categoryId: createProductDto.categoryId },
      });
      if (!category) {
        throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
      }

      const newProduct = new Product();
      newProduct.productName = createProductDto.productName;
      newProduct.productPrice = createProductDto.productPrice;

      // Check if productImage is defined before converting to base64
      if (createProductDto.productImage) {
        newProduct.productImage = Buffer.from(
          createProductDto.productImage,
        ).toString('base64');
      }

      newProduct.category = category;

      const newProduct_ = await this.productRepository.save(newProduct);
      if (category.haveTopping == true) {
        // Add product types if provided
        if (
          createProductDto.productTypes &&
          createProductDto.productTypes.length > 0
        ) {
          for (const productType of createProductDto.productTypes) {
            const newProductType = new ProductType();
            newProductType.productTypeName = productType.productTypeName;
            newProductType.product = newProduct;
            newProductType.productTypePrice = productType.productTypePrice;
            await this.productTypeRepository.save(newProductType); // Save product type
          }
        }
      } else {
        //set product type to null
        newProduct_.productTypes = null;

        await this.productRepository.save(newProduct_);
      }
      return this.productRepository.findOne({
        where: { productId: newProduct_.productId },
        relations: ['category', 'productTypes'],
      });
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Failed to create product',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findAll() {
    try {
      return await this.productRepository.find();
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve products',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: number) {
    try {
      const product = await this.productRepository.findOne({
        where: { productId: id },
        relations: ['productTypes', 'category'],
      });
      if (!product) {
        throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
      }
      return product;
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve product',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    try {
      const product = await this.productRepository.findOne({
        where: { productId: id },
        relations: ['productTypes', 'category'], // Include 'category' in relations
      });

      if (!product) {
        throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
      }

      if (updateProductDto.productImage) {
        updateProductDto.productImage = Buffer.from(
          updateProductDto.productImage,
        ).toString('base64');
      }

      // Update productType if provided and category has 'haveTopping' property
      if (
        updateProductDto.productTypes &&
        updateProductDto.productTypes.length > 0 &&
        product.category?.haveTopping && // Check if product.category is defined
        product.productTypes.length > 0
      ) {
        for (const productType of updateProductDto.productTypes) {
          const productType_ = product.productTypes.find(
            (pt) => pt.productTypeId === productType.productTypeId,
          );
          if (!productType_) {
            throw new HttpException(
              'Product type not found',
              HttpStatus.NOT_FOUND,
            );
          }
          await this.productTypeRepository.save({
            ...productType_,
            ...productType,
          });
        }
      }

      const updatedProduct = await this.productRepository.save({
        ...product,
        ...updateProductDto,
      });

      return updatedProduct;
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Failed to update product',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: number) {
    try {
      const result = await this.productRepository.delete(id);
      if (!result.affected) {
        throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
      }
      //delete product types
      await this.productTypeRepository.delete({ product: { productId: id } });
      return { id, status: 'deleted' };
    } catch (error) {
      throw new HttpException(
        'Failed to delete product',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
