import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CateringEvent } from './entities/catering-event.entity';

@Injectable()
export class CateringEventService {
  constructor(
    @InjectRepository(CateringEvent)
    private cateringEventRepository: Repository<CateringEvent>,
  ) {}

  async findAll(): Promise<CateringEvent[]> {
    return this.cateringEventRepository.find({ relations: ['organizer'] });
  }

  async findOne(id: number): Promise<CateringEvent> {
    return this.cateringEventRepository.findOne({
      where: { eventId: id },
      relations: ['organizer'],
    });
  }

  async create(
    cateringEventData: Partial<CateringEvent>,
  ): Promise<CateringEvent> {
    const newEvent = this.cateringEventRepository.create(cateringEventData);
    return this.cateringEventRepository.save(newEvent);
  }

  async update(
    id: number,
    updateData: Partial<CateringEvent>,
  ): Promise<CateringEvent> {
    await this.cateringEventRepository.update(id, updateData);
    return this.cateringEventRepository.findOne({ where: { eventId: id } });
  }

  async updateStatus(id: number, status: string): Promise<CateringEvent> {
    await this.cateringEventRepository.update(id, { status });
    return this.cateringEventRepository.findOne({ where: { eventId: id } });
  }

  async delete(id: number): Promise<void> {
    await this.cateringEventRepository.delete(id);
  }
}
