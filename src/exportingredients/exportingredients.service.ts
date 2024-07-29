import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateExportingredientDto } from './dto/create-exportingredient.dto';
import { Exportingredient } from './entities/exportingredient.entity';
import { UpdateExportingredientDto } from './dto/update-exportingredient.dto';

@Injectable()
export class ExportIngredientService {
  constructor(
    @InjectRepository(Exportingredient)
    private exportIngredientRepository: Repository<Exportingredient>,
  ) {}

  async create(
    createExportingredientDto: CreateExportingredientDto,
  ): Promise<Exportingredient> {
    const exportIngredient = this.exportIngredientRepository.create(
      createExportingredientDto,
    );
    if (!exportIngredient.exportDate) {
      exportIngredient.exportDate = new Date();
    }
    return this.exportIngredientRepository.save(exportIngredient);
  }

  findAll() {
    return `This action returns all exportingredients`;
  }

  findOne(id: number) {
    return `This action returns a #${id} exportingredient`;
  }

  update(id: number, updateExportingredientDto: UpdateExportingredientDto) {
    return `This action updates a #${id} exportingredient`;
  }

  remove(id: number) {
    return `This action removes a #${id} exportingredient`;
  }
}
