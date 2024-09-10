import { Injectable } from '@nestjs/common';
import { CreateSubIntventoriesCateringDto } from './dto/create-sub-intventories-catering.dto';
import { UpdateSubIntventoriesCateringDto } from './dto/update-sub-intventories-catering.dto';
import { SubIntventoriesCatering } from './entities/sub-intventories-catering.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class SubIntventoriesCateringService {
  constructor(
    @InjectRepository(SubIntventoriesCatering)
    private cateringShopSubInventoryRepository: Repository<SubIntventoriesCatering>,
  ) {}
  create(createSubIntventoriesCateringDto: CreateSubIntventoriesCateringDto) {
    return 'This action adds a new subIntventoriesCatering';
  }
  async findAll(): Promise<SubIntventoriesCatering[]> {
    return await this.cateringShopSubInventoryRepository.find({
      relations: ['ingredient'],
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} subIntventoriesCatering`;
  }

  update(
    id: number,
    updateSubIntventoriesCateringDto: UpdateSubIntventoriesCateringDto,
  ) {
    return `This action updates a #${id} subIntventoriesCatering`;
  }

  remove(id: number) {
    return `This action removes a #${id} subIntventoriesCatering`;
  }
}
