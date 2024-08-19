import { Injectable } from '@nestjs/common';
import { CreateSubInventoriesRiceDto } from './dto/create-sub-inventories-rice.dto';
import { UpdateSubInventoriesRiceDto } from './dto/update-sub-inventories-rice.dto';
import { SubInventoriesRice } from './entities/sub-inventories-rice.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
@Injectable()
export class SubInventoriesRiceService {
  constructor(
    @InjectRepository(SubInventoriesRice)
    private riceShopSubInventoryRepository: Repository<SubInventoriesRice>,
  ) {}
  create(createSubInventoriesRiceDto: CreateSubInventoriesRiceDto) {
    return 'This action adds a new subInventoriesRice';
  }

  async findAll(): Promise<SubInventoriesRice[]> {
    return await this.riceShopSubInventoryRepository.find({
      relations: ['ingredient'],
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} subInventoriesRice`;
  }

  update(id: number, updateSubInventoriesRiceDto: UpdateSubInventoriesRiceDto) {
    return `This action updates a #${id} subInventoriesRice`;
  }

  remove(id: number) {
    return `This action removes a #${id} subInventoriesRice`;
  }
}
