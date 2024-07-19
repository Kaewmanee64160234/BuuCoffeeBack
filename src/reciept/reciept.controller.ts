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
} from '@nestjs/common';
import { RecieptService } from './reciept.service';
import { CreateRecieptDto } from './dto/create-reciept.dto';
import { UpdateRecieptDto } from './dto/update-reciept.dto';
import { Product } from 'src/products/entities/product.entity';
@Controller('receipts')
export class RecieptController {
  constructor(private readonly recieptService: RecieptService) {}

  @Post()
  create(@Body() createRecieptDto: CreateRecieptDto) {
    return this.recieptService.create(createRecieptDto);
  }

  // update
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRecieptDto: UpdateRecieptDto) {
    return this.recieptService.update(+id, updateRecieptDto);
  }
  @Get('ingredient-usage-report')
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
  async getRecieptIn1Day(@Query('typeOfProduct') typeOfProduct: string) {
    return this.recieptService.getRecieptIn1Day(typeOfProduct);
  }

  @Get()
  findAll() {
    return this.recieptService.findAll();
  }
  @Get('/sum')
  async getSumTodayByPaymentMethod(): Promise<{
    cash: number;
    qrcode: number;
  }> {
    const cashSum = await this.recieptService.getSumByPaymentMethod('cash');
    const qrcodeSum = await this.recieptService.getSumByPaymentMethod('qrcode');
    return { cash: cashSum, qrcode: qrcodeSum };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.recieptService.findOne(+id);
  }
  @Get('/sum/:paymentMethod')
  async getSumByPaymentMethod(
    @Param('paymentMethod') paymentMethod: string,
  ): Promise<number> {
    return this.recieptService.getSumByPaymentMethod(paymentMethod);
  }
  // cancelReceipt from param
  @Delete('cancel/:id')
  async cancelReceipt(@Param('id') id: string) {
    return this.recieptService.cancelReceipt(+id);
  }
  @Delete(':id')
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
}
