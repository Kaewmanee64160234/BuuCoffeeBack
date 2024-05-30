import { Injectable } from '@nestjs/common';
import { CreateCheckingredientitemDto } from './dto/create-checkingredientitem.dto';
import { UpdateCheckingredientitemDto } from './dto/update-checkingredientitem.dto';

@Injectable()
export class CheckingredientitemsService {
  create(createCheckingredientitemDto: CreateCheckingredientitemDto) {
    return 'This action adds a new checkingredientitem';
  }

  findAll() {
    return `This action returns all checkingredientitems`;
  }

  findOne(id: number) {
    return `This action returns a #${id} checkingredientitem`;
  }

  update(
    id: number,
    updateCheckingredientitemDto: UpdateCheckingredientitemDto,
  ) {
    return `This action updates a #${id} checkingredientitem`;
  }

  remove(id: number) {
    return `This action removes a #${id} checkingredientitem`;
  }
}
