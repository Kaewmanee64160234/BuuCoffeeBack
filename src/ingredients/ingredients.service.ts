import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
    imageFile?: Express.Multer.File,
  ): Promise<Ingredient> {
    try {
      const newIngredient = new Ingredient();
      newIngredient.ingredientName = createIngredientDto.ingredientName;
      newIngredient.igredientSupplier = createIngredientDto.igredientSupplier;
      newIngredient.igredientMinimun = createIngredientDto.igredientMinimun;
      newIngredient.igredientUnit = createIngredientDto.igredientUnit;
      newIngredient.igredientQuantityInStock = 0;
      newIngredient.igredientRemining = 0;
      newIngredient.igredientQuantityPerUnit =
        createIngredientDto.igredientQuantityPerUnit;
      newIngredient.igredientQuantityPerSubUnit =
        createIngredientDto.igredientQuantityPerSubUnit;

      if (imageFile && imageFile.filename) {
        newIngredient.igredientImage = imageFile.filename; // Save filename instead of base64 string
      } else {
        newIngredient.igredientImage = 'no-image.png';
      }

      return await this.ingredientRepository.save(newIngredient);
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Failed to create Ingredient',
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
        where: { IngredientId: +ingredientId },
      });
      if (!ingredient) {
        throw new HttpException('Ingredient not found', HttpStatus.NOT_FOUND);
      }
      const updatedIngredient = await this.ingredientRepository.save({
        ...ingredient,
        IngredientImage: fileName,
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

  async findAll(): Promise<Ingredient[]> {
    try {
      return await this.ingredientRepository.find();
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve ingredients',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: number): Promise<Ingredient> {
    try {
      const ingredient = await this.ingredientRepository.findOne({
        where: { IngredientId: id },
      });
      if (!ingredient) {
        throw new HttpException('Ingredient not found', HttpStatus.NOT_FOUND);
      }
      return ingredient;
    } catch (error) {
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
        where: { IngredientId: id },
      });
      if (!ingredient) {
        throw new HttpException('Ingredient not found', HttpStatus.NOT_FOUND);
      }
      if (
        imageFile &&
        imageFile.filename &&
        ingredient.igredientImage !== 'no-image.png'
      ) {
        const oldImagePath = path.join(
          './ingredient_images',
          ingredient.igredientImage,
        );
        fs.unlinkSync(oldImagePath);
      }

      if (imageFile && imageFile.filename) {
        updateIngredientDto.igredientImage = imageFile.filename;
      }
      const updatedIngredient = await this.ingredientRepository.save({
        ...ingredient,
        ...updateIngredientDto,
      });

      return updatedIngredient;
    } catch (error) {
      throw new HttpException(
        'Failed to update Ingredient',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const ingredient = await this.ingredientRepository.findOne({
        where: { IngredientId: id },
      });
      if (!ingredient) {
        throw new HttpException('Ingredient not found', HttpStatus.NOT_FOUND);
      }
      if (
        ingredient.igredientImage &&
        ingredient.igredientImage !== 'no-image.png'
      ) {
        const imagePath = path.join(
          './ingredient_images',
          ingredient.igredientImage,
        );
        fs.unlinkSync(imagePath);
      }
      await this.ingredientRepository.delete(id);
    } catch (error) {
      throw new HttpException(
        'Failed to delete Ingredient',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
