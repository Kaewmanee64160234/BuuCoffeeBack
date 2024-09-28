import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { CashiersService } from './cashiers.service';
import { CreateCashierDto } from './dto/create-cashier.dto';
import { UpdateCashierDto } from './dto/update-cashier.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { Permissions } from 'src/decorators/permissions.decorator';

@Controller('cashiers')
export class CashiersController {
  constructor(private readonly cashiersService: CashiersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('แคชเชียร์')
  create(@Body() createCashierDto: CreateCashierDto) {
    return this.cashiersService.create(createCashierDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('แคชเชียร์')
  findAll() {
    return this.cashiersService.findAll();
  }
  @Get('today')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('แคชเชียร์')
  findToday() {
    return this.cashiersService.findToday();
  }
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('แคชเชียร์')
  findOne(@Param('id') id: string) {
    return this.cashiersService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('แคชเชียร์')
  update(@Param('id') id: string, @Body() updateCashierDto: UpdateCashierDto) {
    return this.cashiersService.update(+id, updateCashierDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('แคชเชียร์')
  remove(@Param('id') id: string) {
    return this.cashiersService.softDelete(+id);
  }
}
