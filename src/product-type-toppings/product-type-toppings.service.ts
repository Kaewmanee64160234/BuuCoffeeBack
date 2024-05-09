import { Injectable } from '@nestjs/common';
import { CreateProductTypeToppingDto } from './dto/create-product-type-topping.dto';
import { UpdateProductTypeToppingDto } from './dto/update-product-type-topping.dto';

@Injectable()
export class ProductTypeToppingsService {
  create(createProductTypeToppingDto: CreateProductTypeToppingDto) {
    return 'This action adds a new productTypeTopping';
  }

  findAll() {
    return `This action returns all productTypeToppings`;
  }

  findOne(id: number) {
    return `This action returns a #${id} productTypeTopping`;
  }

  update(id: number, updateProductTypeToppingDto: UpdateProductTypeToppingDto) {
    return `This action updates a #${id} productTypeTopping`;
  }

  remove(id: number) {
    return `This action removes a #${id} productTypeTopping`;
  }
}
