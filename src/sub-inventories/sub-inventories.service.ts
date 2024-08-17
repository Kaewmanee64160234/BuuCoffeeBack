import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateSubInventoryDto } from './dto/create-sub-inventory.dto';
import { UpdateSubInventoryDto } from './dto/update-sub-inventory.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubInventory } from './entities/sub-inventory.entity';

@Injectable()
export class SubInventoriesService {
  constructor(
    @InjectRepository(SubInventory)
    private readonly subInventoryRepository: Repository<SubInventory>,
  ) {}
  create(createSubInventoryDto: CreateSubInventoryDto) {
    return 'This action adds a new subInventory';
  }

  async findAll() {
    try {
      return this.subInventoryRepository.find();
    } catch (error) {
      throw new HttpException(
        'Failed to fetch SubInventory',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} subInventory`;
  }

  update(id: number, updateSubInventoryDto: UpdateSubInventoryDto) {
    return `This action updates a #${id} subInventory`;
  }

  remove(id: number) {
    return `This action removes a #${id} subInventory`;
  }
}
