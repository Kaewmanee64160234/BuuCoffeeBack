import { Injectable } from '@nestjs/common';
import { CreateImportingredientitemDto } from './dto/create-importingredientitem.dto';
import { UpdateImportingredientitemDto } from './dto/update-importingredientitem.dto';

@Injectable()
export class ImportingredientitemsService {
  create(createImportingredientitemDto: CreateImportingredientitemDto) {
    return 'This action adds a new importingredientitem';
  }

  findAll() {
    return `This action returns all importingredientitems`;
  }

  findOne(id: number) {
    return `This action returns a #${id} importingredientitem`;
  }

  update(
    id: number,
    updateImportingredientitemDto: UpdateImportingredientitemDto,
  ) {
    return `This action updates a #${id} importingredientitem`;
  }

  remove(id: number) {
    return `This action removes a #${id} importingredientitem`;
  }
}
