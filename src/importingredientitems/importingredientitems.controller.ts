import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ImportingredientitemsService } from './importingredientitems.service';
import { CreateImportingredientitemDto } from './dto/create-importingredientitem.dto';
import { UpdateImportingredientitemDto } from './dto/update-importingredientitem.dto';

@Controller('importingredientitems')
export class ImportingredientitemsController {
  constructor(
    private readonly importingredientitemsService: ImportingredientitemsService,
  ) {}

  @Post()
  create(@Body() createImportingredientitemDto: CreateImportingredientitemDto) {
    return this.importingredientitemsService.create(
      createImportingredientitemDto,
    );
  }

  @Get()
  findAll() {
    return this.importingredientitemsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.importingredientitemsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateImportingredientitemDto: UpdateImportingredientitemDto,
  ) {
    return this.importingredientitemsService.update(
      +id,
      updateImportingredientitemDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.importingredientitemsService.remove(+id);
  }
}
