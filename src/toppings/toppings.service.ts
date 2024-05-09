import { Injectable } from '@nestjs/common';
import { CreateToppingDto } from './dto/create-topping.dto';
import { UpdateToppingDto } from './dto/update-topping.dto';

@Injectable()
export class ToppingsService {
  create(createToppingDto: CreateToppingDto) {
    return 'This action adds a new topping';
  }

  findAll() {
    return `This action returns all toppings`;
  }

  findOne(id: number) {
    return `This action returns a #${id} topping`;
  }

  update(id: number, updateToppingDto: UpdateToppingDto) {
    return `This action updates a #${id} topping`;
  }

  remove(id: number) {
    return `This action removes a #${id} topping`;
  }
}
