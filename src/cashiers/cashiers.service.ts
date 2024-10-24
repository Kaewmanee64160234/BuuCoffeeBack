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

      // ตรวจสอบว่ามีข้อมูลของวันที่ปัจจุบันในระบบหรือไม่
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0); // กำหนดเวลาให้เป็น 00:00:00

      const existingCashier = await this.cashierRepository.findOne({
        where: { createdDate: currentDate },
      });

      // ถ้ามีข้อมูลของวันที่ปัจจุบันในระบบแล้ว ให้สร้างข้อผิดพลาด
      if (existingCashier) {
        throw new HttpException(
          'Cashier for this date already exists',
          HttpStatus.BAD_REQUEST,
        );
      }
      const cashier = new Cashier();
      cashier.cashierAmount = createCashierDto.cashierAmount;
      cashier.createdDate = currentDate;
      cashier.user = user;

      return this.cashierRepository.save(cashier);
    } catch (error) {
      throw new HttpException(
        'Failed to create cashier',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  async findToday(): Promise<Cashier> {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // กำหนดเวลาให้เป็น 00:00:00

    const cashier = await this.cashierRepository.findOne({
      where: { createdDate: currentDate },
    });

    if (!cashier) {
      throw new HttpException('ไม่มีข้อมูลวันนี้', HttpStatus.NOT_FOUND);
    }

    return cashier;
  }
  async findAll(): Promise<Cashier[]> {
    return await this.cashierRepository.find({
      withDeleted: true,
    });
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

  // get event catering paginate
  async paginate(page = 1, limit = 10): Promise<any> {
    const cashiers = await this.cashierRepository.findAndCount({
      take: limit,
      skip: limit * (page - 1),
    });
    return {
      data: cashiers[0],
      meta: {
        total: cashiers[1],
        page: page,
        last_page: Math.ceil(cashiers[1] / limit),
      },
    };
  }
}
