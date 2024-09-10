import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  Delete,
} from '@nestjs/common';
import { CheckingredientsService } from './checkingredients.service';
import { CreateCheckingredientDto } from './dto/create-checkingredient.dto';
import { UpdateCheckingredientDto } from './dto/update-checkingredient.dto';
import { Checkingredient } from './entities/checkingredient.entity';

@Controller('checkingredients')
export class CheckingredientsController {
  constructor(
    private readonly checkingredientsService: CheckingredientsService,
  ) {}

  @Post()
  async create(@Body() createCheckingredientDto: CreateCheckingredientDto) {
    return await this.checkingredientsService.create(createCheckingredientDto);
  }

  @Post('catering')
  async createCatering(
    @Body() createCheckingredientDto: CreateCheckingredientDto,
  ) {
    return await this.checkingredientsService.createForCatering(
      createCheckingredientDto,
    );
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
  async findAll(@Query('actionType') actionType?: string) {
    return this.checkingredientsService.findAll(actionType);
  }
  @Get('findByShopType')
  async findByShopType(
    @Query('actionType') actionType?: string,
    @Query('shopType') shopType?: string,
  ): Promise<Checkingredient[]> {
    return this.checkingredientsService.findByShop(actionType, shopType);
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
