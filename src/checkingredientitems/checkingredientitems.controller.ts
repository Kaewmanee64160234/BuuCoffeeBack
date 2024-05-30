import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CheckingredientitemsService } from './checkingredientitems.service';
import { CreateCheckingredientitemDto } from './dto/create-checkingredientitem.dto';
import { UpdateCheckingredientitemDto } from './dto/update-checkingredientitem.dto';

@Controller('checkingredientitems')
export class CheckingredientitemsController {
  constructor(private readonly checkingredientitemsService: CheckingredientitemsService) {}

  @Post()
  create(@Body() createCheckingredientitemDto: CreateCheckingredientitemDto) {
    return this.checkingredientitemsService.create(createCheckingredientitemDto);
  }

  @Get()
  findAll() {
    return this.checkingredientitemsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.checkingredientitemsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCheckingredientitemDto: UpdateCheckingredientitemDto) {
    return this.checkingredientitemsService.update(+id, updateCheckingredientitemDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.checkingredientitemsService.remove(+id);
  }
}
