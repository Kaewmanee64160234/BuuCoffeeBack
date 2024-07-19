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
} from '@nestjs/common';
import { PromotionsService } from './promotions.service';
import {
  CreatePromotionDto,
  QueryPromotionDto,
} from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';

@Controller('promotions')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Post()
  create(@Body() createPromotionDto: CreatePromotionDto) {
    return this.promotionsService.create(createPromotionDto);
  }
  @Get('usage')
  async getPromotionsUsageByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    try {
      const parsedStartDate = new Date(startDate);
      const parsedEndDate = new Date(endDate);

      if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
        throw new HttpException('Invalid date format', HttpStatus.BAD_REQUEST);
      }

      // Adjust endDate to include the entire end date
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
  findAll() {
    return this.promotionsService.findAll();
  }

  @Get('search')
  findByCriteria(@Query() query: QueryPromotionDto) {
    return this.promotionsService.findByCriteria(query);
  }

  // /promotions/paginate
  @Get('paginate')
  paginate(
    @Query('search') search: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.promotionsService.getPromotionsPaginate(search, page, limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.promotionsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePromotionDto: UpdatePromotionDto,
  ) {
    return this.promotionsService.update(+id, updatePromotionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.promotionsService.remove(+id);
  }

  // getPromotionByType
  @Get('type/:type')
  getPromotionByType(@Param('type') type: string) {
    return this.promotionsService.getPromotionByType(type);
  }
}
