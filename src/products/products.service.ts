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
    if (!category) {
      throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
    }

    const newProduct = new Product();
    newProduct.productName = productName;
    newProduct.productPrice = productPrice;
    newProduct.category = category;

    const savedProduct = await this.productRepository.save(newProduct);
    if (category.haveTopping === true) {
      if (productTypes && productTypes.length > 0) {
        for (const typeDto of productTypes) {
          const newProductType = new ProductType();
          newProductType.productTypeName = typeDto.productTypeName;
          newProductType.productTypePrice = typeDto.productTypePrice;
          newProductType.product = savedProduct;

          const savedProductType = await this.productTypeRepository.save(
            newProductType,
          );

          const savedProductType_ = await this.productTypeRepository.findOne({
            where: { productTypeId: savedProductType.productTypeId },
            relations: ['recipes', 'recipes.ingredient'],
          });

          if (typeDto.recipes) {
            for (const recipeDto of typeDto.recipes) {
              const ingredient = await this.ingredientRepository.findOne({
                where: { IngredientId: +recipeDto.IngredientId },
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
              newRecipe.productType = savedProductType_;

              await this.recipeRepository.save(newRecipe);
            }
          } else {
            throw new HttpException(
              'Recipe is required',
              HttpStatus.BAD_REQUEST,
            );
          }
        }
      } else {
        throw new HttpException(
          'Product type is required',
          HttpStatus.BAD_REQUEST,
        );
      }
    } else {
      // Create ingredient
      const ingredient = new Ingredient();
      ingredient.nameIngredient = productName;
      ingredient.minimun = 10;
      ingredient.unit = 'piece';
      ingredient.quantityInStock = 10;
      ingredient.quantityPerUnit = 1;
      const ing = await this.ingredientRepository.save(ingredient);

      // Create product type and recipe
      const newProductType = new ProductType();
      newProductType.productTypeName = '';
      newProductType.productTypePrice = 0;
      newProductType.product = savedProduct;
      const savedProductType = await this.productTypeRepository.save(
        newProductType,
      );

      const newRecipe = new Recipe();
      newRecipe.quantity = 1;
      newRecipe.ingredient = ing;
      newRecipe.productType = savedProductType;
      await this.recipeRepository.save(newRecipe);
    }

    return this.productRepository.findOne({
      where: { productId: savedProduct.productId },
      relations: ['productTypes', 'productTypes.recipes', 'category'],
    });
  }

  // uploadImage
  async uploadImage(productId: number, fileName: string) {
    try {
      console.log('productId', productId);
      const product = await this.productRepository.findOne({
        where: { productId: +productId },
      });
      if (!product) {
        throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
      }
      const updatedProduct = await this.productRepository.save({
        ...product,
        productImage: fileName,
      });
      return updatedProduct;
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Failed to upload image',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll() {
    try {
      return await this.productRepository.find({
        relations: [
          'productTypes',
          'category',
          'productTypes.recipes',
          'productTypes.recipes.ingredient',
        ],
      });
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
        relations: [
          'productTypes',
          'category',
          'productTypes.recipes',
          'productTypes.recipes.ingredient',
        ],
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

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { productId: id },
      relations: ['productTypes', 'productTypes.recipes', 'category'],
    });

    if (!product) {
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    }

    // Update basic product details
    product.productName = updateProductDto.productName || product.productName;
    product.productPrice =
      updateProductDto.productPrice || product.productPrice;
    product.productImage =
      updateProductDto.productImage || product.productImage;

    if (product.category?.haveTopping) {
      const existingProductTypes = product.productTypes || [];
      const updatedProductTypes = new Map<string, ProductType>();

      for (const typeDto of updateProductDto.productTypes || []) {
        let productType = existingProductTypes.find(
          (pt) => pt.productTypeName === typeDto.productTypeName,
        );

        if (!productType) {
          productType = new ProductType();
          productType.product = product;
          productType.productTypeName = typeDto.productTypeName;
          productType.productTypePrice = typeDto.productTypePrice;
          productType.recipes = [];
          productType = await this.productTypeRepository.save(productType);
          product.productTypes.push(productType);
        } else {
          productType.productTypeName = typeDto.productTypeName;
          productType.productTypePrice = typeDto.productTypePrice;
          await this.productTypeRepository.save(productType);
        }

        updatedProductTypes.set(productType.productTypeName, productType);

        const existingRecipes = productType.recipes || [];
        const updatedRecipes = new Map<number, Recipe>();

        for (const recipeDto of typeDto.recipes || []) {
          const ingredient = await this.ingredientRepository.findOne({
            where: { IngredientId: recipeDto.ingredient.IngredientId },
          });

          if (!ingredient) {
            throw new HttpException(
              'Ingredient not found',
              HttpStatus.NOT_FOUND,
            );
          }

          let recipe = existingRecipes.find(
            (r) =>
              r.ingredient.IngredientId === recipeDto.ingredient.IngredientId,
          );

          if (!recipe) {
            recipe = new Recipe();
            recipe.productType = productType;
            recipe.ingredient = ingredient;
            productType.recipes.push(recipe);
          }

          recipe.quantity = recipeDto.quantity;
          recipe.ingredient = ingredient;

          recipe = await this.recipeRepository.save(recipe);
          updatedRecipes.set(recipe.recipeId, recipe);
        }

        // Remove old recipes that are not in the updated list
        for (const recipe of existingRecipes) {
          if (!updatedRecipes.has(recipe.recipeId)) {
            await this.recipeRepository.remove(recipe);
          }
        }
      }

      // Remove old product types that are not in the updated list
      for (const existingProductType of existingProductTypes) {
        if (!updatedProductTypes.has(existingProductType.productTypeName)) {
          await this.recipeRepository.delete({
            productType: existingProductType,
          });
          await this.productTypeRepository.remove(existingProductType);
        }
      }
    } else {
      for (const typeDto of updateProductDto.productTypes) {
        const productType = product.productTypes.find(
          (pt) => pt.productTypeName === typeDto.productTypeName,
        );
        if (productType) {
          const existingRecipes = productType.recipes;
          const updatedRecipes = new Map<number, Recipe>();

          for (const recipeDto of typeDto.recipes) {
            console.log(recipeDto);
            const ingredient = await this.ingredientRepository.findOne({
              where: { IngredientId: recipeDto.ingredient.IngredientId },
            });

            if (!ingredient) {
              throw new HttpException(
                'Ingredient not found',
                HttpStatus.NOT_FOUND,
              );
            }

            let recipe = existingRecipes.find(
              (r) =>
                r.ingredient.IngredientId === recipeDto.ingredient.IngredientId,
            );

            if (!recipe) {
              recipe = new Recipe();
              recipe.productType = productType;
              recipe.ingredient = ingredient;
              productType.recipes.push(recipe);
            }

            recipe.quantity = recipeDto.quantity;
            recipe.ingredient = ingredient;

            recipe = await this.recipeRepository.save(recipe);
            updatedRecipes.set(recipe.recipeId, recipe);
          }

          // Remove old recipes that are not in the updated list
          for (const recipe of existingRecipes) {
            if (!updatedRecipes.has(recipe.recipeId)) {
              await this.recipeRepository.remove(recipe);
            }
          }
        }
      }
    }

    await this.productRepository.save(product);

    return this.productRepository.findOne({
      where: { productId: id },
      relations: [
        'productTypes',
        'productTypes.recipes',
        'category',
        'productTypes.recipes.ingredient',
        'productTypes.productTypeToppings',
      ],
    });
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

  //get product by category name
  async getProductByCategoryName(categoryName: string) {
    try {
      const category = await this.categoryRepository.findOne({
        where: { categoryName: categoryName },
      });
      if (!category) {
        throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
      }
      return await this.productRepository.find({
        where: { category: { categoryId: category.categoryId } },
        relations: ['productTypes', 'productTypes.recipes', 'category'],
      });
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve products',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
