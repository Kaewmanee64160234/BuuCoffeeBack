import {
  Injectable,
  HttpException,
  HttpStatus,
  ParseBoolPipe,
} from '@nestjs/common';
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
import { IngredientsService } from '../ingredients/ingredients.service';
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
    private ingredientService: IngredientsService,
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
      haveTopping,
    } = createProductDto; // Include barcode here

    console.log('createProductDto', createProductDto);

    // Parse and validate categoryId
    const parsedCategoryId = Number(categoryId);
    if (isNaN(parsedCategoryId)) {
      throw new HttpException('Invalid category ID', HttpStatus.BAD_REQUEST);
    }
    console.log('parsedCategoryId', createProductDto);

    const category = await this.categoryRepository.findOne({
      where: { categoryId: parsedCategoryId },
    });
    if (!category) {
      throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
    }

    const newProduct = new Product();
    newProduct.productName = productName;
    newProduct.productPrice = Number(productPrice);
    if (countingPoint == 'true') {
      newProduct.countingPoint = true;
    } else {
      newProduct.countingPoint = false;
    }
    newProduct.storeType = storeType;
    newProduct.barcode = barcode; // Add this line
    if (haveTopping == 'true') {
      newProduct.haveTopping = true;
    } else {
      newProduct.haveTopping = false;
    }
    if (createProductDto.productImage) {
      newProduct.productImage = createProductDto.productImage;
    }
    console.log('new Product', newProduct);

    if (isNaN(newProduct.productPrice)) {
      throw new HttpException('Invalid product price', HttpStatus.BAD_REQUEST);
    }
    newProduct.category = category;

    const savedProduct = await this.productRepository.save(newProduct);
    // create product have topping

    if (haveTopping == 'true') {
      if (productTypes && productTypes.length > 0) {
        for (const typeDto of productTypes) {
          const newProductType = new ProductType();
          newProductType.productTypeName = typeDto.productTypeName;
          newProductType.productTypePrice = Number(typeDto.productTypePrice);
          newProductType.product = savedProduct;

          if (isNaN(newProductType.productTypePrice)) {
            throw new HttpException(
              'Invalid product type price',
              HttpStatus.BAD_REQUEST,
            );
          }

          // Save the product type
          await this.productTypeRepository.save(newProductType);
        }
      } else {
        throw new HttpException(
          'Product type is required',
          HttpStatus.BAD_REQUEST,
        );
      }
    } else {
      let ingredient;
      if (createProductDto.needLinkIngredient) {
        createProductDto.ingredient.ingredientName =
          createProductDto.productName;
        console.log(
          'Creating a new ingredient with data:',
          createProductDto.ingredient,
        );

        const newIngredient = new Ingredient();
        newIngredient.ingredientName =
          createProductDto.ingredient.ingredientName;
        newIngredient.ingredientSupplier =
          createProductDto.ingredient.ingredientSupplier;
        newIngredient.ingredientMinimun =
          createProductDto.ingredient.ingredientMinimun;
        newIngredient.ingredientUnit =
          createProductDto.ingredient.ingredientUnit;
        newIngredient.ingredientVolumeUnit =
          createProductDto.ingredient.ingredientVolumeUnit;
        newIngredient.ingredientQuantityInStock = 0;
        newIngredient.ingredientQuantityPerUnit =
          createProductDto.ingredient.ingredientQuantityPerUnit;
        newIngredient.ingredientQuantityPerSubUnit =
          createProductDto.ingredient.ingredientQuantityPerSubUnit;

        newIngredient.ingredientBarcode =
          createProductDto.ingredient.ingredientBarcode ||
          (await this.ingredientService.createRandomBarcode(
            category.categoryId,
          ));

        ingredient = await this.ingredientRepository.save(newIngredient);

        if (createProductDto.ingredient.ingredientImage) {
          const imagePath = await this.ingredientService.uploadImage(
            ingredient.ingredientId,
            createProductDto.product.productImage,
          );
          ingredient.ingredientImage = imagePath;
        } else {
          ingredient.ingredientImage = 'no_image.jpg';
        }

        await this.ingredientRepository.save(ingredient);
      }

      const newProductType = new ProductType();
      newProductType.productTypeName = '';
      newProductType.productTypePrice = 0;
      newProductType.product = savedProduct;

      await this.productTypeRepository.save(newProductType);

      if (ingredient) {
        savedProduct.ingredient = ingredient;
        await this.productRepository.save(savedProduct);
      }
    }

    return this.productRepository.findOne({
      where: { productId: savedProduct.productId },
      relations: [
        'productTypes',
        'productTypes.recipes',
        'category',
        'ingredient',
      ],
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

  // get Product by Store Type
  async getProductByStoreType(storeType: string) {
    try {
      return await this.productRepository.find({
        where: { storeType: storeType },
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

  async remove(id: number) {
    try {
      const product = await this.productRepository.findOne({
        where: { productId: id },
        relations: ['category', 'productTypes', 'productTypes.recipes'],
      });
      if (!product) {
        throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
      }

      if (!product.haveTopping) {
        await this.softRemoveProductIngredients(product);
      }
      await this.productTypeRepository.softRemove(product.productTypes);
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
        relations: ['category', 'productTypes'],
      });
      if (!product) {
        throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
      }

      const category = await this.categoryRepository.findOne({
        where: { categoryId: +updateProductDto.categoryId },
      });
      if (!category) {
        throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
      }
      product.category = category;
      product.productName = updateProductDto.productName;
      product.productPrice = Number(updateProductDto.productPrice);
      if (updateProductDto.countingPoint == 'true') {
        product.countingPoint = true;
      } else {
        product.countingPoint = false;
      }
      product.storeType = updateProductDto.storeType;
      product.barcode = updateProductDto.barcode;
      if (updateProductDto.haveTopping == 'true') {
        product.haveTopping = true;
      } else {
        product.haveTopping = false;
      }

      const isProductTypesChanged = await this.isProductTypesChanged(
        product.productTypes,
        updateProductDto.productTypes,
      );
      console.log('isProductTypesChanged', isProductTypesChanged);

      if (updateProductDto.productImage) {
        product.productImage = updateProductDto.productImage;
      }

      if (isProductTypesChanged) {
        // Disable old product types
        await this.disableOldProductTypes(
          product.productTypes,
          updateProductDto.productTypes,
        );

        // Create or enable new product types
        await this.createOrUpdateProductTypes(
          product,
          updateProductDto.productTypes,
        );

        // Save product and return result
        const savedProduct = await this.productRepository.save(product);
        const result = await this.productRepository.findOne({
          where: { productId: savedProduct.productId },
          relations: ['productTypes', 'category'],
        });
        console.log(result);
        return result;
      } else {
        this.updateProductFromDto(product, updateProductDto, category);

        const savedProduct = await this.productRepository.save(product);
        const result = await this.productRepository.findOne({
          where: { productId: savedProduct.productId },
          relations: ['productTypes', 'category'],
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

  private async createOrUpdateProductTypes(
    product: Product,
    productTypesDto: UpdateProductTypeDto[],
  ) {
    for (const typeDto of productTypesDto) {
      const existingType = product.productTypes.find(
        (type) => type.productTypeName === typeDto.productTypeName,
      );

      if (existingType) {
        existingType.disable = false;
        existingType.productTypePrice = Number(typeDto.productTypePrice);
      } else {
        const newProductType = new ProductType();
        newProductType.productTypeName = typeDto.productTypeName;
        newProductType.productTypePrice = Number(typeDto.productTypePrice);
        newProductType.product = product;
        newProductType.disable = false;

        product.productTypes.push(newProductType);
      }
    }
    await this.productTypeRepository.save(product.productTypes);
  }

  private updateProductFromDto(
    product: Product,
    dto: UpdateProductDto,
    category: Category,
  ) {
    product.productName = dto.productName;
    product.productPrice = Number(dto.productPrice);
    if (dto.countingPoint == 'true') {
      product.countingPoint = true;
    } else {
      product.countingPoint = false;
    }
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
  // disableOldProductTypes
  private async disableOldProductTypes(
    existingProductTypes: ProductType[],
    newProductTypes: UpdateProductTypeDto[],
  ) {
    for (const existingType of existingProductTypes) {
      const newType = newProductTypes.find(
        (typeDto) => typeDto.productTypeName === existingType.productTypeName,
      );

      if (!newType) {
        existingType.disable = true;
      }
    }
    await this.productTypeRepository.save(existingProductTypes);
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
      const newType = newProductTypes.find(
        (typeDto) => typeDto.productTypeName === existingType.productTypeName,
      );

      if (
        !newType ||
        existingType.productTypePrice !== newType.productTypePrice
      ) {
        return true;
      }
    }

    return false;
  }
}
