import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SubIntventoriesCateringService } from './sub-intventories-catering.service';
import { CreateSubIntventoriesCateringDto } from './dto/create-sub-intventories-catering.dto';
import { UpdateSubIntventoriesCateringDto } from './dto/update-sub-intventories-catering.dto';

@Controller('sub-intventories-catering')
export class SubIntventoriesCateringController {
  constructor(private readonly subIntventoriesCateringService: SubIntventoriesCateringService) {}

  @Post()
  create(@Body() createSubIntventoriesCateringDto: CreateSubIntventoriesCateringDto) {
    return this.subIntventoriesCateringService.create(createSubIntventoriesCateringDto);
  }

  @Get()
  findAll() {
    return this.subIntventoriesCateringService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subIntventoriesCateringService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSubIntventoriesCateringDto: UpdateSubIntventoriesCateringDto) {
    return this.subIntventoriesCateringService.update(+id, updateSubIntventoriesCateringDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subIntventoriesCateringService.remove(+id);
  }
}
