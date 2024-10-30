import {
  Injectable,
  HttpException,
  HttpStatus,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { CreateCashierDto } from './dto/create-cashier.dto';
import { UpdateCashierDto } from './dto/update-cashier.dto';
import { Cashier, CashierType } from './entities/cashier.entity';
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
        type: createCashierDto.type,
      },
    });

    if (existingCashier) {
      throw new ConflictException(
        `Cashier for type ${createCashierDto.type} can only be created once per day.`,
      );
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
      type: createCashierDto.type, // กำหนด type ของ Cashier
      cashierItems: [],
    });

    cashierItems.forEach((item) => {
      item.cashier = cashier;
    });

    await this.cashierRepository.save(cashier);
    await this.cashierItemRepository.save(cashierItems);

    return cashier;
  }
  async checkCashierStatus(): Promise<{
    rice: { closedDate: boolean; createdToday: boolean };
    coffee: { closedDate: boolean; createdToday: boolean };
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const riceCashier = await this.cashierRepository.findOne({
      where: { type: CashierType.RICE, createdDate: MoreThanOrEqual(today) },
    });

    const coffeeCashier = await this.cashierRepository.findOne({
      where: { type: CashierType.COFFEE, createdDate: MoreThanOrEqual(today) },
    });

    return {
      rice: {
        closedDate: riceCashier ? !!riceCashier.closedDate : false,
        createdToday: !!riceCashier,
      },
      coffee: {
        closedDate: coffeeCashier ? !!coffeeCashier.closedDate : false,
        createdToday: !!coffeeCashier,
      },
    };
  }

  async isCashierCreatedToday(type: CashierType): Promise<boolean> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingCashier = await this.cashierRepository.findOne({
      where: {
        type: type,
        createdDate: MoreThanOrEqual(today),
        closedDate: null,
      },
    });

    return !!existingCashier;
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
  async closeCashier(
    type: CashierType,
    userId: number,
    closeCashierDto: CreateCashierDto,
  ): Promise<Cashier> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingCashier = await this.cashierRepository.findOne({
      where: {
        createdDate: MoreThanOrEqual(today),
        type,
        closedDate: null,
      },
    });

    if (!existingCashier) {
      throw new ConflictException(`No cashier found for type ${type} today.`);
    }

    // คำนวณจำนวนเงินที่ปิดการขาย
    let cashierAmount = 0;
    const cashierItems = await Promise.all(
      closeCashierDto.items.map(async (item) => {
        const amount = parseFloat(item.denomination) * item.quantity;
        cashierAmount += amount;
        return this.cashierItemRepository.create({
          denomination: item.denomination,
          quantity: item.quantity,
          timestamp: item.timestamp || new Date(),
        });
      }),
    );

    existingCashier.closedDate = new Date();
    existingCashier.closedAmount = cashierAmount;
    existingCashier.closedBy = await this.usersRepository.findOne({
      where: { userId },
    });

    await this.cashierRepository.save(existingCashier);

    cashierItems.forEach((item) => {
      item.cashier = existingCashier;
    });

    await this.cashierItemRepository.save(cashierItems);

    return existingCashier;
  }

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
