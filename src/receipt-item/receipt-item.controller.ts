import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ReceiptItemService } from './receipt-item.service';
import { CreateReceiptItemDto } from './dto/create-receipt-item.dto';
import { UpdateReceiptItemDto } from './dto/update-receipt-item.dto';
import { Permissions } from 'src/decorators/permissions.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PermissionsGuard } from 'src/guards/roles.guard';

@Controller('receipt-item')
export class ReceiptItemController {
  constructor(private readonly receiptItemService: ReceiptItemService) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('จัดการสินค้า')
  create(@Body() createReceiptItemDto: CreateReceiptItemDto) {
    return this.receiptItemService.create(createReceiptItemDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('ดูรายการสินค้า')
  findAll() {
    return this.receiptItemService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('ดูรายการสินค้า')
  findOne(@Param('id') id: string) {
    return this.receiptItemService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('จัดการสินค้า')
  update(
    @Param('id') id: string,
    @Body() updateReceiptItemDto: UpdateReceiptItemDto,
  ) {
    return this.receiptItemService.update(+id, updateReceiptItemDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('จัดการสินค้า')
  remove(@Param('id') id: string) {
    return this.receiptItemService.remove(+id);
  }
}
