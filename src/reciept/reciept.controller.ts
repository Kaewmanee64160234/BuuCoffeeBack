import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { RecieptService } from './reciept.service';
import { CreateRecieptDto } from './dto/create-reciept.dto';
import { UpdateRecieptDto } from './dto/update-reciept.dto';

@Controller('reciept')
export class RecieptController {
  constructor(private readonly recieptService: RecieptService) {}

  @Post()
  create(@Body() createRecieptDto: CreateRecieptDto) {
    return this.recieptService.create(createRecieptDto);
  }

  @Get()
  findAll() {
    return this.recieptService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.recieptService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.recieptService.remove(+id);
  }
}
