import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ToppingsService } from './toppings.service';
import { CreateToppingDto } from './dto/create-topping.dto';
import { UpdateToppingDto } from './dto/update-topping.dto';

@Controller('toppings')
export class ToppingsController {
  constructor(private readonly toppingsService: ToppingsService) {}

  @Post()
  create(@Body() createToppingDto: CreateToppingDto) {
    return this.toppingsService.create(createToppingDto);
  }

  @Get()
  findAll() {
    return this.toppingsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.toppingsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateToppingDto: UpdateToppingDto) {
    return this.toppingsService.update(+id, updateToppingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.toppingsService.remove(+id);
  }
}
