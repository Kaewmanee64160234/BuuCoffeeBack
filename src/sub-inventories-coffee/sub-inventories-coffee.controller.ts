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
import { SubInventoriesCoffeeService } from './sub-inventories-coffee.service';
import { CreateSubInventoriesCoffeeDto } from './dto/create-sub-inventories-coffee.dto';
import { UpdateSubInventoriesCoffeeDto } from './dto/update-sub-inventories-coffee.dto';
import { Permissions } from 'src/decorators/permissions.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';

@Controller('sub-inventories-coffee')
export class SubInventoriesCoffeeController {
  constructor(
    private readonly subInventoriesCoffeeService: SubInventoriesCoffeeService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('จัดการวัตถุดิบ')
  create(@Body() createSubInventoriesCoffeeDto: CreateSubInventoriesCoffeeDto) {
    return this.subInventoriesCoffeeService.create(
      createSubInventoriesCoffeeDto,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('ดูวัตถุดิบ')
  findAll() {
    return this.subInventoriesCoffeeService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('ดูวัตถุดิบ')
  findOne(@Param('id') id: string) {
    return this.subInventoriesCoffeeService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('จัดการวัตถุดิบ')
  remove(@Param('id') id: string) {
    return this.subInventoriesCoffeeService.remove(+id);
  }
}
