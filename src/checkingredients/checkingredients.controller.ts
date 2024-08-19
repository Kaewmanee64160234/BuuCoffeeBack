import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CheckingredientsService } from './checkingredients.service';
import { CreateCheckingredientDto } from './dto/create-checkingredient.dto';
import { UpdateCheckingredientDto } from './dto/update-checkingredient.dto';

@Controller('checkingredients')
export class CheckingredientsController {
  constructor(
    private readonly checkingredientsService: CheckingredientsService,
  ) {}

  @Post()
  async create(@Body() createCheckingredientDto: CreateCheckingredientDto) {
    return await this.checkingredientsService.create(createCheckingredientDto);
  }
  @Post('without-inventory')
  async createWithoutSubInventory(
    @Body() createCheckingredientDto: CreateCheckingredientDto,
  ) {
    return await this.checkingredientsService.createWithoutInventory(
      createCheckingredientDto,
    );
  }

  @Get()
  findAll() {
    return this.checkingredientsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.checkingredientsService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.checkingredientsService.remove(+id);
  }
}
