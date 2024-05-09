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

  async create(
    createProductDto: CreateProductDto,
    imageFile: Express.Multer.File,
  ) {
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

      if (imageFile) {
        newProduct.productImage = Buffer.from(imageFile.buffer).toString(
          'base64',
        );
      } else {
        newProduct.productImage = null;
      }

      newProduct.category = category;

      // Save the new product to the database
      const savedProduct = await this.productRepository.save(newProduct);

      // Add product types if the category supports toppings
      if (category.haveTopping && createProductDto.productTypes?.length > 0) {
        const productTypes = createProductDto.productTypes.map(
          (productTypeDto) => {
            const newProductType = new ProductType();
            newProductType.productTypeName = productTypeDto.productTypeName;
            newProductType.product = savedProduct; // Assign the saved product
            newProductType.productTypePrice = productTypeDto.productTypePrice;
            return newProductType;
          },
        );

        // Save all product types in one transaction
        await this.productTypeRepository.save(productTypes);
      }

      // Fetch the saved product with relations and return it
      return this.productRepository.findOne({
        where: { productId: savedProduct.productId },
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
