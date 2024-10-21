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
import { SubInventoriesRiceService } from './sub-inventories-rice.service';
import { CreateSubInventoriesRiceDto } from './dto/create-sub-inventories-rice.dto';
import { UpdateSubInventoriesRiceDto } from './dto/update-sub-inventories-rice.dto';
import { Permissions } from 'src/decorators/permissions.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { SubInventoriesRice } from './entities/sub-inventories-rice.entity';

@Controller('sub-inventories-rice')
export class SubInventoriesRiceController {
  constructor(
    private readonly subInventoriesRiceService: SubInventoriesRiceService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('จัดการวัตถุดิบ')
  create(@Body() createSubInventoriesRiceDto: CreateSubInventoriesRiceDto) {
    return this.subInventoriesRiceService.create(createSubInventoriesRiceDto);
  }

  @Get('paginate')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Permissions('ดูรายการใบเสร็จ')
  async getReceipts(
    @Query('page') page = 1,
    @Query('limit') limit = 5,
    @Query('search') search = '',
  ): Promise<{ data: SubInventoriesRice[]; total: number }> {
    return this.subInventoriesRiceService.getSubInventoryRices(
      page,
      limit,
      search,
    );
  }

  @Get()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Permissions('ดูวัตถุดิบ')
  findAll() {
    return this.subInventoriesRiceService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('ดูวัตถุดิบ')
  findOne(@Param('id') id: string) {
    return this.subInventoriesRiceService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('จัดการวัตถุดิบ')
  update(
    @Param('id') id: string,
    @Body() updateSubInventoriesRiceDto: UpdateSubInventoriesRiceDto,
  ) {
    return this.subInventoriesRiceService.update(
      +id,
      updateSubInventoriesRiceDto,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('จัดการวัตถุดิบ')
  remove(@Param('id') id: string) {
    return this.subInventoriesRiceService.remove(+id);
  }
}
