import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
  Res,
  Query,
  InternalServerErrorException,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { IngredientsService } from './ingredients.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import { Response, Request } from 'express';
import { Ingredient } from './entities/ingredient.entity';

@Controller('ingredients')
export class IngredientsController {
  constructor(private readonly ingredientsService: IngredientsService) {}
  @Get('search')
  async search(@Query('name') name: string): Promise<Ingredient[]> {
    try {
      return await this.ingredientsService.searchByName(name);
    } catch (error) {
      console.error('Failed to search ingredients', error);
      throw new InternalServerErrorException('Failed to search ingredients');
    }
  }
  @Get('low-stock')
  async findLowStockIngredients(): Promise<Ingredient[]> {
    try {
      return await this.ingredientsService.findLowStockIngredients();
    } catch (error) {
      console.error('Failed to retrieve low stock ingredients', error);
      throw new InternalServerErrorException(
        'Failed to retrieve low stock ingredients',
      );
    }
  }
  @Post()
  @UseInterceptors(
    FileInterceptor('imageFile', {
      storage: diskStorage({
        destination: './ingredient_images',
        filename: (req, file, cb) => {
          const name = uuidv4();
          return cb(null, name + extname(file.originalname));
        },
      }),
    }),
  )
  async createIngredient(
    @Body() createIngredientDto: CreateIngredientDto,
    @UploadedFile() imageFile: Express.Multer.File,
  ) {
    return this.ingredientsService.create(createIngredientDto, imageFile);
  }

  @Post('upload/:ingredientId')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './ingredient_images',
        filename: (req, file, cb) => {
          const name = uuidv4();
          return cb(null, name + extname(file.originalname));
        },
      }),
    }),
  )
  uploadImage(
    @Param('ingredientId') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.ingredientsService.uploadImage(+id, file.filename);
  }

  @Get()
  findAll(@Query() query) {
    return this.ingredientsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ingredientsService.findOne(+id);
  }

  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('imageFile', {
      storage: diskStorage({
        destination: './ingredient_images',
        filename: (req, file, cb) => {
          const name = uuidv4();
          return cb(null, name + extname(file.originalname));
        },
      }),
    }),
  )
  update(
    @Param('id') id: string,
    @Body() updateIngredientDto: UpdateIngredientDto,
    @UploadedFile() imageFile: Express.Multer.File,
  ) {
    // เรียกใช้คำสั่ง update จาก IngredientsService
    return this.ingredientsService.update(+id, updateIngredientDto, imageFile);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ingredientsService.remove(+id);
  }

  @Get(':id/image')
  async getImage(@Param('id') id: string, @Res() res: Response) {
    const ingredient = await this.ingredientsService.findOne(+id);
    res.sendFile(ingredient.ingredientImage, { root: './ingredient_images' });
  }
}
