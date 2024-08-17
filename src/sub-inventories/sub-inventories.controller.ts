import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SubInventoriesService } from './sub-inventories.service';
import { CreateSubInventoryDto } from './dto/create-sub-inventory.dto';
import { UpdateSubInventoryDto } from './dto/update-sub-inventory.dto';

@Controller('sub-inventories')
export class SubInventoriesController {
  constructor(private readonly subInventoriesService: SubInventoriesService) {}

  @Post()
  create(@Body() createSubInventoryDto: CreateSubInventoryDto) {
    return this.subInventoriesService.create(createSubInventoryDto);
  }

  @Get()
  findAll() {
    return this.subInventoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subInventoriesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSubInventoryDto: UpdateSubInventoryDto,
  ) {
    return this.subInventoriesService.update(+id, updateSubInventoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subInventoriesService.remove(+id);
  }
}
