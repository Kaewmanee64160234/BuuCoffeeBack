import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCashierDto } from './dto/create-cashier.dto';
import { UpdateCashierDto } from './dto/update-cashier.dto';
import { Cashier } from './entities/cashier.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class CashiersService {
  constructor(
    @InjectRepository(Cashier)
    private cashierRepository: Repository<Cashier>,
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  async create(createCashierDto: CreateCashierDto) {
    try {
      const user = await this.usersRepository.findOne({
        where: { userId: createCashierDto.userId },
      });
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      const cashier = new Cashier();
      cashier.cashierAmount = createCashierDto.cashierAmount;
      cashier.createdDate = createCashierDto.createdDate || new Date();
      cashier.user = user;

      return this.cashierRepository.save(cashier);
    } catch (error) {
      throw new HttpException(
        'Failed to create cashier',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findAll(): Promise<Cashier[]> {
    return await this.cashierRepository.find();
  }

  async findOne(id: number): Promise<Cashier> {
    const cashier = await this.cashierRepository.findOne({
      where: { cashierId: id },
    });
    if (!cashier) {
      throw new HttpException('Cashier not found', HttpStatus.NOT_FOUND);
    }
    return cashier;
  }

  async update(
    id: number,
    updateCashierDto: UpdateCashierDto,
  ): Promise<Cashier> {
    await this.cashierRepository.update(id, updateCashierDto);
    const updatedCashier = await this.cashierRepository.findOne({
      where: { cashierId: id },
    });
    if (!updatedCashier) {
      throw new HttpException('Cashier not found', HttpStatus.NOT_FOUND);
    }
    return updatedCashier;
  }

  async softDelete(cashierId: number): Promise<void> {
    const result = await this.cashierRepository.softDelete(cashierId);
    if (result.affected === 0) {
      throw new HttpException('Cashier not found', HttpStatus.NOT_FOUND);
    }
  }

  async restore(cashierId: number): Promise<void> {
    const result = await this.cashierRepository.restore(cashierId);
    if (result.affected === 0) {
      throw new HttpException('Cashier not found', HttpStatus.NOT_FOUND);
    }
  }
}
