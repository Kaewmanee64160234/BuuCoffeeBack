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
  Query,
  Req,
} from '@nestjs/common';
import { CashiersService } from './cashiers.service';
import { CreateCashierDto } from './dto/create-cashier.dto';
import { UpdateCashierDto } from './dto/update-cashier.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { Permissions } from 'src/decorators/permissions.decorator';
import { Cashier } from './entities/cashier.entity';
import { User } from 'src/users/entities/user.entity';

@Controller('cashiers')
export class CashiersController {
  constructor(private readonly cashiersService: CashiersService) {}

  @Post()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Permissions('ดูรายงาน')
  async create(@Body() createCashierDto: CreateCashierDto): Promise<Cashier> {
    try {
      return await this.cashiersService.create(createCashierDto); // ส่ง userId ไปยัง service
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
  @Get('is-created-today')
  async isCashierCreatedToday(): Promise<{ isCreatedToday: boolean }> {
    try {
      const isCreatedToday = await this.cashiersService.isCashierCreatedToday();
      return { isCreatedToday };
    } catch (error) {
      throw new HttpException(
        'Could not check if cashier is created today',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // paginate
  @Get('paginate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('ดูรายงาน')
  paginate(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.cashiersService.paginate(+page, +limit);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('ดูรายงาน')
  findAll() {
    return this.cashiersService.findAll();
  }
  @Get('today')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('ดูรายงาน')
  findToday() {
    return this.cashiersService.findToday();
  }
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('ดูรายงาน')
  findOne(@Param('id') id: string) {
    return this.cashiersService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('ดูรายงาน')
  update(@Param('id') id: string, @Body() updateCashierDto: UpdateCashierDto) {
    return this.cashiersService.update(+id, updateCashierDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('ดูรายงาน')
  remove(@Param('id') id: string) {
    return this.cashiersService.softDelete(+id);
  }
}
