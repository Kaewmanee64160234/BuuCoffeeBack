import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, LessThan, Repository } from 'typeorm';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { Ingredient } from './entities/ingredient.entity';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

@Injectable()
export class IngredientsService {
  constructor(
    @InjectRepository(Ingredient)
    private ingredientRepository: Repository<Ingredient>,
  ) {}
  async create(
    createIngredientDto: CreateIngredientDto,
    categoryId: number, // Added categoryId as a parameter
    imageFile?: Express.Multer.File,
  ): Promise<Ingredient> {
    try {
      console.log('Creating a new ingredient with data:', createIngredientDto);

      // Create a new instance of Ingredient but do not save yet
      const newIngredient = new Ingredient();
      newIngredient.ingredientName = createIngredientDto.ingredientName;
      newIngredient.ingredientSupplier = createIngredientDto.ingredientSupplier;
      newIngredient.ingredientMinimun = createIngredientDto.ingredientMinimun;
      newIngredient.ingredientUnit = createIngredientDto.ingredientUnit;
      newIngredient.ingredientVolumeUnit =
        createIngredientDto.ingredientVolumeUnit;
      newIngredient.ingredientQuantityInStock = 0;
      newIngredient.ingredientQuantityPerUnit =
        createIngredientDto.ingredientQuantityPerUnit;
      newIngredient.ingredientQuantityPerSubUnit =
        createIngredientDto.ingredientQuantityPerSubUnit;

      // Assign a temporary barcode if it's not provided
      if (createIngredientDto.ingredientBarcode) {
        newIngredient.ingredientBarcode = createIngredientDto.ingredientBarcode;
        console.log('Using provided barcode:', newIngredient.ingredientBarcode);
      } else {
        // Generate a temporary barcode using categoryId
        newIngredient.ingredientBarcode = await this.createRandomBarcode(
          categoryId,
        );
        console.log(
          'Generated temporary barcode:',
          newIngredient.ingredientBarcode,
        );
      }

      // Handle the image file (if provided)
      if (imageFile && imageFile.filename) {
        newIngredient.ingredientImage = imageFile.filename;
        console.log(
          'Using provided image file:',
          newIngredient.ingredientImage,
        );
      } else {
        newIngredient.ingredientImage = 'no-image.png'; // Default image
        console.log(
          'No image file provided, using default:',
          newIngredient.ingredientImage,
        );
      }

      // Save the ingredient
      const savedIngredient = await this.ingredientRepository.save(
        newIngredient,
      );
      console.log('Ingredient created successfully:', savedIngredient);

      // Update the barcode with the ingredientId after save
      savedIngredient.ingredientBarcode = await this.createRandomBarcode(
        categoryId,
        savedIngredient.ingredientId,
      );
      await this.ingredientRepository.save(savedIngredient);
      console.log(
        'Updated barcode with ingredientId:',
        savedIngredient.ingredientBarcode,
      );

      return savedIngredient;
    } catch (error) {
      console.error('Error creating ingredient:', error);
      throw new HttpException(
        'Failed to create Ingredient',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Adjusted createRandomBarcode method
  private createRandomBarcode(
    categoryId: number,
    ingredientId?: number,
  ): string {
    const prefix = '8852498';
    const categoryPart = categoryId.toString().padStart(2, '0'); // Ensure category is 2 digits
    const ingredientPart = ingredientId
      ? ingredientId.toString().padStart(4, '0')
      : '0000'; // Ingredient ID is optional for the initial generation

    return `${prefix}${categoryPart}${ingredientPart}`;
  }

  async findAllQuery(query) {
    try {
      const page = query.page || 1;
      const take = query.take || 10;
      const keyword = query.keyword || '';
      const orderBy = query.orderBy || 'ingredientName';
      const order = query.order || 'ASC';
      const paginate = query.paginate === 'false' ? false : true;

      let result, total;

      if (paginate) {
        const skip = (page - 1) * take;
        [result, total] = await this.ingredientRepository.findAndCount({
          where: { ingredientName: Like(`%${keyword}%`) },
          order: { [orderBy]: order },
          take: take,
          skip: skip,
        });
      } else {
        result = await this.ingredientRepository.find({
          where: { ingredientName: Like(`%${keyword}%`) },
          order: { [orderBy]: order },
        });
        total = result.length;
      }

      const lastPage = paginate ? Math.ceil(total / take) : 1;

      return {
        data: result,
        count: total,
        currentPage: paginate ? page : 1,
        lastPage: lastPage,
      };
    } catch (error) {
      console.error('Failed to retrieve ingredients', error);
      throw new HttpException(
        'Failed to retrieve ingredients',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async findAll() {
    try {
      return this.ingredientRepository.find();
    } catch (error) {
      throw new HttpException(
        'Failed to fetch ingredients',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  async findAllIngredientPrice() {
    try {
      const ingredients = await this.ingredientRepository.find({
        relations: ['importingredientitem'],
        order: { importingredientitem: { createdDate: 'DESC' } },
      });

      return ingredients.map((ingredient) => {
        const latestImportItem = ingredient.importingredientitem[0];
        let lastPrice = 0;

        if (latestImportItem) {
          if (latestImportItem.importType === 'box') {
            lastPrice = latestImportItem.unitPrice;
          } else {
            lastPrice = latestImportItem.unitPrice / latestImportItem.Quantity;
          }
        }

        return {
          ...ingredient,
          lastPrice,
        };
      });
    } catch (error) {
      throw new HttpException(
        'Failed to fetch ingredients',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async uploadImage(
    ingredientId: number,
    fileName: string,
  ): Promise<Ingredient> {
    try {
      const ingredient = await this.ingredientRepository.findOne({
        where: { ingredientId: +ingredientId },
      });
      if (!ingredient) {
        throw new HttpException('Ingredient not found', HttpStatus.NOT_FOUND);
      }
      const updatedIngredient = await this.ingredientRepository.save({
        ...ingredient,
        ingredientImage: fileName,
      });
      return updatedIngredient;
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Failed to upload image',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async searchByName(ingredientName: string): Promise<Ingredient[]> {
    try {
      return await this.ingredientRepository.find({
        where: {
          ingredientName: Like(`%${ingredientName}%`),
        },
      });
    } catch (error) {
      console.error('Failed to retrieve ingredients', error);
      throw new HttpException(
        'Failed to retrieve ingredients',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: number): Promise<Ingredient> {
    try {
      const ingredient = await this.ingredientRepository.findOne({
        where: { ingredientId: id },
      });
      if (!ingredient) {
        throw new HttpException('Ingredient not found', HttpStatus.NOT_FOUND);
      }
      return ingredient;
    } catch (error) {
      console.error('Failed to retrieve ingredient', error);
      throw new HttpException(
        'Failed to retrieve ingredient',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(
    id: number,
    updateIngredientDto: UpdateIngredientDto,
    imageFile?: Express.Multer.File,
  ): Promise<Ingredient> {
    try {
      const ingredient = await this.ingredientRepository.findOne({
        where: { ingredientId: id },
      });
      if (!ingredient) {
        throw new HttpException('Ingredient not found', HttpStatus.NOT_FOUND);
      }
      if (
        imageFile &&
        imageFile.filename &&
        ingredient.ingredientImage !== 'no-image.png'
      ) {
        const oldImagePath = path.join(
          './ingredient_images',
          ingredient.ingredientImage,
        );
        fs.unlinkSync(oldImagePath);
      }

      if (imageFile && imageFile.filename) {
        updateIngredientDto.ingredientImage = imageFile.filename;
      }
      const updatedIngredient = await this.ingredientRepository.save({
        ...ingredient,
        ...updateIngredientDto,
      });

      return updatedIngredient;
    } catch (error) {
      console.error('Failed to update Ingredient', error);
      throw new HttpException(
        'Failed to update Ingredient',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const ingredient = await this.ingredientRepository.findOne({
        where: { ingredientId: id },
      });
      if (!ingredient) {
        throw new HttpException('Ingredient not found', HttpStatus.NOT_FOUND);
      }
      if (
        ingredient.ingredientImage &&
        ingredient.ingredientImage !== 'no-image.png'
      ) {
        const imagePath = path.join(
          './ingredient_images',
          ingredient.ingredientImage,
        );
        fs.unlinkSync(imagePath);
      }
      await this.ingredientRepository.delete(id);
    } catch (error) {
      console.error('Failed to delete Ingredient', error);
      throw new HttpException(
        'Failed to delete Ingredient',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  async findLowStockIngredients(): Promise<Ingredient[]> {
    try {
      const ingredients = await this.ingredientRepository
        .createQueryBuilder('ingredient')
        .where(
          'ingredient.ingredientQuantityInStock < ingredient.ingredientMinimun',
        )
        .getMany();

      return ingredients;
    } catch (error) {
      console.error('Failed to retrieve low stock ingredients', error);
      throw new HttpException(
        'Failed to retrieve low stock ingredients',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
