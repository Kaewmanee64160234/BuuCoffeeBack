import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProductTypeToppingsService } from './product-type-toppings.service';
import { CreateProductTypeToppingDto } from './dto/create-product-type-topping.dto';
import { UpdateProductTypeToppingDto } from './dto/update-product-type-topping.dto';

@Controller('product-type-toppings')
export class ProductTypeToppingsController {
  constructor(private readonly productTypeToppingsService: ProductTypeToppingsService) {}

  @Post()
  create(@Body() createProductTypeToppingDto: CreateProductTypeToppingDto) {
    return this.productTypeToppingsService.create(createProductTypeToppingDto);
  }

  @Get()
  findAll() {
    return this.productTypeToppingsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productTypeToppingsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductTypeToppingDto: UpdateProductTypeToppingDto) {
    return this.productTypeToppingsService.update(+id, updateProductTypeToppingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productTypeToppingsService.remove(+id);
  }
}
