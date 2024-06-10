import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateToppingDto } from './dto/create-topping.dto';
import { UpdateToppingDto } from './dto/update-topping.dto';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Like, Repository } from 'typeorm';
import { Topping } from './entities/topping.entity';
import { Category } from 'src/categories/entities/category.entity';

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
      throw new HttpException(
        'Failed to create topping',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  findAll() {
    try {
      return this.toppingRepository.find();
    } catch (error) {
      throw new HttpException(
        'Failed to delete product',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  findOne(id: number) {
    try {
      return this.toppingRepository.findOne({ where: { toppingId: id } });
    } catch (error) {
      throw new HttpException(
        'Failed to create topping',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
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
      const updatedTopping = await this.toppingRepository.save({
        ...topping,
        ...updateToppingDto,
      });
      return updatedTopping;
    } catch (error) {
      throw new HttpException(
        'Failed to create topping',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: number) {
    try {
      const topping = await this.toppingRepository.findOne({
        where: { toppingId: id },
      });
      if (!topping) {
        throw new Error('Topping not found');
      }
      await this.toppingRepository.remove(topping);
      return topping;
    } catch (error) {
      throw new HttpException(
        'Failed to create topping',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getToppings(
    page: number,
    limit: number,
    search: string,
  ): Promise<{ data: Topping[]; total: number }> {
    const whereCondition = search ? { toppingName: Like(`%${search}%`) } : {};

    const [data, total] = await this.toppingRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      where: whereCondition,
    });

    return { data, total };
  }
}
