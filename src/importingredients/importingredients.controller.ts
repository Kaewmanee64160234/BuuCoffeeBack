import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ImportingredientsService } from './importingredients.service';
import { CreateImportingredientDto } from './dto/create-importingredient.dto';
import { UpdateImportingredientDto } from './dto/update-importingredient.dto';

@Controller('importingredients')
export class ImportingredientsController {
  constructor(
    private readonly importingredientsService: ImportingredientsService,
  ) {}

  @Post()
  create(@Body() createImportingredientDto: CreateImportingredientDto) {
    return this.importingredientsService.create(createImportingredientDto);
  }

  @Get()
  findAll() {
    return this.importingredientsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.importingredientsService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.importingredientsService.remove(+id);
  }
}
