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
import { UpdateCateringEventDto } from './dto/update-catering-event.dto';

@Controller('catering-events')
export class CateringEventController {
  constructor(private readonly cateringEventService: CateringEventService) {}
  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('จัดการการเลี้ยงรับรอง')
  async create(@Body() createCateringEventDto: CreateCateringEventDto) {
    return this.cateringEventService.create(createCateringEventDto);
  }
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

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('จัดการการเลี้ยงรับรอง')
  async update(
    @Param('id') id: string,
    @Body() updateCateringEventDto: CateringEvent,
  ): Promise<CateringEvent> {
    console.log(updateCateringEventDto);

    return this.cateringEventService.update(+id, updateCateringEventDto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('จัดการการเลี้ยงรับรอง')
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: { status: string },
  ): Promise<CateringEvent> {
    console.log(updateStatusDto);

    return this.cateringEventService.updateStatus(+id, updateStatusDto.status);
  }

  // cancel
  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('จัดการการเลี้ยงรับรอง')
  async cancel(@Param('id') id: string) {
    // return this.cateringEventService.cancel(+id);
    return 'cancel';
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('จัดการการเลี้ยงรับรอง')
  async delete(@Param('id') id: string): Promise<void> {
    return this.cateringEventService.delete(+id);
  }
}
