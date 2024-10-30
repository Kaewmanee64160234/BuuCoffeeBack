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
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { CashiersService } from './cashiers.service';
import { CreateCashierDto } from './dto/create-cashier.dto';
import { UpdateCashierDto } from './dto/update-cashier.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PermissionsGuard } from 'src/guards/roles.guard';
import { Permissions } from 'src/decorators/permissions.decorator';
import { Cashier, CashierType } from './entities/cashier.entity';
import { User } from 'src/users/entities/user.entity';

@Controller('cashiers')
export class CashiersController {
  constructor(private readonly cashiersService: CashiersService) {}

  @Post()
  // @UseGuards(JwtAuthGuard, PermissionsGuard)
  // @Permissions('ดูรายงาน')
  async create(@Body() createCashierDto: CreateCashierDto): Promise<Cashier> {
    try {
      return await this.cashiersService.create(createCashierDto); // ส่ง userId ไปยัง service
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
  @Get('check-today')
  async checkTodayCashiers(): Promise<{ rice: boolean; coffee: boolean }> {
    return this.cashiersService.checkCashierTodayForTypes();
  }
  // paginate
  @Get('paginate')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('ดูรายงาน')
  paginate(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.cashiersService.paginate(+page, +limit);
  }

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('ดูรายงาน')
  findAll() {
    return this.cashiersService.findAll();
  }
  @Get('today')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('ดูรายงาน')
  findToday() {
    return this.cashiersService.checkCashierTodayForTypes();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('ดูรายงาน')
  findOne(@Param('id') id: string) {
    return this.cashiersService.findOne(+id);
  }
  @Post('close/:type/:userId')
  async closeCashier(
    @Param('type') type: CashierType,
    @Param('userId', ParseIntPipe) userId: number,
    @Body() createCashierDto: CreateCashierDto,
  ): Promise<any> {
    try {
      const closedCashier = await this.cashiersService.closeCashier(
        type,
        userId,
        createCashierDto,
      );
      return {
        message: 'Cashier closed successfully',
        data: closedCashier,
      };
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('ดูรายงาน')
  update(@Param('id') id: string, @Body() updateCashierDto: UpdateCashierDto) {
    return this.cashiersService.update(+id, updateCashierDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('ดูรายงาน')
  remove(@Param('id') id: string) {
    return this.cashiersService.softDelete(+id);
  }
}
