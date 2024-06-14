import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
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

    // Parse and validate categoryId
    const parsedCategoryId = Number(categoryId);
    if (isNaN(parsedCategoryId)) {
      throw new HttpException('Invalid category ID', HttpStatus.BAD_REQUEST);
    }

    const category = await this.categoryRepository.findOne({
      where: { categoryId: parsedCategoryId },
    });
    if (!category) {
      throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
    }

    const newProduct = new Product();
    newProduct.productName = productName;
    newProduct.productPrice = Number(productPrice);
    if (isNaN(newProduct.productPrice)) {
      throw new HttpException('Invalid product price', HttpStatus.BAD_REQUEST);
    }
    newProduct.category = category;

    const savedProduct = await this.productRepository.save(newProduct);

    if (category.haveTopping === true) {
      if (productTypes && productTypes.length > 0) {
        for (const typeDto of productTypes) {
          const newProductType = new ProductType();
          newProductType.productTypeName = typeDto.productTypeName;
          newProductType.productTypePrice = Number(typeDto.productTypePrice);
          if (isNaN(newProductType.productTypePrice)) {
            throw new HttpException(
              'Invalid product type price',
              HttpStatus.BAD_REQUEST,
            );
          }
          newProductType.product = savedProduct;

          const savedProductType = await this.productTypeRepository.save(
            newProductType,
          );

          if (typeDto.recipes) {
            for (const recipeDto of typeDto.recipes) {
              const parsedIngredientId = Number(recipeDto.IngredientId);
              if (isNaN(parsedIngredientId)) {
                throw new HttpException(
                  'Invalid ingredient ID',
                  HttpStatus.BAD_REQUEST,
                );
              }

              const ingredient = await this.ingredientRepository.findOne({
                where: { ingredientId: parsedIngredientId },
              });
              if (!ingredient) {
                throw new HttpException(
                  'Ingredient not found',
                  HttpStatus.NOT_FOUND,
                );
              }

              const newRecipe = new Recipe();
              newRecipe.quantity = Number(recipeDto.quantity);
              if (isNaN(newRecipe.quantity)) {
                throw new HttpException(
                  'Invalid recipe quantity',
                  HttpStatus.BAD_REQUEST,
                );
              }
              newRecipe.ingredient = ingredient;
              newRecipe.productType = savedProductType;

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
      ingredient.ingredientName = productName;
      ingredient.ingredientMinimun = 10;
      ingredient.ingredientUnit = 'piece';
      ingredient.ingredientQuantityInStock = 0;
      ingredient.ingredientQuantityPerUnit = 1;
      ingredient.ingredientQuantityPerSubUnit = 'piece';
      ingredient.ingredientRemining = 0;

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
    console.log('Update Product DTO:', updateProductDto); // Debug log
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

    // Update category
    const categoryId = Number(updateProductDto.category.categoryId);
    if (isNaN(categoryId)) {
      throw new HttpException('Invalid Category ID', HttpStatus.BAD_REQUEST);
    }
    const category = await this.categoryRepository.findOne({
      where: { categoryId },
    });

    if (!category) {
      throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
    }

    // Check if category haveTopping has changed
    const hadTopping = product.category?.haveTopping;
    const hasTopping = category.haveTopping;

    product.category = category;

    if (hasTopping) {
      // Handle case when category has topping
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
          productType.productTypePrice = Number(typeDto.productTypePrice);
          if (isNaN(productType.productTypePrice)) {
            throw new HttpException(
              'Invalid Product Type Price',
              HttpStatus.BAD_REQUEST,
            );
          }
          productType.recipes = [];
          productType = await this.productTypeRepository.save(productType);
          product.productTypes.push(productType);
        } else {
          productType.productTypeName = typeDto.productTypeName;
          productType.productTypePrice = Number(typeDto.productTypePrice);
          if (isNaN(productType.productTypePrice)) {
            throw new HttpException(
              'Invalid Product Type Price',
              HttpStatus.BAD_REQUEST,
            );
          }
          await this.productTypeRepository.save(productType);
        }

        updatedProductTypes.set(productType.productTypeName, productType);

        const existingRecipes = productType.recipes || [];
        const updatedRecipes = new Map<number, Recipe>();

        for (const recipeDto of typeDto.recipes || []) {
          const ingredientId = Number(recipeDto.ingredient.ingredientId);
          if (isNaN(ingredientId)) {
            throw new HttpException(
              'Invalid Ingredient ID',
              HttpStatus.BAD_REQUEST,
            );
          }

          const ingredient = await this.ingredientRepository.findOne({
            where: { ingredientId: ingredientId },
          });

          if (!ingredient) {
            throw new HttpException(
              'Ingredient not found',
              HttpStatus.NOT_FOUND,
            );
          }

          let recipe = existingRecipes.find(
            (r) => r.ingredient.ingredientId === ingredientId,
          );

          if (!recipe) {
            recipe = new Recipe();
            recipe.productType = productType;
            recipe.ingredient = ingredient;
            productType.recipes.push(recipe);
          }

          recipe.quantity = Number(recipeDto.quantity);
          if (isNaN(recipe.quantity)) {
            throw new HttpException(
              'Invalid Recipe Quantity',
              HttpStatus.BAD_REQUEST,
            );
          }

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
      // If the category does not have topping, clear existing product types and recipes
      if (hadTopping) {
        // Clear existing product types and recipes
        for (const existingProductType of product.productTypes) {
          await this.recipeRepository.delete({
            productType: existingProductType,
          });
          await this.productTypeRepository.remove(existingProductType);
        }
        product.productTypes = [];
      }

      // Create a new ingredient from the product name
      const newIngredient = new Ingredient();
      newIngredient.ingredientName = product.productName;
      newIngredient.ingredientMinimun = 10;
      newIngredient.ingredientUnit = 'piece';
      newIngredient.ingredientQuantityInStock = 10;
      newIngredient.ingredientQuantityPerUnit = 1;
      newIngredient.ingredientQuantityPerSubUnit = 'piece';
      newIngredient.ingredientRemining = 0;
      const savedIngredient = await this.ingredientRepository.save(
        newIngredient,
      );

      // Create a single product type and recipe for the product
      const newProductType = new ProductType();
      newProductType.productTypeName = '';
      newProductType.productTypePrice = 0;
      newProductType.product = product;

      const savedProductType = await this.productTypeRepository.save(
        newProductType,
      );

      const newRecipe = new Recipe();
      newRecipe.quantity = 1;
      newRecipe.ingredient = savedIngredient;
      newRecipe.productType = savedProductType;

      await this.recipeRepository.save(newRecipe);
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
      console.log(error);
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

  async getProducts(
    page: number,
    limit: number,
    search: string,
  ): Promise<{ data: Product[]; total: number }> {
    const whereCondition = search ? { productName: Like(`%${search}%`) } : {};

    const [data, total] = await this.productRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      where: whereCondition,
      relations: [
        'category',
        'productTypes',
        'productTypes.recipes',
        'productTypes.recipes.ingredient',
      ],
    });

    return { data, total };
  }
}
