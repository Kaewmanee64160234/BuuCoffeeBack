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
import { UpdateRecipeDto } from 'src/recipes/dto/update-recipe.dto';
import { UpdateProductTypeDto } from 'src/product-types/dto/update-product-type.dto';

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
    const {
      productName,
      productPrice,
      categoryId,
      productTypes,
      barcode,
      storeType,
      countingPoint,
    } = createProductDto; // Include barcode here

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
    newProduct.countingPoint = countingPoint;
    newProduct.storeType = storeType;
    newProduct.barcode = barcode; // Add this line
    console.log('new Product', newProduct);

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
      console.log('fileName', fileName);
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

      console.log('productImage', fileName);
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

  async remove(id: number) {
    try {
      const product = await this.productRepository.findOne({
        where: { productId: id },
        relations: ['category', 'productTypes', 'productTypes.recipes'],
      });
      if (!product) {
        throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
      }

      if (!product.category.haveTopping) {
        await this.softRemoveProductIngredients(product);
      }
      await this.productRepository.softRemove(product);
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Error deleting product',
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

  // update
  async update(id: number, updateProductDto: UpdateProductDto) {
    try {
      console.log('updateProductDto', updateProductDto);

      const product = await this.productRepository.findOne({
        where: { productId: id },
        relations: ['category', 'productTypes', 'productTypes.recipes'],
      });
      if (!product) {
        throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
      }

      const category = await this.categoryRepository.findOne({
        where: { categoryId: +updateProductDto.category.categoryId },
      });
      if (!category) {
        throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
      }

      const isCategoryChanged =
        product.category.categoryId !== +updateProductDto.category.categoryId;
      const isProductTypesChanged = await this.isProductTypesChanged(
        product.productTypes,
        updateProductDto.productTypes,
      );

      console.log(
        'isCategoryChanged',
        isCategoryChanged,
        'isProductTypesChanged',
        isProductTypesChanged,
      );
      if (isProductTypesChanged) {
        console.log('================================================');
        console.log('existingProductTypes', product.productTypes);
        console.log('newProductTypes', updateProductDto.productTypes);
        console.log('================================================');
      }

      if (isCategoryChanged || isProductTypesChanged) {
        if (!product.category.haveTopping) {
          await this.softRemoveProductIngredients(product);
        }
        await this.productRepository.softRemove(product);

        const newProduct = this.createProductFromDto(
          updateProductDto,
          product.productImage,
          category,
        );

        const savedProduct = await this.productRepository.save(newProduct);
        await this.handleProductTypesAndRecipes(savedProduct, updateProductDto);

        const result = await this.productRepository.findOne({
          where: { productId: savedProduct.productId },
          relations: ['productTypes', 'productTypes.recipes', 'category'],
        });
        console.log(result);
        return result;
      } else {
        this.updateProductFromDto(product, updateProductDto, category);

        const savedProduct = await this.productRepository.save(product);
        await this.handleProductTypesAndRecipes(
          savedProduct,
          updateProductDto,
          true,
        );

        const result = await this.productRepository.findOne({
          where: { productId: savedProduct.productId },
          relations: ['productTypes', 'productTypes.recipes', 'category'],
        });
        console.log(result);
        return result;
      }
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Error updating product',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private createProductFromDto(
    dto: UpdateProductDto,
    image: string,
    category: Category,
  ): Product {
    const product = new Product();
    product.productName = dto.productName;
    product.countingPoint = dto.countingPoint;
    product.productPrice = Number(dto.productPrice);
    product.productImage = image;
    product.barcode = dto.barcode;
    product.storeType = dto.storeType;
    product.category = category;

    if (isNaN(product.productPrice)) {
      throw new HttpException('Invalid product price', HttpStatus.BAD_REQUEST);
    }
    return product;
  }

  private updateProductFromDto(
    product: Product,
    dto: UpdateProductDto,
    category: Category,
  ) {
    product.productName = dto.productName;
    product.productPrice = Number(dto.productPrice);
    product.countingPoint = dto.countingPoint;
    product.productImage = dto.productImage;
    product.barcode = dto.barcode;
    product.storeType = dto.storeType;
    product.category = category;

    if (isNaN(product.productPrice)) {
      throw new HttpException('Invalid product price', HttpStatus.BAD_REQUEST);
    }
  }

  private async softRemoveProductIngredients(product: Product) {
    for (const productType of product.productTypes) {
      for (const recipe of productType.recipes) {
        await this.recipeRepository.softRemove(recipe);

        const ingredient = await this.ingredientRepository.findOne({
          where: { ingredientId: recipe.ingredient.ingredientId },
        });
        if (ingredient) {
          await this.ingredientRepository.softRemove(ingredient);
        }
      }
    }
  }

  private async isProductTypesChanged(
    existingProductTypes: ProductType[],
    newProductTypes: UpdateProductTypeDto[],
  ): Promise<boolean> {
    if (existingProductTypes.length !== newProductTypes.length) {
      return true;
    }

    for (let i = 0; i < existingProductTypes.length; i++) {
      const existingType = existingProductTypes[i];
      const newType = newProductTypes[i];
      const isRecipesChanged = await this.isRecipesChanged(
        existingType.recipes,
        newType.recipes,
      );

      if (
        existingType.productTypeName !== newType.productTypeName ||
        existingType.productTypePrice !== newType.productTypePrice ||
        isRecipesChanged
      ) {
        return true;
      }
    }

    return false;
  }

  private async isRecipesChanged(
    existingRecipes: Recipe[],
    newRecipes: UpdateRecipeDto[],
  ): Promise<boolean> {
    if (existingRecipes.length !== newRecipes.length) {
      return true;
    }

    for (let i = 0; i < existingRecipes.length; i++) {
      const existingRecipe = existingRecipes[i];
      const newRecipe = newRecipes[i];

      if (
        existingRecipe.quantity !== newRecipe.quantity ||
        existingRecipe.ingredient.ingredientName !==
          newRecipe.ingredient.ingredientName
      ) {
        return true;
      }
    }

    return false;
  }

  private async handleProductTypesAndRecipes(
    savedProduct: Product,
    updateProductDto: UpdateProductDto,
    isUpdate = false,
  ) {
    if (savedProduct.category.haveTopping === true) {
      if (updateProductDto.productTypes.length > 0) {
        for (const typeDto of updateProductDto.productTypes) {
          const newProductType = new ProductType();
          newProductType.productTypeName = this.getProductTypeName(
            typeDto.productTypeName,
          );
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
              const ingredient = await this.getIngredientById(
                recipeDto.ingredient.ingredientId,
              );

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
      if (!isUpdate) {
        const ingredient = await this.createIngredient(
          updateProductDto.productName,
        );

        const newProductType = new ProductType();
        newProductType.productTypeName = '';
        newProductType.productTypePrice = 0;
        newProductType.product = savedProduct;

        const savedProductType = await this.productTypeRepository.save(
          newProductType,
        );
        const newRecipe = new Recipe();
        newRecipe.quantity = 1;
        newRecipe.ingredient = ingredient;
        newRecipe.productType = savedProductType;
        await this.recipeRepository.save(newRecipe);
      }
    }
  }

  private async getIngredientById(ingredientId: number): Promise<Ingredient> {
    const ingredient = await this.ingredientRepository.findOne({
      where: { ingredientId },
    });
    if (!ingredient) {
      throw new HttpException('Ingredient not found', HttpStatus.NOT_FOUND);
    }
    return ingredient;
  }

  private async createIngredient(name: string): Promise<Ingredient> {
    const ingredient = new Ingredient();
    ingredient.ingredientName = name;
    ingredient.ingredientMinimun = 10;
    ingredient.ingredientUnit = 'piece';
    ingredient.ingredientQuantityInStock = 0;
    ingredient.ingredientQuantityPerUnit = 1;
    ingredient.ingredientQuantityPerSubUnit = 'piece';
    ingredient.ingredientRemining = 0;

    return this.ingredientRepository.save(ingredient);
  }

  private getProductTypeName(name: string): string {
    switch (name) {
      case 'Hot':
        return 'ร้อน';
      case 'Cold':
        return 'เย็น';
      case 'Blend':
        return 'ปั่น';
      default:
        return name;
    }
  }
}
