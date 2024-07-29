import { Injectable } from '@nestjs/common';
import { CreateExportingredientitemDto } from './dto/create-exportingredientitem.dto';
import { UpdateExportingredientitemDto } from './dto/update-exportingredientitem.dto';

@Injectable()
export class ExportingredientitemsService {
  create(createExportingredientitemDto: CreateExportingredientitemDto) {
    return 'This action adds a new exportingredientitem';
  }

  findAll() {
    return `This action returns all exportingredientitems`;
  }

  findOne(id: number) {
    return `This action returns a #${id} exportingredientitem`;
  }

  update(id: number, updateExportingredientitemDto: UpdateExportingredientitemDto) {
    return `This action updates a #${id} exportingredientitem`;
  }

  remove(id: number) {
    return `This action removes a #${id} exportingredientitem`;
  }
}
