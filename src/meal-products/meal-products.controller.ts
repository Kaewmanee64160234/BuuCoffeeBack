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
import { MealProductsService } from './meal-products.service';
import { CreateMealProductDto } from './dto/create-meal-product.dto';
import { UpdateMealProductDto } from './dto/update-meal-product.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PermissionsGuard } from 'src/guards/roles.guard';
import { Permissions } from 'src/decorators/permissions.decorator';

@Controller('meal-products')
export class MealProductsController {
  constructor(private readonly mealProductsService: MealProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('จัดการข้อมูลเลี้ยงรับรอง')
  create(@Body() createMealProductDto: CreateMealProductDto) {
    return this.mealProductsService.create(createMealProductDto);
  }

  @Get()
  findAll() {
    return this.mealProductsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('จัดการข้อมูลเลี้ยงรับรอง')
  findOne(@Param('id') id: string) {
    return this.mealProductsService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('จัดการข้อมูลเลี้ยงรับรอง')
  update(
    @Param('id') id: string,
    @Body() updateMealProductDto: UpdateMealProductDto,
  ) {
    return this.mealProductsService.update(+id, updateMealProductDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('จัดการข้อมูลเลี้ยงรับรอง')
  remove(@Param('id') id: string) {
    return this.mealProductsService.remove(+id);
  }
}
