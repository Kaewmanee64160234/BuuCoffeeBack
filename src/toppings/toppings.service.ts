import { Injectable } from '@nestjs/common';
import { CreateToppingDto } from './dto/create-topping.dto';
import { UpdateToppingDto } from './dto/update-topping.dto';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Topping } from './entities/topping.entity';
import { Product } from 'src/products/entities/product.entity';

@Injectable()
export class ToppingsService {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(Topping)
    private toppingRepository: Repository<Topping>,
  ) {}

  create(createToppingDto: CreateToppingDto) {
    try {
      const newTopping = new Topping();
      newTopping.toppingName = createToppingDto.toppingName;
      newTopping.toppingPrice = createToppingDto.toppingPrice;
      return this.toppingRepository.save(newTopping);
    } catch (error) {
      throw new Error(error);
    }
  }

  findAll() {
    try {
      return this.toppingRepository.find();
    } catch (error) {
      throw new Error(error);
    }
  }

  findOne(id: number) {
    try {
      return this.toppingRepository.findOne({ where: { toppingId: id } });
    } catch (error) {
      throw new Error(error);
    }
  }

  async update(id: number, updateToppingDto: UpdateToppingDto) {
    try {
      //if not fountthrow not found exception
      const topping = await this.toppingRepository.findOne({
        where: { toppingId: id },
      });
      if (!topping) {
        throw new Error('Topping not found');
      }
      //update topping
      topping.toppingName = updateToppingDto.toppingName;
      topping.toppingPrice = updateToppingDto.toppingPrice;
      return this.toppingRepository.save(topping);
    } catch (error) {
      throw new Error(error);
    }
  }

  remove(id: number) {
    try {
      return this.toppingRepository.delete({ toppingId: id });
    } catch (error) {
      throw new Error(error);
    }
  }
}
