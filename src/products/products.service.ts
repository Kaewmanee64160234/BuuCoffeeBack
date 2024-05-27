import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Category } from 'src/categories/entities/category.entity';
import { ProductType } from 'src/product-types/entities/product-type.entity';
import { Recipe } from 'src/recipes/entities/recipe.entity';
import { Ingredient } from 'src/ingredients/entities/ingredient.entity';
import { Multer } from 'multer';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(ProductType)
    private productTypeRepository: Repository<ProductType>,
    @InjectRepository(Recipe)
    private recipeRepository: Repository<Recipe>,
    @InjectRepository(Ingredient)
    private ingredientRepository: Repository<Ingredient>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const { productName, productPrice, categoryId, productTypes } =
      createProductDto;
    const category = await this.categoryRepository.findOne({
      where: { categoryId: +categoryId },
    });
    const newProduct = new Product();
    newProduct.productName = productName;
    newProduct.productPrice = +productPrice;
    newProduct.category = category;

    const savedProduct = await this.productRepository.save(newProduct);

    if (productTypes && productTypes.length > 0) {
      for (const typeDto of productTypes) {
        const newProductType = new ProductType();
        newProductType.productTypeName = typeDto.productTypeName;
        newProductType.productTypePrice = typeDto.productTypePrice;
        newProductType.product = savedProduct;

        const savedProductType = await this.productTypeRepository.save(
          newProductType,
        );

        for (const recipeDto of typeDto.recipes) {
          const ingredient = await this.ingredientRepository.findOne({
            where: { IngredientId: recipeDto.ingredientId },
          });
          if (!ingredient) {
            throw new HttpException(
              'Ingredient not found',
              HttpStatus.NOT_FOUND,
            );
          }

          const newRecipe = new Recipe();
          newRecipe.quantity = recipeDto.quantity;
          newRecipe.ingredient = ingredient;
          newRecipe.productType = savedProductType;

          await this.recipeRepository.save(newRecipe);
        }
      }
    }

    return this.productRepository.findOne({
      where: { productId: savedProduct.productId },
      relations: ['productTypes', 'productTypes.recipes'],
    });
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

          const productTypeSaved = await this.productTypeRepository.save({
            ...productType_,
            ...productType,
          });
          for (const recipe of productType.recipes) {
            const ingredient = await this.ingredientRepository.findOne({
              where: { IngredientId: recipe.ingredientId },
            });
            if (!ingredient) {
              throw new HttpException(
                'Ingredient not found',
                HttpStatus.NOT_FOUND,
              );
            }

            if (!product) {
              throw new HttpException(
                'Product not found',
                HttpStatus.NOT_FOUND,
              );
            }
            const newRecipe = new Recipe();
            newRecipe.ingredient = ingredient;
            newRecipe.quantity = recipe.quantity;
            newRecipe.productType = productTypeSaved;

            await this.recipeRepository.save(newRecipe);
          }
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
