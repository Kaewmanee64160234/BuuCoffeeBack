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
import { ProductTypeToppingsService } from './product-type-toppings.service';
import { CreateProductTypeToppingDto } from './dto/create-product-type-topping.dto';
import { UpdateProductTypeToppingDto } from './dto/update-product-type-topping.dto';
import { Permissions } from 'src/decorators/permissions.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';

@Controller('product-type-toppings')
export class ProductTypeToppingsController {
  constructor(
    private readonly productTypeToppingsService: ProductTypeToppingsService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('จัดการสินค้า')
  create(@Body() createProductTypeToppingDto: CreateProductTypeToppingDto) {
    return this.productTypeToppingsService.create(createProductTypeToppingDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('ดูรายการสินค้า')
  findAll() {
    return this.productTypeToppingsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('ดูรายการสินค้า')
  findOne(@Param('id') id: string) {
    return this.productTypeToppingsService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('จัดการสินค้า')
  update(
    @Param('id') id: string,
    @Body() updateProductTypeToppingDto: UpdateProductTypeToppingDto,
  ) {
    return this.productTypeToppingsService.update(
      +id,
      updateProductTypeToppingDto,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('จัดการสินค้า')
  remove(@Param('id') id: string) {
    return this.productTypeToppingsService.remove(+id);
  }
}
