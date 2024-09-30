import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { ToppingsService } from './toppings.service';
import { CreateToppingDto } from './dto/create-topping.dto';
import { UpdateToppingDto } from './dto/update-topping.dto';
import { Topping } from './entities/topping.entity';
import { Permissions } from 'src/decorators/permissions.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';

@Controller('toppings')
export class ToppingsController {
  constructor(private readonly toppingsService: ToppingsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('จัดการท้อปปิ้ง')
  create(@Body() createToppingDto: CreateToppingDto) {
    return this.toppingsService.create(createToppingDto);
  }
  @Get('paginate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('ดูท้อปปิ้ง')
  async getToppings(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('search') search = '',
  ): Promise<{ data: Topping[]; total: number }> {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    if (isNaN(pageNumber) || isNaN(limitNumber)) {
      throw new BadRequestException('Invalid page or limit number');
    }

    return this.toppingsService.getToppings(pageNumber, limitNumber, search);
  }
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('ดูท้อปปิ้ง')
  findAll() {
    return this.toppingsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('ดูท้อปปิ้ง')
  findOne(@Param('id') id: string) {
    return this.toppingsService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('จัดการท้อปปิ้ง')
  update(@Param('id') id: string, @Body() updateToppingDto: UpdateToppingDto) {
    return this.toppingsService.update(+id, updateToppingDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('จัดการท้อปปิ้ง')
  remove(@Param('id') id: string) {
    return this.toppingsService.remove(+id);
  }
}
