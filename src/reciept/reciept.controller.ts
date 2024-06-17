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
  @Get('/top-selling-products')
  async getTopSellingProductsByDate(
    @Query('date') dateString: string,
  ): Promise<Product[]> {
    try {
      const date = new Date(dateString); // Convert query string to Date object
      const topProducts = await this.recieptService.getTopSellingProductsByDate(
        date,
      );
      return topProducts;
    } catch (error) {
      // Handle errors here
      throw error; // or return appropriate error response
    }
  }
  @Get('/grouped')
  async getGroupedReceipts(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);

      const groupedReceipts = await this.recieptService.getGroupedReceipts(
        start,
        end,
      );

      return groupedReceipts;
    } catch (error) {
      throw new HttpException(
        'Failed to fetch grouped receipts',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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
  @Get('daily-report')
  async getDailyReport() {
    return this.recieptService.getDailyReport();
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
