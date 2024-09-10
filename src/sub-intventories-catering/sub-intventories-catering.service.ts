import { Injectable } from '@nestjs/common';
import { CreateSubIntventoriesCateringDto } from './dto/create-sub-intventories-catering.dto';
import { UpdateSubIntventoriesCateringDto } from './dto/update-sub-intventories-catering.dto';

@Injectable()
export class SubIntventoriesCateringService {
  create(createSubIntventoriesCateringDto: CreateSubIntventoriesCateringDto) {
    return 'This action adds a new subIntventoriesCatering';
  }

  findAll() {
    return `This action returns all subIntventoriesCatering`;
  }

  findOne(id: number) {
    return `This action returns a #${id} subIntventoriesCatering`;
  }

  update(id: number, updateSubIntventoriesCateringDto: UpdateSubIntventoriesCateringDto) {
    return `This action updates a #${id} subIntventoriesCatering`;
  }

  remove(id: number) {
    return `This action removes a #${id} subIntventoriesCatering`;
  }
}
