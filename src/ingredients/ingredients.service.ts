import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { Ingredient } from './entities/ingredient.entity';

@Injectable()
export class IngredientsService {
  constructor(
    @InjectRepository(Ingredient)
    private ingredientRepository: Repository<Ingredient>,
  ) {}
  create(
    createIngredientDto: CreateIngredientDto,
    imageFile: Express.Multer.File,
  ) {
    try {
      const newIngredient = new Ingredient();
      newIngredient.nameIngredient = createIngredientDto.nameIngredient;
      newIngredient.supplier = createIngredientDto.supplier;
      newIngredient.minimun = createIngredientDto.minimun;
      newIngredient.unit = createIngredientDto.unit;
      newIngredient.quantityInStock = 0;
      newIngredient.quantityPerUnit = createIngredientDto.quantityPerUnit;

      if (imageFile) {
        newIngredient.IngredientImage = Buffer.from(imageFile.buffer).toString(
          'base64',
        );
      } else {
        newIngredient.IngredientImage = null;
      }

      return this.ingredientRepository.save(newIngredient);
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Failed to create Ingredient',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findAll() {
    try {
      return await this.ingredientRepository.find();
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve products',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: number) {
    try {
      const ingredient = await this.ingredientRepository.findOne({
        where: { IngredientId: id },
      });
      if (!ingredient) {
        throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
      }
      return ingredient;
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve ingredient',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: number, updateIngredientDto: UpdateIngredientDto) {
    try {
      const ingredient = await this.ingredientRepository.findOne({
        where: { IngredientId: id },
      });
      if (!ingredient) {
        throw new HttpException('Ingredient not found', HttpStatus.NOT_FOUND);
      }
      if (updateIngredientDto.IngredientImage) {
        updateIngredientDto.IngredientImage = Buffer.from(
          updateIngredientDto.IngredientImage,
        ).toString('base64');
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

  remove(id: number) {
    try {
      const ingredient = this.ingredientRepository.findOne({
        where: { IngredientId: id },
      });
      if (!ingredient) {
        throw new HttpException('Customer not found', HttpStatus.NOT_FOUND);
      }
      return this.ingredientRepository.delete(id);
    } catch (error) {
      throw new HttpException(
        'Failed to update customer',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
