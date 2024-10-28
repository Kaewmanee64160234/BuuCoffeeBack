import {
  Injectable,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { CreateCashierDto } from './dto/create-cashier.dto';
import { UpdateCashierDto } from './dto/update-cashier.dto';
import { Cashier } from './entities/cashier.entity';
import { User } from 'src/users/entities/user.entity';
import { CashierItem } from './entities/cashierItem.entity';
@Injectable()
export class CashiersService {
  constructor(
    @InjectRepository(Cashier)
    private cashierRepository: Repository<Cashier>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(CashierItem)
    private cashierItemRepository: Repository<CashierItem>,
  ) {}

  async create(createCashierDto: CreateCashierDto): Promise<Cashier> {
    const user = await this.usersRepository.findOne({
      where: { userId: createCashierDto.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingCashier = await this.cashierRepository.findOne({
      where: {
        createdDate: MoreThanOrEqual(today),
      },
    });

    if (existingCashier) {
      throw new Error('Cashier can only be created once per day.');
    }

    let cashierAmount = 0;
    const cashierItems = await Promise.all(
      createCashierDto.items.map(async (item) => {
        const amount = parseFloat(item.denomination) * item.quantity;
        cashierAmount += amount;
        return this.cashierItemRepository.create({
          denomination: item.denomination,
          quantity: item.quantity,
          timestamp: item.timestamp || new Date(),
        });
      }),
    );

    const cashier = this.cashierRepository.create({
      cashierAmount,
      createdDate: new Date(),
      openedBy: user,
      cashierItems: [],
    });

    cashierItems.forEach((item) => {
      item.cashier = cashier;
    });

    await this.cashierRepository.save(cashier);
    await this.cashierItemRepository.save(cashierItems);

    return cashier;
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
