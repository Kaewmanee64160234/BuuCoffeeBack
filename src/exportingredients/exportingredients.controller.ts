import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ExportIngredientService } from './exportingredients.service';
import { CreateExportingredientDto } from './dto/create-exportingredient.dto';
import { UpdateExportingredientDto } from './dto/update-exportingredient.dto';

@Controller('exportingredients')
export class ExportingredientsController {
  constructor(
    private readonly exportingredientsService: ExportIngredientService,
  ) {}

  @Post()
  create(@Body() createExportingredientDto: CreateExportingredientDto) {
    return this.exportingredientsService.create(createExportingredientDto);
  }

  @Get()
  findAll() {
    return this.exportingredientsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.exportingredientsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateExportingredientDto: UpdateExportingredientDto,
  ) {
    return this.exportingredientsService.update(+id, updateExportingredientDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.exportingredientsService.remove(+id);
  }
}
