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
      const product = await this.findOne(id); // Reuse findOne to handle fetching and error handling
      if (updateProductDto.productImage) {
        updateProductDto.productImage = Buffer.from(
          updateProductDto.productImage,
        ).toString('base64');
      }
      const updatedProduct = await this.productRepository.save({
        ...product,
        ...updateProductDto,
      });
      return updatedProduct;
    } catch (error) {
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
      return { id, status: 'deleted' };
    } catch (error) {
      throw new HttpException(
        'Failed to delete product',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
