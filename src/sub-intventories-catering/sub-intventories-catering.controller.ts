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
import { SubIntventoriesCateringService } from './sub-intventories-catering.service';
import { CreateSubIntventoriesCateringDto } from './dto/create-sub-intventories-catering.dto';
import { UpdateSubIntventoriesCateringDto } from './dto/update-sub-intventories-catering.dto';
import { Permissions } from 'src/decorators/permissions.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';

@Controller('sub-inventories-catering')
export class SubIntventoriesCateringController {
  constructor(
    private readonly subIntventoriesCateringService: SubIntventoriesCateringService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('จัดการวัตถุดิบ')
  create(
    @Body() createSubIntventoriesCateringDto: CreateSubIntventoriesCateringDto,
  ) {
    return this.subIntventoriesCateringService.create(
      createSubIntventoriesCateringDto,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('ดูวัตถุดิบ')
  findAll() {
    return this.subIntventoriesCateringService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('ดูวัตถุดิบ')
  findOne(@Param('id') id: string) {
    return this.subIntventoriesCateringService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('จัดการวัตถุดิบ')
  update(
    @Param('id') id: string,
    @Body() updateSubIntventoriesCateringDto: UpdateSubIntventoriesCateringDto,
  ) {
    return this.subIntventoriesCateringService.update(
      +id,
      updateSubIntventoriesCateringDto,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('จัดการวัตถุดิบ')
  remove(@Param('id') id: string) {
    return this.subIntventoriesCateringService.remove(+id);
  }
}
