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
  UseGuards,
  HttpException,
  HttpStatus,
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
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PermissionsGuard } from 'src/guards/roles.guard';
import { Permissions } from 'src/decorators/permissions.decorator';

@Controller('ingredients')
export class IngredientsController {
  constructor(private readonly ingredientsService: IngredientsService) {}
  @Get('prices')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('จัดการวัตถุดิบ')
  async findAllIngredientPrice() {
    try {
      return await this.ingredientsService.findAllIngredientPrice();
    } catch (error) {
      throw new HttpException(
        'Failed to fetch ingredient prices',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('search')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('ดูวัตถุดิบ')
  async search(@Query('name') name: string): Promise<Ingredient[]> {
    try {
      return await this.ingredientsService.searchByName(name);
    } catch (error) {
      console.error('Failed to search ingredients', error);
      throw new InternalServerErrorException('Failed to search ingredients');
    }
  }

  @Get('low-stock')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('ดูวัตถุดิบ')
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
  // @UseGuards(JwtAuthGuard, PermissionsGuard)
  // @Permissions('จัดการวัตถุดิบ')
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
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('จัดการวัตถุดิบ')
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

  @Get(':all')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('ดูวัตถุดิบ')
  findAllQuery(@Query() query) {
    return this.ingredientsService.findAllQuery(query);
  }

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('ดูวัตถุดิบ')
  findAll() {
    return this.ingredientsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('ดูวัตถุดิบ')
  findOne(@Param('id') id: string) {
    return this.ingredientsService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('จัดการวัตถุดิบ')
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
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('จัดการวัตถุดิบ')
  remove(@Param('id') id: string) {
    return this.ingredientsService.remove(+id);
  }

  @Get(':id/image')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('ดูวัตถุดิบ')
  async getImage(@Param('id') id: string, @Res() res: Response) {
    const ingredient = await this.ingredientsService.findOne(+id);
    res.sendFile(ingredient.ingredientImage, { root: './ingredient_images' });
  }
}
