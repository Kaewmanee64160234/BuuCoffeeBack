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
  BadRequestException,
  NotFoundException,
  Query,
  UseGuards,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { extname, join } from 'path';
import { Response, Request } from 'express';
import { rename, unlink } from 'fs';
import { Product } from './entities/product.entity';
import { Permissions } from 'src/decorators/permissions.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
// import { PermissionsGuard } from 'src/permission/permissions.guard';
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('จัดการสินค้า')
  @UseInterceptors(
    FileInterceptor('imageFile', {
      storage: diskStorage({
        destination: './product_images',
        filename: (req, file, cb) => {
          const name = uuidv4();
          return cb(null, name + extname(file.originalname));
        },
      }),
    }),
  )
  async createProduct(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile() imageFile: Express.Multer.File,
  ) {
    if (imageFile) {
      createProductDto.productImage = imageFile.filename;
    }
    return this.productsService.create(createProductDto);
  }

  // getProductByStoreType
  @Get('store-type/:storeType')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('ดูรายการสินค้า')
  getProductByStoreType(@Param('storeType') storeType: string) {
    return this.productsService.getProductByStoreType(storeType);
  }

  @Post('update-image/:productId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('จัดการสินค้า')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './product_images',
        filename: (req, file, cb) => {
          const tempName = `${uuidv4()}${extname(file.originalname)}`;
          cb(null, tempName); // Save with a temporary name
        },
      }),
    }),
  )
  async updateImage(
    @Param('productId') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const product = await this.productsService.findOne(+id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const oldImagePath = join('./product_images', product.productImage);
    const tempImagePath = join('./product_images', file.filename);

    try {
      // Check if the old image exists before renaming
      if (product.productImage) {
        const newImagePath = join('./product_images', file.filename);
        // Rename the temporary file to the old file name
        await promisify(rename)(tempImagePath, newImagePath);

        // Update the product's image information in the database
        await this.productsService.uploadImage(+id, file.filename);

        // Optionally, remove the old image if it exists
        if (fs.existsSync(oldImagePath)) {
          await promisify(unlink)(oldImagePath);
        }

        console.log('Image updated successfully:', newImagePath);
        return { message: 'Image updated successfully' };
      } else {
        // If there was no previous image, just rename and update the path
        await promisify(rename)(tempImagePath, oldImagePath);
        await this.productsService.uploadImage(+id, file.filename);
        console.log('Image updated successfully:', oldImagePath);
        return { message: 'Image updated successfully' };
      }
    } catch (error) {
      console.error('Error updating image:', error);
      // Cleanup in case of error
      await promisify(unlink)(tempImagePath);
      throw new BadRequestException('Error updating image');
    }
  }
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('จัดการสินค้า')
  @UseInterceptors(
    FileInterceptor('imageFile', {
      storage: diskStorage({
        destination: './product_images',
        filename: (req, file, cb) => {
          const name = uuidv4();
          return cb(null, `${name}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    console.log('updateProductImage:', file);

    if (file) {
      updateProductDto.productImage = file.filename;
    }
    return this.productsService.update(+id, updateProductDto);
  }
  //uplode image product file
  @Post('upload/:productId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('จัดการสินค้า')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './product_images',
        filename: (req, file, cb) => {
          const name = uuidv4();
          return cb(null, `${name}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  uploadImage(
    @Param('productId') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    console.log('File:', file);
    if (!file) {
      console.error('File upload attempt without file.');
      throw new BadRequestException('No file uploaded');
    }
    console.log('Uploaded file:', file.filename);
    return this.productsService.uploadImage(+id, file.filename);
  }

  @Get('paginate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('ดูรายการสินค้า')
  async getProducts(
    @Query('page') page = 1,
    @Query('limit') limit = 5,
    @Query('search') search = '',
  ): Promise<{ data: Product[]; total: number }> {
    return this.productsService.getProducts(page, limit, search);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('ดูรายการสินค้า')
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('ดูรายการสินค้า')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('จัดการสินค้า')
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }

  // getProductByCategoryName
  @Get('category/:categoryName')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('ดูรายการสินค้า')
  getProductByCategoryName(@Param('categoryName') categoryName: string) {
    return this.productsService.getProductByCategoryName(categoryName);
  }

  //getImage
  @Get(':id/image')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Permissions('ดูรายการสินค้า')
  async getImage(@Param('id') id: string, @Res() res: Response) {
    const product = await this.productsService.findOne(+id);
    res.sendFile(product.productImage, { root: './product_images' });
  }
}
