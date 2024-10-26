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

@Controller('catering-events')
export class CateringEventController {
  constructor(private readonly cateringEventService: CateringEventService) {}

  @Get()
  async findAll(): Promise<CateringEvent[]> {
    return this.cateringEventService.findAll();
  }
  @Get('paginate')
  async paginate(@Query('page') page, @Query('limit') limit = 10) {
    return this.cateringEventService.paginate(+page, +limit);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<CateringEvent> {
    return this.cateringEventService.findOne(+id);
  }

  @Post()
  async create(@Body() createCateringEventDto: CreateCateringEventDto) {
    return this.cateringEventService.create(createCateringEventDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCateringEventDto: Partial<CateringEvent>,
  ): Promise<CateringEvent> {
    return this.cateringEventService.update(+id, updateCateringEventDto);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: { status: string },
  ): Promise<CateringEvent> {
    return this.cateringEventService.updateStatus(+id, updateStatusDto.status);
  }

  // cancel
  @Patch(':id/cancel')
  async cancel(@Param('id') id: string): Promise<CateringEvent> {
    return this.cateringEventService.cancel(+id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.cateringEventService.delete(+id);
  }
}
