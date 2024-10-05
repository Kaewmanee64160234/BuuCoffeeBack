import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { CateringEventService } from './catering-event.service';
import { CateringEvent } from './entities/catering-event.entity';

@Controller('catering-event')
export class CateringEventController {
  constructor(private readonly cateringEventService: CateringEventService) {}

  @Get()
  async findAll(): Promise<CateringEvent[]> {
    return this.cateringEventService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<CateringEvent> {
    return this.cateringEventService.findOne(+id);
  }

  @Post()
  async create(
    @Body() createCateringEventDto: Partial<CateringEvent>,
  ): Promise<CateringEvent> {
    return this.cateringEventService.create(createCateringEventDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCateringEventDto: Partial<CateringEvent>,
  ): Promise<CateringEvent> {
    return this.cateringEventService.update(+id, updateCateringEventDto);
  }

  // เพิ่ม endpoint สำหรับการอัปเดตสถานะการชำระเงิน
  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: { status: string },
  ): Promise<CateringEvent> {
    return this.cateringEventService.updateStatus(+id, updateStatusDto.status);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.cateringEventService.delete(+id);
  }
}
