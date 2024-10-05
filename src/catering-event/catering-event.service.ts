import { Injectable, NotFoundException } from '@nestjs/common';
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
    return this.cateringEventRepository.find({
      relations: ['meals', 'meals.mealIngredients', 'user'],
    });
  }

  async findOne(id: number): Promise<CateringEvent> {
    const event = await this.cateringEventRepository.findOne({
      where: { eventId: id },
      relations: ['meals', 'meals.mealIngredients', 'user'],
    });
    if (!event) {
      throw new NotFoundException(`Catering event with id ${id} not found`);
    }
    return event;
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
    const event = await this.findOne(id);
    if (!event) {
      throw new NotFoundException(`Catering event with id ${id} not found`);
    }

    Object.assign(event, updateData);
    return this.cateringEventRepository.save(event);
  }

  async updateStatus(id: number, status: string): Promise<CateringEvent> {
    const event = await this.findOne(id);
    if (!event) {
      throw new NotFoundException(`Catering event with id ${id} not found`);
    }
    event.status = status;
    return this.cateringEventRepository.save(event);
  }

  async delete(id: number): Promise<void> {
    await this.cateringEventRepository.delete(id);
  }
}
