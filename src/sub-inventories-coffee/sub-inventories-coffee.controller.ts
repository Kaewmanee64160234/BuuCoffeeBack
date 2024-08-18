import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SubInventoriesCoffeeService } from './sub-inventories-coffee.service';
import { CreateSubInventoriesCoffeeDto } from './dto/create-sub-inventories-coffee.dto';
import { UpdateSubInventoriesCoffeeDto } from './dto/update-sub-inventories-coffee.dto';

@Controller('sub-inventories-coffee')
export class SubInventoriesCoffeeController {
  constructor(private readonly subInventoriesCoffeeService: SubInventoriesCoffeeService) {}

  @Post()
  create(@Body() createSubInventoriesCoffeeDto: CreateSubInventoriesCoffeeDto) {
    return this.subInventoriesCoffeeService.create(createSubInventoriesCoffeeDto);
  }

  @Get()
  findAll() {
    return this.subInventoriesCoffeeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subInventoriesCoffeeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSubInventoriesCoffeeDto: UpdateSubInventoriesCoffeeDto) {
    return this.subInventoriesCoffeeService.update(+id, updateSubInventoriesCoffeeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subInventoriesCoffeeService.remove(+id);
  }
}
