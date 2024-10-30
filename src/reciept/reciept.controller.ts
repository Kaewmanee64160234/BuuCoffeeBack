import {
  Controller,
  Get,
  Post,
  Body,
  HttpStatus,
  Param,
  Delete,
  HttpException,
  Query,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { RecieptService } from './reciept.service';
import { CreateRecieptDto } from './dto/create-reciept.dto';
import { UpdateRecieptDto } from './dto/update-reciept.dto';
import { Permissions } from 'src/decorators/permissions.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PermissionsGuard } from 'src/guards/roles.guard';
import { Reciept } from './entities/reciept.entity';

@Controller('receipts')
export class RecieptController {
  constructor(private readonly recieptService: RecieptService) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('จัดการสินค้า')
  create(@Body() createRecieptDto: CreateRecieptDto) {
    return this.recieptService.create(createRecieptDto);
  }
  @Get('query-date')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('ดูรายการสินค้า')
  async findAllQueryDate(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('receiptType') receiptType?: string,
  ): Promise<any[]> {
    try {
      if (!startDate || !endDate) {
        throw new HttpException(
          'startDate and endDate are required',
          HttpStatus.BAD_REQUEST,
        );
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new HttpException('Invalid date format', HttpStatus.BAD_REQUEST);
      }

      return await this.recieptService.findAllQueryDate(
        startDate,
        endDate,
        receiptType,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  // update
  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('จัดการสินค้า')
  update(@Param('id') id: string, @Body() updateRecieptDto: UpdateRecieptDto) {
    return this.recieptService.update(+id, updateRecieptDto);
  }
  @Get('ingredient-usage-report')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('ดูรายการสินค้า')
  async getIngredientUsageReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const today = new Date();
    const formatDate = (date: Date) => {
      return date.toISOString().split('T')[0];
    };

    const start = startDate ? new Date(startDate) : new Date(formatDate(today));
    const end = endDate ? new Date(endDate) : new Date(formatDate(today));
    end.setDate(end.getDate() + 1);
    return this.recieptService.generateIngredientUsageReport(start, end);
  }

  @Get('daily-report')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('ดูรายการสินค้า')
  async getDailyReport(@Query('receiptType') receiptType: string) {
    try {
      if (!receiptType) {
        throw new HttpException(
          'receiptType is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.recieptService.getDailyReport(receiptType);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  @Get('products-usage')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('ดูรายการสินค้า')
  async getProductsUsageByDateRangeAndReceiptType(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('receiptType') receiptType?: string,
  ) {
    try {
      const parsedStartDate: Date | undefined = startDate
        ? new Date(startDate)
        : undefined;
      const parsedEndDate: Date | undefined = endDate
        ? new Date(endDate)
        : undefined;

      if (parsedStartDate && isNaN(parsedStartDate.getTime())) {
        throw new HttpException(
          'Invalid startDate format',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (parsedEndDate && isNaN(parsedEndDate.getTime())) {
        throw new HttpException(
          'Invalid endDate format',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!receiptType) {
        throw new HttpException(
          'receiptType is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Adjust endDate to include the entire end date if it is defined
      if (parsedEndDate) {
        parsedEndDate.setDate(parsedEndDate.getDate() + 1);
      }

      return await this.recieptService.findAllProductsUsageByDateRangeAndReceiptType(
        receiptType,
        parsedStartDate,
        parsedEndDate,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get products usage',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('/grouped')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('ดูรายการสินค้า')
  async getGroupedReceipts(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('receiptType') receiptType: string,
  ) {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);

      const groupedReceipts = await this.recieptService.getGroupedReceipts(
        start,
        end,
        receiptType,
      );

      return groupedReceipts;
    } catch (error) {
      throw new HttpException(
        'Failed to fetch grouped receipts',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @Get('/coffee-summary')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('ดูรายการสินค้า')
  async getCoffeeReceiptsWithCostAndDiscounts(
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    try {
      const startDate = new Date(start);
      const endDate = new Date(end);

      return await this.recieptService.getCoffeeReceiptsWithCostAndDiscounts(
        startDate,
        endDate,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // getRecieptIn1Day
  // param typeOfProduct
  @Get('/receipt-in-1-day')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('ดูรายการสินค้า')
  async getRecieptIn1Day(@Query('typeOfProduct') typeOfProduct: string) {
    return this.recieptService.getRecieptIn1Day(typeOfProduct);
  }

  // getRecieptCateringIn24Hours
  @Get('/receipt-catering-in-24-hours')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('ดูรายการสินค้า')
  async getRecieptCateringIn24Hours() {
    return this.recieptService.getRecieptCateringIn24Hours();
  }

  @Get('paginate')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('ดูรายการสินค้า')
  async getReceipts(
    @Query('page') page = 1,
    @Query('limit') limit = 5,
    @Query('search') search = '',
  ): Promise<{ data: Reciept[]; total: number }> {
    return this.recieptService.getReceipts(page, limit, search);
  }

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('ดูรายการสินค้า')
  findAll() {
    return this.recieptService.findAll();
  }

  @Get('/sum')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('ดูรายการสินค้า')
  async getSumTodayByPaymentMethod(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<{
    startDate: string;
    endDate: string;
    coffee: {
      cash: number;
      qrcode: number;
    };
    food: {
      cash: number;
      qrcode: number;
    };
  }> {
    console.log('Start Date:', startDate);
    console.log('End Date:', endDate);

    const sumData = await this.recieptService.getSumByPaymentMethod(
      startDate,
      endDate,
    );

    return {
      startDate,
      endDate,
      coffee: {
        cash: sumData.coffee.cash,
        qrcode: sumData.coffee.qrcode,
      },
      food: {
        cash: sumData.food.cash,
        qrcode: sumData.food.qrcode,
      },
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('ดูรายการสินค้า')
  findOne(@Param('id') id: string) {
    return this.recieptService.findOne(+id);
  }

  // cancelReceipt from param
  @Delete('cancel/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('จัดการสินค้า')
  async cancelReceipt(@Param('id') id: string) {
    return this.recieptService.cancelReceipt(+id);
  }
  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('จัดการสินค้า')
  remove(@Param('id') id: string) {
    return this.recieptService.remove(+id);
  }

  // @Get('top-ingredients')
  // async findTopIngredients(): Promise<
  //   { ingredientName: string; count: number }[]
  // > {
  //   try {
  //     const topIngredients = await this.recieptService.findTopIngredients();
  //     return topIngredients.map((item) => ({
  //       ingredientName: item.ingredient.ingredientName,
  //       count: item.count,
  //     }));
  //   } catch (error) {
  //     console.error('Error fetching top ingredients:', error);
  //     throw error;
  //   }
  // }

  // @Get('paginate')
  // @UseGuards(JwtAuthGuard, PermissionsGuard)
  // @Permissions('ดูรายการใบเสร็จ')
  // async getReceipts(
  //   @Query('page') page = 1,
  //   @Query('limit') limit = 5,
  //   @Query('search') search = '',
  // ): Promise<{ data: Reciept[]; total: number }> {
  //   return this.recieptService.getReceipts(page, limit, search);
  // }
}
