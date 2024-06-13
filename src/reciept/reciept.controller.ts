import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { RecieptService } from './reciept.service';
import { CreateRecieptDto } from './dto/create-reciept.dto';
import { UpdateRecieptDto } from './dto/update-reciept.dto';

@Controller('receipts')
export class RecieptController {
  constructor(private readonly recieptService: RecieptService) {}

  @Post()
  create(@Body() createRecieptDto: CreateRecieptDto) {
    return this.recieptService.create(createRecieptDto);
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

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.recieptService.remove(+id);
  }
}
