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
import { SubInventoriesRiceService } from './sub-inventories-rice.service';
import { CreateSubInventoriesRiceDto } from './dto/create-sub-inventories-rice.dto';
import { UpdateSubInventoriesRiceDto } from './dto/update-sub-inventories-rice.dto';
import { Permissions } from 'src/decorators/permissions.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';

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
