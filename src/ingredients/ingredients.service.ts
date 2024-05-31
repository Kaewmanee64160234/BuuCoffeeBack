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
      newIngredient.nameIngredient = createIngredientDto.nameIngredient;
      newIngredient.supplier = createIngredientDto.supplier;
      newIngredient.minimun = createIngredientDto.minimun;
      newIngredient.unit = createIngredientDto.unit;
      newIngredient.quantityInStock = 0;
      newIngredient.quantityPerUnit = createIngredientDto.quantityPerUnit;

      if (imageFile && imageFile.filename) {
        // Check if filename exists
        newIngredient.IngredientImage = imageFile.filename; // Save filename instead of base64 string
      } else {
        newIngredient.IngredientImage = null;
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
      console.log('IngredientId', ingredientId);
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
    imageFile?: Express.Multer.File, // Make imageFile optional
  ): Promise<Ingredient> {
    try {
      const ingredient = await this.ingredientRepository.findOne({
        where: { IngredientId: id },
      });
      if (!ingredient) {
        throw new HttpException('Ingredient not found', HttpStatus.NOT_FOUND);
      }

      // Check if imageFile and its filename exist
      if (imageFile && imageFile.filename) {
        // Save the new filename to IngredientImage
        updateIngredientDto.IngredientImage = imageFile.filename;
      }

      // Merge the updated data with the existing ingredient
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
      await this.ingredientRepository.delete(id);
    } catch (error) {
      throw new HttpException(
        'Failed to delete Ingredient',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
