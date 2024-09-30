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
import { ImportingredientitemsService } from './importingredientitems.service';
import { CreateImportingredientitemDto } from './dto/create-importingredientitem.dto';
import { UpdateImportingredientitemDto } from './dto/update-importingredientitem.dto';
import { RolesGuard } from 'src/guards/roles.guard';
import { Permissions } from 'src/decorators/permissions.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('importingredientitems')
export class ImportingredientitemsController {
  constructor(
    private readonly importingredientitemsService: ImportingredientitemsService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('จัดการการนำเข้าวัตถุดิบ')
  create(@Body() createImportingredientitemDto: CreateImportingredientitemDto) {
    return this.importingredientitemsService.create(
      createImportingredientitemDto,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('ดูการนำเข้าวัตถุดิบ')
  findAll() {
    return this.importingredientitemsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('ดูการนำเข้าวัตถุดิบ')
  findOne(@Param('id') id: string) {
    return this.importingredientitemsService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('จัดการการนำเข้าวัตถุดิบ')
  update(
    @Param('id') id: string,
    @Body() updateImportingredientitemDto: UpdateImportingredientitemDto,
  ) {
    return this.importingredientitemsService.update(
      +id,
      updateImportingredientitemDto,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('จัดการการนำเข้าวัตถุดิบ')
  remove(@Param('id') id: string) {
    return this.importingredientitemsService.remove(+id);
  }
}
