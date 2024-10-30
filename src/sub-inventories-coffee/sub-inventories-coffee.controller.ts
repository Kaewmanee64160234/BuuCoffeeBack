import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { SubInventoriesCoffeeService } from './sub-inventories-coffee.service';
import { CreateSubInventoriesCoffeeDto } from './dto/create-sub-inventories-coffee.dto';
import { UpdateSubInventoriesCoffeeDto } from './dto/update-sub-inventories-coffee.dto';
import { Permissions } from 'src/decorators/permissions.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PermissionsGuard } from 'src/guards/roles.guard';
import { SubInventoriesCoffee } from './entities/sub-inventories-coffee.entity';

@Controller('sub-inventories-coffee')
export class SubInventoriesCoffeeController {
  constructor(
    private readonly subInventoriesCoffeeService: SubInventoriesCoffeeService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('จัดการวัตถุดิบ')
  create(@Body() createSubInventoriesCoffeeDto: CreateSubInventoriesCoffeeDto) {
    return this.subInventoriesCoffeeService.create(
      createSubInventoriesCoffeeDto,
    );
  }

  @Get('paginate')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('ดูวัตถุดิบ')
  async getReceipts(
    @Query('page') page = 1,
    @Query('limit') limit = 5,
    @Query('search') search = '',
  ): Promise<{ data: SubInventoriesCoffee[]; total: number }> {
    return this.subInventoriesCoffeeService.getSubInventoryCoffees(
      page,
      limit,
      search,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('ดูวัตถุดิบ')
  findAll() {
    return this.subInventoriesCoffeeService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('ดูวัตถุดิบ')
  findOne(@Param('id') id: string) {
    return this.subInventoriesCoffeeService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('จัดการวัตถุดิบ')
  update(
    @Param('id') id: string,
    @Body() updateSubInventoriesCoffeeDto: UpdateSubInventoriesCoffeeDto,
  ) {
    return this.subInventoriesCoffeeService.update(
      +id,
      updateSubInventoriesCoffeeDto,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('จัดการวัตถุดิบ')
  remove(@Param('id') id: string) {
    return this.subInventoriesCoffeeService.remove(+id);
  }

  // @Get('paginate')
  // // @UseGuards(JwtAuthGuard, PermissionsGuard)
  // // @Permissions('ดูรายการใบเสร็จ')
  // async getReceipts(
  //   @Query('page') page = 1,
  //   @Query('limit') limit = 5,
  //   @Query('search') search = '',
  // ): Promise<{ data: SubInventoriesCoffee[]; total: number }> {
  //   return this.subInventoriesCoffeeService.getSubInventoryCoffees(
  //     page,
  //     limit,
  //     search,
  //   );
  // }
}
