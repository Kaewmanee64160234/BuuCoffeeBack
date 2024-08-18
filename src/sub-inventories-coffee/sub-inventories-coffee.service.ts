import { Injectable } from '@nestjs/common';
import { CreateSubInventoriesCoffeeDto } from './dto/create-sub-inventories-coffee.dto';
import { UpdateSubInventoriesCoffeeDto } from './dto/update-sub-inventories-coffee.dto';

@Injectable()
export class SubInventoriesCoffeeService {
  create(createSubInventoriesCoffeeDto: CreateSubInventoriesCoffeeDto) {
    return 'This action adds a new subInventoriesCoffee';
  }

  findAll() {
    return `This action returns all subInventoriesCoffee`;
  }

  findOne(id: number) {
    return `This action returns a #${id} subInventoriesCoffee`;
  }

  update(id: number, updateSubInventoriesCoffeeDto: UpdateSubInventoriesCoffeeDto) {
    return `This action updates a #${id} subInventoriesCoffee`;
  }

  remove(id: number) {
    return `This action removes a #${id} subInventoriesCoffee`;
  }
}
