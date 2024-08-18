import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { IngredientusagelogService } from './ingredientusagelog.service';
import { CreateIngredientusagelogDto } from './dto/create-ingredientusagelog.dto';
import { UpdateIngredientusagelogDto } from './dto/update-ingredientusagelog.dto';

@Controller('ingredientusagelog')
export class IngredientusagelogController {
  constructor(private readonly ingredientusagelogService: IngredientusagelogService) {}

  @Post()
  create(@Body() createIngredientusagelogDto: CreateIngredientusagelogDto) {
    return this.ingredientusagelogService.create(createIngredientusagelogDto);
  }

  @Get()
  findAll() {
    return this.ingredientusagelogService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ingredientusagelogService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateIngredientusagelogDto: UpdateIngredientusagelogDto) {
    return this.ingredientusagelogService.update(+id, updateIngredientusagelogDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ingredientusagelogService.remove(+id);
  }
}
