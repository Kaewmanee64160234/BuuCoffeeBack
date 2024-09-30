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
import { IngredientusagelogService } from './ingredientusagelog.service';
import { CreateIngredientusagelogDto } from './dto/create-ingredientusagelog.dto';
import { UpdateIngredientusagelogDto } from './dto/update-ingredientusagelog.dto';
import { RolesGuard } from 'src/guards/roles.guard';
import { Permissions } from 'src/decorators/permissions.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('ingredientusagelog')
export class IngredientusagelogController {
  constructor(
    private readonly ingredientusagelogService: IngredientusagelogService,
  ) {}
  @Get('withdrawal-return-pairs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('ดูการเบิกวัตถุดิบ')
  async getWithdrawalReturnPairsWithLogs() {
    return this.ingredientusagelogService.getWithdrawalReturnPairsWithLogs();
  }
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('จัดการการเบิกวัตถุดิบ')
  create(@Body() createIngredientusagelogDto: CreateIngredientusagelogDto) {
    return this.ingredientusagelogService.create(createIngredientusagelogDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('ดูการเบิกวัตถุดิบ')
  findAll() {
    return this.ingredientusagelogService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('ดูการเบิกวัตถุดิบ')
  findOne(@Param('id') id: string) {
    return this.ingredientusagelogService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('จัดการการเบิกวัตถุดิบ')
  update(
    @Param('id') id: string,
    @Body() updateIngredientusagelogDto: UpdateIngredientusagelogDto,
  ) {
    return this.ingredientusagelogService.update(
      +id,
      updateIngredientusagelogDto,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('จัดการการเบิกวัตถุดิบ')
  remove(@Param('id') id: string) {
    return this.ingredientusagelogService.remove(+id);
  }
}
