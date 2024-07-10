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

  async remove(id: number) {
    // soft remove
    try {
      const product = await this.productRepository.findOne({
        where: { productId: id },
      });
      if (!product) {
        throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
      }
      const updatedProduct = await this.productRepository.softRemove(product);
      return updatedProduct;
    } catch (error) {
      throw new HttpException(
        'Failed to remove product',
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
      // soft remove and create new product for old data
      const product = await this.productRepository.findOne({
        where: { productId: id },
        relations: ['category'],
      });
      if (!product) {
        throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
      }
      await this.productRepository.softRemove(product);

      // Parse and validate categoryId

      if (isNaN(updateProductDto.category.categoryId)) {
        throw new HttpException('Invalid category ID', HttpStatus.BAD_REQUEST);
      }

      const category = await this.categoryRepository.findOne({
        where: { categoryId: +updateProductDto.category.categoryId },
      });
      if (!category) {
        throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
      }

      const newProduct = new Product();
      newProduct.productName = updateProductDto.productName;
      newProduct.productPrice = Number(updateProductDto.productPrice);
      if (isNaN(newProduct.productPrice)) {
        throw new HttpException(
          'Invalid product price',
          HttpStatus.BAD_REQUEST,
        );
      }
      newProduct.category = category;

      const savedProduct = await this.productRepository.save(newProduct);

      if (category.haveTopping === true) {
        if (updateProductDto.productTypes.length > 0) {
          for (const typeDto of updateProductDto.productTypes) {
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
        ingredient.ingredientName = updateProductDto.product.productName;
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
    } catch (error) {
      console.log(error);
    }
  }
}
