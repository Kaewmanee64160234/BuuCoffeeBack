import { Injectable } from '@nestjs/common';
import { CreateSubInventoriesRiceDto } from './dto/create-sub-inventories-rice.dto';
import { UpdateSubInventoriesRiceDto } from './dto/update-sub-inventories-rice.dto';

@Injectable()
export class SubInventoriesRiceService {
  create(createSubInventoriesRiceDto: CreateSubInventoriesRiceDto) {
    return 'This action adds a new subInventoriesRice';
  }

  findAll() {
    return `This action returns all subInventoriesRice`;
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
