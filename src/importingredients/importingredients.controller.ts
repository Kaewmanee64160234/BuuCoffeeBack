import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  Delete,
} from '@nestjs/common';
import { ImportingredientsService } from './importingredients.service';
import { CreateImportingredientDto } from './dto/create-importingredient.dto';
import { UpdateImportingredientDto } from './dto/update-importingredient.dto';

@Controller('importingredients')
export class ImportingredientsController {
  constructor(
    private readonly importingredientsService: ImportingredientsService,
  ) {}
  @Get('find-date')
  async findDate(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    try {
      const results = await this.importingredientsService.findDate(
        startDate,
        endDate,
      );
      return results;
    } catch (error) {
      throw new Error('Error fetching data');
    }
  }
  @Get('revenue')
  async getRevenue(): Promise<{
    receipts: { date: Date; receiptNetPrice: number }[];
    totalRevenue: number;
  }> {
    const { startDate, endDate } =
      await this.importingredientsService.getStartAndEndDate();
    const { receipts, totalRevenue } =
      await this.importingredientsService.getRevenueByPeriod(
        startDate,
        endDate,
      );
    return { receipts, totalRevenue };
  }

  @Get('expenditure')
  async getExpenditure(): Promise<{
    startDate: Date;
    endDate: Date;
    // totalExpenditure: number;
  }> {
    const { startDate, endDate } =
      await this.importingredientsService.getStartAndEndDate();
    const result = await this.importingredientsService.getExpenditureByPeriod(
      startDate,
      endDate,
    );
    return result;
  }

  @Post()
  create(@Body() createImportingredientDto: CreateImportingredientDto) {
    return this.importingredientsService.create(createImportingredientDto);
  }

  @Get()
  findAll() {
    return this.importingredientsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.importingredientsService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.importingredientsService.remove(+id);
  }
}
