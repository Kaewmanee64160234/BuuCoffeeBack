import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { PromotionsService } from './promotions.service';
import {
  CreatePromotionDto,
  QueryPromotionDto,
} from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { Permissions } from 'src/decorators/permissions.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PermissionsGuard } from 'src/guards/roles.guard';
@Controller('promotions')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('จัดการโปรโมชั่น')
  create(@Body() createPromotionDto: CreatePromotionDto) {
    return this.promotionsService.create(createPromotionDto);
  }
  @Get('usage')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('ดูโปรโมชั่น')
  async getPromotionsUsageByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    try {
      const parsedStartDate = new Date(startDate);
      const parsedEndDate = new Date(endDate);

      parsedEndDate.setDate(parsedEndDate.getDate() + 1);

      return await this.promotionsService.findAllPromotionsUsageByDateRange(
        parsedStartDate,
        parsedEndDate,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get promotions usage',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('ดูโปรโมชั่น')
  findAll() {
    return this.promotionsService.findAll();
  }

  @Get('search')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('ดูโปรโมชั่น')
  findByCriteria(@Query() query: QueryPromotionDto) {
    return this.promotionsService.findByCriteria(query);
  }

  // /promotions/paginate
  @Get('paginate')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('ดูโปรโมชั่น')
  paginate(
    @Query('search') search: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.promotionsService.getPromotionsPaginate(search, page, limit);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('ดูโปรโมชั่น')
  findOne(@Param('id') id: string) {
    return this.promotionsService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('จัดการโปรโมชั่น')
  update(
    @Param('id') id: string,
    @Body() updatePromotionDto: UpdatePromotionDto,
  ) {
    return this.promotionsService.update(+id, updatePromotionDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('จัดการโปรโมชั่น')
  remove(@Param('id') id: string) {
    return this.promotionsService.remove(+id);
  }

  // getPromotionByType
  @Get('type/:type')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('ดูโปรโมชั่น')
  getPromotionByType(@Param('type') type: string) {
    return this.promotionsService.getPromotionByType(type);
  }
}
