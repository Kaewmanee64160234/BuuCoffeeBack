import { Injectable } from '@nestjs/common';
import { CreateIngredientusagelogDto } from './dto/create-ingredientusagelog.dto';
import { UpdateIngredientusagelogDto } from './dto/update-ingredientusagelog.dto';

@Injectable()
export class IngredientusagelogService {
  create(createIngredientusagelogDto: CreateIngredientusagelogDto) {
    return 'This action adds a new ingredientusagelog';
  }

  findAll() {
    return `This action returns all ingredientusagelog`;
  }

  findOne(id: number) {
    return `This action returns a #${id} ingredientusagelog`;
  }

  update(id: number, updateIngredientusagelogDto: UpdateIngredientusagelogDto) {
    return `This action updates a #${id} ingredientusagelog`;
  }

  remove(id: number) {
    return `This action removes a #${id} ingredientusagelog`;
  }
}
