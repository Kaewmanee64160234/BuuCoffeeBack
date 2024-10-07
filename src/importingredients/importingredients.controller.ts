import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ImportingredientsService } from './importingredients.service';
import { CreateImportingredientDto } from './dto/create-importingredient.dto';
import { UpdateImportingredientDto } from './dto/update-importingredient.dto';
import { Permissions } from 'src/decorators/permissions.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';

@Controller('importingredients')
export class ImportingredientsController {
  constructor(
    private readonly importingredientsService: ImportingredientsService,
  ) {}
  @Get('find-date')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('ดูการนำเข้าวัตถุดิบ')
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('ดูรายงาน')
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('ดูรายงาน')
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('จัดการการนำเข้าวัตถุดิบ')
  create(@Body() createImportingredientDto: CreateImportingredientDto) {
    return this.importingredientsService.create(createImportingredientDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('ดูการนำเข้าวัตถุดิบ')
  findAll() {
    return this.importingredientsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('ดูการนำเข้าวัตถุดิบ')
  findOne(@Param('id') id: string) {
    return this.importingredientsService.findOne(+id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('จัดการการนำเข้าวัตถุดิบ')
  remove(@Param('id') id: string) {
    return this.importingredientsService.remove(+id);
  }
}
