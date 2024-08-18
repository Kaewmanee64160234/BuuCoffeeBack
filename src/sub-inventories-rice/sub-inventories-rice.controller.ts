import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SubInventoriesRiceService } from './sub-inventories-rice.service';
import { CreateSubInventoriesRiceDto } from './dto/create-sub-inventories-rice.dto';
import { UpdateSubInventoriesRiceDto } from './dto/update-sub-inventories-rice.dto';

@Controller('sub-inventories-rice')
export class SubInventoriesRiceController {
  constructor(private readonly subInventoriesRiceService: SubInventoriesRiceService) {}

  @Post()
  create(@Body() createSubInventoriesRiceDto: CreateSubInventoriesRiceDto) {
    return this.subInventoriesRiceService.create(createSubInventoriesRiceDto);
  }

  @Get()
  findAll() {
    return this.subInventoriesRiceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subInventoriesRiceService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSubInventoriesRiceDto: UpdateSubInventoriesRiceDto) {
    return this.subInventoriesRiceService.update(+id, updateSubInventoriesRiceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subInventoriesRiceService.remove(+id);
  }
}
