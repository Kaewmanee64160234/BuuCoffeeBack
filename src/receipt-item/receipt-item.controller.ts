import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ReceiptItemService } from './receipt-item.service';
import { CreateReceiptItemDto } from './dto/create-receipt-item.dto';
import { UpdateReceiptItemDto } from './dto/update-receipt-item.dto';

@Controller('receipt-item')
export class ReceiptItemController {
  constructor(private readonly receiptItemService: ReceiptItemService) {}

  @Post()
  create(@Body() createReceiptItemDto: CreateReceiptItemDto) {
    return this.receiptItemService.create(createReceiptItemDto);
  }

  @Get()
  findAll() {
    return this.receiptItemService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.receiptItemService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateReceiptItemDto: UpdateReceiptItemDto,
  ) {
    return this.receiptItemService.update(+id, updateReceiptItemDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.receiptItemService.remove(+id);
  }
}
