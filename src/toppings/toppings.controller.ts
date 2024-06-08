import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { ToppingsService } from './toppings.service';
import { CreateToppingDto } from './dto/create-topping.dto';
import { UpdateToppingDto } from './dto/update-topping.dto';
import { Topping } from './entities/topping.entity';

@Controller('toppings')
export class ToppingsController {
  constructor(private readonly toppingsService: ToppingsService) {}

  @Post()
  create(@Body() createToppingDto: CreateToppingDto) {
    return this.toppingsService.create(createToppingDto);
  }
  @Get('paginate')
  async getToppings(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('search') search = '',
  ): Promise<{ data: Topping[]; total: number }> {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    if (isNaN(pageNumber) || isNaN(limitNumber)) {
      throw new BadRequestException('Invalid page or limit number');
    }

    return this.toppingsService.getToppings(pageNumber, limitNumber, search);
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
