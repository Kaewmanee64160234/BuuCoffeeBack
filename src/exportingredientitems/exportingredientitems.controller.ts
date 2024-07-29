import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ExportingredientitemsService } from './exportingredientitems.service';
import { CreateExportingredientitemDto } from './dto/create-exportingredientitem.dto';
import { UpdateExportingredientitemDto } from './dto/update-exportingredientitem.dto';

@Controller('exportingredientitems')
export class ExportingredientitemsController {
  constructor(private readonly exportingredientitemsService: ExportingredientitemsService) {}

  @Post()
  create(@Body() createExportingredientitemDto: CreateExportingredientitemDto) {
    return this.exportingredientitemsService.create(createExportingredientitemDto);
  }

  @Get()
  findAll() {
    return this.exportingredientitemsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.exportingredientitemsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateExportingredientitemDto: UpdateExportingredientitemDto) {
    return this.exportingredientitemsService.update(+id, updateExportingredientitemDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.exportingredientitemsService.remove(+id);
  }
}
