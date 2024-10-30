import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Patch,
  Query,
} from '@nestjs/common';
import { CateringEventService } from './catering-event.service';
import { CateringEvent } from './entities/catering-event.entity';
import { CreateCateringEventDto } from './dto/create-catering-event.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PermissionsGuard } from 'src/guards/roles.guard';
import { Permissions } from 'src/decorators/permissions.decorator';

@Controller('catering-events')
export class CateringEventController {
  constructor(private readonly cateringEventService: CateringEventService) {}

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('จัดการการเลี้ยงรับรอง')
  async findAll(): Promise<CateringEvent[]> {
    return this.cateringEventService.findAll();
  }
  @Get('paginate')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('จัดการการเลี้ยงรับรอง')
  async paginate(@Query('page') page, @Query('limit') limit = 10) {
    return this.cateringEventService.paginate(+page, +limit);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('จัดการการเลี้ยงรับรอง')
  async findOne(@Param('id') id: string): Promise<CateringEvent> {
    return this.cateringEventService.findOne(+id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('จัดการการเลี้ยงรับรอง')
  async create(@Body() createCateringEventDto: CreateCateringEventDto) {
    return this.cateringEventService.create(createCateringEventDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('จัดการการเลี้ยงรับรอง')
  async update(
    @Param('id') id: string,
    @Body() updateCateringEventDto: Partial<CateringEvent>,
  ): Promise<CateringEvent> {
    return this.cateringEventService.update(+id, updateCateringEventDto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('จัดการการเลี้ยงรับรอง')
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: { status: string },
  ): Promise<CateringEvent> {
    return this.cateringEventService.updateStatus(+id, updateStatusDto.status);
  }

  // cancel
  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('จัดการการเลี้ยงรับรอง')
  async cancel(@Param('id') id: string): Promise<CateringEvent> {
    return this.cateringEventService.cancel(+id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('จัดการการเลี้ยงรับรอง')
  async delete(@Param('id') id: string): Promise<void> {
    return this.cateringEventService.delete(+id);
  }
}
