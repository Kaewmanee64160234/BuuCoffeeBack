import { Injectable } from '@nestjs/common';
import { CreateSubInventoriesCoffeeDto } from './dto/create-sub-inventories-coffee.dto';
import { UpdateSubInventoriesCoffeeDto } from './dto/update-sub-inventories-coffee.dto';
import { SubInventoriesCoffee } from './entities/sub-inventories-coffee.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class SubInventoriesCoffeeService {
  constructor(
    @InjectRepository(SubInventoriesCoffee)
    private coffeeShopSubInventoryRepository: Repository<SubInventoriesCoffee>,
  ) {}
  create(createSubInventoriesCoffeeDto: CreateSubInventoriesCoffeeDto) {
    return 'This action adds a new subInventoriesCoffee';
  }

  async findAll(): Promise<SubInventoriesCoffee[]> {
    return await this.coffeeShopSubInventoryRepository.find({
      relations: ['ingredient'],
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} subInventoriesCoffee`;
  }

  update(
    id: number,
    updateSubInventoriesCoffeeDto: UpdateSubInventoriesCoffeeDto,
  ) {
    return `This action updates a #${id} subInventoriesCoffee`;
  }

  remove(id: number) {
    return `This action removes a #${id} subInventoriesCoffee`;
  }
}
