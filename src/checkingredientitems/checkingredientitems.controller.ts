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
import { CheckingredientitemsService } from './checkingredientitems.service';
import { CreateCheckingredientitemDto } from './dto/create-checkingredientitem.dto';
import { UpdateCheckingredientitemDto } from './dto/update-checkingredientitem.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { Permissions } from 'src/decorators/permissions.decorator';

@Controller('checkingredientitems')
export class CheckingredientitemsController {
  constructor(
    private readonly checkingredientitemsService: CheckingredientitemsService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('จัดการการเช็ควัตถุดิบ')
  create(@Body() createCheckingredientitemDto: CreateCheckingredientitemDto) {
    return this.checkingredientitemsService.create(
      createCheckingredientitemDto,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('ดูการเช็ควัตถุดิบ')
  findAll() {
    return this.checkingredientitemsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('ดูการเช็ควัตถุดิบ')
  findOne(@Param('id') id: string) {
    return this.checkingredientitemsService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('จัดการการเช็ควัตถุดิบ')
  update(
    @Param('id') id: string,
    @Body() updateCheckingredientitemDto: UpdateCheckingredientitemDto,
  ) {
    return this.checkingredientitemsService.update(
      +id,
      updateCheckingredientitemDto,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('จัดการการเช็ควัตถุดิบ')
  remove(@Param('id') id: string) {
    return this.checkingredientitemsService.remove(+id);
  }
}
