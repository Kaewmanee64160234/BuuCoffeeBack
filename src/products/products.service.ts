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
    try {
      const { productName, productPrice, categoryId, productTypes } =
        createProductDto;

      console.log(createProductDto);

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
      console.log(savedProduct);
      if (category.haveTopping === true) {
        console.log(productTypes);
        if (productTypes && productTypes.length > 0) {
          for (const typeDto of productTypes) {
            const newProductType = new ProductType();
            newProductType.productTypeName = typeDto.productTypeName;
            newProductType.productTypePrice = typeDto.productTypePrice;
            newProductType.product = savedProduct;

            const savedProductType = await this.productTypeRepository.save(
              newProductType,
            );

            if (typeDto.recipes) {
              for (const recipeDto of typeDto.recipes) {
                const ingredient = await this.ingredientRepository.findOne({
                  where: { IngredientId: +recipeDto.ingredientId },
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
        //create ingredin
        const ingredient = new Ingredient();
        ingredient.nameIngredient = productName;
        ingredient.minimun = 10;
        ingredient.unit = 'piece';
        ingredient.quantityInStock = 10;
        ingredient.quantityPerUnit = 1;
        const ing = await this.ingredientRepository.save(ingredient);
        //create product type and recipe
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
      throw new HttpException(
        'Failed to upload image',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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
        relations: ['productTypes', 'category'],
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
      updateProductDto.productImage || product.productImage; // Assuming productImage is a URL or string path

    if (product.category?.haveTopping) {
      for (const typeDto of updateProductDto.productTypes || []) {
        let productType = product.productTypes.find(
          (pt) => pt.productTypeId === typeDto.productTypeId,
        );

        if (!productType) {
          productType = new ProductType(); // Create new if it doesn't exist
          productType.product = product;
        }

        productType.productTypeName = typeDto.productTypeName;
        productType.productTypePrice = typeDto.productTypePrice;

        const savedProductType = await this.productTypeRepository.save(
          productType,
        );

        for (const recipeDto of typeDto.recipes || []) {
          const ingredient = await this.ingredientRepository.findOne({
            where: { IngredientId: recipeDto.ingredientId },
          });

          if (!ingredient) {
            throw new HttpException(
              'Ingredient not found',
              HttpStatus.NOT_FOUND,
            );
          }

          let recipe = savedProductType.recipes.find(
            (r) => r.recipeId === recipeDto.recipeId,
          );

          if (!recipe) {
            recipe = new Recipe(); // Create new if it doesn't exist
            recipe.productType = savedProductType;
          }

          recipe.quantity = recipeDto.quantity;
          recipe.ingredient = ingredient;

          await this.recipeRepository.save(recipe);
        }
      }
    } else {
      const ingredient = await this.ingredientRepository.findOne({
        where: {
          IngredientId:
            updateProductDto.productTypes[0].recipes[0].ingredientId,
        },
      });
      ingredient.nameIngredient = product.productName;
      ingredient.minimun =
        updateProductDto.productTypes[0].recipes[0].ingredient.minimun;
      ingredient.unit =
        updateProductDto.productTypes[0].recipes[0].ingredient.unit;
      ingredient.quantityInStock =
        updateProductDto.productTypes[0].recipes[0].ingredient.quantityInStock;
      ingredient.quantityPerUnit =
        updateProductDto.productTypes[0].recipes[0].ingredient.quantityPerUnit;
      await this.ingredientRepository.save(ingredient);
      // recipe
      const recipe = await this.recipeRepository.findOne({
        where: {
          recipeId: updateProductDto.productTypes[0].recipes[0].recipeId,
        },
      });
      recipe.quantity = updateProductDto.productTypes[0].recipes[0].quantity;

      recipe.ingredient = ingredient;
      await this.recipeRepository.save(recipe);
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
