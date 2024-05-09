import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryrRepository: Repository<Category>,
  ) {}
  create(createCategoryDto: CreateCategoryDto) {
    try {
      const newCategory = new Category();
      newCategory.categoryName = createCategoryDto.categoryName;
      newCategory.haveTopping = createCategoryDto.haveTopping;

      return this.categoryrRepository.save(newCategory);
    } catch (error) {
      throw new HttpException(
        'Failed to create category',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  findAll() {
    try {
      return this.categoryrRepository.find();
    } catch (error) {
      throw new HttpException(
        'Failed to fetch categories',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findOne(id: number) {
    try {
      //find if not found throw error
      const category = await this.categoryrRepository.findOne({
        where: { categoryId: id },
      });
      if (!category) {
        throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
      }
      return category;
    } catch (error) {
      throw new HttpException(
        'Failed to fetch category',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    try {
      const category = await this.categoryrRepository.findOne({
        where: { categoryId: id },
      });
      if (!category) {
        throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
      }
      return this.categoryrRepository.update(id, updateCategoryDto);
    } catch (error) {
      throw new HttpException(
        'Failed to update category',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  remove(id: number) {
    try {
      const category = this.categoryrRepository.findOne({
        where: { categoryId: id },
      });
      if (!category) {
        throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
      }
      return this.categoryrRepository.delete(id);
    } catch (error) {
      throw new HttpException(
        'Failed to delete category',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
