import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  Delete,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { CheckingredientsService } from './checkingredients.service';
import { CreateCheckingredientDto } from './dto/create-checkingredient.dto';
import { UpdateCheckingredientDto } from './dto/update-checkingredient.dto';
import { Checkingredient } from './entities/checkingredient.entity';
import { RolesGuard } from 'src/guards/roles.guard';
import { Permissions } from 'src/decorators/permissions.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateCateringEventDto } from 'src/catering-event/dto/create-catering-event.dto';

@Controller('checkingredients')
export class CheckingredientsController {
  constructor(
    private readonly checkingredientsService: CheckingredientsService,
  ) {}
  @Post('create-catering')
  async createForCatering(
    @Body() createCateringEventDto: CreateCateringEventDto,
  ) {
    try {
      const cateringEvent =
        await this.checkingredientsService.createForCatering(
          createCateringEventDto,
        );
      return {
        message: 'Catering event created successfully.',
        data: cateringEvent,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('จัดการการเช็ควัตถุดิบ')
  async create(@Body() createCheckingredientDto: CreateCheckingredientDto) {
    return await this.checkingredientsService.create(createCheckingredientDto);
  }

  @Post('without-inventory')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('จัดการการเช็ควัตถุดิบ')
  async createWithoutSubInventory(
    @Body() createCheckingredientDto: CreateCheckingredientDto,
  ) {
    return await this.checkingredientsService.createWithoutInventory(
      createCheckingredientDto,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('ดูการการเช็ควัตถุดิบ')
  async findAll(@Query('actionType') actionType?: string) {
    return this.checkingredientsService.findAll(actionType);
  }

  @Get('findByShopType')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('ดูการการเช็ควัตถุดิบ')
  async findByShopType(
    @Query('actionType') actionType?: string,
    @Query('shopType') shopType?: string,
  ): Promise<Checkingredient[]> {
    console.log('actionType', actionType);
    console.log('shopType', shopType);

    return this.checkingredientsService.findByShop(actionType, shopType);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('ดูการการเช็ควัตถุดิบ')
  findOne(@Param('id') id: string) {
    return this.checkingredientsService.findOne(+id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('จัดการการเช็ควัตถุดิบ')
  remove(@Param('id') id: string) {
    return this.checkingredientsService.remove(+id);
  }
}
